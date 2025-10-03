/**
 * Smithery build configuration
 * Used by @smithery/cli for building the MCP server
 */

export default {
  esbuild: {
    // External packages that shouldn't be bundled
    external: [
      '@modelcontextprotocol/sdk',
      '@smithery/sdk',
      'express',
      'zod',
      'dotenv',
    ],
    // Build for Node.js 20
    platform: 'node',
    target: 'node20',
    // Minify for production
    minify: true,
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Output format
    format: 'esm',
  },
};
