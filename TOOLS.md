# Tools Reference

Complete reference for all 95 tools across 17 categories available in the FamilySearch MCP server.

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

## Ancestry & Pedigree Tools

### ancestry_get

Get the ancestry/pedigree for a person, returning multiple generations of ancestors.

**Parameters:**
- `personId` (string, required) - Person ID to start from
- `generations` (number, optional) - Number of ancestor generations (default: 4)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 4
}
```

**Returns:** Pedigree data with ancestor persons across requested generations.

---

### descendancy_get

Get the descendancy tree for a person, returning multiple generations of descendants.

**Parameters:**
- `personId` (string, required) - Person ID to start from
- `generations` (number, optional) - Number of descendant generations (default: 2)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 2
}
```

**Returns:** Descendancy data with descendant persons and family links.

---

## Person CRUD Tools

### person_create

Create a new person in the FamilySearch Family Tree.

**Parameters:**
- `givenName` (string, required) - Given/first name
- `surname` (string, required) - Family/last name
- `gender` (string, required) - Gender: "Male" or "Female"
- `birthDate` (string, optional) - Birth date
- `birthPlace` (string, optional) - Birth place
- `deathDate` (string, optional) - Death date
- `deathPlace` (string, optional) - Death place

**Example:**
```json
{
  "givenName": "John",
  "surname": "Smith",
  "gender": "Male",
  "birthDate": "1850",
  "birthPlace": "New York"
}
```

**Returns:** Created person record with assigned ID.

---

### person_update

Update facts and details for an existing person.

**Parameters:**
- `personId` (string, required) - Person ID to update
- `givenName` (string, optional) - Updated given name
- `surname` (string, optional) - Updated surname
- `birthDate` (string, optional) - Updated birth date
- `birthPlace` (string, optional) - Updated birth place
- `deathDate` (string, optional) - Updated death date
- `deathPlace` (string, optional) - Updated death place

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "birthDate": "15 March 1850",
  "birthPlace": "Albany, New York"
}
```

**Returns:** Updated person record.

---

### person_delete

Delete a person from the FamilySearch Family Tree.

**Parameters:**
- `personId` (string, required) - Person ID to delete
- `reason` (string, optional) - Reason for deletion

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "reason": "Duplicate record"
}
```

**Returns:** Confirmation of person deletion.

---

## Relationship Management Tools

### relationship_create_couple

Create a couple relationship between two persons.

**Parameters:**
- `person1Id` (string, required) - First person ID
- `person2Id` (string, required) - Second person ID

**Example:**
```json
{
  "person1Id": "KWQS-BBQ",
  "person2Id": "L123-456"
}
```

**Returns:** Created couple relationship with ID.

---

### relationship_create_parent_child

Create a parent-child relationship.

**Parameters:**
- `parentId` (string, required) - Parent person ID
- `childId` (string, required) - Child person ID

**Example:**
```json
{
  "parentId": "KWQS-BBQ",
  "childId": "L123-456"
}
```

**Returns:** Created parent-child relationship with ID.

---

### relationship_delete

Delete a relationship from the Family Tree.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID to delete
- `reason` (string, optional) - Reason for deletion

**Example:**
```json
{
  "relationshipId": "REL-123",
  "reason": "Incorrect relationship"
}
```

**Returns:** Confirmation of relationship deletion.

---

## User & Session Tools

### user_current

Get information about the currently authenticated user.

**Parameters:** None

**Example:**
```json
{}
```

**Returns:** Current user profile including display name and person ID.

---

### user_tree_person

Get the tree person (starting person) for the current user.

**Parameters:** None

**Example:**
```json
{}
```

**Returns:** The user's default starting person in the Family Tree.

---

### relationship_find

Find the relationship path between two persons in the tree.

**Parameters:**
- `person1Id` (string, required) - First person ID
- `person2Id` (string, required) - Second person ID

**Example:**
```json
{
  "person1Id": "KWQS-BBQ",
  "person2Id": "L123-456"
}
```

**Returns:** Relationship path and description between the two persons.

---

## Change History Tools

### change_history_person

Get the change history for a person record.

**Parameters:**
- `personId` (string, required) - Person ID
- `count` (number, optional) - Number of changes to return

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "count": 10
}
```

**Returns:** Array of change entries with timestamps, contributors, and change details.

---

### change_history_relationship

Get the change history for a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID
- `count` (number, optional) - Number of changes to return

**Example:**
```json
{
  "relationshipId": "REL-123",
  "count": 10
}
```

**Returns:** Array of change entries for the relationship.

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

## Source Description Tools

### source_description_get

Get a source description by ID.

**Parameters:**
- `sourceDescriptionId` (string, required) - Source description ID

**Example:**
```json
{
  "sourceDescriptionId": "SD-123"
}
```

**Returns:** Full source description with citation, title, and notes.

---

### source_description_create

Create a new source description.

**Parameters:**
- `title` (string, required) - Source title
- `citation` (string, required) - Source citation text
- `url` (string, optional) - Source URL
- `notes` (string, optional) - Additional notes

**Example:**
```json
{
  "title": "1940 U.S. Census",
  "citation": "U.S. Census Bureau. 1940 Census.",
  "url": "https://example.com/census-1940"
}
```

**Returns:** Created source description with ID.

---

### source_description_update

Update an existing source description.

**Parameters:**
- `sourceDescriptionId` (string, required) - Source description ID
- `title` (string, optional) - Updated title
- `citation` (string, optional) - Updated citation
- `notes` (string, optional) - Updated notes

**Example:**
```json
{
  "sourceDescriptionId": "SD-123",
  "title": "1940 U.S. Federal Census"
}
```

**Returns:** Updated source description.

---

### source_description_delete

Delete a source description.

**Parameters:**
- `sourceDescriptionId` (string, required) - Source description ID

**Example:**
```json
{
  "sourceDescriptionId": "SD-123"
}
```

**Returns:** Confirmation of deletion.

---

### source_description_changes

Get the change history for a source description.

**Parameters:**
- `sourceDescriptionId` (string, required) - Source description ID

**Example:**
```json
{
  "sourceDescriptionId": "SD-123"
}
```

**Returns:** Array of change history entries.

---

## Source Folder Tools

### source_folders_list

List all source folders (source box) for the current user.

**Parameters:** None

**Example:**
```json
{}
```

**Returns:** Array of source folders with IDs and names.

---

### source_folder_create

Create a new source folder.

**Parameters:**
- `name` (string, required) - Folder name

**Example:**
```json
{
  "name": "Census Records"
}
```

**Returns:** Created source folder with ID.

---

### source_folder_get

Get details and contents of a source folder.

**Parameters:**
- `folderId` (string, required) - Source folder ID

**Example:**
```json
{
  "folderId": "FOLDER-123"
}
```

**Returns:** Folder details with list of contained source descriptions.

---

### source_folder_update

Update a source folder name.

**Parameters:**
- `folderId` (string, required) - Source folder ID
- `name` (string, required) - Updated folder name

**Example:**
```json
{
  "folderId": "FOLDER-123",
  "name": "U.S. Census Records"
}
```

**Returns:** Updated source folder record.

---

### source_folder_delete

Delete a source folder.

**Parameters:**
- `folderId` (string, required) - Source folder ID

**Example:**
```json
{
  "folderId": "FOLDER-123"
}
```

**Returns:** Confirmation of folder deletion.

---

### source_folder_add

Add a source description to a folder.

**Parameters:**
- `folderId` (string, required) - Source folder ID
- `sourceDescriptionId` (string, required) - Source description ID to add

**Example:**
```json
{
  "folderId": "FOLDER-123",
  "sourceDescriptionId": "SD-456"
}
```

**Returns:** Confirmation of addition.

---

### source_folder_remove

Remove a source description from a folder.

**Parameters:**
- `folderId` (string, required) - Source folder ID
- `sourceDescriptionId` (string, required) - Source description ID to remove

**Example:**
```json
{
  "folderId": "FOLDER-123",
  "sourceDescriptionId": "SD-456"
}
```

**Returns:** Confirmation of removal.

---

## Relationship Sources Tools

### relationship_sources_get

Get all sources attached to a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID

**Example:**
```json
{
  "relationshipId": "REL-123"
}
```

**Returns:** Array of source references attached to the relationship.

---

### relationship_source_attach

Attach a source to a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID
- `sourceDescriptionId` (string, required) - Source description ID to attach

**Example:**
```json
{
  "relationshipId": "REL-123",
  "sourceDescriptionId": "SD-456"
}
```

**Returns:** Confirmation of source attachment.

---

### relationship_source_detach

Detach a source from a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID
- `sourceReferenceId` (string, required) - Source reference ID to detach

**Example:**
```json
{
  "relationshipId": "REL-123",
  "sourceReferenceId": "SREF-789"
}
```

**Returns:** Confirmation of source detachment.

---

## Relationship Notes Tools

### relationship_notes_get

Get all notes attached to a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID

**Example:**
```json
{
  "relationshipId": "REL-123"
}
```

**Returns:** Array of notes on the relationship.

---

### relationship_note_create

Create a note on a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID
- `text` (string, required) - Note text content

**Example:**
```json
{
  "relationshipId": "REL-123",
  "text": "Marriage confirmed by county records."
}
```

**Returns:** Created note with ID.

---

### relationship_note_delete

Delete a note from a relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID
- `noteId` (string, required) - Note ID to delete

**Example:**
```json
{
  "relationshipId": "REL-123",
  "noteId": "NOTE-456"
}
```

**Returns:** Confirmation of deletion.

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

## Memory Management Tools

### memory_get

Get details of a specific memory by ID.

**Parameters:**
- `memoryId` (string, required) - Memory ID

**Example:**
```json
{
  "memoryId": "MEM-123"
}
```

**Returns:** Full memory details including metadata, personas, and attached persons.

---

### memory_delete

Delete a memory.

**Parameters:**
- `memoryId` (string, required) - Memory ID

**Example:**
```json
{
  "memoryId": "MEM-123"
}
```

**Returns:** Confirmation of memory deletion.

---

### memory_attach

Attach a memory to a person (create a memory persona reference).

**Parameters:**
- `memoryId` (string, required) - Memory ID
- `personId` (string, required) - Person ID to attach to

**Example:**
```json
{
  "memoryId": "MEM-123",
  "personId": "KWQS-BBQ"
}
```

**Returns:** Confirmation of memory attachment.

---

### memory_detach

Detach a memory from a person.

**Parameters:**
- `memoryId` (string, required) - Memory ID
- `personId` (string, required) - Person ID to detach from

**Example:**
```json
{
  "memoryId": "MEM-123",
  "personId": "KWQS-BBQ"
}
```

**Returns:** Confirmation of memory detachment.

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

### mother_side_plan

Generate a research plan for the maternal side of a family.

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

**Returns:** Structured research plan with tasks for each maternal generation.

---

## Notes Tools

### notes_get

Get all notes attached to a person.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of notes with text and contributor info.

---

### note_create

Create a new note on a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `text` (string, required) - Note text content

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "text": "Birth record found in county archives."
}
```

**Returns:** Created note with assigned ID.

---

### note_update

Update an existing note on a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `noteId` (string, required) - Note ID to update
- `text` (string, required) - Updated note text

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "noteId": "NOTE-123",
  "text": "Birth record confirmed in county archives, dated 15 March 1850."
}
```

**Returns:** Updated note record.

---

### note_delete

Delete a note from a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `noteId` (string, required) - Note ID to delete

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "noteId": "NOTE-123"
}
```

**Returns:** Confirmation of note deletion.

---

## Batch Operations Tools

### persons_batch_get

Get multiple person records in a single batch request.

**Parameters:**
- `personIds` (string[], required) - Array of person IDs to retrieve

**Example:**
```json
{
  "personIds": ["KWQS-BBQ", "L123-456", "M789-012"]
}
```

**Returns:** Array of person records.

---

## Merge Tools

### person_merge

Merge two duplicate person records into one.

**Parameters:**
- `survivorId` (string, required) - Person ID to keep
- `duplicateId` (string, required) - Person ID to merge and remove

**Example:**
```json
{
  "survivorId": "KWQS-BBQ",
  "duplicateId": "L123-456"
}
```

**Returns:** Merged person record.

---

## Restore Tools

### person_restore

Restore a previously deleted person.

**Parameters:**
- `personId` (string, required) - Person ID to restore

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Restored person record.

---

### relationship_restore

Restore a previously deleted relationship.

**Parameters:**
- `relationshipId` (string, required) - Relationship ID to restore

**Example:**
```json
{
  "relationshipId": "REL-123"
}
```

**Returns:** Restored relationship record.

---

### change_restore

Restore a person or relationship to a previous state from change history.

**Parameters:**
- `personId` (string, required) - Person ID
- `changeId` (string, required) - Change ID to restore to

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "changeId": "CHG-456"
}
```

**Returns:** Restored record at specified change point.

---

## Match Management Tools

### matches_get

Get potential duplicate matches for a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `collection` (string, optional) - Filter by collection

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of potential match candidates with confidence scores.

---

### match_resolve

Resolve a match by accepting or rejecting it.

**Parameters:**
- `personId` (string, required) - Person ID
- `matchId` (string, required) - Match ID
- `action` (string, required) - "accept" or "reject"

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "matchId": "MATCH-123",
  "action": "accept"
}
```

**Returns:** Confirmation of match resolution.

---

### not_a_match_create

Declare that two persons are not the same individual.

**Parameters:**
- `personId` (string, required) - First person ID
- `notMatchId` (string, required) - Second person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "notMatchId": "L123-456"
}
```

**Returns:** Confirmation of not-a-match declaration.

---

### not_a_match_delete

Remove a not-a-match declaration between two persons.

**Parameters:**
- `personId` (string, required) - First person ID
- `notMatchId` (string, required) - Second person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "notMatchId": "L123-456"
}
```

**Returns:** Confirmation of removal.

---

## Preferred Relationships Tools

### preferred_parent_get

Get the preferred parent relationship for a person.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Preferred parent relationship details.

---

### preferred_parent_set

Set the preferred parent relationship for a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `parentRelationshipId` (string, required) - Parent-child relationship ID to set as preferred

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "parentRelationshipId": "REL-123"
}
```

**Returns:** Confirmation of preferred parent setting.

---

### preferred_spouse_get

Get the preferred spouse relationship for a person.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Preferred spouse relationship details.

---

### preferred_spouse_set

Set the preferred spouse relationship for a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `coupleRelationshipId` (string, required) - Couple relationship ID to set as preferred

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "coupleRelationshipId": "REL-456"
}
```

**Returns:** Confirmation of preferred spouse setting.

---

## Conclusion Management Tools

### conclusion_delete

Delete a specific conclusion (name, date, place, etc.) from a person.

**Parameters:**
- `personId` (string, required) - Person ID
- `conclusionId` (string, required) - Conclusion ID to delete

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "conclusionId": "CONC-123"
}
```

**Returns:** Confirmation of conclusion deletion.

---

## Place Authority Tools

### place_search

Search the FamilySearch place authority database.

**Parameters:**
- `query` (string, required) - Place name search query
- `parentId` (string, optional) - Filter by parent place ID

**Example:**
```json
{
  "query": "Albany, New York"
}
```

**Returns:** Array of matching place records with IDs and hierarchies.

---

### place_get

Get details about a specific place from the authority database.

**Parameters:**
- `placeId` (string, required) - Place authority ID

**Example:**
```json
{
  "placeId": "PLACE-123"
}
```

**Returns:** Full place details including hierarchy, jurisdiction, and alternate names.

---

### place_children

Get child places (subdivisions) of a place.

**Parameters:**
- `placeId` (string, required) - Parent place ID

**Example:**
```json
{
  "placeId": "PLACE-123"
}
```

**Returns:** Array of child place records.

---

## Discussion Tools

### discussions_get

Get discussions associated with a person.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of discussion threads.

---

### discussion_read

Read a specific discussion thread.

**Parameters:**
- `discussionId` (string, required) - Discussion ID

**Example:**
```json
{
  "discussionId": "DISC-123"
}
```

**Returns:** Discussion details with all comments.

---

### discussion_create

Create a new discussion thread.

**Parameters:**
- `title` (string, required) - Discussion title
- `description` (string, required) - Discussion description
- `personId` (string, optional) - Person ID to associate with

**Example:**
```json
{
  "title": "Birth date discrepancy",
  "description": "Census records show conflicting birth dates.",
  "personId": "KWQS-BBQ"
}
```

**Returns:** Created discussion with ID.

---

### discussion_update

Update an existing discussion.

**Parameters:**
- `discussionId` (string, required) - Discussion ID
- `title` (string, optional) - Updated title
- `description` (string, optional) - Updated description

**Example:**
```json
{
  "discussionId": "DISC-123",
  "title": "Birth date discrepancy - resolved"
}
```

**Returns:** Updated discussion record.

---

### discussion_comment

Add a comment to a discussion.

**Parameters:**
- `discussionId` (string, required) - Discussion ID
- `text` (string, required) - Comment text

**Example:**
```json
{
  "discussionId": "DISC-123",
  "text": "I found a birth certificate that confirms the 1850 date."
}
```

**Returns:** Created comment with ID.

---

### discussion_comment_delete

Delete a comment from a discussion.

**Parameters:**
- `discussionId` (string, required) - Discussion ID
- `commentId` (string, required) - Comment ID to delete

**Example:**
```json
{
  "discussionId": "DISC-123",
  "commentId": "CMT-456"
}
```

**Returns:** Confirmation of comment deletion.

---

## Record Hints & Ordinances Tools

### hints_get

Get server-generated record hints for a person from FamilySearch.

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Array of record hints with source details and confidence.

---

### ordinances_get

Get ordinance information for a person (temple work status).

**Parameters:**
- `personId` (string, required) - Person ID

**Example:**
```json
{
  "personId": "KWQS-BBQ"
}
```

**Returns:** Ordinance status information.

---

## Date & Standardization Tools

### date_standardize

Standardize a date string using FamilySearch date authority.

**Parameters:**
- `date` (string, required) - Date string to standardize (e.g., "abt 1850", "between 1840 and 1860")

**Example:**
```json
{
  "date": "abt 1850"
}
```

**Returns:** Standardized date with formal and normalized representations.

---

## Collections Tools

### collections_list

List available FamilySearch record collections.

**Parameters:**
- `query` (string, optional) - Filter collections by keyword

**Example:**
```json
{
  "query": "census"
}
```

**Returns:** Array of collections with IDs, titles, and record counts.

---

### collection_get

Get details about a specific FamilySearch record collection.

**Parameters:**
- `collectionId` (string, required) - Collection ID

**Example:**
```json
{
  "collectionId": "COLL-123"
}
```

**Returns:** Collection details including description, coverage, and record count.

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

## Visualization Tools

These tools generate chart and diagram output inspired by [mcp-mermaid](https://github.com/hustcc/mcp-mermaid) and [excalidraw-mcp](https://github.com/excalidraw/excalidraw-mcp). Output can be rendered by any compatible viewer or composed with those MCP servers.

### family_tree_chart

Generate a Mermaid flowchart of a family tree showing parents, children, and spouses.

**Parameters:**
- `personId` (string, required) - Root person ID
- `generations` (number, optional) - Number of generations (default: 3)
- `direction` (string, optional) - Chart direction: `TB`, `BT`, `LR`, `RL` (default: TB)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 3,
  "direction": "TB"
}
```

**Returns:** Object with `mermaid` (Mermaid syntax string) and `description`. Render with any Mermaid viewer, GitHub markdown, or mcp-mermaid server.

---

### timeline_chart

Generate a Mermaid timeline diagram of a person's life events.

**Parameters:**
- `personId` (string, required) - Person ID
- `includeRelatives` (boolean, optional) - Include marriages and children (default: false)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "includeRelatives": true
}
```

**Returns:** Object with `mermaid` (Mermaid timeline syntax) and `description`.

---

### pedigree_chart

Generate a Mermaid pedigree/ancestry chart showing ancestors.

**Parameters:**
- `personId` (string, required) - Root person ID
- `generations` (number, optional) - Number of ancestor generations (default: 4)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 4
}
```

**Returns:** Object with `mermaid` (Mermaid bottom-to-top graph) and `description`.

---

### family_tree_drawing

Generate an Excalidraw JSON drawing of a family tree with color-coded boxes and relationship arrows.

**Parameters:**
- `personId` (string, required) - Root person ID
- `generations` (number, optional) - Number of generations (default: 3)

**Example:**
```json
{
  "personId": "KWQS-BBQ",
  "generations": 3
}
```

**Returns:** Object with `excalidraw` (Excalidraw-compatible JSON) and `description`. Import into Excalidraw (excalidraw.com) or render via excalidraw-mcp server.

---

## Tool Categories Summary

| Category | Tool Count | Tools |
|----------|------------|-------|
| Person | 2 | person_get, people_search |
| Family | 4 | families_get, parents_get, children_get, spouses_get |
| Ancestry & Pedigree | 2 | ancestry_get, descendancy_get |
| Person CRUD | 3 | person_create, person_update, person_delete |
| Relationship Management | 4 | relationship_create_couple, relationship_create_parent_child, relationship_delete, relationship_find |
| User & Session | 2 | user_current, user_tree_person |
| Sources | 3 | sources_get, source_attach, source_detach |
| Source Descriptions | 5 | source_description_get, source_description_create, source_description_update, source_description_delete, source_description_changes |
| Source Folders | 7 | source_folders_list, source_folder_create, source_folder_get, source_folder_update, source_folder_delete, source_folder_add, source_folder_remove |
| Relationship Sources & Notes | 6 | relationship_sources_get, relationship_source_attach, relationship_source_detach, relationship_notes_get, relationship_note_create, relationship_note_delete |
| Records | 1 | records_search |
| Memories | 2 | memories_search, memory_upload |
| Memory Management | 4 | memory_get, memory_delete, memory_attach, memory_detach |
| GEDCOM | 2 | gedcom_import, gedcom_export |
| Change History | 2 | change_history_person, change_history_relationship |
| Notes | 4 | notes_get, note_create, note_update, note_delete |
| Batch Operations | 1 | persons_batch_get |
| Merge & Restore | 4 | person_merge, person_restore, relationship_restore, change_restore |
| Match Management | 4 | matches_get, match_resolve, not_a_match_create, not_a_match_delete |
| Preferred Relationships | 4 | preferred_parent_get, preferred_parent_set, preferred_spouse_get, preferred_spouse_set |
| Conclusion Management | 1 | conclusion_delete |
| Place Authority | 3 | place_search, place_get, place_children |
| Discussions | 6 | discussions_get, discussion_read, discussion_create, discussion_update, discussion_comment, discussion_comment_delete |
| AI Research | 5 | hints_generate, merges_suggest, match_explain_llm, hints_rank_llm, timeline_summary_llm |
| Research Planning | 2 | father_side_plan, mother_side_plan |
| Record Hints & Ordinances | 2 | hints_get, ordinances_get |
| Date & Standardization | 1 | date_standardize |
| Collections | 2 | collections_list, collection_get |
| Visualization | 4 | family_tree_chart, timeline_chart, pedigree_chart, family_tree_drawing |
| Utility | 3 | cache_get, cache_clear, healthcheck |
| **Total** | **95** | |

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
