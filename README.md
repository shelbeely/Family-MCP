# Family-MCP

A comprehensive Model Context Protocol (MCP) server for FamilySearch.org integration. This server provides AI assistants with access to genealogical data, family tree information, and research tools from FamilySearch.

## Features

### Person & Family Tools
- **person_get** - Get detailed information about a specific person
- **people_search** - Search for people in the Family Tree
- **families_get** - Get all family relationships for a person
- **parents_get** - Get parents of a person
- **children_get** - Get children of a person
- **spouses_get** - Get spouses of a person

### Sources & Records
- **sources_get** - Get sources attached to a person
- **source_attach** - Attach a source to a person
- **source_detach** - Detach a source from a person
- **records_search** - Search historical records

### Memories
- **memories_search** - Search memories
- **memory_upload** - Upload a memory

### GEDCOM
- **gedcom_import** - Import GEDCOM data
- **gedcom_export** - Export person data as GEDCOM

### AI-Powered Tools
- **hints_generate** - Generate research hints for a person
- **merges_suggest** - Suggest potential duplicate persons for merging
- **match_explain_llm** - Use LLM to explain why two persons might match
- **hints_rank_llm** - Use LLM to rank research hints by relevance
- **timeline_summary_llm** - Generate an LLM-powered timeline summary
- **father_side_plan** - Generate a research plan for the paternal side

### Utility Tools
- **cache_get** - Get cached data
- **cache_clear** - Clear the cache
- **healthcheck** - Check API connection health

## Installation

```bash
npm install
```

## Configuration

### Authentication

Set your FamilySearch access token:

```bash
export FAMILYSEARCH_TOKEN="your-access-token-here"
```

Or the token will be loaded from an encrypted token store at `~/.family-mcp-tokens`.

### Optional: Set encryption password

```bash
export FAMILY_MCP_PASSWORD="your-secure-password"
```

## Usage

### Stdio Transport (for MCP clients)

```bash
npm start
```

Or run directly:

```bash
node dist/index.js
```

### Using with Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

## Architecture

### Components

- **index.ts** - Main MCP server implementation with all tool handlers
- **familysearch-client.ts** - FamilySearch API client wrapper with caching
- **token-store.ts** - Encrypted token storage using AES-256-GCM
- **schemas.ts** - Zod schemas for input validation

### Security Features

- **Encrypted Token Storage** - Access tokens are encrypted using AES-256-GCM with scrypt key derivation
- **Secure Defaults** - HTTPS-only API communication
- **Input Validation** - All inputs validated using Zod schemas

### Caching

The server includes built-in caching with configurable timeout (default 5 minutes) to reduce API calls and improve performance.

## API Access

To get a FamilySearch access token:

1. Register your application at [FamilySearch Developers](https://www.familysearch.org/developers/)
2. Obtain OAuth credentials
3. Use the OAuth flow to get an access token
4. Set the token in your environment or save it using the encrypted token store

## Tools Reference

### person_get

Get detailed information about a specific person.

```json
{
  "personId": "KWQS-BBQ"
}
```

### people_search

Search for people in the Family Tree.

```json
{
  "query": "John Smith",
  "birthDate": "1850",
  "birthPlace": "New York"
}
```

### records_search

Search historical records.

```json
{
  "query": "Jane Doe",
  "birthDate": "1920-01-15",
  "collection": "census-1940"
}
```

### match_explain_llm

Get an AI explanation of why two persons might be the same individual.

```json
{
  "personId1": "KWQS-BBQ",
  "personId2": "L123-456",
  "context": "Both lived in same county"
}
```

### timeline_summary_llm

Generate a narrative timeline for a person's life.

```json
{
  "personId": "KWQS-BBQ",
  "includeRelatives": true
}
```

## License

MIT

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/shelbeely/Family-MCP).
