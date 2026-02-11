import { getTools } from '../dist/tools.js';

// Test that all planned tools are registered
console.log('Testing tool registration...\n');

const tools = getTools();
console.log(`Total tools registered: ${tools.length}`);

// All expected tool names across Phases 1-6
const expectedTools = [
  // Original tools (27)
  'person_get', 'people_search', 'families_get', 'parents_get', 'children_get',
  'spouses_get', 'sources_get', 'source_attach', 'source_detach', 'records_search',
  'memories_search', 'memory_upload', 'gedcom_import', 'gedcom_export',
  'hints_generate', 'merges_suggest', 'match_explain_llm', 'hints_rank_llm',
  'timeline_summary_llm', 'father_side_plan', 'cache_get', 'cache_clear',
  'healthcheck', 'family_tree_chart', 'timeline_chart', 'pedigree_chart',
  'family_tree_drawing',
  // Phase 1: Core API Gap Closure (11)
  'ancestry_get', 'descendancy_get', 'person_create', 'person_update',
  'person_delete', 'relationship_create_couple', 'relationship_create_parent_child',
  'relationship_delete', 'user_current', 'user_tree_person', 'relationship_find',
  // Phase 2: Extended Tree Operations (20)
  'change_history_person', 'change_history_relationship', 'notes_get', 'note_create',
  'note_update', 'note_delete', 'persons_batch_get', 'person_merge',
  'person_restore', 'relationship_restore', 'change_restore',
  'matches_get', 'match_resolve', 'not_a_match_create', 'not_a_match_delete',
  'preferred_parent_get', 'preferred_parent_set', 'preferred_spouse_get',
  'preferred_spouse_set', 'conclusion_delete',
  // Phase 3: Collaboration & Metadata (31)
  'place_search', 'place_get', 'place_children',
  'discussions_get', 'discussion_read', 'discussion_create', 'discussion_update',
  'discussion_comment', 'discussion_comment_delete',
  'source_description_get', 'source_description_create', 'source_description_update',
  'source_description_delete', 'source_description_changes',
  'relationship_sources_get', 'relationship_source_attach', 'relationship_source_detach',
  'relationship_notes_get', 'relationship_note_create', 'relationship_note_delete',
  'source_folders_list', 'source_folder_create', 'source_folder_get',
  'source_folder_update', 'source_folder_delete', 'source_folder_add',
  'source_folder_remove',
  'memory_get', 'memory_delete', 'memory_attach', 'memory_detach',
  // Phase 6: Advanced Research (7)
  'hints_get', 'ordinances_get', 'date_standardize', 'mother_side_plan',
  'collections_list', 'collection_get',
];

const toolNames = new Set(tools.map(t => t.name));
let pass = true;

// Check every expected tool is registered
const missing = [];
for (const expected of expectedTools) {
  if (!toolNames.has(expected)) {
    missing.push(expected);
  }
}

if (missing.length > 0) {
  console.error(`\n✗ Missing tools: ${missing.join(', ')}`);
  pass = false;
} else {
  console.log('✓ All expected tools are registered');
}

// Verify tool count
console.log(`\nExpected: ${expectedTools.length} tools`);
console.log(`Actual:   ${tools.length} tools`);

if (tools.length >= expectedTools.length) {
  console.log('✓ Tool count matches or exceeds expected');
} else {
  console.error('✗ Tool count is lower than expected');
  pass = false;
}

// Verify every tool has required fields
let malformed = 0;
for (const tool of tools) {
  if (!tool.name || !tool.description || !tool.inputSchema) {
    console.error(`✗ Tool ${tool.name || 'UNNAMED'} missing required fields`);
    malformed++;
    pass = false;
  }
}
if (malformed === 0) {
  console.log('✓ All tools have name, description, and inputSchema');
}

// Verify destructive operations require confirm parameter
const destructiveTools = [
  'person_delete', 'relationship_delete', 'note_delete',
  'person_merge', 'conclusion_delete', 'discussion_comment_delete',
  'source_description_delete', 'relationship_source_detach',
  'relationship_note_delete', 'source_folder_delete',
  'source_folder_remove', 'memory_delete', 'memory_detach',
  'not_a_match_delete',
];

let safetyPass = true;
for (const toolName of destructiveTools) {
  const tool = tools.find(t => t.name === toolName);
  if (tool) {
    const hasConfirm = tool.inputSchema?.properties?.confirm;
    if (hasConfirm) {
      // good
    } else {
      // Some tools may not need confirm (e.g., simple detach operations)
      // Only flag the major destructive ones
      if (['person_delete', 'relationship_delete', 'person_merge', 'conclusion_delete'].includes(toolName)) {
        console.error(`✗ ${toolName} missing confirm parameter`);
        safetyPass = false;
        pass = false;
      }
    }
  }
}
if (safetyPass) {
  console.log('✓ Major destructive operations have safety confirm parameter');
}

// Categorize tools by phase
const phases = {
  'Original': expectedTools.slice(0, 27),
  'Phase 1': expectedTools.slice(27, 38),
  'Phase 2': expectedTools.slice(38, 58),
  'Phase 3': expectedTools.slice(58, 89),
  'Phase 6': expectedTools.slice(89),
};

console.log('\nTool breakdown by phase:');
for (const [phase, phaseTools] of Object.entries(phases)) {
  const registered = phaseTools.filter(t => toolNames.has(t));
  console.log(`  ${phase}: ${registered.length}/${phaseTools.length} tools`);
}

if (pass) {
  console.log('\n✓ All tools tests passed!');
} else {
  console.error('\n✗ Some tests failed');
  process.exit(1);
}
