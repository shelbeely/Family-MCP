import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import http from 'http';
import { URL } from 'url';
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

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

export class FamilySearchHTTPServer {
  private server: Server;
  private client: FamilySearchClient | null = null;
  private tokenStore: EncryptedTokenStore;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.server = new Server(
      {
        name: 'family-mcp-http',
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
    this.initializeClient();
    this.setupHandlers();
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        const typedArgs = args as any;

        switch (name) {
          case 'person_get':
            result = await this.client.getPerson(typedArgs.personId);
            break;
          case 'people_search':
            result = await this.client.searchPeople(typedArgs.query, typedArgs);
            break;
          case 'families_get':
            result = await this.client.getPersonWithRelationships(typedArgs.personId);
            break;
          case 'parents_get':
            result = await this.client.getParents(typedArgs.personId);
            break;
          case 'children_get':
            result = await this.client.getChildren(typedArgs.personId);
            break;
          case 'spouses_get':
            result = await this.client.getSpouses(typedArgs.personId);
            break;
          case 'sources_get':
            result = await this.client.getSources(typedArgs.personId);
            break;
          case 'source_attach':
            result = await this.client.attachSource(typedArgs.personId, typedArgs);
            break;
          case 'source_detach':
            result = await this.client.detachSource(typedArgs.personId, typedArgs.sourceId);
            break;
          case 'records_search':
            result = await this.client.searchRecords(typedArgs.query, typedArgs);
            break;
          case 'memories_search':
            result = await this.client.searchMemories(typedArgs.query, typedArgs);
            break;
          case 'memory_upload':
            result = await this.client.uploadMemory(typedArgs.personId, typedArgs);
            break;
          case 'gedcom_import':
            result = await this.client.importGedcom(typedArgs.gedcomData);
            break;
          case 'gedcom_export':
            result = await this.client.exportGedcom(typedArgs.personId);
            break;
          case 'hints_generate':
            result = await generateHints(this.client, typedArgs.personId);
            break;
          case 'merges_suggest':
            result = await suggestMerges(this.client, typedArgs.personId);
            break;
          case 'match_explain_llm':
            result = await explainMatch(this.client, typedArgs.personId1, typedArgs.personId2, typedArgs.context);
            break;
          case 'hints_rank_llm':
            result = await rankHints(this.client, typedArgs.personId, typedArgs.hints);
            break;
          case 'timeline_summary_llm':
            result = await generateTimelineSummary(this.client, typedArgs.personId, typedArgs.includeRelatives);
            break;
          case 'father_side_plan':
            result = await generateFatherSidePlan(this.client, typedArgs.personId, typedArgs.generations);
            break;
          case 'cache_get':
            result = getCacheInfo(this.cache, typedArgs.key);
            break;
          case 'cache_clear':
            this.client.clearCache();
            result = { success: true, message: 'Cache cleared' };
            break;
          case 'healthcheck':
            result = await this.client.healthcheck();
            break;
          case 'family_tree_chart':
            result = await generateFamilyTreeChart(this.client, typedArgs.personId, typedArgs.generations, typedArgs.direction);
            break;
          case 'timeline_chart':
            result = await generateTimelineChart(this.client, typedArgs.personId, typedArgs.includeRelatives);
            break;
          case 'pedigree_chart':
            result = await generatePedigreeChart(this.client, typedArgs.personId, typedArgs.generations);
            break;
          case 'family_tree_drawing':
            result = await generateFamilyTreeDrawing(this.client, typedArgs.personId, typedArgs.generations);
            break;
          // Phase 1: Ancestry & Pedigree
          case 'ancestry_get':
            result = await this.client.getAncestry(typedArgs.personId, typedArgs.generations);
            break;
          case 'descendancy_get':
            result = await this.client.getDescendancy(typedArgs.personId, typedArgs.generations);
            break;
          // Phase 1: Person CRUD
          case 'person_create':
            result = await this.client.createPerson(typedArgs);
            break;
          case 'person_update':
            result = await this.client.updatePerson(typedArgs.personId, typedArgs);
            break;
          case 'person_delete':
            if (!typedArgs.confirm) {
              result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
            } else {
              result = await this.client.deletePerson(typedArgs.personId, typedArgs.reason);
            }
            break;
          // Phase 1: Relationship Management
          case 'relationship_create_couple':
            result = await this.client.createCoupleRelationship(typedArgs.person1Id, typedArgs.person2Id);
            break;
          case 'relationship_create_parent_child':
            result = await this.client.createParentChildRelationship(typedArgs.parentId, typedArgs.childId);
            break;
          case 'relationship_delete':
            if (!typedArgs.confirm) {
              result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
            } else {
              result = await this.client.deleteRelationship(typedArgs.relationshipId, typedArgs.type, typedArgs.reason);
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
            result = await this.client.findRelationship(typedArgs.personId1, typedArgs.personId2);
            break;
          // Phase 2: Change History
          case 'change_history_person':
            result = await this.client.getPersonChangeHistory(typedArgs.personId);
            break;
          case 'change_history_relationship':
            result = await this.client.getRelationshipChangeHistory(typedArgs.relationshipId, typedArgs.type);
            break;
          // Phase 2: Notes CRUD
          case 'notes_get':
            result = await this.client.getNotes(typedArgs.personId);
            break;
          case 'note_create':
            result = await this.client.createNote(typedArgs.personId, typedArgs.subject, typedArgs.text);
            break;
          case 'note_update':
            result = await this.client.updateNote(typedArgs.personId, typedArgs.noteId, typedArgs.subject, typedArgs.text);
            break;
          case 'note_delete':
            if (!typedArgs.confirm) {
              result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
            } else {
              result = await this.client.deleteNote(typedArgs.personId, typedArgs.noteId);
            }
            break;
          // Phase 2: Batch Person Retrieval
          case 'persons_batch_get':
            result = await this.client.getPersonsBatch(typedArgs.personIds);
            break;
          // Phase 2: Person Merge
          case 'person_merge':
            if (!typedArgs.confirm) {
              result = { error: 'Merge not confirmed. Set confirm: true to proceed. This is a destructive operation.' };
            } else {
              result = await this.client.mergePerson(typedArgs.survivingPersonId, typedArgs.duplicatePersonId);
            }
            break;
          // Phase 2: Restore Operations
          case 'person_restore':
            result = await this.client.restorePerson(typedArgs.personId);
            break;
          case 'relationship_restore':
            result = await this.client.restoreRelationship(typedArgs.relationshipId, typedArgs.type);
            break;
          case 'change_restore':
            result = await this.client.restoreChange(typedArgs.changeId);
            break;
          // Phase 2: Match Management
          case 'matches_get':
            result = await this.client.getMatches(typedArgs.personId);
            break;
          case 'match_resolve':
            result = await this.client.resolveMatch(typedArgs.personId, typedArgs.matchId, typedArgs.status);
            break;
          case 'not_a_match_create':
            result = await this.client.createNotAMatch(typedArgs.personId, typedArgs.notMatchId);
            break;
          case 'not_a_match_delete':
            if (!typedArgs.confirm) {
              result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
            } else {
              result = await this.client.deleteNotAMatch(typedArgs.personId, typedArgs.declarationId);
            }
            break;
          // Phase 2: Preferred Relationships
          case 'preferred_parent_get':
            result = await this.client.getPreferredParent(typedArgs.personId);
            break;
          case 'preferred_parent_set':
            result = await this.client.setPreferredParent(typedArgs.personId, typedArgs.relationshipId);
            break;
          case 'preferred_spouse_get':
            result = await this.client.getPreferredSpouse(typedArgs.personId);
            break;
          case 'preferred_spouse_set':
            result = await this.client.setPreferredSpouse(typedArgs.personId, typedArgs.relationshipId);
            break;
          // Phase 2: Conclusion Management
          case 'conclusion_delete':
            if (!typedArgs.confirm) {
              result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
            } else {
              result = await this.client.deleteConclusion(typedArgs.entityType, typedArgs.entityId, typedArgs.conclusionId);
            }
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
    });
  }

  async start(): Promise<void> {
    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Health check endpoint
      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', version: '1.0.0' }));
        return;
      }

      // SSE endpoint for MCP
      if (url.pathname === '/sse') {
        const transport = new SSEServerTransport(url.pathname, res);
        await this.server.connect(transport);
        return;
      }

      // Default 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    httpServer.listen(PORT, HOST, () => {
      console.log(`FamilySearch MCP HTTP Server listening on http://${HOST}:${PORT}`);
      console.log(`SSE endpoint: http://${HOST}:${PORT}/sse`);
      console.log(`Health check: http://${HOST}:${PORT}/health`);
    });
  }
}

// Only start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new FamilySearchHTTPServer();
  server.start().catch(console.error);
}
