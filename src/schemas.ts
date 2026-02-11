import { z } from 'zod';

// Person-related schemas
export const PersonGetSchema = z.object({
  personId: z.string().describe('The ID of the person to retrieve'),
});

export const PeopleSearchSchema = z.object({
  query: z.string().describe('Search query for finding people'),
  givenName: z.string().optional().describe('Given name filter'),
  surname: z.string().optional().describe('Surname filter'),
  birthDate: z.string().optional().describe('Birth date filter (YYYY-MM-DD)'),
  birthPlace: z.string().optional().describe('Birth place filter'),
  deathDate: z.string().optional().describe('Death date filter (YYYY-MM-DD)'),
  deathPlace: z.string().optional().describe('Death place filter'),
  maxResults: z.number().optional().describe('Maximum number of results'),
});

// Family-related schemas
export const FamiliesGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose families to retrieve'),
});

export const ParentsGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose parents to retrieve'),
});

export const ChildrenGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose children to retrieve'),
});

export const SpousesGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose spouses to retrieve'),
});

// Sources schemas
export const SourcesGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose sources to retrieve'),
});

export const SourceAttachSchema = z.object({
  personId: z.string().describe('The ID of the person to attach source to'),
  sourceUrl: z.string().describe('URL of the source'),
  citation: z.string().optional().describe('Citation text'),
  title: z.string().optional().describe('Title of the source'),
});

export const SourceDetachSchema = z.object({
  personId: z.string().describe('The ID of the person to detach source from'),
  sourceId: z.string().describe('The ID of the source to detach'),
});

// Records schema
export const RecordsSearchSchema = z.object({
  query: z.string().describe('Search query for records'),
  givenName: z.string().optional().describe('Given name filter'),
  surname: z.string().optional().describe('Surname filter'),
  birthDate: z.string().optional().describe('Birth date filter'),
  birthPlace: z.string().optional().describe('Birth place filter'),
  deathDate: z.string().optional().describe('Death date filter'),
  deathPlace: z.string().optional().describe('Death place filter'),
  collection: z.string().optional().describe('Collection ID filter'),
});

// Memories schemas
export const MemoriesSearchSchema = z.object({
  query: z.string().describe('Search query for memories'),
  personId: z.string().optional().describe('Filter by person ID'),
});

export const MemoryUploadSchema = z.object({
  personId: z.string().describe('The ID of the person to associate memory with'),
  title: z.string().describe('Title of the memory'),
  description: z.string().optional().describe('Description of the memory'),
  artifactUrl: z.string().optional().describe('URL of the artifact'),
});

// GEDCOM schemas
export const GedcomImportSchema = z.object({
  gedcomData: z.string().describe('GEDCOM data to import'),
});

export const GedcomExportSchema = z.object({
  personId: z.string().describe('The ID of the person to export'),
  generations: z.number().optional().describe('Number of generations to export'),
});

// AI/LLM tool schemas
export const HintsGenerateSchema = z.object({
  personId: z.string().describe('The ID of the person to generate hints for'),
});

export const MergesSuggestSchema = z.object({
  personId: z.string().describe('The ID of the person to find merge candidates for'),
});

export const MatchExplainLlmSchema = z.object({
  personId1: z.string().describe('The ID of the first person'),
  personId2: z.string().describe('The ID of the second person'),
  context: z.string().optional().describe('Additional context for the match explanation'),
});

export const HintsRankLlmSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  hints: z.array(z.any()).describe('Array of hints to rank'),
});

export const TimelineSummaryLlmSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  includeRelatives: z.boolean().optional().describe('Include relatives in timeline'),
});

export const FatherSidePlanSchema = z.object({
  personId: z.string().describe('The ID of the person to generate father side plan for'),
  generations: z.number().optional().describe('Number of generations to analyze'),
});

// Cache schemas
export const CacheGetSchema = z.object({
  key: z.string().optional().describe('Specific cache key to retrieve'),
});

export const CacheClearSchema = z.object({
  pattern: z.string().optional().describe('Pattern to match keys to clear (optional)'),
});

// Visualization schemas
export const FamilyTreeChartSchema = z.object({
  personId: z.string().describe('The ID of the root person for the family tree chart'),
  generations: z.number().optional().describe('Number of generations to include (default: 3)'),
  direction: z.enum(['TB', 'BT', 'LR', 'RL']).optional().describe('Chart direction: TB (top-bottom), BT (bottom-top), LR (left-right), RL (right-left). Default: TB'),
});

export const TimelineChartSchema = z.object({
  personId: z.string().describe('The ID of the person for the timeline chart'),
  includeRelatives: z.boolean().optional().describe('Include key relatives in the timeline (default: false)'),
});

export const PedigreeChartSchema = z.object({
  personId: z.string().describe('The ID of the root person for the pedigree chart'),
  generations: z.number().optional().describe('Number of ancestor generations to include (default: 4)'),
});

export const FamilyTreeDrawingSchema = z.object({
  personId: z.string().describe('The ID of the root person for the Excalidraw family tree drawing'),
  generations: z.number().optional().describe('Number of generations to include (default: 3)'),
});

// Healthcheck schema
export const HealthcheckSchema = z.object({});

// Phase 1: Ancestry & Pedigree
export const AncestryGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get ancestry for'),
  generations: z.number().min(1).max(8).optional().describe('Number of generations (1-8, default: 4)'),
});

export const DescendancyGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get descendants for'),
  generations: z.number().min(1).max(8).optional().describe('Number of generations (1-8, default: 2)'),
});

// Phase 1: Person CRUD
export const PersonCreateSchema = z.object({
  givenName: z.string().describe('Given (first) name of the person'),
  surname: z.string().describe('Surname (last name) of the person'),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional().describe('Gender of the person'),
  birthDate: z.string().optional().describe('Birth date (e.g., "12 March 1820")'),
  birthPlace: z.string().optional().describe('Birth place (e.g., "London, England")'),
  deathDate: z.string().optional().describe('Death date (e.g., "5 January 1890")'),
  deathPlace: z.string().optional().describe('Death place (e.g., "New York, New York")'),
});

export const PersonUpdateSchema = z.object({
  personId: z.string().describe('The ID of the person to update'),
  givenName: z.string().optional().describe('Updated given (first) name'),
  surname: z.string().optional().describe('Updated surname (last name)'),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional().describe('Updated gender'),
  birthDate: z.string().optional().describe('Updated birth date'),
  birthPlace: z.string().optional().describe('Updated birth place'),
  deathDate: z.string().optional().describe('Updated death date'),
  deathPlace: z.string().optional().describe('Updated death place'),
});

export const PersonDeleteSchema = z.object({
  personId: z.string().describe('The ID of the person to delete'),
  reason: z.string().describe('Reason for deletion (required by FamilySearch)'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 1: Relationship management
export const RelationshipCreateCoupleSchema = z.object({
  person1Id: z.string().describe('The ID of the first person in the couple'),
  person2Id: z.string().describe('The ID of the second person in the couple'),
});

export const RelationshipCreateParentChildSchema = z.object({
  parentId: z.string().describe('The ID of the parent'),
  childId: z.string().describe('The ID of the child'),
});

export const RelationshipDeleteSchema = z.object({
  relationshipId: z.string().describe('The ID of the relationship to delete'),
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  reason: z.string().describe('Reason for deletion'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 1: User & navigation
export const UserCurrentSchema = z.object({});

export const UserTreePersonSchema = z.object({});

export const RelationshipFindSchema = z.object({
  personId1: z.string().describe('The ID of the first person'),
  personId2: z.string().describe('The ID of the second person'),
});

// Phase 2: Change History
export const ChangeHistoryPersonSchema = z.object({
  personId: z.string().describe('The ID of the person to get change history for'),
});

export const ChangeHistoryRelationshipSchema = z.object({
  relationshipId: z.string().describe('The ID of the relationship to get change history for'),
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
});

// Phase 2: Notes CRUD
export const NotesGetSchema = z.object({
  personId: z.string().describe('The ID of the person whose notes to retrieve'),
});

export const NoteCreateSchema = z.object({
  personId: z.string().describe('The ID of the person to add a note to'),
  subject: z.string().describe('Subject/title of the note'),
  text: z.string().describe('Body text of the note'),
});

export const NoteUpdateSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  noteId: z.string().describe('The ID of the note to update'),
  subject: z.string().describe('Updated subject/title of the note'),
  text: z.string().describe('Updated body text of the note'),
});

export const NoteDeleteSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  noteId: z.string().describe('The ID of the note to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 2: Batch Person Retrieval
export const PersonsBatchGetSchema = z.object({
  personIds: z.array(z.string()).min(1).max(200).describe('Array of person IDs to retrieve (max 200)'),
});

// Phase 2: Person Merge
export const PersonMergeSchema = z.object({
  survivingPersonId: z.string().describe('The ID of the person to keep (surviving person)'),
  duplicatePersonId: z.string().describe('The ID of the duplicate person to merge into the surviving person'),
  confirm: z.boolean().describe('Must be true to confirm merge. This is a destructive operation.'),
});

// Phase 2: Restore Operations
export const PersonRestoreSchema = z.object({
  personId: z.string().describe('The ID of the deleted person to restore'),
});

export const RelationshipRestoreSchema = z.object({
  relationshipId: z.string().describe('The ID of the deleted relationship to restore'),
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
});

export const ChangeRestoreSchema = z.object({
  changeId: z.string().describe('The ID of the change to restore/undo'),
});

// Phase 2: Match Management
export const MatchesGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get matches for'),
});

export const MatchResolveSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  matchId: z.string().describe('The ID of the match to resolve'),
  status: z.string().describe('Resolution status for the match'),
});

export const NotAMatchCreateSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  notMatchId: z.string().describe('The ID of the person that is not a match'),
});

export const NotAMatchDeleteSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  declarationId: z.string().describe('The ID of the not-a-match declaration to remove'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 2: Preferred Relationships
export const PreferredParentGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get preferred parent relationship for'),
});

export const PreferredParentSetSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  relationshipId: z.string().describe('The ID of the parent-child relationship to set as preferred'),
});

export const PreferredSpouseGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get preferred spouse relationship for'),
});

export const PreferredSpouseSetSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  relationshipId: z.string().describe('The ID of the couple relationship to set as preferred'),
});

// Phase 2: Conclusion Management
export const ConclusionDeleteSchema = z.object({
  entityType: z.enum(['person', 'couple', 'parent-child']).describe('Type of entity the conclusion belongs to'),
  entityId: z.string().describe('The ID of the entity (person, couple relationship, or parent-child relationship)'),
  conclusionId: z.string().describe('The ID of the conclusion to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 3: Place Authority
export const PlaceSearchSchema = z.object({
  query: z.string().describe('Search query for places'),
  count: z.number().optional().describe('Maximum number of results to return'),
});

export const PlaceGetSchema = z.object({
  placeId: z.string().describe('The ID of the place to retrieve'),
});

export const PlaceChildrenSchema = z.object({
  placeId: z.string().describe('The ID of the place to get children for'),
});

// Phase 3: Discussions
export const DiscussionsGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get discussion references for'),
});

export const DiscussionReadSchema = z.object({
  discussionId: z.string().describe('The ID of the discussion to read'),
});

export const DiscussionCreateSchema = z.object({
  title: z.string().describe('Title of the discussion'),
  details: z.string().describe('Details/body of the discussion'),
});

export const DiscussionUpdateSchema = z.object({
  discussionId: z.string().describe('The ID of the discussion to update'),
  title: z.string().describe('Updated title of the discussion'),
  details: z.string().describe('Updated details/body of the discussion'),
});

export const DiscussionCommentSchema = z.object({
  discussionId: z.string().describe('The ID of the discussion to comment on'),
  text: z.string().describe('Comment text'),
});

export const DiscussionCommentDeleteSchema = z.object({
  discussionId: z.string().describe('The ID of the discussion'),
  commentId: z.string().describe('The ID of the comment to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 3: Source Description Management
export const SourceDescriptionGetSchema = z.object({
  sourceId: z.string().describe('The ID of the source description to retrieve'),
});

export const SourceDescriptionCreateSchema = z.object({
  title: z.string().describe('Title of the source'),
  citation: z.string().describe('Citation text for the source'),
  about: z.string().optional().describe('URL the source is about'),
  notes: z.string().optional().describe('Notes about the source'),
});

export const SourceDescriptionUpdateSchema = z.object({
  sourceId: z.string().describe('The ID of the source description to update'),
  title: z.string().optional().describe('Updated title'),
  citation: z.string().optional().describe('Updated citation text'),
  about: z.string().optional().describe('Updated URL'),
  notes: z.string().optional().describe('Updated notes'),
});

export const SourceDescriptionDeleteSchema = z.object({
  sourceId: z.string().describe('The ID of the source description to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

export const SourceDescriptionChangesSchema = z.object({
  sourceId: z.string().describe('The ID of the source description to get changes for'),
});

// Phase 3: Relationship-Level Sources
export const RelationshipSourcesGetSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
});

export const RelationshipSourceAttachSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
  sourceRef: z.any().describe('Source reference object to attach'),
});

export const RelationshipSourceDetachSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
  sourceRefId: z.string().describe('The ID of the source reference to detach'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 3: Relationship-Level Notes
export const RelationshipNotesGetSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
});

export const RelationshipNoteCreateSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
  subject: z.string().describe('Subject/title of the note'),
  text: z.string().describe('Body text of the note'),
});

export const RelationshipNoteDeleteSchema = z.object({
  type: z.enum(['couple', 'parent-child']).describe('Type of relationship'),
  id: z.string().describe('The ID of the relationship'),
  noteId: z.string().describe('The ID of the note to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

// Phase 3: Source Box / Folders
export const SourceFoldersListSchema = z.object({});

export const SourceFolderCreateSchema = z.object({
  name: z.string().describe('Name of the source folder'),
});

export const SourceFolderGetSchema = z.object({
  folderId: z.string().describe('The ID of the source folder'),
});

export const SourceFolderUpdateSchema = z.object({
  folderId: z.string().describe('The ID of the source folder to update'),
  name: z.string().describe('Updated name of the source folder'),
});

export const SourceFolderDeleteSchema = z.object({
  folderId: z.string().describe('The ID of the source folder to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

export const SourceFolderAddSchema = z.object({
  folderId: z.string().describe('The ID of the source folder'),
  sourceIds: z.array(z.string()).describe('Array of source description IDs to add to the folder'),
});

export const SourceFolderRemoveSchema = z.object({
  folderId: z.string().describe('The ID of the source folder'),
  sourceIds: z.array(z.string()).describe('Array of source description IDs to remove from the folder'),
  confirm: z.boolean().describe('Must be true to confirm removal'),
});

// Phase 3: Memory CRUD
export const MemoryGetSchema = z.object({
  memoryId: z.string().describe('The ID of the memory to retrieve'),
});

export const MemoryDeleteSchema = z.object({
  memoryId: z.string().describe('The ID of the memory to delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion'),
});

export const MemoryAttachSchema = z.object({
  personId: z.string().describe('The ID of the person to attach the memory to'),
  memoryId: z.string().describe('The ID of the memory to attach'),
});

export const MemoryDetachSchema = z.object({
  personId: z.string().describe('The ID of the person'),
  referenceId: z.string().describe('The ID of the memory reference to detach'),
  confirm: z.boolean().describe('Must be true to confirm detachment'),
});

// Phase 6: Record Hints
export const HintsGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get record hints for'),
  collection: z.string().optional().describe('Optional collection ID to filter hints'),
});

// Phase 6: Ordinance Information
export const OrdinancesGetSchema = z.object({
  personId: z.string().describe('The ID of the person to get ordinance information for'),
});

// Phase 6: Date Standardization
export const DateStandardizeSchema = z.object({
  dateString: z.string().describe('The date string to standardize (e.g. "abt 1850")'),
});

// Phase 6: Maternal Side Research Plan
export const MotherSidePlanSchema = z.object({
  personId: z.string().describe('The ID of the person to generate mother side plan for'),
  generations: z.number().optional().describe('Number of generations to analyze'),
});

// Phase 6: Collections Browsing
export const CollectionsListSchema = z.object({
  count: z.number().optional().describe('Maximum number of collections to return'),
});

export const CollectionGetSchema = z.object({
  collectionId: z.string().describe('The ID of the collection to retrieve'),
});
