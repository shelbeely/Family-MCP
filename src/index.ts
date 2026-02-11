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
  generateMotherSidePlan,
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

        // Phase 2: Change History
        case 'change_history_person':
          result = await this.client.getPersonChangeHistory(args.personId);
          break;

        case 'change_history_relationship':
          result = await this.client.getRelationshipChangeHistory(args.relationshipId, args.type);
          break;

        // Phase 2: Notes CRUD
        case 'notes_get':
          result = await this.client.getNotes(args.personId);
          break;

        case 'note_create':
          result = await this.client.createNote(args.personId, args.subject, args.text);
          break;

        case 'note_update':
          result = await this.client.updateNote(args.personId, args.noteId, args.subject, args.text);
          break;

        case 'note_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteNote(args.personId, args.noteId);
          }
          break;

        // Phase 2: Batch Person Retrieval
        case 'persons_batch_get':
          result = await this.client.getPersonsBatch(args.personIds);
          break;

        // Phase 2: Person Merge
        case 'person_merge':
          if (!args.confirm) {
            result = { error: 'Merge not confirmed. Set confirm: true to proceed. This is a destructive operation.' };
          } else {
            result = await this.client.mergePerson(args.survivingPersonId, args.duplicatePersonId);
          }
          break;

        // Phase 2: Restore Operations
        case 'person_restore':
          result = await this.client.restorePerson(args.personId);
          break;

        case 'relationship_restore':
          result = await this.client.restoreRelationship(args.relationshipId, args.type);
          break;

        case 'change_restore':
          result = await this.client.restoreChange(args.changeId);
          break;

        // Phase 2: Match Management
        case 'matches_get':
          result = await this.client.getMatches(args.personId);
          break;

        case 'match_resolve':
          result = await this.client.resolveMatch(args.personId, args.matchId, args.status);
          break;

        case 'not_a_match_create':
          result = await this.client.createNotAMatch(args.personId, args.notMatchId);
          break;

        case 'not_a_match_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteNotAMatch(args.personId, args.declarationId);
          }
          break;

        // Phase 2: Preferred Relationships
        case 'preferred_parent_get':
          result = await this.client.getPreferredParent(args.personId);
          break;

        case 'preferred_parent_set':
          result = await this.client.setPreferredParent(args.personId, args.relationshipId);
          break;

        case 'preferred_spouse_get':
          result = await this.client.getPreferredSpouse(args.personId);
          break;

        case 'preferred_spouse_set':
          result = await this.client.setPreferredSpouse(args.personId, args.relationshipId);
          break;

        // Phase 2: Conclusion Management
        case 'conclusion_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteConclusion(args.entityType, args.entityId, args.conclusionId);
          }
          break;

        // Phase 3: Place Authority
        case 'place_search':
          result = await this.client.searchPlaces(args.query, args.count);
          break;

        case 'place_get':
          result = await this.client.getPlace(args.placeId);
          break;

        case 'place_children':
          result = await this.client.getPlaceChildren(args.placeId);
          break;

        // Phase 3: Discussions
        case 'discussions_get':
          result = await this.client.getDiscussionReferences(args.personId);
          break;

        case 'discussion_read':
          result = await this.client.getDiscussion(args.discussionId);
          break;

        case 'discussion_create':
          result = await this.client.createDiscussion(args.title, args.details);
          break;

        case 'discussion_update':
          result = await this.client.updateDiscussion(args.discussionId, args.title, args.details);
          break;

        case 'discussion_comment':
          result = await this.client.createDiscussionComment(args.discussionId, args.text);
          break;

        case 'discussion_comment_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteDiscussionComment(args.discussionId, args.commentId);
          }
          break;

        // Phase 3: Source Description Management
        case 'source_description_get':
          result = await this.client.getSourceDescription(args.sourceId);
          break;

        case 'source_description_create':
          result = await this.client.createSourceDescription({
            title: args.title,
            citation: args.citation,
            about: args.about,
            notes: args.notes,
          });
          break;

        case 'source_description_update':
          result = await this.client.updateSourceDescription(args.sourceId, {
            title: args.title,
            citation: args.citation,
            about: args.about,
            notes: args.notes,
          });
          break;

        case 'source_description_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteSourceDescription(args.sourceId);
          }
          break;

        case 'source_description_changes':
          result = await this.client.getSourceDescriptionChanges(args.sourceId);
          break;

        // Phase 3: Relationship-Level Sources
        case 'relationship_sources_get':
          result = await this.client.getRelationshipSources(args.type, args.id);
          break;

        case 'relationship_source_attach':
          result = await this.client.attachRelationshipSource(args.type, args.id, args.sourceRef);
          break;

        case 'relationship_source_detach':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.detachRelationshipSource(args.type, args.id, args.sourceRefId);
          }
          break;

        // Phase 3: Relationship-Level Notes
        case 'relationship_notes_get':
          result = await this.client.getRelationshipNotes(args.type, args.id);
          break;

        case 'relationship_note_create':
          result = await this.client.createRelationshipNote(args.type, args.id, args.subject, args.text);
          break;

        case 'relationship_note_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteRelationshipNote(args.type, args.id, args.noteId);
          }
          break;

        // Phase 3: Source Box / Folders
        case 'source_folders_list':
          result = await this.client.getSourceFolders();
          break;

        case 'source_folder_create':
          result = await this.client.createSourceFolder(args.name);
          break;

        case 'source_folder_get':
          result = await this.client.getSourceFolder(args.folderId);
          break;

        case 'source_folder_update':
          result = await this.client.updateSourceFolder(args.folderId, args.name);
          break;

        case 'source_folder_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteSourceFolder(args.folderId);
          }
          break;

        case 'source_folder_add':
          result = await this.client.addToSourceFolder(args.folderId, args.sourceIds);
          break;

        case 'source_folder_remove':
          if (!args.confirm) {
            result = { error: 'Removal not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.removeFromSourceFolder(args.folderId, args.sourceIds);
          }
          break;

        // Phase 3: Memory CRUD
        case 'memory_get':
          result = await this.client.getMemory(args.memoryId);
          break;

        case 'memory_delete':
          if (!args.confirm) {
            result = { error: 'Deletion not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.deleteMemory(args.memoryId);
          }
          break;

        case 'memory_attach':
          result = await this.client.attachMemory(args.personId, args.memoryId);
          break;

        case 'memory_detach':
          if (!args.confirm) {
            result = { error: 'Detachment not confirmed. Set confirm: true to proceed.' };
          } else {
            result = await this.client.detachMemory(args.personId, args.referenceId);
          }
          break;

        // Phase 6: Record Hints
        case 'hints_get':
          result = await this.client.getRecordHints(args.personId, args.collection);
          break;

        // Phase 6: Ordinance Information
        case 'ordinances_get':
          result = await this.client.getOrdinances(args.personId);
          break;

        // Phase 6: Date Standardization
        case 'date_standardize':
          result = await this.client.standardizeDate(args.dateString);
          break;

        // Phase 6: Maternal Side Research Plan
        case 'mother_side_plan':
          result = await generateMotherSidePlan(this.client, args.personId, args.generations);
          break;

        // Phase 6: Collections Browsing
        case 'collections_list':
          result = await this.client.listCollections(args.count);
          break;

        case 'collection_get':
          result = await this.client.getCollection(args.collectionId);
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
