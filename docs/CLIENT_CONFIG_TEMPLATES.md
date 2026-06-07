# Client Configuration Templates (Copilot / VS Code / Codex)

This project supports two MCP transport modes:

- Local stdio mode: run `src/index.js` as a local process.
- Remote Streamable HTTP mode: run `src/http.js` and expose `/mcp`.

## 1) VS Code + GitHub Copilot (mcp.json)

VS Code and Copilot Chat use `mcp.json` with `servers` entries.

Recommended locations:

- Workspace-level: `.vscode/mcp.json`
- User-level: use the command `MCP: Open User Configuration`

Templates:

- stdio: [examples/vscode_mcp.stdio.example.json](examples/vscode_mcp.stdio.example.json)
- remote HTTP: [examples/vscode_mcp.remote_http.example.json](examples/vscode_mcp.remote_http.example.json)
- remote HTTP (this deployed endpoint): [examples/vscode_mcp.gitlumen.remote.example.json](examples/vscode_mcp.gitlumen.remote.example.json)

Copy one of the templates above into `.vscode/mcp.json` (this file is gitignored — it is local to your workspace and may contain secrets) and replace placeholders such as `REPLACE_WITH_MCP_AUTH_TOKEN` with your real token before enabling the server.

Notes:

- Use absolute paths for local stdio command args.
- For remote HTTP production, use HTTPS and bearer token.

## 2) Codex CLI / Codex IDE extension (config.toml)

Codex uses TOML config:

- Global: `~/.codex/config.toml`
- Project-scoped: `.codex/config.toml`

Templates:

- stdio: [examples/codex.config.stdio.example.toml](examples/codex.config.stdio.example.toml)
- remote HTTP: [examples/codex.config.remote_http.example.toml](examples/codex.config.remote_http.example.toml)

Notes:

- For remote HTTP, set `MCP_AUTH_TOKEN` in your shell environment.
- Codex supports both stdio and Streamable HTTP MCP servers.

## 3) Choosing a mode

Use stdio when:

- you run everything on one machine
- you want simplest setup

Use remote HTTP when:

- server runs on VPS
- you need always-on access
- you need shared access across devices/users

For VPS deployment with PM2 and reverse proxy:

- [docs/DEPLOY_VPS_PM2.md](docs/DEPLOY_VPS_PM2.md)
- [ecosystem.config.cjs](ecosystem.config.cjs)
