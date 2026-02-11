import {
  generateFamilyTreeChart,
  generateTimelineChart,
  generatePedigreeChart,
  generateFamilyTreeDrawing,
} from '../dist/visualization.js';

// Mock FamilySearch client for testing visualization tools
class MockClient {
  async getPerson(personId) {
    return {
      id: personId,
      display: {
        name: 'John Smith',
        gender: 'Male',
        birthDate: '1 January 1900',
        birthPlace: 'Salt Lake City, Utah',
        deathDate: '15 March 1975',
        deathPlace: 'Provo, Utah',
      },
      gender: { type: 'http://gedcomx.org/Male' },
    };
  }

  async getPersonWithRelationships(personId) {
    return {
      persons: [
        {
          id: personId,
          display: { name: 'John Smith', gender: 'Male', birthDate: '1900', deathDate: '1975' },
          gender: { type: 'http://gedcomx.org/Male' },
        },
        {
          id: 'SPOUSE-1',
          display: { name: 'Jane Doe', gender: 'Female', birthDate: '1902', deathDate: '1980' },
          gender: { type: 'http://gedcomx.org/Female' },
        },
        {
          id: 'CHILD-1',
          display: { name: 'Bob Smith', gender: 'Male', birthDate: '1925', deathDate: '2000' },
          gender: { type: 'http://gedcomx.org/Male' },
        },
      ],
      relationships: [
        {
          type: 'http://gedcomx.org/Couple',
          person1: { resourceId: personId },
          person2: { resourceId: 'SPOUSE-1' },
        },
        {
          type: 'http://gedcomx.org/ParentChild',
          person1: { resourceId: personId },
          person2: { resourceId: 'CHILD-1' },
        },
      ],
    };
  }

  async getParents(personId) {
    return [
      {
        id: 'FATHER-1',
        display: { name: 'William Smith', gender: 'Male', birthDate: '1870', deathDate: '1940' },
        gender: { type: 'http://gedcomx.org/Male' },
      },
      {
        id: 'MOTHER-1',
        display: { name: 'Mary Johnson', gender: 'Female', birthDate: '1872', deathDate: '1945' },
        gender: { type: 'http://gedcomx.org/Female' },
      },
    ];
  }
}

const client = new MockClient();
const testPersonId = 'TEST-123';
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('Testing Visualization Tools...\n');

  // Test 1: Family Tree Chart
  console.log('--- family_tree_chart ---');
  const treeChart = await generateFamilyTreeChart(client, testPersonId);
  assert(treeChart.mermaid.startsWith('graph TB'), 'Default direction is TB');
  assert(treeChart.mermaid.includes('John Smith'), 'Contains root person name');
  assert(treeChart.mermaid.includes('Jane Doe'), 'Contains spouse name');
  assert(treeChart.mermaid.includes('Bob Smith'), 'Contains child name');
  assert(treeChart.mermaid.includes('parent of'), 'Contains parent-child relationship');
  assert(treeChart.mermaid.includes('married'), 'Contains marriage relationship');
  assert(treeChart.mermaid.includes('classDef male'), 'Contains male style class');
  assert(treeChart.mermaid.includes('classDef female'), 'Contains female style class');
  assert(treeChart.mermaid.includes('classDef root'), 'Contains root style class');
  assert(treeChart.description.includes('Mermaid'), 'Description mentions Mermaid');
  assert(typeof treeChart.mermaid === 'string', 'Returns string mermaid syntax');

  // Test direction parameter
  const lrChart = await generateFamilyTreeChart(client, testPersonId, 3, 'LR');
  assert(lrChart.mermaid.startsWith('graph LR'), 'Respects LR direction parameter');

  // Test 2: Timeline Chart
  console.log('\n--- timeline_chart ---');
  const timeline = await generateTimelineChart(client, testPersonId);
  assert(timeline.mermaid.startsWith('timeline'), 'Starts with timeline keyword');
  assert(timeline.mermaid.includes('John Smith'), 'Contains person name in title');
  assert(timeline.mermaid.includes('Born'), 'Contains birth event');
  assert(timeline.mermaid.includes('Died'), 'Contains death event');
  assert(timeline.mermaid.includes('Salt Lake City'), 'Contains birth place');
  assert(timeline.description.includes('Timeline'), 'Description mentions Timeline');

  // Test with relatives
  const timelineWithRelatives = await generateTimelineChart(client, testPersonId, true);
  assert(timelineWithRelatives.mermaid.includes('Jane Doe'), 'Includes spouse when includeRelatives=true');
  assert(timelineWithRelatives.mermaid.includes('Bob Smith'), 'Includes child when includeRelatives=true');

  // Test 3: Pedigree Chart
  console.log('\n--- pedigree_chart ---');
  const pedigree = await generatePedigreeChart(client, testPersonId, 2);
  assert(pedigree.mermaid.startsWith('graph BT'), 'Uses bottom-to-top direction');
  assert(pedigree.mermaid.includes('John Smith'), 'Contains root person');
  assert(pedigree.mermaid.includes('William Smith'), 'Contains father');
  assert(pedigree.mermaid.includes('Mary Johnson'), 'Contains mother');
  assert(pedigree.description.includes('Pedigree'), 'Description mentions Pedigree');
  assert(pedigree.description.includes('ancestors'), 'Description mentions ancestors');

  // Test 4: Family Tree Drawing (Excalidraw)
  console.log('\n--- family_tree_drawing ---');
  const drawing = await generateFamilyTreeDrawing(client, testPersonId);
  assert(drawing.excalidraw.type === 'excalidraw', 'Excalidraw JSON has correct type');
  assert(drawing.excalidraw.version === 2, 'Excalidraw JSON has version 2');
  assert(drawing.excalidraw.source === 'family-mcp', 'Source is family-mcp');
  assert(Array.isArray(drawing.excalidraw.elements), 'Elements is an array');
  assert(drawing.excalidraw.elements.length > 0, 'Has elements');

  // Check for rectangles (person boxes)
  const rectangles = drawing.excalidraw.elements.filter(e => e.type === 'rectangle');
  assert(rectangles.length === 3, 'Has 3 person rectangles');

  // Check for text elements (names)
  const texts = drawing.excalidraw.elements.filter(e => e.type === 'text');
  assert(texts.length > 0, 'Has text elements');
  assert(texts.some(t => t.text === 'John Smith'), 'Has root person name text');

  // Check for arrows (relationships)
  const arrows = drawing.excalidraw.elements.filter(e => e.type === 'arrow');
  assert(arrows.length === 2, 'Has 2 relationship arrows');

  // Check root person styling
  const rootRect = rectangles.find(r => r.id === `rect-${testPersonId}`);
  assert(rootRect && rootRect.backgroundColor === '#fef3c7', 'Root person has gold background');
  assert(rootRect && rootRect.strokeWidth === 3, 'Root person has thicker border');

  assert(drawing.description.includes('Excalidraw'), 'Description mentions Excalidraw');
  assert(drawing.description.includes('excalidraw-mcp'), 'Description references excalidraw-mcp');

  // Summary
  console.log(`\n${passed + failed} tests run: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error('\n✗ Some visualization tests failed!');
    process.exit(1);
  } else {
    console.log('\n✓ All visualization tests passed!');
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
