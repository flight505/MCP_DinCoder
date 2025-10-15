import { describe, it, expect } from 'vitest';
import { prereqsCheck } from '../../src/tools/prereqs.js';

describe('Prerequisites Check Tool', () => {
  describe('prereqsCheck', () => {
    it('should check Node.js is available', async () => {
      const result = await prereqsCheck({
        checkFor: {
          node: undefined // Just check if available
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      expect(parsed.results.some((r: { name: string }) => r.name === 'Node.js')).toBe(true);
      expect(parsed.results.find((r: { name: string }) => r.name === 'Node.js').available).toBe(true);
    });

    it('should check npm is available', async () => {
      const result = await prereqsCheck({
        checkFor: {
          npm: true
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      const npmResult = parsed.results.find((r: { name: string }) => r.name === 'npm');
      expect(npmResult).toBeDefined();
      expect(npmResult.available).toBe(true);
    });

    it('should check git is available', async () => {
      const result = await prereqsCheck({
        checkFor: {
          git: true
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      const gitResult = parsed.results.find((r: { name: string }) => r.name === 'git');
      expect(gitResult).toBeDefined();
      expect(gitResult.available).toBe(true);
    });

    it('should check Node.js version requirement', async () => {
      const result = await prereqsCheck({
        checkFor: {
          node: '>=18' // Should pass on most systems
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      const nodeResult = parsed.results.find((r: { name: string }) => r.name === 'Node.js');
      expect(nodeResult).toBeDefined();
      expect(nodeResult.version).toBeDefined();
    });

    it('should detect missing custom command', async () => {
      const result = await prereqsCheck({
        checkFor: {
          customCommands: ['nonexistent-command-12345']
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.success).toBe(true);
      expect(parsed.allPassed).toBe(false);
      const customResult = parsed.results.find((r: { name: string }) => r.name === 'nonexistent-command-12345');
      expect(customResult).toBeDefined();
      expect(customResult.available).toBe(false);
    });

    it('should provide helpful suggestions for missing prereqs', async () => {
      const result = await prereqsCheck({
        checkFor: {
          customCommands: ['totally-fake-tool']
        }
      });

      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.nextSteps.length).toBeGreaterThan(0);
      expect(parsed.nextSteps[0]).toContain('Install');
    });
  });
});
