#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createGitLumenMcpServer } from './mcpServer.js';

const server = createGitLumenMcpServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('[gitlumen-mcp-server] fatal:', error);
  process.exit(1);
});
