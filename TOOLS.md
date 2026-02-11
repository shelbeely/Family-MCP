# Tools Reference

Complete reference for all 24 tools available in the FamilySearch MCP server.

## Person Tools

### person_get

Get detailed information about a specific person in FamilySearch.

**Parameters:**
- `personId` (string, required) - The ID of the person to retrieve

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Complete person record including names, dates, places, and relationships.

---

### people_search

Search for people in the FamilySearch Family Tree.

**Parameters:**
- `query` (string, required) - Search query
- `givenName` (string, optional) - Given name filter
- `surname` (string, optional) - Surname filter  
- `birthDate` (string, optional) - Birth date filter
- `birthPlace` (string, optional) - Birth place filter
- `deathDate` (string, optional) - Death date filter
- `deathPlace` (string, optional) - Death place filter
- `maxResults` (number, optional) - Maximum number of results

**Example:**
```json
{
  "query": "John Smith",
  "birthDate": "1850",
  "birthPlace": "New York"
}
```

**Returns:** List of matching persons with relevance scores.

---

## Family Tools

### families_get

Get all family relationships for a person (parents, spouses, children).

**Parameters:**
- `personId` (string, required) - The ID of the person

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Complete family structure with all relationships.

---

### parents_get

Get the parents of a person.

**Parameters:**
- `personId` (string, required) - The ID of the person

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of parent persons (typically 0-2 entries).

---

### children_get

Get the children of a person.

**Parameters:**
- `personId` (string, required) - The ID of the person

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of child persons.

---

### spouses_get

Get the spouses of a person.

**Parameters:**
- `personId` (string, required) - The ID of the person

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of spouse persons.

---

## Source Tools

### sources_get

Get all sources attached to a person.

**Parameters:**
- `personId` (string, required) - The ID of the person

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of source descriptions with citations.

---

### source_attach

Attach a source to a person.

**Parameters:**
- `personId` (string, required) - The ID of the person
- `sourceUrl` (string, required) - URL of the source
- `citation` (string, optional) - Citation text
- `title` (string, optional) - Title of the source

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "sourceUrl": "https://example.com/census-1940",
  "title": "1940 U.S. Census",
  "citation": "U.S. Census Bureau. 1940 Census."
}
```

**Returns:** Confirmation of source attachment.

---

### source_detach

Detach a source from a person.

**Parameters:**
- `personId` (string, required) - The ID of the person
- `sourceId` (string, required) - The ID of the source to detach

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "sourceId": "SOURCE-123"
}
```

**Returns:** Confirmation of source detachment.

---

## Records Tool

### records_search

Search historical records in FamilySearch collections.

**Parameters:**
- `query` (string, required) - Search query
- `givenName` (string, optional) - Given name filter
- `surname` (string, optional) - Surname filter
- `birthDate` (string, optional) - Birth date filter
- `birthPlace` (string, optional) - Birth place filter
- `deathDate` (string, optional) - Death date filter
- `deathPlace` (string, optional) - Death place filter
- `collection` (string, optional) - Collection ID filter

**Example:**
```json
{
  "query": "Jane Doe",
  "birthDate": "1920",
  "collection": "census-1940"
}
```

**Returns:** Array of matching historical records.

---

## Memory Tools

### memories_search

Search memories (photos, stories, documents) in FamilySearch.

**Parameters:**
- `query` (string, required) - Search query
- `personId` (string, optional) - Filter by person ID

**Example:**
```json
{
  "query": "wedding photo",
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of matching memories.

---

### memory_upload

Upload a memory to FamilySearch.

**Parameters:**
- `personId` (string, required) - Person to associate memory with
- `title` (string, required) - Title of the memory
- `description` (string, optional) - Description of the memory
- `artifactUrl` (string, optional) - URL of the artifact

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "title": "Wedding Photo - 1945",
  "description": "Photo from grandparents' wedding",
  "artifactUrl": "https://example.com/photo.jpg"
}
```

**Returns:** Confirmation of memory upload with new memory ID.

---

## GEDCOM Tools

### gedcom_import

Import GEDCOM data to FamilySearch.

**Parameters:**
- `gedcomData` (string, required) - GEDCOM data to import

**Example:**
```json
{
  "gedcomData": "0 HEAD\n1 GEDC\n2 VERS 5.5.1\n..."
}
```

**Returns:** Import status and created records.

---

### gedcom_export

Export person data as GEDCOM from FamilySearch.

**Parameters:**
- `personId` (string, required) - Person ID to export
- `generations` (number, optional) - Number of generations to include

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 3
}
```

**Returns:** GEDCOM formatted data.

---

## AI-Powered Research Tools

### hints_generate

Generate research hints and suggestions for a person.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of research hints with priorities and suggested actions.

---

### merges_suggest

Suggest potential duplicate persons that might need merging.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of potential duplicates with confidence scores.

---

### match_explain_llm

Use AI to explain why two persons might be the same individual.

**Parameters:**
- `personId1` (string, required) - First person ID
- `personId2` (string, required) - Second person ID
- `context` (string, optional) - Additional context for analysis

**Example:**
```json
{
  "personId1": "KWQS-BBQ",
  "personId2": "L123-456",
  "context": "Both lived in same county during same period"
}
```

**Returns:** Detailed AI-powered analysis with confidence scores and reasoning.

---

### hints_rank_llm

Use AI to rank research hints by relevance and importance.

**Parameters:**
- `personId` (string, required) - Person ID
- `hints` (array, required) - Array of hints to rank

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "hints": [
    {"id": 1, "type": "census", "year": 1940},
    {"id": 2, "type": "birth", "year": 1920}
  ]
}
```

**Returns:** Ranked hints with relevance scores and explanations.

---

### timeline_summary_llm

Generate an AI-powered narrative timeline for a person's life.

**Parameters:**
- `personId` (string, required) - Person ID
- `includeRelatives` (boolean, optional) - Include relatives in timeline

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "includeRelatives": true
}
```

**Returns:** Narrative timeline with chronological events and context.

---

### father_side_plan

Generate a research plan for the paternal side of a family.

**Parameters:**
- `personId` (string, required) - Person ID (starting point)
- `generations` (number, optional) - Number of generations to plan (default: 4)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 4
}
```

**Returns:** Structured research plan with tasks for each paternal generation.

---

## Utility Tools

### cache_get

Get information about cached data.

**Parameters:**
- `key` (string, optional) - Specific cache key to retrieve

**Example (all cache info):**
```json
{}
```

**Example (specific key):**
```json
{
  "key": "specific-cache-key"
}
```

**Returns:** Cache statistics or specific cached data.

---

### cache_clear

Clear all cached data.

**Parameters:**
- `pattern` (string, optional) - Pattern to match keys to clear

**Example (clear all):**
```json
{}
```

**Example (pattern):**
```json
{
  "pattern": "person-*"
}
```

**Returns:** Confirmation of cache clearing.

---

### healthcheck

Check the health of the FamilySearch API connection.

**Parameters:** None

**Example:**
```json
{}
```

**Returns:** Health status of API connection.

---

## Tool Categories Summary

| Category | Tool Count | Tools |
|----------|------------|-------|
| Person | 2 | person_get, people_search |
| Family | 4 | families_get, parents_get, children_get, spouses_get |
| Sources | 3 | sources_get, source_attach, source_detach |
| Records | 1 | records_search |
| Memories | 2 | memories_search, memory_upload |
| GEDCOM | 2 | gedcom_import, gedcom_export |
| AI Research | 5 | hints_generate, merges_suggest, match_explain_llm, hints_rank_llm, timeline_summary_llm |
| Research Planning | 1 | father_side_plan |
| Utility | 3 | cache_get, cache_clear, healthcheck |
| **Total** | **24** | |

## Error Handling

All tools return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:
- **401**: Invalid or expired access token
- **403**: Insufficient permissions
- **404**: Person or resource not found
- **429**: Rate limit exceeded
- **500**: Server error

## Rate Limiting

FamilySearch API has rate limits. The server includes caching (5-minute default) to help manage this. For high-volume usage:

1. Use caching effectively
2. Batch operations when possible
3. Implement exponential backoff on 429 errors
4. Consider requesting higher rate limits from FamilySearch

## Best Practices

1. **Cache Usage**: Let the cache work - don't clear unnecessarily
2. **Person IDs**: Always validate person IDs before making requests
3. **Batch Operations**: Use search tools to find multiple people at once
4. **AI Tools**: Use AI tools for complex analysis, not simple data retrieval
5. **Error Handling**: Always check for errors in responses
6. **Token Security**: Never expose your access token in logs or errors

## Support

For detailed usage examples, see [EXAMPLES.md](./EXAMPLES.md).

For configuration options, see [CONFIGURATION.md](./CONFIGURATION.md).
