# Family-MCP

A comprehensive Model Context Protocol (MCP) server for FamilySearch.org integration. This server provides AI assistants with access to genealogical data, family tree information, and research tools from FamilySearch.

## 🌟 Features

### 24 Powerful Tools

- **Person & Family Tools** - Get person details, search people, retrieve parents, children, spouses, and full family relationships
- **Sources & Records** - Search historical records, manage source attachments
- **Memories** - Search and upload photos, stories, and documents
- **GEDCOM** - Import and export GEDCOM genealogy data
- **AI-Powered Research** - Generate hints, suggest merges, explain matches, rank research priorities
- **Research Planning** - Create structured research plans (e.g., paternal line research)
- **Utilities** - Cache management, health checks

See [TOOLS.md](./TOOLS.md) for complete tool reference.

### Security & Performance

- **Encrypted Token Storage** - AES-256-GCM encryption for access tokens
- **Built-in Caching** - Reduces API calls and improves performance
- **Zod Schema Validation** - Type-safe input validation
- **Multiple Transports** - Support for both stdio and HTTP/SSE

## 📋 Quick Start

### Installation

```bash
git clone https://github.com/shelbeely/Family-MCP.git
cd Family-MCP
npm install
npm run build
```

### Configuration

Set your FamilySearch access token:

```bash
export FAMILYSEARCH_TOKEN="your-access-token-here"
```

Optional encryption password:

```bash
export FAMILY_MCP_PASSWORD="your-secure-password"
```

See [CONFIGURATION.md](./CONFIGURATION.md) for all configuration options.

### Running

**Stdio mode (for MCP clients):**
```bash
npm start
```

**HTTP mode (for web apps):**
```bash
npm run start:http
# Server starts on http://localhost:3000
```

## 🔧 Usage

### With Claude Desktop

Add to your Claude Desktop configuration:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "familysearch": {
      "command": "node",
      "args": ["/absolute/path/to/Family-MCP/dist/index.js"],
      "env": {
        "FAMILYSEARCH_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

Then ask Claude:
- "Search FamilySearch for John Smith born in 1850"
- "Get the parents of person KWQS-BBQ"
- "Generate a timeline for person KWQS-BBQ"
- "Find potential duplicates for this person"

### With Other MCP Clients

The server works with any MCP-compatible client that supports stdio or HTTP transport.

### With GitHub Copilot Coding Agent

Add secrets with the `COPILOT_MCP_` prefix in your repository's **Settings → Copilot → Coding agent**, then configure `.github/copilot/mcp.json`:

```json
{
  "mcpServers": {
    "familysearch": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {
        "FAMILYSEARCH_TOKEN": "${COPILOT_MCP_FAMILYSEARCH_TOKEN}"
      }
    }
  }
}
```

See [CONFIGURATION.md](./CONFIGURATION.md) for full setup details.

## 📚 Documentation

- **[TOOLS.md](./TOOLS.md)** - Complete reference for all 24 tools
- **[EXAMPLES.md](./EXAMPLES.md)** - Usage examples and recipes
- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration guide
- **[LICENSE](./LICENSE)** - MIT License

## 🛠️ Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Run tests

```bash
node test/basic-test.js
```

## 📦 Project Structure

```
Family-MCP/
├── src/
│   ├── index.ts              # Main MCP server (stdio)
│   ├── http-server.ts        # HTTP/SSE server
│   ├── familysearch-client.ts # FamilySearch API wrapper
│   ├── token-store.ts        # Encrypted token storage
│   └── schemas.ts            # Zod validation schemas
├── dist/                     # Compiled JavaScript
├── test/                     # Tests
├── TOOLS.md                  # Tool reference
├── EXAMPLES.md               # Usage examples
├── CONFIGURATION.md          # Configuration guide
└── README.md                 # This file
```

## 🔐 Security

- **Encrypted Storage**: Tokens encrypted with AES-256-GCM
- **No Token Exposure**: Tokens never logged or exposed in errors
- **HTTPS Only**: All API communication over HTTPS
- **Input Validation**: All inputs validated with Zod schemas

## 🌐 API Access

To get a FamilySearch access token:

1. Register at [FamilySearch Developers](https://developers.familysearch.org/)
2. Create an application and register your `client_id` / `redirect_uri`
3. Use the [OAuth 2.0 Authorization Code flow](https://developers.familysearch.org/main/docs/authentication) to obtain an access token
4. Set token in environment or encrypted storage

> **Note:** Access tokens expire after **24 hours** or **60 minutes of inactivity**. See [CONFIGURATION.md](./CONFIGURATION.md) for details.

## 🚀 Tools Overview

| Category | Tools |
|----------|-------|
| **Person** | person_get, people_search |
| **Family** | families_get, parents_get, children_get, spouses_get |
| **Sources** | sources_get, source_attach, source_detach |
| **Records** | records_search |
| **Memories** | memories_search, memory_upload |
| **GEDCOM** | gedcom_import, gedcom_export |
| **AI Research** | hints_generate, merges_suggest, match_explain_llm, hints_rank_llm, timeline_summary_llm |
| **Planning** | father_side_plan |
| **Utility** | cache_get, cache_clear, healthcheck |

Total: **24 tools**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/shelbeely/Family-MCP/issues)
- **FamilySearch API**: [API Documentation](https://developers.familysearch.org/)
- **MCP Protocol**: [MCP Documentation](https://modelcontextprotocol.io/)

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Integrates with [FamilySearch.org](https://www.familysearch.org/)
- Uses [Zod](https://github.com/colinhacks/zod) for validation

---

**Note**: This is an unofficial project and is not affiliated with or endorsed by FamilySearch International.
