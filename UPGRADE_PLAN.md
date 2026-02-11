# Comprehensive Upgrade Plan

> **Master API Reference:** https://developers.familysearch.org/  
> **API Reference Guide:** https://developers.familysearch.org/main/reference/api-reference-guide  
> **Current Implementation:** 95 tools across 17 categories

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
- [Phase 8: Portraits, Media & User Content (Lower Priority)](#phase-8-portraits-media--user-content-lower-priority)
- [Phase 9: User Trees, Groups & Genealogies (Lower Priority)](#phase-9-user-trees-groups--genealogies-lower-priority)
- [Phase 10: Standards, Vocabularies & Name Services (Lower Priority)](#phase-10-standards-vocabularies--name-services-lower-priority)
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

### 1.5 Current User's Tree Person

**Gap:** No way to get the tree person associated with the currently authenticated user.

**FamilySearch API Endpoint:**
- `GET /platform/tree/current-person` — Returns the current user's tree person

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `user_tree_person` | Get the tree person for the currently authenticated user | None |

**Implementation:**
- Add `getCurrentTreePerson()` to `FamilySearchClient`
- Useful as a starting point for family tree exploration
- Expected effort: Small

---

### 1.6 Find Relationship

**Gap:** No way to find the relationship path between two persons in the tree.

**FamilySearch API Endpoint:**
- `GET /platform/tree/relationships?person={pid1}&person={pid2}` — Find relationship between two persons

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `relationship_find` | Find the relationship path between two persons | `personId1` (required), `personId2` (required) |

**Implementation:**
- Add `findRelationship(personId1, personId2)` to `FamilySearchClient`
- Returns relationship path/description between two people
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

### 2.5 Restore Operations

**Gap:** No ability to restore deleted persons, relationships, or undo changes. FamilySearch supports restoring previously deleted records.

**FamilySearch API Endpoints:**
- `POST /platform/tree/persons/{personId}/restore` — Restore a deleted person
- `POST /platform/tree/child-and-parents-relationships/{relationshipId}/restore` — Restore a deleted child-parent relationship
- `POST /platform/tree/couple-relationships/{relationshipId}/restore` — Restore a deleted couple relationship
- `POST /platform/tree/changes/{changeId}/restore` — Restore a specific change

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `person_restore` | Restore a previously deleted person | `personId` (required) |
| `relationship_restore` | Restore a deleted relationship | `relationshipId` (required), `type` (couple or parent-child) |
| `change_restore` | Restore (undo) a specific change | `changeId` (required) |

**Implementation:**
- Add restore methods to `FamilySearchClient`
- Important undo capability for accidental deletions
- Expected effort: Small

---

### 2.6 Match Management

**Gap:** `merges_suggest` identifies potential duplicates, but cannot manage match resolutions or declare non-matches. The API supports full match workflow management.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/matches` — Read person matches by ID
- `POST /platform/tree/persons/{personId}/matches/{matchId}` — Update match resolution
- `GET /platform/tree/persons/{personId}/not-a-matches` — Read not-a-match declarations
- `POST /platform/tree/persons/{personId}/not-a-matches` — Create not-a-match declaration
- `DELETE /platform/tree/persons/{personId}/not-a-matches/{declarationId}` — Delete not-a-match declaration

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `matches_get` | Get match candidates for a person (server-side) | `personId` (required) |
| `match_resolve` | Accept or reject a match resolution | `personId`, `matchId`, `resolution` (accept/reject) |
| `not_a_match_create` | Declare two records are NOT the same person | `personId`, `notMatchId` |
| `not_a_match_delete` | Remove a not-a-match declaration | `personId`, `declarationId` |

**Implementation:**
- Extends the merge/match workflow from existing `merges_suggest`
- Expected effort: Medium

---

### 2.7 Preferred Relationships

**Gap:** No way to set or read preferred parent or spouse relationships. Users may have multiple parent or spouse relationships and need to designate one as preferred.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/preferred-parent-relationship` — Read preferred parent relationship
- `PUT /platform/tree/persons/{personId}/preferred-parent-relationship` — Set preferred parent relationship
- `DELETE /platform/tree/persons/{personId}/preferred-parent-relationship` — Remove preferred parent relationship
- `GET /platform/tree/persons/{personId}/preferred-spouse-relationship` — Read preferred spouse relationship
- `PUT /platform/tree/persons/{personId}/preferred-spouse-relationship` — Set preferred spouse relationship
- `DELETE /platform/tree/persons/{personId}/preferred-spouse-relationship` — Remove preferred spouse relationship

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `preferred_parent_get` | Get preferred parent relationship for a person | `personId` |
| `preferred_parent_set` | Set preferred parent relationship | `personId`, `relationshipId` |
| `preferred_spouse_get` | Get preferred spouse relationship for a person | `personId` |
| `preferred_spouse_set` | Set preferred spouse relationship | `personId`, `relationshipId` |

**Implementation:**
- Add preferred relationship methods to `FamilySearchClient`
- Expected effort: Small

---

### 2.8 Conclusion Management

**Gap:** No ability to delete individual conclusions (facts, events, names) from a person without deleting the entire person record.

**FamilySearch API Endpoints:**
- `DELETE /platform/tree/persons/{personId}/conclusions/{conclusionId}` — Delete a specific conclusion
- `DELETE /platform/tree/couple-relationships/{relationshipId}/conclusions/{conclusionId}` — Delete a couple relationship conclusion
- `DELETE /platform/tree/child-and-parents-relationships/{relationshipId}/conclusions/{conclusionId}` — Delete a child-parent relationship conclusion

**New Tool:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `conclusion_delete` | Delete a specific conclusion (fact/event/name) from a person or relationship | `entityId` (person or relationship ID), `conclusionId`, `entityType` (person, couple, child-parent) |

**Implementation:**
- Add conclusion deletion method to `FamilySearchClient`
- Expected effort: Small

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
- `GET /platform/discussions/{discussionId}` — Read a discussion
- `POST /platform/discussions/{discussionId}` — Update a discussion *(FamilySearch uses POST for updates)*
- `GET /platform/discussions/{discussionId}/comments` — Read comments
- `POST /platform/discussions/{discussionId}/comments` — Add a comment
- `DELETE /platform/discussions/{discussionId}/comments/{commentId}` — Delete a comment
- `DELETE /platform/tree/persons/{personId}/discussion-references/{referenceId}` — Remove discussion from person

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `discussions_get` | Get discussions for a person | `personId` |
| `discussion_read` | Read a specific discussion with comments | `discussionId` |
| `discussion_create` | Create a new discussion | `title`, `details` |
| `discussion_update` | Update a discussion | `discussionId`, `title`, `details` |
| `discussion_comment` | Add a comment to a discussion | `discussionId`, `text` |
| `discussion_comment_delete` | Delete a comment from a discussion | `discussionId`, `commentId` |

**Implementation:**
- Add full discussion CRUD methods to `FamilySearchClient`
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

### 3.3a Source Description Full Lifecycle

**Gap:** Cannot delete source descriptions or view their change history.

**FamilySearch API Endpoints:**
- `DELETE /platform/sources/descriptions/{sourceId}` — Delete a source description
- `POST /platform/sources/descriptions/{sourceId}/changes` — Get source description change history *(FamilySearch uses POST for this read operation)*

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `source_description_delete` | Delete a source description | `sourceId` |
| `source_description_changes` | Get change history for a source description | `sourceId` |

**Implementation:**
- Complete source description lifecycle in `FamilySearchClient`
- Expected effort: Small

---

### 3.3b Relationship-Level Sources

**Gap:** Can only manage sources attached to persons. FamilySearch also supports sources on couple relationships and child-parent relationships.

**FamilySearch API Endpoints:**
- `GET /platform/tree/couple-relationships/{relationshipId}/source-references` — Read couple relationship source references
- `POST /platform/tree/couple-relationships/{relationshipId}/source-references` — Create couple relationship source reference
- `DELETE /platform/tree/couple-relationships/{relationshipId}/source-references/{sourceId}` — Delete couple relationship source reference
- `GET /platform/tree/child-and-parents-relationships/{relationshipId}/source-references` — Read child-parent relationship source references
- `POST /platform/tree/child-and-parents-relationships/{relationshipId}/source-references` — Create child-parent relationship source reference
- `DELETE /platform/tree/child-and-parents-relationships/{relationshipId}/source-references/{sourceId}` — Delete child-parent relationship source reference

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `relationship_sources_get` | Get sources for a relationship | `relationshipId`, `type` (couple or child-parent) |
| `relationship_source_attach` | Attach a source to a relationship | `relationshipId`, `type`, `sourceId` |
| `relationship_source_detach` | Detach a source from a relationship | `relationshipId`, `type`, `sourceId` |

**Implementation:**
- Extends existing source management patterns to relationships
- Expected effort: Small-Medium

---

### 3.3c Relationship-Level Notes

**Gap:** Notes can only be managed for persons (Phase 2.2). FamilySearch also supports notes on couple relationships and child-parent relationships.

**FamilySearch API Endpoints:**
- `GET /platform/tree/couple-relationships/{relationshipId}/notes` — Read couple relationship notes
- `POST /platform/tree/couple-relationships/{relationshipId}/notes` — Create couple relationship note
- `DELETE /platform/tree/couple-relationships/{relationshipId}/notes/{noteId}` — Delete couple relationship note
- `GET /platform/tree/child-and-parents-relationships/{relationshipId}/notes` — Read child-parent relationship notes
- `POST /platform/tree/child-and-parents-relationships/{relationshipId}/notes` — Create child-parent relationship note
- `DELETE /platform/tree/child-and-parents-relationships/{relationshipId}/notes/{noteId}` — Delete child-parent relationship note

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `relationship_notes_get` | Get notes for a relationship | `relationshipId`, `type` (couple or child-parent) |
| `relationship_note_create` | Add a note to a relationship | `relationshipId`, `type`, `subject`, `text` |
| `relationship_note_delete` | Delete a note from a relationship | `relationshipId`, `type`, `noteId` |

**Implementation:**
- Mirrors person-level notes pattern from Phase 2.2
- Expected effort: Small

---

### 3.3d Source Box (Source Folders & Collections)

**Gap:** No access to user source box — the personal source folder/collection system for organizing source descriptions.

**FamilySearch API Endpoints:**
- `GET /platform/tree/source-folders` — Read user source folders
- `POST /platform/tree/source-folders` — Create a source folder
- `GET /platform/tree/source-folders/{folderId}` — Read a specific source folder
- `POST /platform/tree/source-folders/{folderId}` — Update a source folder
- `DELETE /platform/tree/source-folders/{folderId}` — Delete a source folder
- `GET /platform/tree/source-folders/{folderId}/source-descriptions` — Read source descriptions in a folder
- `POST /platform/tree/source-folders/{folderId}/source-descriptions` — Add source descriptions to a folder
- `DELETE /platform/tree/source-folders/{folderId}/source-descriptions` — Remove source descriptions from a folder

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `source_folders_list` | List user's source folders | None |
| `source_folder_create` | Create a source folder | `name` |
| `source_folder_get` | Get contents of a source folder | `folderId` |
| `source_folder_update` | Rename a source folder | `folderId`, `name` |
| `source_folder_delete` | Delete a source folder | `folderId` |
| `source_folder_add` | Add source descriptions to a folder | `folderId`, `sourceIds` (array) |
| `source_folder_remove` | Remove source descriptions from a folder | `folderId`, `sourceIds` (array) |

**Implementation:**
- New source box module in `FamilySearchClient`
- Useful for organizing research sources
- Expected effort: Medium

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

## Phase 8: Portraits, Media & User Content (Lower Priority)

### 8.1 Person Portraits

**Gap:** No access to person portrait photos. FamilySearch allows users to set a profile portrait for each person.

**FamilySearch API Endpoints:**
- `GET /platform/tree/persons/{personId}/portrait` — Read person portrait
- `DELETE /platform/tree/persons/{personId}/portrait` — Delete person portrait
- `GET /platform/tree/persons/{personId}/portraits` — Read person portraits (all)
- `POST /platform/tree/persons/{personId}/portraits` — Update person portraits

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `portrait_get` | Get the portrait for a person | `personId` |
| `portraits_list` | Get all portraits for a person | `personId` |
| `portrait_set` | Set a portrait for a person | `personId`, `memoryId` |
| `portrait_delete` | Remove a person's portrait | `personId` |

**Implementation:**
- Add portrait management methods to `FamilySearchClient`
- Expected effort: Small

---

### 8.2 Memory Personas

**Gap:** No support for memory personas — tagging specific people within a memory (e.g., identifying someone in a photo).

**FamilySearch API Endpoints:**
- `POST /platform/memories/{memoryId}/personas` — Create a memory persona
- `GET /platform/memories/{memoryId}/personas` — Read memory personas
- `GET /platform/memories/{memoryId}/personas/{personaId}` — Read a specific memory persona
- `POST /platform/memories/{memoryId}/personas/{personaId}` — Update a memory persona
- `DELETE /platform/memories/{memoryId}/personas/{personaId}` — Delete a memory persona

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `memory_personas_list` | List personas (tagged people) in a memory | `memoryId` |
| `memory_persona_create` | Tag a person in a memory | `memoryId`, `name`, `personId` (optional link to tree person) |
| `memory_persona_update` | Update a memory persona tag | `memoryId`, `personaId`, fields to update |
| `memory_persona_delete` | Remove a person tag from a memory | `memoryId`, `personaId` |

**Implementation:**
- Add persona methods to `FamilySearchClient`
- Expected effort: Small-Medium

---

### 8.3 Memory Comments

**Gap:** No support for comments on memories. FamilySearch allows users to discuss memories via comments.

**FamilySearch API Endpoints:**
- `POST /platform/memories/{memoryId}/comments` — Create memory comments
- `GET /platform/memories/{memoryId}/comments` — Read memory comments
- `DELETE /platform/memories/{memoryId}/comments/{commentId}` — Delete a memory comment

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `memory_comments_get` | Get comments on a memory | `memoryId` |
| `memory_comment_create` | Add a comment to a memory | `memoryId`, `text` |
| `memory_comment_delete` | Delete a comment from a memory | `memoryId`, `commentId` |

**Implementation:**
- Add memory comment methods to `FamilySearchClient`
- Expected effort: Small

---

### 8.4 Memory Artifacts

**Gap:** No ability to update memory artifacts or manage artifact coverage areas.

**FamilySearch API Endpoints:**
- `POST /platform/memories/{memoryId}/artifacts/{artifactId}` — Update memory artifact
- `DELETE /platform/memories/{memoryId}/artifacts/{artifactId}/coverage` — Delete memory artifact coverage

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `memory_artifact_update` | Update a memory artifact | `memoryId`, `artifactId`, fields to update |
| `memory_artifact_coverage_delete` | Delete artifact coverage area | `memoryId`, `artifactId` |

**Implementation:**
- Add artifact methods to `FamilySearchClient`
- Expected effort: Small

---

### 8.5 Memory Browsing

**Gap:** Can search memories but cannot browse or list memories (all memories, user memories).

**FamilySearch API Endpoints:**
- `GET /platform/memories` — Read memories (list/browse)
- `GET /platform/memories/users/{userId}` — Read user memories
- `POST /platform/memories/{memoryId}` — Update a memory

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `memories_list` | Browse/list memories | `count` (optional), `start` (optional) |
| `memories_user` | List memories for a specific user | `userId` (optional — defaults to current user) |
| `memory_update` | Update an existing memory | `memoryId`, fields to update |

**Implementation:**
- Extends existing memory capabilities
- Expected effort: Small

---

## Phase 9: User Trees, Groups & Genealogies (Lower Priority)

### 9.1 User Tree Management

**Gap:** FamilySearch supports user-specific trees (personal/research trees) separate from the shared Family Tree. No tools exist for managing these.

**FamilySearch API Endpoints:**
- `GET /platform/tree/trees/current` — Read current tree ID
- `POST /platform/tree/trees/current` — Set current tree ID
- `GET /platform/tree/trees/{treeId}` — Read a tree
- `POST /platform/tree/trees/{treeId}` — Update a tree
- `DELETE /platform/tree/trees/{treeId}` — Delete a tree
- `POST /platform/tree/trees` — Create a new tree
- `GET /platform/tree/trees/{treeId}/persons` — Read tree person IDs
- `GET /platform/tree/trees/{treeId}/matches` — Read tree matches
- `GET /platform/tree/trees/{treeId}/changes` — Read tree change history

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `tree_current` | Get the current user's active tree ID | None |
| `tree_set_current` | Set the current active tree | `treeId` |
| `tree_get` | Get details about a specific tree | `treeId` |
| `tree_create` | Create a new personal/research tree | `name`, `description` |
| `tree_update` | Update a tree's metadata | `treeId`, `name`, `description` |
| `tree_delete` | Delete a tree | `treeId` |
| `tree_persons` | List person IDs in a tree | `treeId` |
| `tree_matches` | Get match suggestions for a tree | `treeId` |
| `tree_changes` | Get change history for a tree | `treeId` |

**Implementation:**
- New tree management module in `FamilySearchClient`
- Expected effort: Medium

---

### 9.2 Groups

**Gap:** FamilySearch supports groups for organizing research collaborators. Not covered.

**FamilySearch API Endpoints:**
- `GET /platform/tree/groups` — List user's groups
- `POST /platform/tree/groups` — Create a group
- `GET /platform/tree/groups/{groupId}` — Read a group
- `POST /platform/tree/groups/{groupId}` — Update a group
- `DELETE /platform/tree/groups/{groupId}` — Delete a group

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `groups_list` | List user's groups | None |
| `group_create` | Create a new group | `name`, `description` |
| `group_get` | Get a specific group | `groupId` |
| `group_update` | Update a group | `groupId`, `name`, `description` |
| `group_delete` | Delete a group | `groupId` |

**Implementation:**
- Add group management methods to `FamilySearchClient`
- Expected effort: Small

---

### 9.3 Genealogies (Personal Trees)

**Gap:** The Genealogies API is an entirely separate tree system for personal/imported genealogies. Not covered at all.

**FamilySearch API Endpoints:**
- **Trees:** `GET /platform/genealogies/trees` — List genealogy trees
- **Trees:** `POST /platform/genealogies/trees` — Create a genealogy tree
- **Trees:** `GET /platform/genealogies/trees/{treeId}` — Read a genealogy tree
- **Trees:** `POST /platform/genealogies/trees/{treeId}` — Update a genealogy tree
- **Trees:** `DELETE /platform/genealogies/trees/{treeId}` — Delete a genealogy tree
- **Persons:** `GET /platform/genealogies/trees/{treeId}/persons` — List persons in a tree
- **Persons:** `POST /platform/genealogies/trees/{treeId}/persons` — Create a person
- **Persons:** `GET /platform/genealogies/trees/{treeId}/persons/{personId}` — Read a person
- **Persons:** `POST /platform/genealogies/trees/{treeId}/persons/{personId}` — Update a person
- **Persons:** `DELETE /platform/genealogies/trees/{treeId}/persons/{personId}` — Delete a person
- **Relationships:** `POST /platform/genealogies/trees/{treeId}/relationships/{relationshipId}` — Update relationship
- **Relationships:** `DELETE /platform/genealogies/trees/{treeId}/relationships/{relationshipId}` — Delete relationship
- **Sources:** `GET /platform/genealogies/trees/{treeId}/sources/{sourceId}` — Read source description
- **Sources:** `POST /platform/genealogies/trees/{treeId}/sources` — Create source description
- **Sources:** `POST /platform/genealogies/trees/{treeId}/sources/{sourceId}` — Update source description
- **Sources:** `DELETE /platform/genealogies/trees/{treeId}/sources/{sourceId}` — Delete source description
- **Notes:** `GET /platform/genealogies/trees/{treeId}/persons/{personId}/notes/{noteId}` — Read notes
- **Matches:** `GET /platform/genealogies/trees/{treeId}/matches` — Tree-level matching
- **Matches:** `GET /platform/genealogies/trees/{treeId}/persons/{personId}/matches` — Person-level matching

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `genealogy_trees_list` | List user's genealogy trees | None |
| `genealogy_tree_create` | Create a new genealogy tree | `name` |
| `genealogy_tree_get` | Get a genealogy tree | `treeId` |
| `genealogy_tree_delete` | Delete a genealogy tree | `treeId` |
| `genealogy_person_create` | Create a person in a genealogy tree | `treeId`, person fields |
| `genealogy_person_get` | Read a person from a genealogy tree | `treeId`, `personId` |
| `genealogy_person_update` | Update a person in a genealogy tree | `treeId`, `personId`, fields |
| `genealogy_person_delete` | Delete a person from a genealogy tree | `treeId`, `personId` |
| `genealogy_matches_get` | Get match suggestions for a genealogy tree or person | `treeId`, `personId` (optional) |

**Implementation:**
- New genealogies module in `FamilySearchClient`
- Important for users who import GEDCOM files into personal trees before merging with shared tree
- Expected effort: Large

---

## Phase 10: Standards, Vocabularies & Name Services (Lower Priority)

### 10.1 Extended Place Authority

**Gap:** Phase 3.1 covers basic place search/get/children. The full Place Authority API has significantly more capabilities.

**FamilySearch API Endpoints:**
- `GET /platform/places/{placeId}/descriptions` — Read place descriptions
- `GET /platform/places/{placeId}/descriptions/{descriptionId}` — Read a specific place description
- `GET /platform/places/{placeId}/descriptions/{descriptionId}/attributes` — Read place attributes
- `GET /platform/places/{placeId}/descriptions/{descriptionId}/with-related` — Read place with related places
- `GET /platform/places/descriptions/group/{groupId}` — Read place descriptions by group
- `GET /platform/places/types` — Read place types
- `GET /platform/places/types/{typeId}` — Read a specific place type
- `GET /platform/places/type-groups` — Read place type groups
- `GET /platform/places/type-groups/{groupId}` — Read a specific place type group
- `GET /platform/places/search?parentId={placeId}` — Search for parent places
- `GET /platform/places/{placeId}/is-child-of/{parentPlaceId}` — Check if place is child of another

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `place_description` | Get detailed description for a place | `placeId`, `descriptionId` (optional) |
| `place_types` | List all place types | None |
| `place_type_groups` | List place type groups | None |
| `place_parents` | Find parent places (jurisdictions above) | `placeId` |
| `place_is_child` | Check if one place is within another | `placeId`, `parentPlaceId` |

**Implementation:**
- Extends Phase 3.1 place authority with full feature set
- Expected effort: Small-Medium

---

### 10.2 Name Standardization & Services

**Gap:** No name analysis or standardization capabilities. FamilySearch provides APIs for name script detection, name segmentation, and name composition.

**FamilySearch API Endpoints:**
- `GET /platform/names/script?name={name}` — Detect name script (Latin, CJK, Cyrillic, etc.)
- `GET /platform/names/segments?name={name}` — Segment a name into given name, surname, etc.
- `POST /platform/names/segments` — Compose a full name from parts

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `name_script` | Detect the script of a name (Latin, CJK, etc.) | `name` |
| `name_segment` | Segment a name into given name, surname, prefix, suffix parts | `name` |
| `name_compose` | Compose a full name from individual parts | `givenName`, `surname`, `prefix`, `suffix` |

**Implementation:**
- Add name services methods to `FamilySearchClient`
- Useful for international research and name normalization
- Expected effort: Small

---

### 10.3 Controlled Vocabularies

**Gap:** No access to FamilySearch's controlled vocabulary system for standardized terms (event types, fact types, etc.).

**FamilySearch API Endpoints:**
- `GET /platform/vocabularies/search?q={query}` — Search controlled vocabulary terms
- `GET /platform/vocabularies/{termId}` — Read a controlled vocabulary term
- `GET /platform/vocabularies/{termId}/translations/{locale}` — Read a term translation
- `GET /platform/vocabularies/concepts/{conceptId}` — Read a vocabulary concept
- `GET /platform/vocabularies/concepts/{conceptId}/definition` — Read concept definition
- `GET /platform/vocabularies/lists/{listId}` — Read a controlled vocabulary list

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `vocabulary_search` | Search controlled vocabulary terms | `query` |
| `vocabulary_term` | Get a specific vocabulary term | `termId`, `locale` (optional for translation) |
| `vocabulary_list` | Get a controlled vocabulary list | `listId` |

**Implementation:**
- Add vocabulary methods to `FamilySearchClient`
- Useful for understanding FamilySearch's standardized event/fact types
- Expected effort: Small

---

### 10.4 User History & Agent

**Gap:** No access to user history or agent information.

**FamilySearch API Endpoints:**
- `GET /platform/users/{userId}/history` — Read user history
- `POST /platform/users/{userId}/history` — Update user history
- `DELETE /platform/users/{userId}/history/{entryId}` — Delete user history entry
- `GET /platform/agents/{agentId}` — Read agent information

**New Tools:**

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `user_history` | Get user activity history | `userId` (optional — defaults to current user) |
| `agent_get` | Get agent (contributor) information | `agentId` |

**Implementation:**
- Add user history and agent methods to `FamilySearchClient`
- Expected effort: Small

---

## API Endpoint Coverage Matrix

This matrix maps FamilySearch API endpoints to current and planned tool coverage.

### Family Tree Endpoints — Persons

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}` | GET | `person_get` ✅ | — | — |
| `/tree/persons` | POST | — | `person_create` | 1.2 |
| `/tree/persons/{pid}` | POST | — | `person_update` | 1.2 |
| `/tree/persons/{pid}` | DELETE | — | `person_delete` | 1.2 |
| `/tree/persons?pids=...` | GET | — | `persons_batch_get` | 2.3 |
| `/tree/current-person` | GET | — | `user_tree_person` | 1.5 |
| `/tree/persons/{pid}/restore` | POST | — | `person_restore` | 2.5 |
| `/tree/persons/{pid}/conclusions/{cid}` | DELETE | — | `conclusion_delete` | 2.8 |

### Family Tree Endpoints — Search & Navigation

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/search` | GET | `people_search` ✅ | — | — |
| `/tree/ancestry` | GET | — | `ancestry_get` | 1.1 |
| `/tree/descendancy` | GET | — | `descendancy_get` | 1.1 |
| `/tree/persons/{pid}/with-relationships` | GET | `families_get` ✅ | — | — |

### Family Tree Endpoints — Relationships

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/relationships` | GET | — | `relationship_find` | 1.6 |
| `/tree/relationships` | POST | — | `relationship_create_couple` | 1.3 |
| `/tree/child-and-parents-relationships` | POST | — | `relationship_create_parent_child` | 1.3 |
| `/tree/couple-relationships/{rid}` | DELETE | — | `relationship_delete` | 1.3 |
| `/tree/child-and-parents-relationships/{rid}` | DELETE | — | `relationship_delete` | 1.3 |
| `/tree/couple-relationships/{rid}/restore` | POST | — | `relationship_restore` | 2.5 |
| `/tree/child-and-parents-relationships/{rid}/restore` | POST | — | `relationship_restore` | 2.5 |
| `/tree/persons/{pid}/preferred-parent-relationship` | GET/PUT/DELETE | — | `preferred_parent_get/set` | 2.7 |
| `/tree/persons/{pid}/preferred-spouse-relationship` | GET/PUT/DELETE | — | `preferred_spouse_get/set` | 2.7 |

### Family Tree Endpoints — Change History

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}/change-history` | GET | — | `change_history_person` | 2.1 |
| `/tree/couple-relationships/{rid}/change-history` | GET | — | `change_history_relationship` | 2.1 |
| `/tree/child-and-parents-relationships/{rid}/change-history` | GET | — | `change_history_relationship` | 2.1 |
| `/tree/changes/{changeId}/restore` | POST | — | `change_restore` | 2.5 |

### Family Tree Endpoints — Notes

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}/notes` | GET | — | `notes_get` | 2.2 |
| `/tree/persons/{pid}/notes` | POST | — | `note_create` | 2.2 |
| `/tree/persons/{pid}/notes/{nid}` | PUT | — | `note_update` | 2.2 |
| `/tree/persons/{pid}/notes/{nid}` | DELETE | — | `note_delete` | 2.2 |
| `/tree/couple-relationships/{rid}/notes` | GET/POST | — | `relationship_notes_get/note_create` | 3.3c |
| `/tree/child-and-parents-relationships/{rid}/notes` | GET/POST | — | `relationship_notes_get/note_create` | 3.3c |

### Family Tree Endpoints — Sources

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}/sources` | GET | `sources_get` ✅ | — | — |
| `/tree/persons/{pid}/sources` | POST | `source_attach` ✅ | — | — |
| `/tree/persons/{pid}/sources/{sid}` | DELETE | `source_detach` ✅ | — | — |
| `/sources/descriptions/{sid}` | GET | — | `source_description_get` | 3.3 |
| `/sources/descriptions` | POST | — | `source_description_create` | 3.3 |
| `/sources/descriptions/{sid}` | POST | — | `source_description_update` | 3.3 |
| `/sources/descriptions/{sid}` | DELETE | — | `source_description_delete` | 3.3a |
| `/sources/descriptions/{sid}/changes` | POST | — | `source_description_changes` | 3.3a |
| `/tree/couple-relationships/{rid}/source-references` | GET/POST/DELETE | — | `relationship_sources_*` | 3.3b |
| `/tree/child-and-parents-relationships/{rid}/source-references` | GET/POST/DELETE | — | `relationship_sources_*` | 3.3b |
| `/tree/source-folders` | GET/POST | — | `source_folders_*` | 3.3d |
| `/tree/source-folders/{fid}` | GET/POST/DELETE | — | `source_folder_*` | 3.3d |

### Family Tree Endpoints — Matches & Merges

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}/matches` | GET | — | `matches_get` | 2.6 |
| `/tree/persons/{pid}/matches/{mid}` | POST | — | `match_resolve` | 2.6 |
| `/tree/persons/{pid}/not-a-matches` | GET/POST | — | `not_a_match_create` | 2.6 |
| `/tree/persons/{pid}/not-a-matches/{did}` | DELETE | — | `not_a_match_delete` | 2.6 |
| `/tree/persons/{pid}/merges/{did}` | POST | — | `person_merge` | 2.4 |

### Family Tree Endpoints — Discussions & Portraits

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/persons/{pid}/discussion-references` | GET | — | `discussions_get` | 3.2 |
| `/discussions` | POST | — | `discussion_create` | 3.2 |
| `/discussions/{did}` | GET/POST | — | `discussion_read/update` | 3.2 |
| `/discussions/{did}/comments` | GET/POST | — | `discussion_comment` | 3.2 |
| `/discussions/{did}/comments/{cid}` | DELETE | — | `discussion_comment_delete` | 3.2 |
| `/tree/persons/{pid}/portrait` | GET/DELETE | — | `portrait_get/delete` | 8.1 |
| `/tree/persons/{pid}/portraits` | GET/POST | — | `portraits_list/set` | 8.1 |

### Records & Search

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/records/search` | GET | `records_search` ✅ | — | — |
| `/collections` | GET | — | `collections_list` | 6.5 |
| `/collections/{cid}` | GET | — | `collection_get` | 6.5 |

### Memories Endpoints

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/memories/search` | GET | `memories_search` ✅ | — | — |
| `/memories` | GET/POST | `memory_upload` ✅ | `memories_list` | 8.5 |
| `/memories/{mid}` | GET | — | `memory_get` | 3.4 |
| `/memories/{mid}` | POST | — | `memory_update` | 8.5 |
| `/memories/{mid}` | DELETE | — | `memory_delete` | 3.4 |
| `/memories/users/{uid}` | GET | — | `memories_user` | 8.5 |
| `/tree/persons/{pid}/memory-references` | POST | — | `memory_attach` | 3.4 |
| `/tree/persons/{pid}/memory-references/{rid}` | DELETE | — | `memory_detach` | 3.4 |
| `/memories/{mid}/personas` | GET/POST | — | `memory_personas_list/create` | 8.2 |
| `/memories/{mid}/personas/{pid}` | GET/POST/DELETE | — | `memory_persona_*` | 8.2 |
| `/memories/{mid}/comments` | GET/POST | — | `memory_comments_get/create` | 8.3 |
| `/memories/{mid}/comments/{cid}` | DELETE | — | `memory_comment_delete` | 8.3 |
| `/memories/{mid}/artifacts/{aid}` | POST | — | `memory_artifact_update` | 8.4 |

### Standards Endpoints

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/dates` | GET | — | `date_standardize` | 6.3 |
| `/places/search` | GET | — | `place_search` | 3.1 |
| `/places/{placeId}` | GET | — | `place_get` | 3.1 |
| `/places/{placeId}/children` | GET | — | `place_children` | 3.1 |
| `/places/{placeId}/descriptions` | GET | — | `place_description` | 10.1 |
| `/places/types` | GET | — | `place_types` | 10.1 |
| `/places/type-groups` | GET | — | `place_type_groups` | 10.1 |
| `/names/script` | GET | — | `name_script` | 10.2 |
| `/names/segments` | GET/POST | — | `name_segment/compose` | 10.2 |
| `/vocabularies/search` | GET | — | `vocabulary_search` | 10.3 |
| `/vocabularies/{tid}` | GET | — | `vocabulary_term` | 10.3 |
| `/vocabularies/lists/{lid}` | GET | — | `vocabulary_list` | 10.3 |

### User Endpoints

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/users/current` | GET | — | `user_current` | 1.4 |
| `/users/{uid}/history` | GET/POST/DELETE | — | `user_history` | 10.4 |
| `/agents/{aid}` | GET | — | `agent_get` | 10.4 |

### User Tree Endpoints

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/trees/current` | GET/POST | — | `tree_current/set_current` | 9.1 |
| `/tree/trees/{tid}` | GET/POST/DELETE | — | `tree_get/update/delete` | 9.1 |
| `/tree/trees` | POST | — | `tree_create` | 9.1 |
| `/tree/trees/{tid}/persons` | GET | — | `tree_persons` | 9.1 |
| `/tree/trees/{tid}/matches` | GET | — | `tree_matches` | 9.1 |
| `/tree/trees/{tid}/changes` | GET | — | `tree_changes` | 9.1 |
| `/tree/groups` | GET/POST | — | `groups_list/create` | 9.2 |
| `/tree/groups/{gid}` | GET/POST/DELETE | — | `group_get/update/delete` | 9.2 |

### Genealogies Endpoints

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/genealogies/trees` | GET/POST | — | `genealogy_trees_list/create` | 9.3 |
| `/genealogies/trees/{tid}` | GET/POST/DELETE | — | `genealogy_tree_get/update/delete` | 9.3 |
| `/genealogies/trees/{tid}/persons` | GET/POST | — | `genealogy_person_*` | 9.3 |
| `/genealogies/trees/{tid}/persons/{pid}` | GET/POST/DELETE | — | `genealogy_person_*` | 9.3 |
| `/genealogies/trees/{tid}/matches` | GET | — | `genealogy_matches_get` | 9.3 |

### GEDCOM & Utilities

| API Endpoint | Method | Current Tool | Planned Tool | Phase |
|---|---|---|---|---|
| `/tree/gedcomx` | POST | `gedcom_import` ✅ | — | — |
| `/tree/persons/{pid}/gedcomx` | GET | `gedcom_export` ✅ | — | — |
| `/tree/persons/{pid}/ordinances` | GET | — | `ordinances_get` | 6.2 |
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

### FamilySearch API Conventions

> **Note:** The FamilySearch API uses non-standard HTTP methods in some cases:
> - **POST for updates**: Many update operations use POST instead of PUT/PATCH (e.g., Update Discussion, Update Person)
> - **POST for reads**: Some read operations use POST (e.g., Get Source Description Changes, Person Matches by Example)
> - Always refer to the [official API documentation](https://developers.familysearch.org/) for the correct HTTP method for each endpoint.

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
| Current (with visualization) | — | 27 |
| Phase 1 (Core API Gap Closure) ✅ | 10 | 37 |
| Phase 2 (Extended Tree Operations) ✅ | 20 | 57 |
| Phase 3 (Collaboration & Metadata) ✅ | 31 | 88 |
| Phase 4 (Infrastructure) | 0 (infrastructure) | 88 |
| Phase 5 (Auth & Authorization) | 0 (infrastructure) | 88 |
| Phase 6 (Advanced Research) ✅ | 7 | 95 |
| Phase 7 (Developer Experience) | 0 (infrastructure) | 95 |
| Phase 8 (Portraits, Media & User Content) | 16 | 111 |
| Phase 9 (User Trees, Groups & Genealogies) | 23 | 134 |
| Phase 10 (Standards, Vocabularies & Names) | 13 | 147 |

**Target: ~147 tools** covering the full FamilySearch API surface. Currently **95 tools implemented** (Phases 1-3 and 6 complete).

> **Note:** The estimate above includes every documented FamilySearch API endpoint. In practice, many endpoints are low-priority or niche. A practical "full coverage" target of **~95 tools** (Phases 1-7) covers all frequently-used API capabilities. Phases 8-10 represent exhaustive completeness.

---

## Completed Upgrades

### ✅ Visualization Tools (Implemented)

Added 4 visualization tools inspired by [mcp-mermaid](https://github.com/hustcc/mcp-mermaid) and [excalidraw-mcp](https://github.com/excalidraw/excalidraw-mcp):

| Tool | Output | Description |
|------|--------|-------------|
| `family_tree_chart` | Mermaid | Flowchart of family relationships with color coding |
| `timeline_chart` | Mermaid | Life events timeline with optional relatives |
| `pedigree_chart` | Mermaid | Multi-generational ancestry chart |
| `family_tree_drawing` | Excalidraw JSON | Interactive drawing with boxes and arrows |

These tools generate visualization data that can be rendered by external MCP servers (mcp-mermaid, excalidraw-mcp) or [MCP Apps](https://modelcontextprotocol.io/docs/extensions/apps) for interactive in-chat rendering.

### ✅ Agents Skill (Implemented)

Added `.github/copilot/skills/family-mcp/SKILL.md` for GitHub Copilot and other AI coding agents. The skill provides comprehensive guidance on all 95 tools, visualization capabilities, common workflows, and configuration.

### ✅ Custom Agents (Implemented)

Added 3 custom agents in `.github/agents/` following the [GitHub Copilot custom agents specification](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents):

| Agent | File | Description |
|-------|------|-------------|
| **Family Investigator** | `family-investigator.agent.md` | Detective-style genealogy research with investigation reports, evidence gathering, and lineage tracing |
| **Family Tree Visualizer** | `family-tree-visualizer.agent.md` | Specialist in Mermaid charts and Excalidraw drawings for family tree visualization |
| **Genealogy Planner** | `genealogy-planner.agent.md` | Structured research plans with prioritized tasks, methodology guidance, and record suggestions |

Custom agents use the `.agent.md` format with YAML frontmatter for `name`, `description`, and `tools` configuration. They are available via the agents dropdown in GitHub Copilot or can be assigned to issues.

### ✅ Copilot Coding Agent Compatibility (Implemented)

Added `COPILOT_MCP_` prefixed environment variable support for GitHub Copilot coding agent compatibility.

### ✅ Phase 1: Core API Gap Closure (Implemented)

Added 10 tools for core API coverage:

| Tool | Category | Description |
|------|----------|-------------|
| `ancestry_get` | Ancestry & Pedigree | Get multi-generation ancestor pedigree |
| `descendancy_get` | Ancestry & Pedigree | Get multi-generation descendancy tree |
| `person_create` | Person CRUD | Create a new person in the Family Tree |
| `person_update` | Person CRUD | Update person facts and details |
| `person_delete` | Person CRUD | Delete a person from the Family Tree |
| `relationship_create_couple` | Relationship Management | Create a couple relationship |
| `relationship_create_parent_child` | Relationship Management | Create a parent-child relationship |
| `relationship_delete` | Relationship Management | Delete a relationship |
| `user_current` | User & Session | Get current authenticated user info |
| `user_tree_person` | User & Session | Get the user's default tree person |
| `relationship_find` | User & Navigation | Find relationship path between two persons |

### ✅ Phase 2: Extended Tree Operations (Implemented)

Added 20 tools for extended tree operations:

| Tool | Category | Description |
|------|----------|-------------|
| `change_history_person` | Change History | Get change history for a person |
| `change_history_relationship` | Change History | Get change history for a relationship |
| `notes_get` | Notes | Get notes attached to a person |
| `note_create` | Notes | Create a note on a person |
| `note_update` | Notes | Update a note |
| `note_delete` | Notes | Delete a note |
| `persons_batch_get` | Batch Operations | Get multiple persons in one request |
| `person_merge` | Merge | Merge duplicate person records |
| `person_restore` | Restore | Restore a deleted person |
| `relationship_restore` | Restore | Restore a deleted relationship |
| `change_restore` | Restore | Restore to a previous change state |
| `matches_get` | Match Management | Get potential duplicate matches |
| `match_resolve` | Match Management | Accept or reject a match |
| `not_a_match_create` | Match Management | Declare two persons are not the same |
| `not_a_match_delete` | Match Management | Remove a not-a-match declaration |
| `preferred_parent_get` | Preferred Relationships | Get preferred parent relationship |
| `preferred_parent_set` | Preferred Relationships | Set preferred parent relationship |
| `preferred_spouse_get` | Preferred Relationships | Get preferred spouse relationship |
| `preferred_spouse_set` | Preferred Relationships | Set preferred spouse relationship |
| `conclusion_delete` | Conclusion Management | Delete a conclusion from a person |

### ✅ Phase 3: Collaboration & Metadata (Implemented)

Added 31 tools for collaboration and metadata features:

| Tool | Category | Description |
|------|----------|-------------|
| `place_search` | Place Authority | Search the place authority database |
| `place_get` | Place Authority | Get place details by ID |
| `place_children` | Place Authority | Get child/subdivision places |
| `discussions_get` | Discussions | Get discussions for a person |
| `discussion_read` | Discussions | Read a discussion thread |
| `discussion_create` | Discussions | Create a new discussion |
| `discussion_update` | Discussions | Update a discussion |
| `discussion_comment` | Discussions | Add a comment to a discussion |
| `discussion_comment_delete` | Discussions | Delete a discussion comment |
| `source_description_get` | Source Descriptions | Get a source description |
| `source_description_create` | Source Descriptions | Create a source description |
| `source_description_update` | Source Descriptions | Update a source description |
| `source_description_delete` | Source Descriptions | Delete a source description |
| `source_description_changes` | Source Descriptions | Get source description change history |
| `relationship_sources_get` | Relationship Sources | Get sources on a relationship |
| `relationship_source_attach` | Relationship Sources | Attach a source to a relationship |
| `relationship_source_detach` | Relationship Sources | Detach a source from a relationship |
| `relationship_notes_get` | Relationship Notes | Get notes on a relationship |
| `relationship_note_create` | Relationship Notes | Create a note on a relationship |
| `relationship_note_delete` | Relationship Notes | Delete a note from a relationship |
| `source_folders_list` | Source Folders | List source folders |
| `source_folder_create` | Source Folders | Create a source folder |
| `source_folder_get` | Source Folders | Get folder details and contents |
| `source_folder_update` | Source Folders | Update a folder name |
| `source_folder_delete` | Source Folders | Delete a source folder |
| `source_folder_add` | Source Folders | Add a source to a folder |
| `source_folder_remove` | Source Folders | Remove a source from a folder |
| `memory_get` | Memory Management | Get memory details by ID |
| `memory_delete` | Memory Management | Delete a memory |
| `memory_attach` | Memory Management | Attach a memory to a person |
| `memory_detach` | Memory Management | Detach a memory from a person |

### ✅ Phase 6: Advanced Research & Discovery (Implemented)

Added 7 tools for advanced research capabilities:

| Tool | Category | Description |
|------|----------|-------------|
| `hints_get` | Record Hints | Get server-generated record hints |
| `ordinances_get` | Ordinances | Get ordinance/temple work status |
| `date_standardize` | Date Standardization | Standardize date strings |
| `mother_side_plan` | Research Planning | Research plan for maternal lineage |
| `collections_list` | Collections | List record collections |
| `collection_get` | Collections | Get collection details |

---

## Priority Summary

| Priority | Phases | Key Deliverables |
|----------|--------|-----------------|
| 🔴 **High** | 1, 4, 5 | Ancestry/pedigree, person CRUD, relationship management, find relationship, current user/tree person, OAuth, rate limiting, error handling |
| 🟡 **Medium** | 2, 3 | Change history, notes, batch ops, restore operations, match management, preferred relationships, conclusion management, places, discussions (full CRUD), source descriptions (full lifecycle), relationship-level sources/notes, source box/folders, memory management |
| 🟢 **Lower** | 6, 7, 8, 9, 10 | Server-side hints, ordinances, date standardization, maternal research plan, collections, Docker, linting, telemetry, portraits, memory personas/comments/artifacts, user trees, groups, genealogies, extended place authority, name services, vocabularies, user history |

---

*This plan is a living document. Update it as features are implemented or as the FamilySearch API evolves. Always refer to the [official API documentation](https://developers.familysearch.org/) for the latest endpoint specifications.*
