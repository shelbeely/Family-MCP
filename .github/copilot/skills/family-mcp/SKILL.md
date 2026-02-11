---
name: family-mcp
description: This skill should be used when the user asks about genealogy, family history, family trees, FamilySearch, visualizing family relationships, generating pedigree charts, searching historical records, or working with the Family-MCP server. Provides guidance on using the 95 MCP tools across 17 categories for genealogical research, family tree management, collaboration, and FamilySearch API integration.
---

# Family-MCP Skill

Use the Family-MCP server to access FamilySearch.org genealogical data, manage family trees, generate visualizations, and perform AI-powered genealogy research.

## Server Overview

Family-MCP is an MCP server providing 95 tools across 17 categories for genealogical research via the FamilySearch API. It supports both stdio and HTTP/SSE transports.

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

### Ancestry & Pedigree Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `ancestry_get` | Get multi-generation ancestor pedigree |
| `descendancy_get` | Get multi-generation descendancy tree |

### Person CRUD Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `person_create` | Create a new person in the Family Tree |
| `person_update` | Update person facts and details |
| `person_delete` | Delete a person from the Family Tree |

### Relationship Management Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `relationship_create_couple` | Create a couple relationship |
| `relationship_create_parent_child` | Create a parent-child relationship |
| `relationship_delete` | Delete a relationship |
| `relationship_find` | Find relationship path between two persons |

### User & Session Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `user_current` | Get current authenticated user info |
| `user_tree_person` | Get the user's default tree person |

### Source Management Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `sources_get` | Get sources attached to a person |
| `source_attach` | Attach a source URL/citation |
| `source_detach` | Remove a source |

### Source Description Tools (5 tools)
| Tool | Purpose |
|------|---------|
| `source_description_get` | Get a source description by ID |
| `source_description_create` | Create a new source description |
| `source_description_update` | Update a source description |
| `source_description_delete` | Delete a source description |
| `source_description_changes` | Get source description change history |

### Source Folder Tools (7 tools)
| Tool | Purpose |
|------|---------|
| `source_folders_list` | List all source folders |
| `source_folder_create` | Create a new source folder |
| `source_folder_get` | Get folder details and contents |
| `source_folder_update` | Update a folder name |
| `source_folder_delete` | Delete a source folder |
| `source_folder_add` | Add a source to a folder |
| `source_folder_remove` | Remove a source from a folder |

### Relationship Sources & Notes Tools (6 tools)
| Tool | Purpose |
|------|---------|
| `relationship_sources_get` | Get sources on a relationship |
| `relationship_source_attach` | Attach a source to a relationship |
| `relationship_source_detach` | Detach a source from a relationship |
| `relationship_notes_get` | Get notes on a relationship |
| `relationship_note_create` | Create a note on a relationship |
| `relationship_note_delete` | Delete a note from a relationship |

### Record Search (1 tool)
| Tool | Purpose |
|------|---------|
| `records_search` | Search historical records/collections |

### Memory Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `memories_search` | Search photos, stories, documents |
| `memory_upload` | Upload a memory |

### Memory Management Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `memory_get` | Get memory details by ID |
| `memory_delete` | Delete a memory |
| `memory_attach` | Attach a memory to a person |
| `memory_detach` | Detach a memory from a person |

### GEDCOM Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `gedcom_import` | Import GEDCOM data |
| `gedcom_export` | Export person data as GEDCOM |

### Change History Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `change_history_person` | Get change history for a person |
| `change_history_relationship` | Get change history for a relationship |

### Notes Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `notes_get` | Get notes attached to a person |
| `note_create` | Create a note on a person |
| `note_update` | Update a note |
| `note_delete` | Delete a note |

### Batch & Merge Tools (2 tools)
| Tool | Purpose |
|------|---------|
| `persons_batch_get` | Get multiple persons in one request |
| `person_merge` | Merge duplicate person records |

### Restore Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `person_restore` | Restore a deleted person |
| `relationship_restore` | Restore a deleted relationship |
| `change_restore` | Restore to a previous change state |

### Match Management Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `matches_get` | Get potential duplicate matches |
| `match_resolve` | Accept or reject a match |
| `not_a_match_create` | Declare two persons are not the same |
| `not_a_match_delete` | Remove a not-a-match declaration |

### Preferred Relationships Tools (4 tools)
| Tool | Purpose |
|------|---------|
| `preferred_parent_get` | Get preferred parent relationship |
| `preferred_parent_set` | Set preferred parent relationship |
| `preferred_spouse_get` | Get preferred spouse relationship |
| `preferred_spouse_set` | Set preferred spouse relationship |

### Conclusion Management (1 tool)
| Tool | Purpose |
|------|---------|
| `conclusion_delete` | Delete a conclusion from a person |

### Place Authority Tools (3 tools)
| Tool | Purpose |
|------|---------|
| `place_search` | Search the place authority database |
| `place_get` | Get place details by ID |
| `place_children` | Get child/subdivision places |

### Discussion Tools (6 tools)
| Tool | Purpose |
|------|---------|
| `discussions_get` | Get discussions for a person |
| `discussion_read` | Read a discussion thread |
| `discussion_create` | Create a new discussion |
| `discussion_update` | Update a discussion |
| `discussion_comment` | Add a comment to a discussion |
| `discussion_comment_delete` | Delete a discussion comment |

### AI-Powered Research Tools (5 tools)
| Tool | Purpose |
|------|---------|
| `hints_generate` | Generate research suggestions |
| `merges_suggest` | Identify potential duplicate persons |
| `match_explain_llm` | Explain why two persons might match |
| `hints_rank_llm` | Rank hints by relevance |
| `timeline_summary_llm` | Generate narrative timeline |

### Research Planning (2 tools)
| Tool | Purpose |
|------|---------|
| `father_side_plan` | Research plan for paternal lineage |
| `mother_side_plan` | Research plan for maternal lineage |

### Record Hints & Ordinances (2 tools)
| Tool | Purpose |
|------|---------|
| `hints_get` | Get server-generated record hints |
| `ordinances_get` | Get ordinance/temple work status |

### Date & Standardization (1 tool)
| Tool | Purpose |
|------|---------|
| `date_standardize` | Standardize date strings |

### Collections (2 tools)
| Tool | Purpose |
|------|---------|
| `collections_list` | List record collections |
| `collection_get` | Get collection details |

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
