# GitLumen MCP Server Architecture

This is Path 1: a standalone intelligence MCP server. It does not execute onchain actions.

```txt
AI Agent / MCP Client
        |
        | stdio MCP tools
        v
GitLumen MCP Server
        |
        |-- screen_repository
        |-- get_repository_structure
        |-- get_review_report
        |-- list_review_reports
        \-- explain_gitlumen_mcp_flow
        |
        v
GitHub Public API / Raw Files
        |
        v
Local Heuristic Analyzer
        |
        |-- repo / PR context
        |-- dependency signals
        |-- test-surface signals
        |-- security heuristics
        |-- operations / CI signals
        |-- risk scoring
        \-- review chapters
        |
        v
Local Report Store
.gitlumen-mcp/reports/*.json
```

## Why this is useful before Base MCP

GitLumen needs a review-intelligence layer before payments, rewards, or reputation can be attached.
This MCP server gives agents a callable interface for repository/PR screening.

Path 2 can later add Base MCP custom plugin support:

```txt
GitLumen MCP report
        |
        |-- quote review credit
        |-- prepare onchain calldata
        |-- Base MCP get_wallets
        |-- Base MCP send_calls
        \-- confirmed review/reward/reputation event
```

## Current scanner limitations

- Only public GitHub repositories are supported by default.
- Private repositories require a GitHub token with proper access.
- The analyzer is heuristic-based and does not replace human security review.
- It does not run tests/builds or resolve dependency CVEs online.
- It intentionally does not send repository content to external LLM APIs.

## Extension points

- Add real GitLumen API calls in `src/services/gitlumen.js`.
- Replace local analyzer with a hosted Review Intelligence Engine.
- Add authenticated GitHub App support.
- Add SARIF output.
- Add Base MCP Path 2 prepare endpoints.
