#!/usr/bin/env node
import { GitLumenService } from './services/gitlumen.js';
import { safeJson } from './utils/text.js';

const service = new GitLumenService();

function help() {
  console.log(`GitLumen MCP CLI\n\nUsage:\n  npm run screen -- <github_repo_or_pr_url> [scope] [branch]\n  npm run report -- <reportId> [markdown|json]\n  npm run list -- [limit]\n\nExamples:\n  npm run screen -- https://github.com/modelcontextprotocol/typescript-sdk quick\n  npm run screen -- https://github.com/owner/repo/pull/123 standard\n  npm run report -- glr_1234abcd5678ef00 markdown\n  npm run list -- 10\n`);
}

async function main() {
  const [, , command, ...args] = process.argv;
  if (!command || command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'screen') {
    const [repoUrl, scope = 'standard', branch] = args;
    if (!repoUrl) throw new Error('repoUrl is required');
    const report = await service.screenRepository({ repoUrl, scope, branch });
    console.log(report.markdown);
    console.error(`\nSaved report: ${report.reportId}`);
    return;
  }

  if (command === 'report') {
    const [reportId, output = 'markdown'] = args;
    if (!reportId) throw new Error('reportId is required');
    const report = await service.getReport(reportId);
    console.log(output === 'json' ? safeJson(report) : report.markdown);
    return;
  }

  if (command === 'list') {
    const [limit = '20'] = args;
    const reports = await service.listReports(Number(limit));
    console.log(safeJson(reports));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[gitlumen-cli] ${error.message}`);
  process.exit(1);
});
