# Family-MCP Usage Examples

This document provides examples of using the FamilySearch MCP server.

## Setup

1. Install the package:
```bash
npm install
npm run build
```

2. Set your FamilySearch access token:
```bash
export FAMILYSEARCH_TOKEN="your-token-here"
```

## Running the Server

### Stdio Mode (for MCP clients like Claude Desktop)

```bash
npm start
```

### HTTP Mode (for web applications)

```bash
npm run start:http
# Server will start on http://localhost:3000
```

Custom port:
```bash
PORT=8080 npm run start:http
```

## Example Tool Calls

### Get Person Information

```json
{
  "name": "person_get",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Search for People

```json
{
  "name": "people_search",
  "arguments": {
    "query": "John Smith",
    "birthDate": "1850",
    "birthPlace": "New York, USA"
  }
}
```

### Get Parents

```json
{
  "name": "parents_get",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Get Children

```json
{
  "name": "children_get",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Get Spouses

```json
{
  "name": "spouses_get",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Search Records

```json
{
  "name": "records_search",
  "arguments": {
    "query": "Jane Doe",
    "birthDate": "1920-01-15",
    "birthPlace": "Boston, Massachusetts"
  }
}
```

### Get Sources

```json
{
  "name": "sources_get",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Attach Source

```json
{
  "name": "source_attach",
  "arguments": {
    "personId": "KWQS-BBQ",
    "sourceUrl": "https://example.com/source",
    "title": "1940 Census Record",
    "citation": "U.S. Census, 1940"
  }
}
```

### Search Memories

```json
{
  "name": "memories_search",
  "arguments": {
    "query": "wedding photo",
    "personId": "KWQS-BBQ"
  }
}
```

### Generate Research Hints

```json
{
  "name": "hints_generate",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Suggest Merges

```json
{
  "name": "merges_suggest",
  "arguments": {
    "personId": "KWQS-BBQ"
  }
}
```

### Explain Match (AI-powered)

```json
{
  "name": "match_explain_llm",
  "arguments": {
    "personId1": "KWQS-BBQ",
    "personId2": "L123-456",
    "context": "Both individuals lived in the same county during the same time period"
  }
}
```

### Rank Hints (AI-powered)

```json
{
  "name": "hints_rank_llm",
  "arguments": {
    "personId": "KWQS-BBQ",
    "hints": [
      {"id": 1, "type": "census", "year": 1940},
      {"id": 2, "type": "birth", "year": 1920}
    ]
  }
}
```

### Generate Timeline Summary (AI-powered)

```json
{
  "name": "timeline_summary_llm",
  "arguments": {
    "personId": "KWQS-BBQ",
    "includeRelatives": true
  }
}
```

### Generate Father Side Research Plan

```json
{
  "name": "father_side_plan",
  "arguments": {
    "personId": "KWQS-BBQ",
    "generations": 4
  }
}
```

### Export GEDCOM

```json
{
  "name": "gedcom_export",
  "arguments": {
    "personId": "KWQS-BBQ",
    "generations": 3
  }
}
```

### Cache Management

Get cache info:
```json
{
  "name": "cache_get",
  "arguments": {}
}
```

Clear cache:
```json
{
  "name": "cache_clear",
  "arguments": {}
}
```

### Health Check

```json
{
  "name": "healthcheck",
  "arguments": {}
}
```

## Using with Claude Desktop

Add this to your Claude Desktop configuration:

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

Then you can ask Claude:
- "Search FamilySearch for John Smith born in 1850"
- "Get the parents of person KWQS-BBQ"
- "Generate a timeline for person KWQS-BBQ"
- "Find potential duplicates for this person"

## Using with HTTP Transport

Example using curl:

```bash
# Health check
curl http://localhost:3000/health

# Connect via SSE
curl -N http://localhost:3000/sse
```

## Token Storage

The server supports encrypted token storage. To save your token:

```javascript
import { EncryptedTokenStore } from './token-store.js';

const store = new EncryptedTokenStore('your-password');
store.saveToken('your-familysearch-token');
```

To load a saved token:

```javascript
const token = store.loadToken();
```

## Tips

1. **Caching**: The server caches API responses for 5 minutes to improve performance
2. **Rate Limiting**: Be mindful of FamilySearch API rate limits
3. **Person IDs**: FamilySearch person IDs typically look like "KWQS-BBQ"
4. **Dates**: Use ISO format (YYYY-MM-DD) for dates when possible
5. **Error Handling**: All tools return error messages in JSON format

## Advanced Usage

### Custom API Base URL

```bash
export FAMILYSEARCH_BASE_URL="https://sandbox.familysearch.org/platform"
npm start
```

### Custom Cache Timeout

Modify the cache timeout in the code (default is 5 minutes):

```typescript
const client = new FamilySearchClient({
  accessToken: token,
  cache: this.cache,
  cacheTimeout: 600000, // 10 minutes
});
```

## Troubleshooting

### "FamilySearch client not initialized"

Make sure you've set the `FAMILYSEARCH_TOKEN` environment variable or saved a token using the encrypted token store.

### "FamilySearch API error: 401"

Your access token is invalid or expired. Get a new token from FamilySearch.

### "FamilySearch API error: 429"

You've hit the rate limit. Wait a few minutes before making more requests.

## Need Help?

- [FamilySearch API Documentation](https://www.familysearch.org/developers/docs/api/)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [GitHub Issues](https://github.com/shelbeely/Family-MCP/issues)
