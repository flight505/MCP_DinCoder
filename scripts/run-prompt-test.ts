#!/usr/bin/env tsx
/**
 * DinCoder Prompt Test Runner
 *
 * Automates the validation steps defined in docs/PROMPT_TEST.md against
 * a locally running MCP DinCoder server (HTTP transport).
 *
 * Requirements:
 *   - Server running at http://127.0.0.1:8123/mcp
 *   - Workspace prepared at ~/dincoder-e2e-test
 *
 * Usage:
 *   npm run dev:http   # in another terminal
 *   tsx scripts/run-prompt-test.ts
 */

import path from 'path';
import os from 'os';
import * as fs from 'fs/promises';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

interface ToolResult {
  tool: string;
  success: boolean;
  error?: string;
  data?: unknown;
  rawText?: string | null;
  durationMs: number;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const workspacePath = path.join(os.homedir(), 'dincoder-e2e-test');
  const results: ToolResult[] = [];

  console.log('📂 Workspace:', workspacePath);
  console.log('📡 Target MCP endpoint: http://127.0.0.1:8123/mcp');

  // Basic workspace sanity check
  try {
    await fs.mkdir(workspacePath, { recursive: true });
    const stat = await fs.stat(workspacePath);
    if (!stat.isDirectory()) {
      throw new Error('Workspace path exists but is not a directory');
    }
    const entries = await fs.readdir(workspacePath);
    if (entries.length > 0 && !(entries.length === 1 && entries[0] === '.git')) {
      console.warn('⚠️  Workspace not empty. Existing files will be reused.');
    } else {
      console.log('✅ Workspace is empty (aside from optional .git directory).');
    }
  } catch (error) {
    throw new Error(`Workspace validation failed: ${(error as Error).message}`);
  }

  await ensureWorkspaceNodeProject(workspacePath);

  const loggingFetch: typeof fetch = async (input, init) => {
    if (typeof input === 'string' || input instanceof URL) {
      console.log(`   ↗ HTTP ${init?.method || 'GET'} ${input.toString()}`);
    }
    if (init?.headers) {
      console.log(`     headers: ${JSON.stringify(init.headers)}`);
    }
    if (init?.body && typeof init.body === 'string') {
      console.log(`     body: ${init.body}`);
    }
    return fetch(input, init);
  };

  const transport = new StreamableHTTPClientTransport(
    new URL('http://127.0.0.1:8123/mcp'),
    {
      fetch: loggingFetch,
      requestInit: {
        headers: {
          Accept: 'application/json, text/event-stream',
        },
      },
    }
  );

  const client = new Client({
    name: 'prompt-test-runner',
    version: '0.0.1',
  });

  await client.connect(transport);
  await client.listTools();
  console.log('🔗 Connected to DinCoder MCP server.\n');

  const callTool = async (tool: string, params: Record<string, unknown>) => {
    const start = Date.now();
    console.log(`🔧 ${tool}`);
    console.log(`   params: ${JSON.stringify(params)}`);

    try {
      const result = await client.callTool({
        name: tool,
        arguments: params,
      });

      const textBlocks = (Array.isArray(result.content) ? result.content : [])
        .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
        .map(block => block.text);

      const primaryText = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1] : null;
      let parsed: unknown = null;

      if (primaryText) {
        try {
          parsed = JSON.parse(primaryText);
        } catch {
          parsed = primaryText;
        }
      } else if (result.structuredContent) {
        parsed = result.structuredContent;
      }

      const success = !result.isError && !(parsed && typeof parsed === 'object' && 'success' in parsed && (parsed as any).success === false);

      const durationMs = Date.now() - start;
      results.push({
        tool,
        success,
        data: parsed ?? result,
        rawText: primaryText,
        durationMs,
      });

      console.log(`   status: ${success ? 'SUCCESS' : 'FAILED'} (${durationMs}ms)`);
      if (parsed && typeof parsed === 'object') {
        console.log(`   summary: ${JSON.stringify(parsed, null, 2).slice(0, 600)}\n`);
      } else if (typeof parsed === 'string') {
        console.log(`   output: ${parsed.slice(0, 600)}\n`);
      } else {
        console.log('   no structured/text response; raw result recorded\n');
      }

      return parsed;
    } catch (error) {
      const durationMs = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      results.push({ tool, success: false, error: message, durationMs });
      console.error(`   status: ERROR (${durationMs}ms) -> ${message}\n`);
      return null;
    }
  };

  // Step 1: constitution_create
  const constitutionParams = {
    projectName: 'QA Validation Suite',
    principles: ['Ship specs before code', 'Prefer deterministic tools'],
    constraints: ['Tests must gate merges', 'Support macOS/Linux clients'],
    preferences: {
      libraries: ['Vitest', 'Prettier'],
      patterns: ['Spec-first planning'],
      style: 'Functional > OOP',
    },
    workspacePath,
  };
  const constitutionResult = await callTool('constitution_create', constitutionParams);

  let featurePath = '';
  if (
    constitutionResult &&
    typeof constitutionResult === 'object' &&
    'constitutionPath' in constitutionResult
  ) {
    const constitutionPath = (constitutionResult as Record<string, string>).constitutionPath;
    featurePath = path.dirname(constitutionPath);
    console.log(`📁 Feature directory detected: ${featurePath}\n`);
  }

  // Step 2: specify_start
  const specifyStartParams = {
    projectName: 'QA Validation Suite',
    agent: 'claude',
    workspacePath,
  };
  const specifyStartResult = await callTool('specify_start', specifyStartParams);

  if (
    specifyStartResult &&
    typeof specifyStartResult === 'object' &&
    'details' in specifyStartResult
  ) {
    const details = (specifyStartResult as any).details;
    if (details?.filesCreated?.spec) {
      featurePath = path.dirname(details.filesCreated.spec);
      console.log(`📁 Updated feature directory from specify_start: ${featurePath}\n`);
    }
  }

  if (!featurePath) {
    throw new Error('Unable to determine feature directory after specify_start');
  }

  // Step 3: specify_describe
  const describeText = `
## Product Brief: QA Validation Suite

The QA Validation Suite is a lightweight command-line toolkit that validates MCP workflows end-to-end.
It must orchestrate constitution creation, specification drafting, planning, task derivation, and quality gates.

Key goals:
- Provide deterministic scaffolding for specification-driven development teams.
- Run entirely locally without external dependencies.
- Capture structured artifacts compatible with DinCoder workflows.

Success criteria:
- Generates spec.md, plan.md, tasks.md that mirror Spec Kit conventions.
- Supports iterative refinement by logging clarifications and research notes.
- Surfaces actionable quality signals for linting, tests, and dependency health.

Open questions:
- Should the suite bundle git automation or expect teams to manage branches separately?
- How do we tailor quality checks for non-Node projects while keeping defaults sensible?
`;

  const specifyDescribeResult = await callTool('specify_describe', {
    description: describeText.trim(),
    workspacePath,
  });

  if (
    specifyDescribeResult &&
    typeof specifyDescribeResult === 'object' &&
    'specPath' in specifyDescribeResult
  ) {
    featurePath = path.dirname(String((specifyDescribeResult as any).specPath));
    console.log(`📁 Feature directory updated from specify_describe: ${featurePath}\n`);
  }

  // Step 4: plan_create
  const constraintsText = `
- Backend: Node.js 20 with TypeScript, Express for HTTP transport.
- Frontend: None (CLI-only); focus on structured markdown outputs.
- Data: Local filesystem only; must work offline.
- Testing: Vitest for unit/integration, mock MCP clients for simulation.
- Deployment: Target Smithery hosting with Streamable HTTP.
- Observability: Emit structured JSON logs compatible with Datadog ingestion.
  `;
  const planCreateResult = await callTool('plan_create', {
    constraintsText: constraintsText.trim(),
    workspacePath,
  });

  if (
    planCreateResult &&
    typeof planCreateResult === 'object' &&
    'planPath' in planCreateResult
  ) {
    featurePath = path.dirname(String((planCreateResult as any).planPath));
    console.log(`📁 Feature directory updated from plan_create: ${featurePath}\n`);
  }

  // Step 5: tasks_generate
  const tasksGenerateResult = await callTool('tasks_generate', {
    scope: 'Full implementation of QA Validation Suite',
    workspacePath,
  });

  // Determine first task ID from tasks.md
  const tasksPath =
    tasksGenerateResult &&
    typeof tasksGenerateResult === 'object' &&
    'tasksPath' in tasksGenerateResult
      ? String((tasksGenerateResult as any).tasksPath)
      : path.join(featurePath, 'tasks.md');

  console.log(`📝 Using tasks file: ${tasksPath}\n`);

  const tasksContent = await fs.readFile(tasksPath, 'utf-8');
  const taskIdMatch = tasksContent.match(/- \[ \] ([A-Z0-9-]+)/);
  if (!taskIdMatch) {
    throw new Error('Unable to locate a task ID in tasks.md');
  }
  const firstTaskId = taskIdMatch[1];
  console.log(`📝 First task ID: ${firstTaskId}\n`);

  await callTool('tasks_tick', {
    taskId: firstTaskId,
    workspacePath,
  });

  // Step 6: Clarification workflow
  const clarifyAddResult = await callTool('clarify_add', {
    question: 'Do we need to support remote artifact storage or only local filesystem?',
    context: '## Open Questions',
    options: ['Local filesystem only', 'Support S3-compatible buckets later'],
    workspacePath,
  });

  let clarificationId = '';
  if (
    clarifyAddResult &&
    typeof clarifyAddResult === 'object' &&
    'clarificationId' in clarifyAddResult
  ) {
    clarificationId = String((clarifyAddResult as any).clarificationId);
  } else {
    throw new Error('clarify_add did not return a clarificationId');
  }

  await callTool('clarify_list', {
    status: 'all',
    workspacePath,
  });

  await callTool('clarify_resolve', {
    clarificationId,
    resolution: 'Initial release focuses on local storage; document S3 support as a future enhancement.',
    rationale: 'Keeps MVP scope tight and avoids cloud credential handling for now.',
    workspacePath,
  });

  await callTool('clarify_list', {
    status: 'all',
    workspacePath,
  });

  // Step 7: artifacts_read
  await callTool('artifacts_read', {
    artifactType: 'spec',
    workspacePath,
  });
  await callTool('artifacts_read', {
    artifactType: 'plan',
    workspacePath,
  });
  await callTool('artifacts_read', {
    artifactType: 'tasks',
    workspacePath,
  });

  // Step 8: research_append
  await callTool('research_append', {
    topic: 'Prompt Test Execution',
    content: 'Ran end-to-end DinCoder validation prompt via automated script. Confirmed artifact generation and clarification workflow.',
    workspacePath,
  });

  // Prepare git state before git_create_branch
  try {
    execSync('git config user.email "qa-bot@example.com"', { cwd: workspacePath });
    execSync('git config user.name "DinCoder QA Bot"', { cwd: workspacePath });
    execSync('git add .', { cwd: workspacePath });
    execSync('git commit -m "chore: initial DinCoder prompt test artifacts"', {
      cwd: workspacePath,
    });
    console.log('✅ Created initial commit to enable git branch operations.\n');
  } catch (error) {
    console.warn('⚠️  Git commit setup failed:', error);
  }

  // Step 9: git_create_branch
  const gitBranchResult = await callTool('git_create_branch', {
    branchName: 'qa/dincoder-e2e',
    workspacePath,
  });

  // Switch back to main if branch creation succeeded
  if (
    gitBranchResult &&
    typeof gitBranchResult === 'object' &&
    'success' in gitBranchResult &&
    gitBranchResult.success
  ) {
    try {
      execSync('git checkout main', { cwd: workspacePath });
      console.log('🔄 Restored git branch to main.\n');
    } catch (error) {
      console.warn('⚠️  Failed to switch back to main branch:', error);
    }
  }

  // Step 10: Quality suite
  await callTool('quality_format', {
    workspacePath,
    fix: false,
  });
  await callTool('quality_lint', {
    workspacePath,
    fix: false,
  });
  await callTool('quality_test', {
    workspacePath,
    coverage: false,
  });
  await callTool('quality_security_audit', {
    workspacePath,
  });
  await callTool('quality_deps_update', {
    workspacePath,
    check: true,
  });
  await callTool('quality_license_check', {
    workspacePath,
  });

  // Step 11: Final validation (directory tree handled outside)

  // Persist results for later analysis
  const resultsPath = path.join(workspacePath, 'prompt-test-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`📝 Saved run summary to ${resultsPath}`);

  await client.close();
  await transport.close?.();
  console.log('\n✅ Prompt test run completed.');
}

async function ensureWorkspaceNodeProject(workspacePath: string): Promise<void> {
  const packageJsonPath = path.join(workspacePath, 'package.json');
  const prettierIgnorePath = path.join(workspacePath, '.prettierignore');

  let hasPackageJson = false;
  try {
    await fs.access(packageJsonPath);
    hasPackageJson = true;
  } catch {
    hasPackageJson = false;
  }

  if (!hasPackageJson) {
    console.log('📦 Initializing minimal Node project for QA workspace...\n');

    const packageJson = {
      name: 'dincoder-e2e-test',
      version: '0.0.1',
      private: true,
      scripts: {
        format: 'prettier --write --no-error-on-unmatched-pattern "src/**/*.{ts,tsx,js,jsx,cjs,mjs,json}" "tests/**/*.{ts,tsx,js,jsx,cjs,mjs,json}" "scripts/**/*.{ts,tsx,js,jsx,cjs,mjs}" "docs/**/*.{md,mdx}" "templates/**/*.{md,mdx,json}" "examples/**/*.{ts,tsx,js,jsx,md}" "*.{js,ts,tsx,cjs,mjs,json,md,mdx,yaml,yml}"',
        lint: 'echo "lint placeholder (no-op)"',
        test: 'echo "test placeholder (no-op)"',
        'test:coverage': 'npm run test',
      },
      devDependencies: {
        prettier: '^3.6.0',
      },
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');

    const ignoreContent = [
      'node_modules',
      '.dincoder',
      '.smithery',
      'dist',
      'coverage',
      'tmp',
      'logs',
    ].join('\n');
    await fs.writeFile(prettierIgnorePath, ignoreContent + '\n', 'utf-8');

    try {
      execSync('npm install', { cwd: workspacePath, stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Failed to install dev dependencies for QA workspace:', error);
    }
  } else {
    // Ensure Prettier ignore exists for existing workspaces
    try {
      await fs.access(prettierIgnorePath);
    } catch {
      const ignoreContent = [
        'node_modules',
        '.dincoder',
        '.smithery',
        'dist',
        'coverage',
        'tmp',
        'logs',
      ].join('\n');
      await fs.writeFile(prettierIgnorePath, ignoreContent + '\n', 'utf-8');
    }
  }
}

main().catch((error) => {
  console.error('❌ Prompt test runner failed:', error);
  process.exitCode = 1;
});
