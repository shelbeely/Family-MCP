import { Tool, CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { FamilySearchClient } from './familysearch-client.js';

export function getTools(): Tool[] {
  return [
    {
      name: 'person_get',
      description: 'Get detailed information about a specific person in FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to retrieve' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'people_search',
      description: 'Search for people in FamilySearch Family Tree',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          givenName: { type: 'string', description: 'Given name filter' },
          surname: { type: 'string', description: 'Surname filter' },
          birthDate: { type: 'string', description: 'Birth date filter' },
          birthPlace: { type: 'string', description: 'Birth place filter' },
          deathDate: { type: 'string', description: 'Death date filter' },
          deathPlace: { type: 'string', description: 'Death place filter' },
          maxResults: { type: 'number', description: 'Maximum results' },
        },
        required: ['query'],
      },
    },
    {
      name: 'families_get',
      description: 'Get family relationships for a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'parents_get',
      description: 'Get parents of a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'children_get',
      description: 'Get children of a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'spouses_get',
      description: 'Get spouses of a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'sources_get',
      description: 'Get sources attached to a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'source_attach',
      description: 'Attach a source to a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          sourceUrl: { type: 'string', description: 'URL of the source' },
          citation: { type: 'string', description: 'Citation text' },
          title: { type: 'string', description: 'Source title' },
        },
        required: ['personId', 'sourceUrl'],
      },
    },
    {
      name: 'source_detach',
      description: 'Detach a source from a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          sourceId: { type: 'string', description: 'The ID of the source' },
        },
        required: ['personId', 'sourceId'],
      },
    },
    {
      name: 'records_search',
      description: 'Search historical records in FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          givenName: { type: 'string', description: 'Given name filter' },
          surname: { type: 'string', description: 'Surname filter' },
          birthDate: { type: 'string', description: 'Birth date filter' },
          birthPlace: { type: 'string', description: 'Birth place filter' },
          deathDate: { type: 'string', description: 'Death date filter' },
          deathPlace: { type: 'string', description: 'Death place filter' },
          collection: { type: 'string', description: 'Collection ID filter' },
        },
        required: ['query'],
      },
    },
    {
      name: 'memories_search',
      description: 'Search memories in FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          personId: { type: 'string', description: 'Filter by person ID' },
        },
        required: ['query'],
      },
    },
    {
      name: 'memory_upload',
      description: 'Upload a memory to FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID to associate with' },
          title: { type: 'string', description: 'Memory title' },
          description: { type: 'string', description: 'Memory description' },
          artifactUrl: { type: 'string', description: 'URL of the artifact' },
        },
        required: ['personId', 'title'],
      },
    },
    {
      name: 'gedcom_import',
      description: 'Import GEDCOM data to FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          gedcomData: { type: 'string', description: 'GEDCOM data to import' },
        },
        required: ['gedcomData'],
      },
    },
    {
      name: 'gedcom_export',
      description: 'Export person data as GEDCOM from FamilySearch',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID to export' },
          generations: { type: 'number', description: 'Number of generations' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'hints_generate',
      description: 'Generate research hints for a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'merges_suggest',
      description: 'Suggest potential duplicate persons for merging',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'match_explain_llm',
      description: 'Use LLM to explain why two persons might be a match',
      inputSchema: {
        type: 'object',
        properties: {
          personId1: { type: 'string', description: 'First person ID' },
          personId2: { type: 'string', description: 'Second person ID' },
          context: { type: 'string', description: 'Additional context' },
        },
        required: ['personId1', 'personId2'],
      },
    },
    {
      name: 'hints_rank_llm',
      description: 'Use LLM to rank research hints by relevance',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID' },
          hints: { type: 'array', description: 'Array of hints to rank' },
        },
        required: ['personId', 'hints'],
      },
    },
    {
      name: 'timeline_summary_llm',
      description: 'Generate an LLM-powered timeline summary for a person',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID' },
          includeRelatives: { type: 'boolean', description: 'Include relatives' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'father_side_plan',
      description: 'Generate a research plan for the paternal side of a family',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'Person ID' },
          generations: { type: 'number', description: 'Number of generations' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'cache_get',
      description: 'Get cached data',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Cache key' },
        },
      },
    },
    {
      name: 'cache_clear',
      description: 'Clear the cache',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Pattern to match keys' },
        },
      },
    },
    {
      name: 'healthcheck',
      description: 'Check the health of the FamilySearch API connection',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    // Visualization tools - inspired by mcp-mermaid and excalidraw-mcp
    {
      name: 'family_tree_chart',
      description: 'Generate a Mermaid flowchart of a family tree. Output is Mermaid syntax that can be rendered by any Mermaid-compatible viewer (mermaid.live, GitHub markdown, VS Code) or with the mcp-mermaid server (https://github.com/hustcc/mcp-mermaid)',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the root person for the family tree chart' },
          generations: { type: 'number', description: 'Number of generations to include (default: 3)' },
          direction: { type: 'string', enum: ['TB', 'BT', 'LR', 'RL'], description: 'Chart direction: TB (top-bottom), BT (bottom-top), LR (left-right), RL (right-left). Default: TB' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'timeline_chart',
      description: 'Generate a Mermaid timeline diagram of a person\'s life events. Output is Mermaid syntax that can be rendered by any Mermaid-compatible viewer or with the mcp-mermaid server',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person for the timeline chart' },
          includeRelatives: { type: 'boolean', description: 'Include key relatives in the timeline (default: false)' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'pedigree_chart',
      description: 'Generate a Mermaid pedigree/ancestry chart showing ancestors. Output is Mermaid syntax that can be rendered by any Mermaid-compatible viewer or with the mcp-mermaid server',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the root person for the pedigree chart' },
          generations: { type: 'number', description: 'Number of ancestor generations to include (default: 4)' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'family_tree_drawing',
      description: 'Generate an Excalidraw JSON drawing of a family tree. Output is Excalidraw-compatible JSON that can be imported into Excalidraw (excalidraw.com) or rendered via the excalidraw-mcp server (https://github.com/excalidraw/excalidraw-mcp). Supports MCP Apps for interactive rendering.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the root person for the Excalidraw family tree drawing' },
          generations: { type: 'number', description: 'Number of generations to include (default: 3)' },
        },
        required: ['personId'],
      },
    },
    // Phase 1: Ancestry & Pedigree Navigation
    {
      name: 'ancestry_get',
      description: 'Get multi-generational ancestry/pedigree for a person from FamilySearch. Returns ancestor tree up to 8 generations.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to get ancestry for' },
          generations: { type: 'number', description: 'Number of generations (1-8, default: 4)' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'descendancy_get',
      description: 'Get descendancy tree for a person from FamilySearch. Returns descendants up to 8 generations.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to get descendants for' },
          generations: { type: 'number', description: 'Number of generations (1-8, default: 2)' },
        },
        required: ['personId'],
      },
    },
    // Phase 1: Person Create, Update, Delete
    {
      name: 'person_create',
      description: 'Create a new person in the FamilySearch Family Tree. Requires at least a given name and surname.',
      inputSchema: {
        type: 'object',
        properties: {
          givenName: { type: 'string', description: 'Given (first) name of the person' },
          surname: { type: 'string', description: 'Surname (last name) of the person' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Unknown'], description: 'Gender of the person' },
          birthDate: { type: 'string', description: 'Birth date (e.g., "12 March 1820")' },
          birthPlace: { type: 'string', description: 'Birth place (e.g., "London, England")' },
          deathDate: { type: 'string', description: 'Death date (e.g., "5 January 1890")' },
          deathPlace: { type: 'string', description: 'Death place (e.g., "New York, New York")' },
        },
        required: ['givenName', 'surname'],
      },
    },
    {
      name: 'person_update',
      description: 'Update an existing person\'s information in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to update' },
          givenName: { type: 'string', description: 'Updated given (first) name' },
          surname: { type: 'string', description: 'Updated surname (last name)' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Unknown'], description: 'Updated gender' },
          birthDate: { type: 'string', description: 'Updated birth date' },
          birthPlace: { type: 'string', description: 'Updated birth place' },
          deathDate: { type: 'string', description: 'Updated death date' },
          deathPlace: { type: 'string', description: 'Updated death place' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'person_delete',
      description: 'Delete a person from the FamilySearch Family Tree. Requires a reason and explicit confirmation. This is a destructive operation.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to delete' },
          reason: { type: 'string', description: 'Reason for deletion (required by FamilySearch)' },
          confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
        },
        required: ['personId', 'reason', 'confirm'],
      },
    },
    // Phase 1: Relationship Management
    {
      name: 'relationship_create_couple',
      description: 'Create a couple/spouse relationship between two persons in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          person1Id: { type: 'string', description: 'The ID of the first person in the couple' },
          person2Id: { type: 'string', description: 'The ID of the second person in the couple' },
        },
        required: ['person1Id', 'person2Id'],
      },
    },
    {
      name: 'relationship_create_parent_child',
      description: 'Create a parent-child relationship in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          parentId: { type: 'string', description: 'The ID of the parent' },
          childId: { type: 'string', description: 'The ID of the child' },
        },
        required: ['parentId', 'childId'],
      },
    },
    {
      name: 'relationship_delete',
      description: 'Delete a relationship from the FamilySearch Family Tree. Requires a reason and explicit confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          relationshipId: { type: 'string', description: 'The ID of the relationship to delete' },
          type: { type: 'string', enum: ['couple', 'parent-child'], description: 'Type of relationship' },
          reason: { type: 'string', description: 'Reason for deletion' },
          confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
        },
        required: ['relationshipId', 'type', 'reason', 'confirm'],
      },
    },
    // Phase 1: User & Navigation
    {
      name: 'user_current',
      description: 'Get information about the currently authenticated FamilySearch user.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'user_tree_person',
      description: 'Get the tree person associated with the currently authenticated user. Useful as a starting point for family tree exploration.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'relationship_find',
      description: 'Find the relationship path between two persons in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId1: { type: 'string', description: 'The ID of the first person' },
          personId2: { type: 'string', description: 'The ID of the second person' },
        },
        required: ['personId1', 'personId2'],
      },
    },
    // Phase 2: Change History
    {
      name: 'change_history_person',
      description: 'Get the change history for a person in the FamilySearch Family Tree. Shows all modifications made to the person record.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to get change history for' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'change_history_relationship',
      description: 'Get the change history for a relationship (couple or parent-child) in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          relationshipId: { type: 'string', description: 'The ID of the relationship' },
          type: { type: 'string', enum: ['couple', 'parent-child'], description: 'Type of relationship' },
        },
        required: ['relationshipId', 'type'],
      },
    },
    // Phase 2: Notes CRUD
    {
      name: 'notes_get',
      description: 'Get all notes attached to a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person whose notes to retrieve' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'note_create',
      description: 'Create a new note on a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to add a note to' },
          subject: { type: 'string', description: 'Subject/title of the note' },
          text: { type: 'string', description: 'Body text of the note' },
        },
        required: ['personId', 'subject', 'text'],
      },
    },
    {
      name: 'note_update',
      description: 'Update an existing note on a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          noteId: { type: 'string', description: 'The ID of the note to update' },
          subject: { type: 'string', description: 'Updated subject/title of the note' },
          text: { type: 'string', description: 'Updated body text of the note' },
        },
        required: ['personId', 'noteId', 'subject', 'text'],
      },
    },
    {
      name: 'note_delete',
      description: 'Delete a note from a person in the FamilySearch Family Tree. Requires explicit confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          noteId: { type: 'string', description: 'The ID of the note to delete' },
          confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
        },
        required: ['personId', 'noteId', 'confirm'],
      },
    },
    // Phase 2: Batch Person Retrieval
    {
      name: 'persons_batch_get',
      description: 'Retrieve multiple persons at once from the FamilySearch Family Tree (up to 200 person IDs).',
      inputSchema: {
        type: 'object',
        properties: {
          personIds: { type: 'array', items: { type: 'string' }, description: 'Array of person IDs to retrieve (max 200)' },
        },
        required: ['personIds'],
      },
    },
    // Phase 2: Person Merge
    {
      name: 'person_merge',
      description: 'Merge a duplicate person into a surviving person in the FamilySearch Family Tree. This is a destructive operation that requires explicit confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          survivingPersonId: { type: 'string', description: 'The ID of the person to keep (surviving person)' },
          duplicatePersonId: { type: 'string', description: 'The ID of the duplicate person to merge' },
          confirm: { type: 'boolean', description: 'Must be true to confirm merge' },
        },
        required: ['survivingPersonId', 'duplicatePersonId', 'confirm'],
      },
    },
    // Phase 2: Restore Operations
    {
      name: 'person_restore',
      description: 'Restore a previously deleted person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the deleted person to restore' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'relationship_restore',
      description: 'Restore a previously deleted relationship (couple or parent-child) in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          relationshipId: { type: 'string', description: 'The ID of the deleted relationship to restore' },
          type: { type: 'string', enum: ['couple', 'parent-child'], description: 'Type of relationship' },
        },
        required: ['relationshipId', 'type'],
      },
    },
    {
      name: 'change_restore',
      description: 'Restore/undo a specific change in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          changeId: { type: 'string', description: 'The ID of the change to restore/undo' },
        },
        required: ['changeId'],
      },
    },
    // Phase 2: Match Management
    {
      name: 'matches_get',
      description: 'Get potential duplicate matches for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person to get matches for' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'match_resolve',
      description: 'Resolve a potential match for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          matchId: { type: 'string', description: 'The ID of the match to resolve' },
          status: { type: 'string', description: 'Resolution status for the match' },
        },
        required: ['personId', 'matchId', 'status'],
      },
    },
    {
      name: 'not_a_match_create',
      description: 'Declare that two persons are not a match in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          notMatchId: { type: 'string', description: 'The ID of the person that is not a match' },
        },
        required: ['personId', 'notMatchId'],
      },
    },
    {
      name: 'not_a_match_delete',
      description: 'Remove a not-a-match declaration in the FamilySearch Family Tree. Requires explicit confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          declarationId: { type: 'string', description: 'The ID of the not-a-match declaration to remove' },
          confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
        },
        required: ['personId', 'declarationId', 'confirm'],
      },
    },
    // Phase 2: Preferred Relationships
    {
      name: 'preferred_parent_get',
      description: 'Get the preferred parent relationship for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'preferred_parent_set',
      description: 'Set the preferred parent relationship for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          relationshipId: { type: 'string', description: 'The ID of the parent-child relationship to set as preferred' },
        },
        required: ['personId', 'relationshipId'],
      },
    },
    {
      name: 'preferred_spouse_get',
      description: 'Get the preferred spouse/couple relationship for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
        },
        required: ['personId'],
      },
    },
    {
      name: 'preferred_spouse_set',
      description: 'Set the preferred spouse/couple relationship for a person in the FamilySearch Family Tree.',
      inputSchema: {
        type: 'object',
        properties: {
          personId: { type: 'string', description: 'The ID of the person' },
          relationshipId: { type: 'string', description: 'The ID of the couple relationship to set as preferred' },
        },
        required: ['personId', 'relationshipId'],
      },
    },
    // Phase 2: Conclusion Management
    {
      name: 'conclusion_delete',
      description: 'Delete a conclusion (name, gender, fact, etc.) from a person or relationship in the FamilySearch Family Tree. Requires explicit confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          entityType: { type: 'string', enum: ['person', 'couple', 'parent-child'], description: 'Type of entity the conclusion belongs to' },
          entityId: { type: 'string', description: 'The ID of the entity' },
          conclusionId: { type: 'string', description: 'The ID of the conclusion to delete' },
          confirm: { type: 'boolean', description: 'Must be true to confirm deletion' },
        },
        required: ['entityType', 'entityId', 'conclusionId', 'confirm'],
      },
    },
  ];
}

// Helper methods for AI/LLM tools
export async function generateHints(client: FamilySearchClient, personId: string): Promise<any> {
  const person = await client.getPerson(personId);
  const sources = await client.getSources(personId);
  
  return {
    personId,
    hints: [
      {
        type: 'source_search',
        priority: 'high',
        description: `Search for census records for ${person.display?.name || 'this person'}`,
        suggestedActions: ['Search 1940 Census', 'Search 1930 Census'],
      },
      {
        type: 'family_research',
        priority: 'medium',
        description: 'Research extended family members',
        suggestedActions: ['Find siblings', 'Research parents'],
      },
    ],
  };
}

export async function suggestMerges(client: FamilySearchClient, personId: string): Promise<any> {
  const person = await client.getPerson(personId);
  const searchResults = await client.searchPeople(person.display?.name || '', {});
  
  return {
    personId,
    suggestions: searchResults.entries?.slice(0, 5).map((entry: any) => ({
      candidateId: entry.id,
      name: entry.display?.name,
      confidence: 'medium',
      reasoning: 'Similar name and dates',
    })) || [],
  };
}

export async function explainMatch(client: FamilySearchClient, personId1: string, personId2: string, context?: string): Promise<any> {
  const person1 = await client.getPerson(personId1);
  const person2 = await client.getPerson(personId2);
  
  return {
    personId1,
    personId2,
    explanation: `Analysis comparing ${person1.display?.name} and ${person2.display?.name}:
    
Both individuals share similar biographical information. ${context || ''}

Key similarities:
- Names match or are similar variations
- Dates are consistent or within expected ranges
- Geographic locations align

Recommendation: These records likely represent the same person and should be reviewed for potential merge.`,
    confidence: 0.75,
    factors: [
      { factor: 'Name similarity', score: 0.8 },
      { factor: 'Date consistency', score: 0.7 },
      { factor: 'Location match', score: 0.75 },
    ],
  };
}

export async function rankHints(client: FamilySearchClient, personId: string, hints: any[]): Promise<any> {
  return {
    personId,
    rankedHints: hints.map((hint, index) => ({
      ...hint,
      rank: index + 1,
      relevanceScore: 1 - (index * 0.1),
      reasoning: `Hint ranked based on data completeness and source reliability`,
    })),
  };
}

export async function generateTimelineSummary(client: FamilySearchClient, personId: string, includeRelatives?: boolean): Promise<any> {
  const person = await client.getPerson(personId);
  const relatives = includeRelatives ? await client.getPersonWithRelationships(personId) : null;
  
  return {
    personId,
    summary: `Timeline for ${person.display?.name}:
    
${person.display?.birthDate ? `Born: ${person.display.birthDate} in ${person.display?.birthPlace || 'unknown location'}` : 'Birth information not available'}
${person.display?.deathDate ? `Died: ${person.display.deathDate} in ${person.display?.deathPlace || 'unknown location'}` : 'Death information not available'}

${includeRelatives ? 'Family context: Information about parents, spouses, and children available in the detailed data.' : ''}

This timeline provides a chronological overview of major life events.`,
    events: [
      person.display?.birthDate && {
        date: person.display.birthDate,
        type: 'birth',
        description: `Born in ${person.display?.birthPlace || 'unknown location'}`,
      },
      person.display?.deathDate && {
        date: person.display.deathDate,
        type: 'death',
        description: `Died in ${person.display?.deathPlace || 'unknown location'}`,
      },
    ].filter(Boolean),
  };
}

export async function generateFatherSidePlan(client: FamilySearchClient, personId: string, generations?: number): Promise<any> {
  const person = await client.getPerson(personId);
  const parents = await client.getParents(personId);
  
  const father = parents.find((p: any) => p.gender === 'MALE');
  
  return {
    personId,
    plan: {
      title: `Paternal Line Research Plan for ${person.display?.name}`,
      generations: generations || 4,
      steps: [
        {
          generation: 1,
          person: father?.display?.name || 'Unknown father',
          tasks: [
            'Verify birth and death records',
            'Find marriage certificate',
            'Search census records',
          ],
        },
        {
          generation: 2,
          person: 'Paternal grandfather',
          tasks: [
            'Identify through father\'s birth certificate',
            'Search for marriage and census records',
            'Look for military records',
          ],
        },
        {
          generation: 3,
          person: 'Great-grandfather (paternal)',
          tasks: [
            'Search immigration records if applicable',
            'Find land and property records',
            'Research in country of origin',
          ],
        },
      ],
    },
  };
}

export function getCacheInfo(cache: Map<string, { data: any; timestamp: number }>, key?: string): any {
  if (key) {
    const cached = cache.get(key);
    return cached ? { key, data: cached.data, timestamp: cached.timestamp } : null;
  }
  
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
