import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { constitutionCreate, ConstitutionCreateSchema } from '../../src/tools/constitution.js';

describe('constitution_create', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'constitution-test-'));
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should create constitution.md with principles and constraints', async () => {
    const params = ConstitutionCreateSchema.parse({
      projectName: 'test-project',
      principles: [
        'Prefer functional patterns',
        'Write tests first',
        'Keep it simple'
      ],
      constraints: [
        'Support Node 20+',
        'Max bundle size: 500KB',
        'Zero runtime dependencies'
      ],
      workspacePath: testDir
    });

    const result = await constitutionCreate(params);

    // Verify result structure
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');

    const response = JSON.parse(result.content[0].text);
    expect(response.success).toBe(true);
    expect(response.projectName).toBe('test-project');
    expect(response.principlesCount).toBe(3);
    expect(response.constraintsCount).toBe(3);

    // Verify file was created
    const constitutionPath = response.constitutionPath;
    expect(constitutionPath).toBeDefined();

    const content = await fs.readFile(constitutionPath, 'utf-8');

    // Verify content structure
    expect(content).toContain('# test-project Constitution');
    expect(content).toContain('## 🎯 Project Principles');
    expect(content).toContain('## 🔒 Technical Constraints');
    expect(content).toContain('Prefer functional patterns');
    expect(content).toContain('Write tests first');
    expect(content).toContain('Keep it simple');
    expect(content).toContain('Support Node 20+');
    expect(content).toContain('Max bundle size: 500KB');
    expect(content).toContain('Zero runtime dependencies');
  });

  it('should create constitution with preferences', async () => {
    const params = ConstitutionCreateSchema.parse({
      projectName: 'web-app',
      principles: ['User experience first'],
      constraints: ['Browser support: Chrome, Firefox, Safari'],
      preferences: {
        libraries: ['React Query over Redux', 'Tailwind over Bootstrap'],
        patterns: ['Repository pattern for data access', 'Composition over inheritance'],
        style: 'Functional programming preferred'
      },
      workspacePath: testDir
    });

    const result = await constitutionCreate(params);
    const response = JSON.parse(result.content[0].text);

    const content = await fs.readFile(response.constitutionPath, 'utf-8');

    // Verify preferences section
    expect(content).toContain('## 📚 Preferences');
    expect(content).toContain('React Query over Redux');
    expect(content).toContain('Tailwind over Bootstrap');
    expect(content).toContain('Repository pattern for data access');
    expect(content).toContain('Functional programming preferred');
  });

  it('should create constitution without preferences', async () => {
    const params = ConstitutionCreateSchema.parse({
      projectName: 'minimal-project',
      principles: ['Simplicity'],
      constraints: ['MIT licensed'],
      workspacePath: testDir
    });

    const result = await constitutionCreate(params);
    const response = JSON.parse(result.content[0].text);

    const content = await fs.readFile(response.constitutionPath, 'utf-8');

    // Verify it handles missing preferences gracefully
    expect(content).toContain('_No library preferences specified_');
    expect(content).toContain('_No pattern preferences specified_');
    expect(content).toContain('_No style preference specified_');
  });

  it('should validate schema correctly', () => {
    // Valid schema
    expect(() => {
      ConstitutionCreateSchema.parse({
        projectName: 'valid-project',
        principles: ['Principle 1'],
        constraints: ['Constraint 1']
      });
    }).not.toThrow();

    // Invalid - missing principles
    expect(() => {
      ConstitutionCreateSchema.parse({
        projectName: 'invalid-project',
        constraints: ['Constraint 1']
      });
    }).toThrow();

    // Invalid - missing constraints
    expect(() => {
      ConstitutionCreateSchema.parse({
        projectName: 'invalid-project',
        principles: ['Principle 1']
      });
    }).toThrow();

    // Invalid - empty arrays
    expect(() => {
      ConstitutionCreateSchema.parse({
        projectName: 'invalid-project',
        principles: [],
        constraints: []
      });
    }).not.toThrow(); // Should allow empty arrays
  });

  it('should create constitution in correct directory structure', async () => {
    const params = ConstitutionCreateSchema.parse({
      projectName: 'structured-project',
      principles: ['Good structure'],
      constraints: ['Well organized'],
      workspacePath: testDir
    });

    const result = await constitutionCreate(params);
    const response = JSON.parse(result.content[0].text);

    // Verify directory structure
    const constitutionPath = response.constitutionPath;
    expect(constitutionPath).toMatch(/structured-project[/\\]constitution\.md$/);

    // Check parent directory exists
    const parentDir = path.dirname(constitutionPath);
    const stats = await fs.stat(parentDir);
    expect(stats.isDirectory()).toBe(true);
  });
});
