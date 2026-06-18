# @tablecharts/mcp-server

[![npm](https://img.shields.io/npm/v/@tablecharts/mcp-server.svg)](https://www.npmjs.com/package/@tablecharts/mcp-server)

MCP server for [TableCharts](https://tablecharts.co) — turn tables (CSV, JSON, Notion, Google Sheets, Salesforce) into shareable interactive dashboards, directly from Claude, Cursor, VS Code, or any other [MCP](https://modelcontextprotocol.io) client.

## Why

LLMs are great at producing structured data but terrible at producing real charts. This server gives any MCP-aware assistant a one-shot tool to convert tabular data into a hosted, embeddable dashboard with a public URL.

## Install

```bash
npm i -g @tablecharts/mcp-server
```

Or run on demand with `npx -y @tablecharts/mcp-server` — no install needed.

## Get an API key

1. Sign up at <https://tablecharts.co>
2. Open <https://tablecharts.co/api-keys>
3. Create a key starting with `tc_live_…`

## Configure your MCP client

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tablecharts": {
      "command": "npx",
      "args": ["-y", "@tablecharts/mcp-server"],
      "env": {
        "TABLECHARTS_API_KEY": "tc_live_..."
      }
    }
  }
}
```

Restart Claude Desktop. The `generate_dashboard` tool will appear in the tools menu.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tablecharts": {
      "command": "npx",
      "args": ["-y", "@tablecharts/mcp-server"],
      "env": { "TABLECHARTS_API_KEY": "tc_live_..." }
    }
  }
}
```

### VS Code (with MCP extension)

```json
{
  "mcp.servers": {
    "tablecharts": {
      "command": "npx",
      "args": ["-y", "@tablecharts/mcp-server"],
      "env": { "TABLECHARTS_API_KEY": "tc_live_..." }
    }
  }
}
```

## Tools

| Tool | Description |
| --- | --- |
| `generate_dashboard` | Create a dashboard from `data` (JSON rows), `csv` (string), or `source_url` (Notion / Google Sheets / Salesforce). Returns `dashboard_url`, `embed_url`, `iframe_code`. |
| `list_chart_types` | Returns the 6 supported chart types: `bar`, `line`, `area`, `pie`, `scatter`, `radar`. |

### Example prompts

- *"Chart my monthly revenue: Jan 12k, Feb 15k, Mar 18k, Apr 22k. Use TableCharts."*
- *"Pull this Notion database and build a dashboard: https://notion.so/…"*
- *"Take this CSV and pick the best chart type automatically."*

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `TABLECHARTS_API_KEY` | yes | Your `tc_live_…` key from <https://tablecharts.co/api-keys> |
| `TABLECHARTS_API_BASE` | no | Override the API base (default `https://tablecharts.co`) |

## Limits

- Free tier: 3 saved charts, 30 requests/minute.
- Pro tier: unlimited charts, AI cleaning, AI chart recommendation, custom colors, no watermark.

## License

MIT
