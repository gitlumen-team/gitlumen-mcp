# MCP Tools

## `screen_repository`

Generate a GitLumen-style risk report from a public GitHub repo or PR URL.

Input:

```json
{
  "repoUrl": "https://github.com/modelcontextprotocol/typescript-sdk",
  "scope": "quick",
  "output": "compact"
}
```

Supported scope:

- `quick`: fewer files, fastest initial scan
- `standard`: balanced default

Supported output:

- `compact`: useful JSON summary for agent replies
- `markdown`: full human-readable report
- `json`: full report object

## `get_review_report`

Fetch a previously generated local report by `reportId`.

## `list_review_reports`

List stored reports from `.gitlumen-mcp/reports`.

## `get_repository_structure`

Fetch repository/PR structure without generating a full risk report.

## `explain_gitlumen_mcp_flow`

Explains the Path 1 architecture and how Path 2 can attach Base MCP later.
