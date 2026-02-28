---
name: setup-project
description: Install or configure DeepWiki MCP. Use when the user asks to install DeepWiki, connect the DeepWiki MCP server, or set up repository documentation lookup for public GitHub repositories.
---

# Setup Project

## Overview

Use this skill to install DeepWiki MCP with the recommended `/mcp` endpoint.

## Install DeepWiki MCP

### Codex

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.deepwiki]
url = "https://mcp.deepwiki.com/mcp"
```

### Claude Code

Run:

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```

### Other MCP clients

Use:

```json
{
  "mcpServers": {
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    }
  }
}
```

## Notes

- DeepWiki is free and does not require authentication for public repositories
- Use `https://mcp.deepwiki.com/mcp`
- Do not use the legacy `/sse` endpoint unless the client requires it
