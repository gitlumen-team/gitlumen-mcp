# GitLumen MCP Server - Version 1.0.0

GitLumen MCP Server is a Node.js project that exposes a GitLumen-style review intelligence layer through the Model Context Protocol (MCP), so AI agents can call it as tools.

This project focuses on:

```txt
AI Agent / MCP Client
-> GitLumen MCP Server
-> GitHub public repo / PR reader
-> local risk analyzer
-> GitLumen-style report
```

This project intentionally does not execute onchain transactions yet and does not use Base MCP `send_calls`. A Base MCP custom plugin can be attached in Path 2 after this intelligence server is ready.

---

## Features

- MCP stdio server that can be used by Claude Desktop, Cursor, Claude Code, or other MCP clients.
- Screens public GitHub repository URLs.
- Screens GitHub Pull Request URLs `/pull/<number>`.
- No GitHub token required for small/medium public repositories.
- Optional `GITHUB_TOKEN` for higher rate limits and private repositories (depending on token scope).
- Local analyzer: source code is not sent to external LLMs.
- Produces:
  - risk score
  - category risk map
  - findings
  - review chapters
  - decision questions
  - merge-readiness signal
  - recommended next actions
- Stores reports locally in `.gitlumen-mcp/reports/*.json`.
- Includes a CLI for local testing without an MCP client.

---

## Project Structure

```txt
gitlumen-mcp-server/
|- package.json
|- README.md
|- .env.example
|- examples/
|  |- claude_desktop_config.example.json
|  \- cursor_mcp.example.json
|- docs/
|  |- ARCHITECTURE.md
|  \- TOOLS.md
\- src/
   |- index.js                  # MCP stdio server entrypoint
   |- cli.js                    # CLI local test
   |- doctor.js                 # environment checker
   |- config.js
   |- types.js
   |- services/
   |  |- github.js              # GitHub API + raw file loader
   |  |- analyzer.js            # local heuristic risk engine
   |  |- gitlumen.js            # service orchestrator
   |  \- reportStore.js         # local report persistence
   \- utils/
      |- githubUrl.js
      |- ids.js
      \- text.js
```

---

## Requirements

- Node.js 20+
- npm
- Internet access to fetch metadata/files from GitHub

Check Node version:

```bash
node -v
```

If your version is Node 18 or below, upgrade to Node 20+.

---

## 1. Install Dependencies

Open the project directory:

```bash
cd gitlumen-mcp-server
```

Install dependencies:

```bash
npm install
```

---

## 2. Optional Env Setup

Copy env example:

```bash
cp .env.example .env
```

Fill optional values:

```bash
GITHUB_TOKEN=ghp_xxx_or_fine_grained_token
GITLUMEN_MCP_DATA_DIR=.gitlumen-mcp
GITLUMEN_MAX_FILE_BYTES=120000
```

For public repositories, `GITHUB_TOKEN` can be empty. A token is still recommended to avoid low GitHub rate limits.

---

## 3. Run Doctor

```bash
npm run doctor
```

Expected output:

```txt
GitLumen MCP Doctor

✅ Node version: v20.x.x
✅ GITHUB_TOKEN configured: no (public unauthenticated mode)
✅ Data directory: /path/to/gitlumen-mcp-server/.gitlumen-mcp
✅ Reports directory writable: /path/to/gitlumen-mcp-server/.gitlumen-mcp/reports
```

---

## 4. Test Screening via CLI

### Offline test without GitHub network

```bash
npm run sample
```

This command generates a report from a local fixture so you can verify analyzer and report-store behavior without GitHub connectivity.

### Screen a public repository

```bash
npm run screen -- https://github.com/modelcontextprotocol/typescript-sdk quick
```

### Screen a public PR

```bash
npm run screen -- https://github.com/modelcontextprotocol/typescript-sdk/pull/1 quick
```

### Available scopes

```txt
quick     = fastest, fewer files
standard  = balanced default
```

Examples:

```bash
npm run screen -- https://github.com/owner/repo standard
npm run screen -- https://github.com/owner/repo quick main
```

After completion, CLI prints a markdown report and saves JSON to:

```txt
.gitlumen-mcp/reports/<reportId>.json
```

---

## 5. Read Previous Reports

```bash
npm run list -- 10
```

Take a `reportId`, then:

```bash
npm run report -- glr_xxxxxxxxxxxxxxxx markdown
```

Or full JSON:

```bash
npm run report -- glr_xxxxxxxxxxxxxxxx json
```

---

## 6. Run as MCP Server

The MCP server uses stdio, so it is normally started by an MCP client instead of being run manually.

```bash
node /ABSOLUTE/PATH/TO/gitlumen-mcp-server/src/index.js
```

To debug MCP protocol, use MCP Inspector:

```bash
npm run inspect
```

Then open the Inspector URL printed in terminal.

### Optional: Run as Remote MCP HTTP Server (for VPS/PM2)

This project also includes a Streamable HTTP transport endpoint at `/mcp`.

Run locally:

```bash
npm run start:http
```

Environment variables:

```bash
PORT=3333
HOST=0.0.0.0
MCP_AUTH_TOKEN=replace_with_a_long_random_token
```

- `MCP_AUTH_TOKEN` is optional but strongly recommended for production.
- When set, clients must send `Authorization: Bearer <token>`.

Health check:

```bash
curl -s http://localhost:3333/health
```

Production deployment guide:

- PM2 example config: [examples/ecosystem.pm2.example.cjs](examples/ecosystem.pm2.example.cjs)

Client configuration templates (Copilot / VS Code / Codex):

- [docs/CLIENT_CONFIG_TEMPLATES.md](docs/CLIENT_CONFIG_TEMPLATES.md)
- VS Code remote endpoint template: [examples/vscode_mcp.gitlumen.remote.example.json](examples/vscode_mcp.gitlumen.remote.example.json) (copy into `.vscode/mcp.json`, which is gitignored)

---

## 7. Install in Claude Desktop

Open Claude Desktop config.

Common location:

### macOS

```txt
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Windows

```txt
%APPDATA%\Claude\claude_desktop_config.json
```

Add:

```json
{
  "mcpServers": {
    "gitlumen": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/gitlumen-mcp-server/src/index.js"],
      "env": {
        "GITHUB_TOKEN": "optional_github_token_here",
        "GITLUMEN_MCP_DATA_DIR": "/ABSOLUTE/PATH/TO/gitlumen-mcp-server/.gitlumen-mcp"
      }
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/...` with your real path.

Restart Claude Desktop.

Example prompt:

```txt
Use GitLumen to screen https://github.com/modelcontextprotocol/typescript-sdk with quick scope. Return the risk map and top findings.
```

---

## 8. Install in Cursor

Create or edit Cursor MCP config (format may vary by Cursor version):

```json
{
  "mcpServers": {
    "gitlumen": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/gitlumen-mcp-server/src/index.js"],
      "env": {
        "GITHUB_TOKEN": "optional_github_token_here"
      }
    }
  }
}
```

Restart Cursor, then ask the agent to use GitLumen tools.

---

## Available MCP Tools

### `screen_repository`

Screen a repository or PR.

Input:

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "scope": "standard",
  "output": "compact"
}
```

For PR:

```json
{
  "repoUrl": "https://github.com/owner/repo/pull/123",
  "scope": "quick",
  "output": "markdown"
}
```

Output modes:

```txt
compact   = concise JSON for agent replies
markdown  = full markdown report
json      = full JSON report
```

### `get_review_report`

Fetch a previous report by `reportId`.

```json
{
  "reportId": "glr_xxxxxxxxxxxxxxxx",
  "output": "markdown"
}
```

### `list_review_reports`

List local reports.

```json
{
  "limit": 20
}
```

### `get_repository_structure`

Get repository/PR structure without generating a full risk report.

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "limit": 300
}
```

### `explain_gitlumen_mcp_flow`

Explain Path 1 flow and how Path 2 Base MCP can be attached later.

---

## How the Analyzer Works

The local analyzer reads:

- repository metadata
- default branch
- recursive tree
- selected source/config files
- PR metadata and changed files (for PR URLs)

Then it generates signals:

- language/framework detection
- dependency surface
- lockfile presence
- lifecycle script risk
- test presence
- CI presence
- Dockerfile/container risk
- possible hardcoded secret patterns
- dynamic code execution
- command execution pattern
- SQL interpolation pattern
- GitHub Actions supply-chain pattern
- merge-readiness estimate

Risk categories:

```txt
security
dependencies
tests
architecture
operations
maintainability
```

Severity:

```txt
critical
high
medium
low
info
```

---

## Example Compact Report Output

```json
{
  "reportId": "glr_abc123...",
  "risk": {
    "score": 42,
    "level": "medium",
    "mergeReadiness": "review_required",
    "categoryScores": {
      "security": 24,
      "dependencies": 13,
      "tests": 24,
      "architecture": 0,
      "operations": 13,
      "maintainability": 5
    }
  },
  "summary": "The repository/PR has medium risk signals...",
  "findings": [],
  "decisionQuestions": [],
  "recommendations": []
}
```

---

## Path 1 vs Path 2

### Path 1 (this project)

```txt
Repo/PR intelligence
Risk map
Review chapters
Decision questions
Report retrieval
```

### Path 2 (future)

```txt
Base MCP get_wallets
GitLumen quote endpoint
GitLumen prepare endpoint
Base MCP send_calls
Review credit purchase
Reward claim
Reviewer reputation
```

This project is intentionally standalone for Path 1 first. Later, Path 2 can read `reportId` and connect it with onchain payment/reward/reputation flows.

---

## Troubleshooting

### `Unable to reach GitHub API` or `fetch failed`

Check internet connection, DNS, proxy/VPN, or retry. For offline verification:

```bash
npm run sample
```

### `GitHub API 403 rate limit exceeded`

Add `GITHUB_TOKEN` in `.env` or MCP client config.

### `Only github.com repositories are supported`

This prototype does not support GitLab/Bitbucket yet. Add a new adapter in `src/services/github.js` or create a separate service.

### MCP client cannot see tools

Check:

1. `args` path is absolute.
2. `npm install` has been run.
3. Node 20+ is installed.
4. MCP client was restarted.
5. Verify with `npm run inspect`.

### Report is not saved

Run:

```bash
npm run doctor
```

Ensure `.gitlumen-mcp/reports` is writable.

---

## Important Files for Future Changes

### Add a new detector

Edit:

```txt
src/services/analyzer.js
```

### Change repository fetching behavior

Edit:

```txt
src/services/github.js
```

### Replace local analyzer with hosted GitLumen API

Edit:

```txt
src/services/gitlumen.js
```

Potential production direction:

```txt
screen_repository MCP tool
-> GitLumen hosted API /v1/screenings
-> GitLumen Review Intelligence Engine
-> reportId
-> get_review_report MCP tool
```

---

## Security Notes

- Do not commit `.env`.
- Do not hardcode GitHub tokens in publicly shared config.
- For private repositories, use least-privilege fine-grained GitHub tokens.
- Local reports may contain paths, findings, and snippet metadata. Store them securely for private repositories.

---

## License

MIT
