import path from 'node:path';
import process from 'node:process';

export const config = {
  githubToken: process.env.GITHUB_TOKEN || '',
  dataDir: path.resolve(process.cwd(), process.env.GITLUMEN_MCP_DATA_DIR || '.gitlumen-mcp'),
  maxFileBytes: Number.parseInt(process.env.GITLUMEN_MAX_FILE_BYTES || '120000', 10),
  githubApiBase: 'https://api.github.com',
  rawBase: 'https://raw.githubusercontent.com',
  userAgent: 'gitlumen-mcp-server/1.0.0'
};

export const DEFAULT_LIMITS = {
  maxTreeEntries: 2500,
  quickMaxFiles: 40,
  standardMaxFiles: 90,
  maxPrFiles: 300
};
