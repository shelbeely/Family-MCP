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
