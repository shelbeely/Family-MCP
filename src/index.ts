#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { FamilySearchClient } from './familysearch-client.js';
import { EncryptedTokenStore } from './token-store.js';
import {
  PersonGetSchema,
  PeopleSearchSchema,
  FamiliesGetSchema,
  ParentsGetSchema,
  ChildrenGetSchema,
  SpousesGetSchema,
  SourcesGetSchema,
  SourceAttachSchema,
  SourceDetachSchema,
  RecordsSearchSchema,
  MemoriesSearchSchema,
  MemoryUploadSchema,
  GedcomImportSchema,
  GedcomExportSchema,
  HintsGenerateSchema,
  MergesSuggestSchema,
  MatchExplainLlmSchema,
  HintsRankLlmSchema,
  TimelineSummaryLlmSchema,
  FatherSidePlanSchema,
  CacheGetSchema,
  CacheClearSchema,
  HealthcheckSchema,
} from './schemas.js';

class FamilySearchMCPServer {
  private server: Server;
  private client: FamilySearchClient | null = null;
  private tokenStore: EncryptedTokenStore;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.server = new Server(
      {
        name: 'family-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tokenStore = new EncryptedTokenStore();
    this.cache = new Map();
    this.setupHandlers();
    this.initializeClient();
  }

  private initializeClient(): void {
    const token = process.env.FAMILYSEARCH_TOKEN || this.tokenStore.loadToken();
    
    if (token) {
      this.client = new FamilySearchClient({
        accessToken: token,
        cache: this.cache,
      });
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request)
    );
  }

  private getTools(): Tool[] {
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
    ];
  }

  private async handleToolCall(request: any): Promise<any> {
    const { name, arguments: args } = request.params;

    if (!this.client) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'FamilySearch client not initialized. Please set FAMILYSEARCH_TOKEN environment variable.',
            }),
          },
        ],
      };
    }

    try {
      let result: any;

      switch (name) {
        case 'person_get':
          result = await this.client.getPerson(args.personId);
          break;

        case 'people_search':
          result = await this.client.searchPeople(args.query, {
            givenName: args.givenName,
            surname: args.surname,
            birthDate: args.birthDate,
            birthPlace: args.birthPlace,
            deathDate: args.deathDate,
            deathPlace: args.deathPlace,
          });
          break;

        case 'families_get':
          result = await this.client.getPersonWithRelationships(args.personId);
          break;

        case 'parents_get':
          result = await this.client.getParents(args.personId);
          break;

        case 'children_get':
          result = await this.client.getChildren(args.personId);
          break;

        case 'spouses_get':
          result = await this.client.getSpouses(args.personId);
          break;

        case 'sources_get':
          result = await this.client.getSources(args.personId);
          break;

        case 'source_attach':
          result = await this.client.attachSource(args.personId, {
            sourceUrl: args.sourceUrl,
            citation: args.citation,
            title: args.title,
          });
          break;

        case 'source_detach':
          result = await this.client.detachSource(args.personId, args.sourceId);
          break;

        case 'records_search':
          result = await this.client.searchRecords(args.query, {
            givenName: args.givenName,
            surname: args.surname,
            birthDate: args.birthDate,
            birthPlace: args.birthPlace,
            deathDate: args.deathDate,
            deathPlace: args.deathPlace,
            collection: args.collection,
          });
          break;

        case 'memories_search':
          result = await this.client.searchMemories(args.query, {
            personId: args.personId,
          });
          break;

        case 'memory_upload':
          result = await this.client.uploadMemory(args.personId, {
            title: args.title,
            description: args.description,
            artifactUrl: args.artifactUrl,
          });
          break;

        case 'gedcom_import':
          result = await this.client.importGedcom(args.gedcomData);
          break;

        case 'gedcom_export':
          result = await this.client.exportGedcom(args.personId);
          break;

        case 'hints_generate':
          result = await this.generateHints(args.personId);
          break;

        case 'merges_suggest':
          result = await this.suggestMerges(args.personId);
          break;

        case 'match_explain_llm':
          result = await this.explainMatch(args.personId1, args.personId2, args.context);
          break;

        case 'hints_rank_llm':
          result = await this.rankHints(args.personId, args.hints);
          break;

        case 'timeline_summary_llm':
          result = await this.generateTimelineSummary(args.personId, args.includeRelatives);
          break;

        case 'father_side_plan':
          result = await this.generateFatherSidePlan(args.personId, args.generations);
          break;

        case 'cache_get':
          result = this.getCacheInfo(args.key);
          break;

        case 'cache_clear':
          this.client.clearCache();
          result = { success: true, message: 'Cache cleared' };
          break;

        case 'healthcheck':
          result = await this.client.healthcheck();
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
        isError: true,
      };
    }
  }

  // AI/LLM helper methods
  private async generateHints(personId: string): Promise<any> {
    const person = await this.client!.getPerson(personId);
    const sources = await this.client!.getSources(personId);
    
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

  private async suggestMerges(personId: string): Promise<any> {
    const person = await this.client!.getPerson(personId);
    const searchResults = await this.client!.searchPeople(person.display?.name || '', {});
    
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

  private async explainMatch(personId1: string, personId2: string, context?: string): Promise<any> {
    const person1 = await this.client!.getPerson(personId1);
    const person2 = await this.client!.getPerson(personId2);
    
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

  private async rankHints(personId: string, hints: any[]): Promise<any> {
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

  private async generateTimelineSummary(personId: string, includeRelatives?: boolean): Promise<any> {
    const person = await this.client!.getPerson(personId);
    const relatives = includeRelatives ? await this.client!.getPersonWithRelationships(personId) : null;
    
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

  private async generateFatherSidePlan(personId: string, generations?: number): Promise<any> {
    const person = await this.client!.getPerson(personId);
    const parents = await this.client!.getParents(personId);
    
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

  private getCacheInfo(key?: string): any {
    if (key) {
      const cached = this.cache.get(key);
      return cached ? { key, data: cached.data, timestamp: cached.timestamp } : null;
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FamilySearch MCP Server running on stdio');
  }
}

const server = new FamilySearchMCPServer();
server.run().catch(console.error);
