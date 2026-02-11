---
name: family-mcp
description: This skill should be used when the user asks about genealogy, family history, family trees, FamilySearch, visualizing family relationships, generating pedigree charts, searching historical records, or working with the Family-MCP server. Provides guidance on using the 27 MCP tools for genealogical research, family tree visualization, and FamilySearch API integration.
---

# Family-MCP Skill

Use the Family-MCP server to access FamilySearch.org genealogical data, generate family tree visualizations, and perform AI-powered genealogy research.

## Server Overview

Family-MCP is an MCP server providing 27 tools in 10 categories for genealogical research via the FamilySearch API. It supports both stdio and HTTP/SSE transports.

## Tool Categories

### Person Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `person_get` | Get detailed person info by ID |
| `people_search` | Search people by name, dates, places |

### Family Relationship Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `families_get` | Get all family relationships for a person |
| `parents_get` | Get parents of a person |
| `children_get` | Get children of a person |
| `spouses_get` | Get spouses of a person |

### Source Management Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `sources_get` | Get sources attached to a person |
| `source_attach` | Attach a source URL/citation |
| `source_detach` | Remove a source |

### Record Search (1 tool)
| Tool | Purpose |
|------|---------|
| `records_search` | Search historical records/collections |

### Memory Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `memories_search` | Search photos, stories, documents |
| `memory_upload` | Upload a memory |

### GEDCOM Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `gedcom_import` | Import GEDCOM data |
| `gedcom_export` | Export person data as GEDCOM |

### AI-Powered Research Tools (5 tools)
| Tool | Purpose |
|------|---------|
| `hints_generate` | Generate research suggestions |
| `merges_suggest` | Identify potential duplicate persons |
| `match_explain_llm` | Explain why two persons might match |
| `hints_rank_llm` | Rank hints by relevance |
| `timeline_summary_llm` | Generate narrative timeline |

### Research Planning (1 tool)
| Tool | Purpose |
|------|---------|
| `father_side_plan` | Research plan for paternal lineage |

### Visualization Tools (4 tools)
| Tool | Purpose | Output Format |
|------|---------|--------------|
| `family_tree_chart` | Family tree flowchart | Mermaid syntax |
| `timeline_chart` | Life events timeline | Mermaid syntax |
| `pedigree_chart` | Ancestry/pedigree chart | Mermaid syntax |
| `family_tree_drawing` | Interactive family tree | Excalidraw JSON |

### Utility Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `cache_get` | Retrieve cache statistics |
| `cache_clear` | Clear cached data |
| `healthcheck` | Test API connection |

## Visualization Capabilities

### Mermaid Charts
The server generates Mermaid syntax that can be rendered by:
- **mcp-mermaid** server (https://github.com/hustcc/mcp-mermaid) for PNG/SVG output
- **GitHub Markdown** (wrap in ` ```mermaid ``` ` code blocks)
- **Mermaid Live Editor** (https://mermaid.live)
- Any Mermaid-compatible viewer

**Family Tree Chart** generates a flowchart with:
- Color-coded nodes (blue=male, pink=female, gold=root person)
- Relationship edges (solid=parent-child, dashed=couple)
- Configurable direction (TB, BT, LR, RL)

**Timeline Chart** generates a timeline with:
- Birth and death events
- Optional relatives (marriages, children)

**Pedigree Chart** generates an ancestry chart with:
- Multi-generational ancestor tree (bottom-to-top)
- Color coding by generation level

### Excalidraw Drawings
The `family_tree_drawing` tool outputs Excalidraw-compatible JSON that can be:
- Imported into **Excalidraw** (https://excalidraw.com)
- Rendered via **excalidraw-mcp** server (https://github.com/excalidraw/excalidraw-mcp)
- Used with **MCP Apps** for interactive in-chat rendering

## Common Workflows

### Visualize a Family Tree
```
1. Use `person_get` with a person ID to get their details
2. Use `family_tree_chart` to generate a Mermaid flowchart
3. Optionally use `family_tree_drawing` for an Excalidraw version
```

### Research an Ancestor
```
1. Use `people_search` to find the person
2. Use `parents_get` to trace the lineage
3. Use `pedigree_chart` to visualize the ancestry
4. Use `hints_generate` for research suggestions
5. Use `records_search` to find historical records
```

### Create a Life Timeline
```
1. Use `person_get` for basic life events
2. Use `timeline_chart` with includeRelatives=true for full context
3. Use `timeline_summary_llm` for narrative description
```

## Configuration

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `FAMILYSEARCH_TOKEN` | FamilySearch OAuth access token (required) |
| `FAMILY_MCP_PASSWORD` | Encryption password for token storage |
| `FAMILYSEARCH_BASE_URL` | API base URL (default: production) |

### GitHub Copilot Coding Agent
Use `COPILOT_MCP_` prefix for secrets in GitHub Copilot:
| Secret | Purpose |
|--------|---------|
| `COPILOT_MCP_FAMILYSEARCH_TOKEN` | Access token |
| `COPILOT_MCP_FAMILY_MCP_PASSWORD` | Encryption password |

### Running the Server
```bash
# Build
npm run build

# Stdio mode (for MCP clients like Claude Desktop)
npm start

# HTTP mode (for web apps)
npm run start:http
```

## Integration with External MCP Servers

Family-MCP is designed to work alongside other MCP servers:

- **mcp-mermaid**: Render the Mermaid syntax from `family_tree_chart`, `timeline_chart`, and `pedigree_chart` as PNG/SVG images
- **excalidraw-mcp**: Render the Excalidraw JSON from `family_tree_drawing` as interactive diagrams
- Both can be configured as separate MCP servers alongside Family-MCP

## Architecture Notes

- Tool definitions are centralized in `src/tools.ts` (shared between stdio and HTTP)
- Visualization logic is in `src/visualization.ts`
- Schemas are in `src/schemas.ts` (Zod validation)
- API client wrapper in `src/familysearch-client.ts` with built-in caching
- Token encryption uses AES-256-GCM with scrypt key derivation

## API Reference

Master FamilySearch API documentation: https://developers.familysearch.org/
