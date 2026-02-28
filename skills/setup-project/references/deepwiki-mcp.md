# DeepWiki MCP

Recommended endpoint:

`https://mcp.deepwiki.com/mcp`

## Install

### Codex

```toml
[mcp_servers.deepwiki]
url = "https://mcp.deepwiki.com/mcp"
```

### Claude Code

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```

### Generic MCP config

```json
{
  "mcpServers": {
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    }
  }
}
```
