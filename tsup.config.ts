import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index-stdio.ts', 'src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node20',
  shims: false,
  banner: {
    js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);`,
  },
  noExternal: [],
  external: [
    '@modelcontextprotocol/sdk',
    'express',
    'zod',
    'fs',
    'path',
    'child_process',
    'util',
    'crypto',
    'stream',
    'http',
    'https',
    'events',
    'os',
    'url',
    'querystring',
    'buffer'
  ],
  esbuildOptions(options) {
    options.platform = 'node';
    options.target = 'node20';
  }
});