# Family-MCP

A comprehensive Model Context Protocol (MCP) server for FamilySearch.org integration. This server provides AI assistants with access to genealogical data, family tree information, and research tools from FamilySearch.

## 🌟 Features

### 95 Powerful Tools across 17 Categories

- **Person & Family Tools** - Get person details, search people, retrieve parents, children, spouses, and full family relationships
- **Ancestry & Pedigree** - Multi-generation ancestor and descendant navigation
- **Person CRUD** - Create, update, and delete person records
- **Relationship Management** - Create couple/parent-child relationships, delete relationships, find relationship paths
- **User & Session** - Current user info, default tree person
- **Sources & Records** - Search historical records, manage source attachments, full source description lifecycle
- **Source Folders** - Organize sources into folders with full CRUD operations
- **Relationship Sources & Notes** - Attach/detach sources and notes at the relationship level
- **Memories & Memory Management** - Search, upload, get, delete, attach, and detach memories
- **GEDCOM** - Import and export GEDCOM genealogy data
- **Change History & Restore** - Track changes to persons and relationships, restore previous states
- **Notes** - Full CRUD for person notes
- **Batch & Merge** - Batch person retrieval, merge duplicate records
- **Match Management** - Get matches, resolve duplicates, manage not-a-match declarations
- **Preferred Relationships** - Get/set preferred parents and spouses
- **Place Authority** - Search places, get place details and subdivisions
- **Discussions** - Full CRUD for discussion threads and comments
- **AI-Powered Research** - Generate hints, suggest merges, explain matches, rank research priorities
- **Research Planning** - Create structured research plans for paternal and maternal lines
- **Record Hints & Ordinances** - Server-generated hints, ordinance status
- **Date Standardization** - Standardize date strings via FamilySearch authority
- **Collections** - Browse and search FamilySearch record collections
- **Visualization** - Generate Mermaid charts and Excalidraw drawings of family trees, timelines, and pedigrees
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

## 🤖 Custom Agents

The repository includes custom agents (`.github/agents/`) for specialized genealogy tasks with GitHub Copilot:

| Agent | Description |
|-------|-------------|
| **Family Investigator** | Detective-style genealogy research — gathers evidence, traces lineages, resolves mysteries, presents investigation reports |
| **Family Tree Visualizer** | Visualization specialist — generates Mermaid charts, Excalidraw drawings, and visual family tree representations |
| **Genealogy Planner** | Research planner — creates structured research plans with prioritized tasks, methodology, and record suggestions |

Select a custom agent from the agents dropdown in GitHub Copilot or assign it to an issue. See [GitHub Copilot custom agents docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents#using-custom-agents) for usage details.

An **agent skill** (`.github/copilot/skills/family-mcp/SKILL.md`) is also available, providing tool reference knowledge to any agent working with this repository.

## 📚 Documentation

- **[TOOLS.md](./TOOLS.md)** - Complete reference for all 95 tools
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
├── .github/
│   ├── agents/               # Custom agents for GitHub Copilot
│   │   ├── family-investigator.agent.md
│   │   ├── family-tree-visualizer.agent.md
│   │   └── genealogy-planner.agent.md
│   └── copilot/
│       └── skills/           # Agent skills
│           └── family-mcp/SKILL.md
├── src/
│   ├── index.ts              # Main MCP server (stdio)
│   ├── http-server.ts        # HTTP/SSE server
│   ├── familysearch-client.ts # FamilySearch API wrapper
│   ├── token-store.ts        # Encrypted token storage
│   ├── tools.ts              # Tool definitions & AI functions
│   ├── schemas.ts            # Zod validation schemas
│   └── visualization.ts     # Chart & drawing generation
├── dist/                     # Compiled JavaScript
├── test/                     # Tests
├── TOOLS.md                  # Tool reference
├── EXAMPLES.md               # Usage examples
├── CONFIGURATION.md          # Configuration guide
├── UPGRADE_PLAN.md           # Upgrade roadmap
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
| **Ancestry & Pedigree** | ancestry_get, descendancy_get |
| **Person CRUD** | person_create, person_update, person_delete |
| **Relationship Management** | relationship_create_couple, relationship_create_parent_child, relationship_delete, relationship_find |
| **User & Session** | user_current, user_tree_person |
| **Sources** | sources_get, source_attach, source_detach |
| **Source Descriptions** | source_description_get, source_description_create, source_description_update, source_description_delete, source_description_changes |
| **Source Folders** | source_folders_list, source_folder_create, source_folder_get, source_folder_update, source_folder_delete, source_folder_add, source_folder_remove |
| **Relationship Sources & Notes** | relationship_sources_get, relationship_source_attach, relationship_source_detach, relationship_notes_get, relationship_note_create, relationship_note_delete |
| **Records** | records_search |
| **Memories** | memories_search, memory_upload |
| **Memory Management** | memory_get, memory_delete, memory_attach, memory_detach |
| **GEDCOM** | gedcom_import, gedcom_export |
| **Change History** | change_history_person, change_history_relationship |
| **Notes** | notes_get, note_create, note_update, note_delete |
| **Batch & Merge** | persons_batch_get, person_merge |
| **Restore** | person_restore, relationship_restore, change_restore |
| **Match Management** | matches_get, match_resolve, not_a_match_create, not_a_match_delete |
| **Preferred Relationships** | preferred_parent_get, preferred_parent_set, preferred_spouse_get, preferred_spouse_set |
| **Conclusion Management** | conclusion_delete |
| **Place Authority** | place_search, place_get, place_children |
| **Discussions** | discussions_get, discussion_read, discussion_create, discussion_update, discussion_comment, discussion_comment_delete |
| **AI Research** | hints_generate, merges_suggest, match_explain_llm, hints_rank_llm, timeline_summary_llm |
| **Planning** | father_side_plan, mother_side_plan |
| **Record Hints & Ordinances** | hints_get, ordinances_get |
| **Date & Standardization** | date_standardize |
| **Collections** | collections_list, collection_get |
| **Visualization** | family_tree_chart, timeline_chart, pedigree_chart, family_tree_drawing |
| **Utility** | cache_get, cache_clear, healthcheck |

Total: **95 tools** across 17 categories

## 📊 Visualization & Charts

Family trees are visualized using two complementary approaches:

### Mermaid Charts
The `family_tree_chart`, `timeline_chart`, and `pedigree_chart` tools generate [Mermaid](https://mermaid.js.org/) syntax. Render with:
- [mcp-mermaid](https://github.com/hustcc/mcp-mermaid) — MCP server for PNG/SVG rendering
- GitHub Markdown — wrap in ` ```mermaid ``` ` code blocks
- [Mermaid Live Editor](https://mermaid.live) — browser-based rendering

### Excalidraw Drawings
The `family_tree_drawing` tool generates [Excalidraw](https://excalidraw.com)-compatible JSON. Use with:
- [excalidraw-mcp](https://github.com/excalidraw/excalidraw-mcp) — MCP App server for interactive rendering
- [Excalidraw](https://excalidraw.com) — import JSON directly
- [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) — interactive in-chat rendering

These tools are designed to be used alongside external MCP servers (mcp-mermaid, excalidraw-mcp) for rendering. Family-MCP generates the data; rendering servers display it.

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
