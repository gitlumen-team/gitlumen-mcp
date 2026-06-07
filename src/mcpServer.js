import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { GitLumenService } from './services/gitlumen.js';
import { safeJson, truncateText } from './utils/text.js';

function text(content) {
  return { content: [{ type: 'text', text: content }] };
}

function reportCompact(report) {
  return {
    reportId: report.reportId,
    generatedAt: report.generatedAt,
    target: report.target,
    risk: report.risk,
    summary: report.summary,
    findings: report.findings.slice(0, 20),
    decisionQuestions: report.decisionQuestions,
    recommendations: report.recommendations,
    markdown: truncateText(report.markdown, 12000)
  };
}

export function createGitLumenMcpServer(service = new GitLumenService()) {
  const server = new McpServer({
    name: 'gitlumen-mcp-server',
    version: '1.0.0'
  });

  server.tool(
    'screen_repository',
    'Screen a public GitHub repository or GitHub pull request URL and generate a GitLumen-style risk report. Supports repo URLs and /pull/<number> URLs.',
    {
      repoUrl: z.string().describe('GitHub repository URL, for example https://github.com/owner/repo or https://github.com/owner/repo/pull/123'),
      branch: z.string().optional().describe('Optional branch/ref. Ignored for PR URLs unless GitHub needs fallback.'),
      scope: z.enum(['quick', 'standard']).default('standard').describe('Screening depth. quick downloads fewer files; standard downloads more files.'),
      maxFiles: z.number().int().min(1).max(300).optional().describe('Optional hard cap for files downloaded and scanned.'),
      output: z.enum(['compact', 'markdown', 'json']).default('compact').describe('Response format returned to the MCP client.')
    },
    async (input) => {
      const report = await service.screenRepository(input);
      if (input.output === 'markdown') return text(report.markdown);
      if (input.output === 'json') return text(safeJson(report));
      return text(safeJson(reportCompact(report)));
    }
  );

  server.tool(
    'get_review_report',
    'Get a previously generated GitLumen MCP report by reportId.',
    {
      reportId: z.string().describe('Report id returned by screen_repository, for example glr_abcd1234abcd1234'),
      output: z.enum(['compact', 'markdown', 'json']).default('compact')
    },
    async ({ reportId, output }) => {
      const report = await service.getReport(reportId);
      if (output === 'markdown') return text(report.markdown);
      if (output === 'json') return text(safeJson(report));
      return text(safeJson(reportCompact(report)));
    }
  );

  server.tool(
    'list_review_reports',
    'List previously generated GitLumen MCP reports stored locally.',
    {
      limit: z.number().int().min(1).max(100).default(20)
    },
    async ({ limit }) => {
      const reports = await service.listReports(limit);
      return text(safeJson(reports));
    }
  );

  server.tool(
    'get_repository_structure',
    'Fetch public GitHub repository or PR structure without generating a full risk report.',
    {
      repoUrl: z.string().describe('GitHub repository or pull request URL.'),
      branch: z.string().optional().describe('Optional branch/ref.'),
      limit: z.number().int().min(10).max(1000).default(300).describe('Maximum tree entries to return.')
    },
    async (input) => {
      const structure = await service.getRepositoryStructure(input);
      return text(safeJson(structure));
    }
  );

  server.tool(
    'explain_gitlumen_mcp_flow',
    'Explain how this Path 1 MCP server fits into GitLumen and how it later connects to Base MCP Path 2.',
    {},
    async () => text(`# GitLumen MCP Flow\n\nPath 1 turns GitLumen into an MCP server for agents. Agents can call repository/PR screening tools, fetch previous reports, and inspect repository structure.\n\nPrimary flow:\n1. A user asks an agent to analyze a GitHub repository or PR.\n2. The agent calls the \`screen_repository\` tool.\n3. The server fetches public metadata/tree/files from the GitHub API.\n4. The analyzer builds a risk map, findings, review chapters, decision questions, and a merge-readiness signal.\n5. The report is stored locally in \`.gitlumen-mcp/reports\`.\n6. The agent uses the report to answer the user or continue the review workflow.\n\nPath 2 can be added later with a Base MCP custom plugin:\n- get_wallets for wallet identity.\n- prepare review-credit / claim-reward endpoints.\n- send_calls for approve/purchase/claim onchain actions.\n\nThis server intentionally does not execute onchain transactions. The focus is the intelligence layer first.`)
  );

  return server;
}
