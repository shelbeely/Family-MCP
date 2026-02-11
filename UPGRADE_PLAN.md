# Comprehensive Upgrade Plan

> **Master API Reference:** https://developers.familysearch.org/  
> **API Reference Guide:** https://developers.familysearch.org/main/reference/api-reference-guide  
> **Current Implementation:** 24 tools across 9 categories

This document provides a comprehensive, prioritized upgrade plan for the Family-MCP server. Each section maps directly to FamilySearch API capabilities documented at [developers.familysearch.org](https://developers.familysearch.org/). Items are organized into phases by priority and dependency.

---

## Table of Contents

- [Authentication Audit](#authentication-audit)
- [Current Coverage Summary](#current-coverage-summary)
- [Phase 1: Core API Gap Closure (High Priority)](#phase-1-core-api-gap-closure-high-priority)
- [Phase 2: Extended Tree Operations (Medium Priority)](#phase-2-extended-tree-operations-medium-priority)
- [Phase 3: Collaboration & Metadata Features (Medium Priority)](#phase-3-collaboration--metadata-features-medium-priority)
- [Phase 4: Infrastructure & Reliability (High Priority)](#phase-4-infrastructure--reliability-high-priority)
- [Phase 5: Authentication & Authorization (High Priority)](#phase-5-authentication--authorization-high-priority)
- [Phase 6: Advanced Research & Discovery (Lower Priority)](#phase-6-advanced-research--discovery-lower-priority)
- [Phase 7: Developer Experience & Ecosystem (Lower Priority)](#phase-7-developer-experience--ecosystem-lower-priority)
- [API Endpoint Coverage Matrix](#api-endpoint-coverage-matrix)
- [Implementation Guidelines](#implementation-guidelines)

---

## Authentication Audit

> **Reference:** https://developers.familysearch.org/main/docs/authentication

### How FamilySearch API Authentication Works

FamilySearch uses **OAuth 2.0 Authorization Code** flow for all API access:

| Component | URL |
|-----------|-----|
| **Authorization endpoint** | `https://ident.familysearch.org/cis-web/oauth2/v3/authorization` |
| **Token endpoint** | `https://ident.familysearch.org/cis-web/oauth2/v3/token` |
| **API base URL** | `https://api.familysearch.org/platform` |
| **Sandbox API base URL** | `https://sandbox.familysearch.org/platform` |

**OAuth 2.0 flow:**
1. Redirect user to authorization endpoint with `client_id`, `redirect_uri`, `response_type=code`
2. User authenticates on FamilySearch, redirected back with authorization `code`
3. Exchange `code` for `access_token` (and optional `refresh_token`) at token endpoint
4. Use `Authorization: Bearer <access_token>` header on all API requests

**Token lifetime:** Access tokens expire after **24 hours** or after **60 minutes of inactivity**.

**PKCE:** Recommended for native/mobile apps (include `code_challenge` and `code_verifier`).

### Current Implementation — What's Correct ✅

| Aspect | Status | Detail |
|--------|--------|--------|
| Bearer token header | ✅ Correct | `Authorization: Bearer ${accessToken}` in `familysearch-client.ts` |
| API base URL | ✅ Correct | `https://api.familysearch.org/platform` as default |
| Sandbox support | ✅ Correct | Configurable via `FAMILYSEARCH_BASE_URL` env var |
| HTTPS only | ✅ Correct | All API calls over HTTPS |
| Encrypted token storage | ✅ Correct | AES-256-GCM with scrypt key derivation |
| Accept header | ✅ Correct | `application/json` |

### Current Implementation — Issues Found ❌

| Issue | Severity | Detail |
|-------|----------|--------|
| No OAuth 2.0 flow | Medium | Users must manually obtain tokens outside the app |
| No token refresh | Medium | Expired tokens (24h / 60min idle) cause silent 401 failures |
| No `client_id` support | Medium | FamilySearch requires a registered `client_id` for OAuth |
| ~~Copilot agent incompatible~~ | ~~High~~ **Fixed** | ~~Env vars lacked `COPILOT_MCP_` prefix~~ — Now supports both prefixed and unprefixed vars |
| No token expiry detection | Low | No proactive detection of token expiration |

### GitHub Copilot Coding Agent Compatibility — Fixed ✅

GitHub's Copilot coding agent only exposes environment variables prefixed with `COPILOT_MCP_` to MCP servers ([docs](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)). The server now accepts both naming conventions:

| Purpose | Standard Env Var | Copilot Env Var (also accepted) |
|---------|------------------|---------------------------------|
| Access token | `FAMILYSEARCH_TOKEN` | `COPILOT_MCP_FAMILYSEARCH_TOKEN` |
| Encryption password | `FAMILY_MCP_PASSWORD` | `COPILOT_MCP_FAMILY_MCP_PASSWORD` |
| API base URL | `FAMILYSEARCH_BASE_URL` | `COPILOT_MCP_FAMILYSEARCH_BASE_URL` |

**Resolution order:** `COPILOT_MCP_*` → standard env var → encrypted token store (for tokens).

### Remaining Authentication Upgrades (See Phase 4.1 and 5)

- Implement full OAuth 2.0 Authorization Code flow with PKCE
- Add token refresh automation
- Support `client_id` / `redirect_uri` configuration
- Detect 401 responses and prompt for re-authentication

---

## Current Coverage Summary

### What We Have

| Category | Tools | API Endpoints Used |
|----------|-------|--------------------|
| Person (Read) | `person_get`, `people_search` | `GET /tree/persons/{pid}`, `GET /tree/search` |
| Family Relationships (Read) | `families_get`, `parents_get`, `children_get`, `spouses_get` | `GET /tree/persons/{pid}/with-relationships` |
| Sources (Read/Write) | `sources_get`, `source_attach`, `source_detach` | `GET/POST/DELETE /tree/persons/{pid}/sources` |
| Records (Search) | `records_search` | `GET /records/search` |
| Memories (Search/Upload) | `memories_search`, `memory_upload` | `GET /memories/search`, `POST /memories` |
| GEDCOM (Import/Export) | `gedcom_import`, `gedcom_export` | `POST /tree/gedcomx`, `GET /tree/persons/{pid}/gedcomx` |
| AI-Powered Research | 5 tools | Client-side analysis using API data |
| Research Planning | `father_side_plan` | Client-side planning using API data |
| Utilities | `cache_get`, `cache_clear`, `healthcheck` | `GET /` |

### What's Missing

The FamilySearch API at [developers.familysearch.org](https://developers.familysearch.org/main/reference/api-reference-guide) offers significant capabilities not yet exposed through MCP tools. The sections below detail each gap and the plan to close it.

---

## Phase 1: Core API Gap Closure (High Priority)

These upgrades address the most impactful missing capabilities — features that users of a genealogy tool expect to be available.

### 1.1 Ancestry & Pedigree Navigation

**Gap:** No way to retrieve multi-generational ancestry or pedigree charts. Users must manually chain `parents_get` calls.

**FamilySearch API Endpoints:**
- `GET /platform/tree/ancestry?person={personId}&generations={n}` — Returns ancestry up to 8 generations
- `GET /platform/tree/descendancy?person={personId}&generations={n}` — Returns descendancy tree

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `ancestry_get` | Retrieve multi-generational ancestry/pedigree for a person | `personId` (required), `generations` (optional, 1-8, default 4) |
| `descendancy_get` | Retrieve descendancy tree for a person | `personId` (required), `generations` (optional, 1-8, default 2) |

**Implementation:**
- Add `getAncestry(personId, generations)` and `getDescendancy(personId, generations)` to `FamilySearchClient`
- Add Zod schemas: `AncestryGetSchema`, `DescendancyGetSchema`
- Add tool definitions and handlers
- Expected effort: Small — straightforward GET endpoints

---

### 1.2 Person Create, Update, Delete

**Gap:** Currently read-only for person records. Cannot create new persons or update existing data.

**FamilySearch API Endpoints:**
- `POST /platform/tree/persons` — Create a new person
- `POST /platform/tree/persons/{personId}` — Update a person's information
- `DELETE /platform/tree/persons/{personId}` — Delete a person

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `person_create` | Create a new person in FamilySearch tree | `givenName`, `surname`, `gender`, `birthDate`, `birthPlace`, `deathDate`, `deathPlace` (all optional except `givenName` and `surname`) |
| `person_update` | Update an existing person's information | `personId` (required), plus optional fields to update |
| `person_delete` | Delete a person from the tree | `personId` (required), `reason` (required — API requires justification) |

**Implementation:**
- Add write methods to `FamilySearchClient`
- Build GEDCOM X-compliant request bodies
- Add confirmation/safety checks for destructive operations
- Expected effort: Medium — requires GEDCOM X body construction

---

### 1.3 Relationship Management

**Gap:** Can read relationships but cannot create, update, or delete them.

**FamilySearch API Endpoints:**
- `POST /platform/tree/relationships` — Create couple relationship
- `POST /platform/tree/child-and-parents-relationships` — Create child-parent relationship
- `DELETE /platform/tree/couple-relationships/{relationshipId}` — Delete couple relationship
- `DELETE /platform/tree/child-and-parents-relationships/{relationshipId}` — Delete child-parent relationship

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `relationship_create_couple` | Create a couple/spouse relationship | `person1Id`, `person2Id` |
| `relationship_create_parent_child` | Create a parent-child relationship | `parentId`, `childId` |
| `relationship_delete` | Delete a relationship | `relationshipId`, `type` (couple or parent-child) |

**Implementation:**
- Add relationship write methods to `FamilySearchClient`
- Include safeguards (confirmation flags) for delete operations
- Expected effort: Medium

---

### 1.4 Current User Information

**Gap:** No way to identify the authenticated user or retrieve account details.

**FamilySearch API Endpoint:**
- `GET /platform/users/current` — Returns current authenticated user information

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `user_current` | Get information about the currently authenticated user | None |

**Implementation:**
- Add `getCurrentUser()` to `FamilySearchClient`
- Useful for session validation and personalized features
- Expected effort: Small

---

## Phase 2: Extended Tree Operations (Medium Priority)

### 2.1 Change History

**Gap:** No visibility into who changed what and when. Critical for collaborative genealogy.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/change-history` — Person change history
- `GET /platform/tree/couple-relationships/{relationshipId}/change-history` — Couple relationship change history
- `GET /platform/tree/child-and-parents-relationships/{relationshipId}/change-history` — Parent-child change history

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `change_history_person` | Get change history for a person | `personId` (required), `count` (optional) |
| `change_history_relationship` | Get change history for a relationship | `relationshipId` (required), `type` (couple or parent-child) |

**Implementation:**
- Add change history methods to `FamilySearchClient`
- Parse Atom feed format responses
- Expected effort: Medium — Atom feed parsing may be needed

---

### 2.2 Notes Management

**Gap:** No support for person or relationship notes.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/notes` — Read notes
- `POST /platform/tree/persons/{personId}/notes` — Create a note
- `PUT /platform/tree/persons/{personId}/notes/{noteId}` — Update a note
- `DELETE /platform/tree/persons/{personId}/notes/{noteId}` — Delete a note

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `notes_get` | Get notes for a person | `personId` |
| `note_create` | Add a note to a person | `personId`, `subject`, `text` |
| `note_update` | Update an existing note | `personId`, `noteId`, `subject`, `text` |
| `note_delete` | Delete a note | `personId`, `noteId` |

**Implementation:**
- Full CRUD note operations in `FamilySearchClient`
- Expected effort: Small-Medium

---

### 2.3 Batch Person Retrieval

**Gap:** Retrieving multiple persons requires individual API calls. The API supports batch retrieval.

**FamilySearch API Endpoint:**
- `GET /platform/tree/persons?pids={pid1},{pid2},...` — Batch retrieve up to 200 persons

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `persons_batch_get` | Retrieve multiple persons in a single request | `personIds` (array of strings, max 200) |

**Implementation:**
- Add `getPersonsBatch(personIds)` to `FamilySearchClient`
- Chunk requests if > 200 IDs
- Expected effort: Small

---

### 2.4 Person Merge Operations

**Gap:** `merges_suggest` identifies duplicates but cannot execute merges.

**FamilySearch API Endpoints:**
- `POST /platform/tree/persons/{personId}/merges/{duplicateId}` — Merge two persons

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `person_merge` | Merge a duplicate person into a surviving person | `survivingPersonId`, `duplicatePersonId` |

**Implementation:**
- Add merge method to `FamilySearchClient`
- Require explicit confirmation parameter for safety
- Expected effort: Medium

---

## Phase 3: Collaboration & Metadata Features (Medium Priority)

### 3.1 Place Authority Integration

**Gap:** No place standardization or place search capability. FamilySearch maintains a database of 6+ million standardized places.

**FamilySearch API Endpoints:**
- `GET /platform/places/search?q={query}` — Search places
- `GET /platform/places/{placeId}` — Get place details
- `GET /platform/places/{placeId}/children` — Get child places (jurisdictions)

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `place_search` | Search FamilySearch Place Authority | `query` (required), `count` (optional) |
| `place_get` | Get details for a specific place | `placeId` |
| `place_children` | Get sub-jurisdictions of a place | `placeId` |

**Implementation:**
- Add Place Authority methods to `FamilySearchClient`
- Useful for standardizing place names in research
- Expected effort: Small

---

### 3.2 Discussions

**Gap:** No support for discussions — a key collaboration feature in FamilySearch.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/discussion-references` — Get discussions for a person
- `POST /platform/discussions` — Create a discussion
- `POST /platform/discussions/{discussionId}/comments` — Add a comment

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `discussions_get` | Get discussions for a person | `personId` |
| `discussion_create` | Create a new discussion | `title`, `details` |
| `discussion_comment` | Add a comment to a discussion | `discussionId`, `text` |

**Implementation:**
- Add discussion methods to `FamilySearchClient`
- Expected effort: Small-Medium

---

### 3.3 Source Description Management

**Gap:** Can attach/detach sources but cannot create standalone source descriptions or search for existing ones.

**FamilySearch API Endpoints:**
- `GET /platform/sources/descriptions/{sourceId}` — Read a source description
- `POST /platform/sources/descriptions` — Create a source description
- `PUT /platform/sources/descriptions/{sourceId}` — Update a source description

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `source_description_get` | Get a source description by ID | `sourceId` |
| `source_description_create` | Create a reusable source description | `title`, `citation`, `url`, `notes` |
| `source_description_update` | Update an existing source description | `sourceId`, plus fields to update |

**Implementation:**
- Extend source management in `FamilySearchClient`
- Expected effort: Small

---

### 3.4 Memories — Full CRUD and Person Attachment

**Gap:** Can search and upload memories but cannot manage memory-person associations, read individual memories, or delete them.

**FamilySearch API Endpoints:**
- `GET /platform/memories/{memoryId}` — Read a specific memory
- `DELETE /platform/memories/{memoryId}` — Delete a memory
- `POST /platform/tree/persons/{personId}/memory-references` — Attach memory to person
- `DELETE /platform/tree/persons/{personId}/memory-references/{referenceId}` — Detach memory from person

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `memory_get` | Get a specific memory by ID | `memoryId` |
| `memory_delete` | Delete a memory | `memoryId` |
| `memory_attach` | Attach a memory to a person | `personId`, `memoryId` |
| `memory_detach` | Detach a memory from a person | `personId`, `referenceId` |

**Implementation:**
- Extend memory management in `FamilySearchClient`
- Expected effort: Small-Medium

---

## Phase 4: Infrastructure & Reliability (High Priority)

These improvements address non-functional requirements critical for production use.

### 4.1 OAuth 2.0 Authorization Flow

**Gap:** Currently requires users to manually obtain and provide access tokens. No automated auth flow.

**FamilySearch API Endpoints:**
- `GET /cis-web/oauth2/v3/authorization` — Authorization endpoint
- `POST /cis-web/oauth2/v3/token` — Token exchange endpoint

**Implementation:**
- Add OAuth 2.0 Authorization Code flow support
- Implement token refresh logic
- Store refresh tokens securely using `EncryptedTokenStore`
- Support both interactive (browser-based) and headless (device code) flows
- Expected effort: Large

---

### 4.2 Rate Limiting & Retry Logic

**Gap:** No handling for API rate limits (HTTP 429) or transient errors. Failures propagate directly to the user.

**Implementation:**
- Add exponential backoff retry logic to `FamilySearchClient.request()`
- Respect `Retry-After` headers from the API
- Add configurable max retries and backoff settings
- Implement request throttling to stay within rate limits proactively
- Expected effort: Medium

---

### 4.3 Improved Error Handling & Response Normalization

**Gap:** Errors return raw API responses. No structured error types or user-friendly messages.

**Implementation:**
- Define custom error classes (e.g., `FamilySearchNotFoundError`, `FamilySearchAuthError`, `FamilySearchRateLimitError`)
- Normalize API responses into consistent shapes
- Add detailed error context (endpoint, parameters, HTTP status)
- Add request/response logging (debug level)
- Expected effort: Medium

---

### 4.4 Comprehensive Test Suite

**Gap:** Only basic unit tests exist. No integration tests, no tool handler tests, no mock API tests.

**Implementation:**
- Add unit tests for all tool handlers using mocked `FamilySearchClient`
- Add integration tests that validate request construction
- Add schema validation tests for all Zod schemas
- Add error handling tests
- Set up test coverage tracking
- Consider using `vitest` or `jest` for a proper test framework
- Expected effort: Large

---

### 4.5 CI/CD Pipeline

**Gap:** No automated build, test, or release pipeline.

**Implementation:**
- Add GitHub Actions workflow for:
  - Build verification on PR
  - Test execution on PR
  - Lint checking (add ESLint)
  - Security scanning (CodeQL)
  - NPM publish on release
- Expected effort: Medium

---

### 4.6 Advanced Caching Strategy

**Gap:** Current cache is in-memory with a single TTL. No cache invalidation on writes, no persistent cache.

**Implementation:**
- Invalidate cache entries when write operations affect the same resource
- Add per-endpoint cache TTL configuration
- Add optional persistent cache (file-based or SQLite)
- Add cache hit/miss metrics to `cache_get` output
- Expected effort: Medium

---

## Phase 5: Authentication & Authorization (High Priority)

### 5.1 Multi-User Token Management

**Gap:** Single-user token storage. Cannot manage tokens for multiple FamilySearch accounts.

**Implementation:**
- Extend `EncryptedTokenStore` to support named profiles
- Add tools: `token_set_profile`, `token_list_profiles`, `token_switch_profile`
- Useful for researchers managing multiple family lines across accounts
- Expected effort: Medium

---

### 5.2 Token Refresh Automation

**Gap:** Tokens expire and must be manually replaced.

**Implementation:**
- Detect token expiration from 401 responses
- Automatically refresh using stored refresh token (requires OAuth 2.0 flow from Phase 4.1)
- Emit notification when token is refreshed
- Expected effort: Medium (depends on Phase 4.1)

---

## Phase 6: Advanced Research & Discovery (Lower Priority)

### 6.1 Record Hints (Server-Side)

**Gap:** `hints_generate` uses client-side heuristics. FamilySearch provides server-side record hints.

**FamilySearch API Endpoint:**
- `GET /platform/tree/persons/{personId}/matches` — Server-side record hints/matches

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `hints_get` | Get server-generated record hints for a person | `personId`, `collection` (optional) |

**Implementation:**
- Add matches/hints endpoint to `FamilySearchClient`
- Complements the existing client-side `hints_generate`
- Expected effort: Small

---

### 6.2 Ordinance Information

**Gap:** No access to ordinance status. Relevant for LDS-related genealogy workflows.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/ordinances` — Read ordinance status

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `ordinances_get` | Get ordinance information for a person | `personId` |

**Implementation:**
- Add ordinance method to `FamilySearchClient`
- Read-only access
- Expected effort: Small

---

### 6.3 Date & Place Standardization

**Gap:** No way to standardize dates or places using FamilySearch's authority databases.

**FamilySearch API Endpoints:**
- `GET /platform/dates?date={dateString}` — Standardize a date string
- Place Authority endpoints (see Phase 3.1)

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `date_standardize` | Standardize a date string using FamilySearch | `date` (string, e.g., "abt 1850", "Jan 1920") |

**Implementation:**
- Add date standardization method to `FamilySearchClient`
- Useful for normalizing user-entered dates
- Expected effort: Small

---

### 6.4 Maternal Side Research Plan

**Gap:** Only `father_side_plan` exists. No equivalent for maternal lineage.

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `mother_side_plan` | Generate a research plan for the maternal side | `personId`, `generations` |

**Implementation:**
- Mirror `father_side_plan` logic, adapted for maternal line
- Expected effort: Small

---

### 6.5 Collections Browsing

**Gap:** Can search records in a collection but cannot browse available collections.

**FamilySearch API Endpoints:**
- `GET /platform/collections` — List available collections
- `GET /platform/collections/{collectionId}` — Get collection details

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `collections_list` | List available record collections | `count` (optional) |
| `collection_get` | Get details about a specific collection | `collectionId` |

**Implementation:**
- Add collection methods to `FamilySearchClient`
- Expected effort: Small

---

## Phase 7: Developer Experience & Ecosystem (Lower Priority)

### 7.1 Docker Containerization

**Implementation:**
- Create `Dockerfile` for the MCP server
- Create `docker-compose.yml` for easy deployment
- Support both stdio and HTTP modes
- Expected effort: Small

---

### 7.2 ESLint & Code Quality Tooling

**Implementation:**
- Add ESLint with TypeScript rules
- Add Prettier for consistent formatting
- Add pre-commit hooks with Husky/lint-staged
- Expected effort: Small

---

### 7.3 OpenAPI/Swagger Documentation for HTTP Server

**Implementation:**
- Add OpenAPI spec for the HTTP/SSE server endpoints
- Auto-generate API documentation
- Expected effort: Medium

---

### 7.4 Streamable HTTP Transport (MCP Upgrade)

**Gap:** HTTP transport uses SSE. The MCP specification now supports Streamable HTTP as a preferred transport.

**Implementation:**
- Upgrade `@modelcontextprotocol/sdk` to latest version
- Add Streamable HTTP transport alongside SSE
- Maintain backward compatibility with SSE transport
- Expected effort: Medium

---

### 7.5 Telemetry & Observability

**Implementation:**
- Add structured logging (e.g., with `pino` or `winston`)
- Add request timing metrics
- Add optional OpenTelemetry integration
- Expected effort: Medium

---

## API Endpoint Coverage Matrix

This matrix maps FamilySearch API endpoints to current and planned tool coverage.

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}` | GET | `person_get` ✅ | — | — |
| `/tree/persons` | POST | — | `person_create` | 1.2 |
| `/tree/persons/{pid}` | POST | — | `person_update` | 1.2 |
| `/tree/persons/{pid}` | DELETE | — | `person_delete` | 1.2 |
| `/tree/persons?pids=...` | GET | — | `persons_batch_get` | 2.3 |
| `/tree/search` | GET | `people_search` ✅ | — | — |
| `/tree/persons/{pid}/with-relationships` | GET | `families_get` ✅ | — | — |
| `/tree/ancestry` | GET | — | `ancestry_get` | 1.1 |
| `/tree/descendancy` | GET | — | `descendancy_get` | 1.1 |
| `/tree/relationships` | POST | — | `relationship_create_couple` | 1.3 |
| `/tree/child-and-parents-relationships` | POST | — | `relationship_create_parent_child` | 1.3 |
| `/tree/couple-relationships/{rid}` | DELETE | — | `relationship_delete` | 1.3 |
| `/tree/child-and-parents-relationships/{rid}` | DELETE | — | `relationship_delete` | 1.3 |
| `/tree/persons/{pid}/change-history` | GET | — | `change_history_person` | 2.1 |
| `/tree/couple-relationships/{rid}/change-history` | GET | — | `change_history_relationship` | 2.1 |
| `/tree/persons/{pid}/notes` | GET | — | `notes_get` | 2.2 |
| `/tree/persons/{pid}/notes` | POST | — | `note_create` | 2.2 |
| `/tree/persons/{pid}/notes/{nid}` | PUT | — | `note_update` | 2.2 |
| `/tree/persons/{pid}/notes/{nid}` | DELETE | — | `note_delete` | 2.2 |
| `/tree/persons/{pid}/sources` | GET | `sources_get` ✅ | — | — |
| `/tree/persons/{pid}/sources` | POST | `source_attach` ✅ | — | — |
| `/tree/persons/{pid}/sources/{sid}` | DELETE | `source_detach` ✅ | — | — |
| `/sources/descriptions/{sid}` | GET | — | `source_description_get` | 3.3 |
| `/sources/descriptions` | POST | — | `source_description_create` | 3.3 |
| `/sources/descriptions/{sid}` | PUT | — | `source_description_update` | 3.3 |
| `/records/search` | GET | `records_search` ✅ | — | — |
| `/memories/search` | GET | `memories_search` ✅ | — | — |
| `/memories` | POST | `memory_upload` ✅ | — | — |
| `/memories/{mid}` | GET | — | `memory_get` | 3.4 |
| `/memories/{mid}` | DELETE | — | `memory_delete` | 3.4 |
| `/tree/persons/{pid}/memory-references` | POST | — | `memory_attach` | 3.4 |
| `/tree/persons/{pid}/memory-references/{rid}` | DELETE | — | `memory_detach` | 3.4 |
| `/tree/persons/{pid}/matches` | GET | — | `hints_get` | 6.1 |
| `/tree/persons/{pid}/merges/{did}` | POST | — | `person_merge` | 2.4 |
| `/tree/persons/{pid}/ordinances` | GET | — | `ordinances_get` | 6.2 |
| `/tree/persons/{pid}/discussion-references` | GET | — | `discussions_get` | 3.2 |
| `/discussions` | POST | — | `discussion_create` | 3.2 |
| `/discussions/{did}/comments` | POST | — | `discussion_comment` | 3.2 |
| `/places/search` | GET | — | `place_search` | 3.1 |
| `/places/{placeId}` | GET | — | `place_get` | 3.1 |
| `/places/{placeId}/children` | GET | — | `place_children` | 3.1 |
| `/dates` | GET | — | `date_standardize` | 6.3 |
| `/collections` | GET | — | `collections_list` | 6.5 |
| `/collections/{cid}` | GET | — | `collection_get` | 6.5 |
| `/users/current` | GET | — | `user_current` | 1.4 |
| `/tree/gedcomx` | POST | `gedcom_import` ✅ | — | — |
| `/tree/persons/{pid}/gedcomx` | GET | `gedcom_export` ✅ | — | — |
| `/` (health) | GET | `healthcheck` ✅ | — | — |

---

## Implementation Guidelines

### Adding a New Tool — Checklist

For each new tool, the following files need to be updated:

1. **`src/familysearch-client.ts`** — Add the API method
2. **`src/schemas.ts`** — Add the Zod input validation schema
3. **`src/tools.ts`** — Add the tool definition and handler function
4. **`src/index.ts`** — Add the tool handler case in the stdio server
5. **`src/http-server.ts`** — Add the tool handler case in the HTTP server
6. **`test/basic-test.js`** (or new test files) — Add tests
7. **`TOOLS.md`** — Document the new tool
8. **`EXAMPLES.md`** — Add usage examples

### Naming Conventions

- Tool names: `resource_action` format (e.g., `person_create`, `notes_get`)
- Schema names: `PascalCase` + `Schema` suffix (e.g., `PersonCreateSchema`)
- Client methods: `camelCase` (e.g., `createPerson()`)

### Safety Guidelines for Write Operations

- All delete operations should require explicit `confirm: true` parameter
- Create/update operations should validate input thoroughly with Zod schemas
- Merge operations should return a preview before executing
- Include `reason` parameters for operations that modify shared tree data

### Versioning Strategy

- Follow semver: MAJOR.MINOR.PATCH
- New tool additions: MINOR version bump
- Infrastructure improvements: PATCH version bump
- Breaking changes to existing tools: MAJOR version bump

---

## Estimated Tool Count After Full Implementation

| Phase | New Tools | Running Total |
|-------|-----------|---------------|
| Current | — | 24 |
| Phase 1 | 8 | 32 |
| Phase 2 | 8 | 40 |
| Phase 3 | 13 | 53 |
| Phase 4 | 0 (infrastructure) | 53 |
| Phase 5 | 0 (infrastructure) | 53 |
| Phase 6 | 7 | 60 |
| Phase 7 | 0 (infrastructure) | 60 |

**Target: ~60 tools** covering the full FamilySearch API surface, up from the current 24.

---

## Priority Summary

| Priority | Phases | Key Deliverables |
|----------|--------|-----------------|
| 🔴 **High** | 1, 4, 5 | Ancestry/pedigree, person CRUD, relationship management, OAuth, rate limiting, error handling |
| 🟡 **Medium** | 2, 3 | Change history, notes, batch ops, places, discussions, source descriptions, memory management |
| 🟢 **Lower** | 6, 7 | Server-side hints, ordinances, date standardization, Docker, linting, telemetry |

---

*This plan is a living document. Update it as features are implemented or as the FamilySearch API evolves. Always refer to the [official API documentation](https://developers.familysearch.org/) for the latest endpoint specifications.*
