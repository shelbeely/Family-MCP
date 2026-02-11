#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FamilySearchClient } from './familysearch-client.js';
import { EncryptedTokenStore } from './token-store.js';
import {
  getTools,
  generateHints,
  suggestMerges,
  explainMatch,
  rankHints,
  generateTimelineSummary,
  generateFatherSidePlan,
  getCacheInfo,
} from './tools.js';
import {
  generateFamilyTreeChart,
  generateTimelineChart,
  generatePedigreeChart,
  generateFamilyTreeDrawing,
} from './visualization.js';

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
    const token = process.env.COPILOT_MCP_FAMILYSEARCH_TOKEN || process.env.FAMILYSEARCH_TOKEN || this.tokenStore.loadToken();
    
    if (token) {
      this.client = new FamilySearchClient({
        accessToken: token,
        baseUrl: process.env.COPILOT_MCP_FAMILYSEARCH_BASE_URL || process.env.FAMILYSEARCH_BASE_URL,
        cache: this.cache,
      });
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request)
    );
  }

  private async handleToolCall(request: any): Promise<any> {
    const { name, arguments: args } = request.params;

    if (!this.client) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'FamilySearch client not initialized. Please set FAMILYSEARCH_TOKEN (or COPILOT_MCP_FAMILYSEARCH_TOKEN for GitHub Copilot) environment variable.',
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
          result = await generateHints(this.client, args.personId);
          break;

        case 'merges_suggest':
          result = await suggestMerges(this.client, args.personId);
          break;

        case 'match_explain_llm':
          result = await explainMatch(this.client, args.personId1, args.personId2, args.context);
          break;

        case 'hints_rank_llm':
          result = await rankHints(this.client, args.personId, args.hints);
          break;

        case 'timeline_summary_llm':
          result = await generateTimelineSummary(this.client, args.personId, args.includeRelatives);
          break;

        case 'father_side_plan':
          result = await generateFatherSidePlan(this.client, args.personId, args.generations);
          break;

        case 'cache_get':
          result = getCacheInfo(this.cache, args.key);
          break;

        case 'cache_clear':
          this.client.clearCache();
          result = { success: true, message: 'Cache cleared' };
          break;

        case 'healthcheck':
          result = await this.client.healthcheck();
          break;

        case 'family_tree_chart':
          result = await generateFamilyTreeChart(this.client, args.personId, args.generations, args.direction);
          break;

        case 'timeline_chart':
          result = await generateTimelineChart(this.client, args.personId, args.includeRelatives);
          break;

        case 'pedigree_chart':
          result = await generatePedigreeChart(this.client, args.personId, args.generations);
          break;

        case 'family_tree_drawing':
          result = await generateFamilyTreeDrawing(this.client, args.personId, args.generations);
          break;

        // Phase 1: Ancestry & Pedigree
        case 'ancestry_get':
          result = await this.client.getAncestry(args.personId, args.generations);
          break;

        case 'descendancy_get':
          result = await this.client.getDescendancy(args.personId, args.generations);
          break;

        // Phase 1: Person CRUD
        case 'person_create':
          result = await this.client.createPerson(args);
          break;

        case 'person_update':
          result = await this.client.updatePerson(args.personId, args);
          break;

        case 'person_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deletePerson(args.personId, args.reason);
          }
          break;

        // Phase 1: Relationship Management
        case 'relationship_create_couple':
          result = await this.client.createCoupleRelationship(args.person1Id, args.person2Id);
          break;

        case 'relationship_create_parent_child':
          result = await this.client.createParentChildRelationship(args.parentId, args.childId);
          break;

        case 'relationship_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteRelationship(args.relationshipId, args.type, args.reason);
          }
          break;

        // Phase 1: User & Navigation
        case 'user_current':
          result = await this.client.getCurrentUser();
          break;

        case 'user_tree_person':
          result = await this.client.getCurrentTreePerson();
          break;

        case 'relationship_find':
          result = await this.client.findRelationship(args.personId1, args.personId2);
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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FamilySearch MCP Server running on stdio');
  }
}

const server = new FamilySearchMCPServer();
server.run().catch(console.error);
