import { FamilySearchClient } from './familysearch-client.js';

function normalizeGender(person: any): string {
  return person.display?.gender || person.gender?.type?.split('/').pop() || '';
}

function getPersonColors(isRoot: boolean, gender: string): { bgColor: string; strokeColor: string } {
  if (isRoot) return { bgColor: '#fef3c7', strokeColor: '#d97706' };
  if (gender === 'Male' || gender === 'MALE') return { bgColor: '#dbeafe', strokeColor: '#2563eb' };
  if (gender === 'Female' || gender === 'FEMALE') return { bgColor: '#fce7f3', strokeColor: '#db2777' };
  return { bgColor: '#f3f4f6', strokeColor: '#6b7280' };
}

/**
 * Generates a Mermaid flowchart representing a family tree.
 * Inspired by mcp-mermaid (https://github.com/hustcc/mcp-mermaid) approach
 * of generating Mermaid syntax that can be rendered by any Mermaid-compatible viewer.
 */
export async function generateFamilyTreeChart(
  client: FamilySearchClient,
  personId: string,
  generations: number = 3,
  direction: string = 'TB'
): Promise<{ mermaid: string; description: string }> {
  const data = await client.getPersonWithRelationships(personId);
  const persons = data?.persons || [];
  const relationships = data?.relationships || [];
  const rootPerson = persons.find((p: any) => p.id === personId);
  const rootName = rootPerson?.display?.name || 'Unknown';

  const lines: string[] = [`graph ${direction}`];
  const seen = new Set<string>();

  // Add person nodes
  for (const person of persons) {
    if (!seen.has(person.id)) {
      seen.add(person.id);
      const name = person.display?.name || 'Unknown';
      const birth = person.display?.birthDate || '';
      const death = person.display?.deathDate || '';
      const lifespan = birth || death ? `\\n${birth} - ${death}` : '';
      const gender = normalizeGender(person);
      const shape = gender === 'Male' || gender === 'MALE'
        ? `[["${name}${lifespan}"]]`
        : gender === 'Female' || gender === 'FEMALE'
        ? `(["${name}${lifespan}"])`
        : `["${name}${lifespan}"]`;
      lines.push(`    ${person.id}${shape}`);
    }
  }

  // Add relationship edges
  for (const rel of relationships) {
    const type = rel.type || '';
    const p1 = rel.person1?.resourceId;
    const p2 = rel.person2?.resourceId;
    if (!p1 || !p2) continue;

    if (type.includes('ParentChild')) {
      lines.push(`    ${p1} -->|parent of| ${p2}`);
    } else if (type.includes('Couple')) {
      lines.push(`    ${p1} ---|married| ${p2}`);
    }
  }

  // Add styling
  lines.push('');
  lines.push('    classDef male fill:#4a90d9,stroke:#2c5aa0,color:#fff');
  lines.push('    classDef female fill:#d94a8a,stroke:#a02c5a,color:#fff');
  lines.push('    classDef root fill:#f5a623,stroke:#d4891a,color:#fff');

  // Apply styles
  for (const person of persons) {
    const gender = normalizeGender(person);
    if (person.id === personId) {
      lines.push(`    class ${person.id} root`);
    } else if (gender === 'Male' || gender === 'MALE') {
      lines.push(`    class ${person.id} male`);
    } else if (gender === 'Female' || gender === 'FEMALE') {
      lines.push(`    class ${person.id} female`);
    }
  }

  const mermaid = lines.join('\n');

  return {
    mermaid,
    description: `Family tree chart for ${rootName} (${personId}) showing ${persons.length} family members and ${relationships.length} relationships. Render this Mermaid diagram using any Mermaid-compatible viewer (mermaid.live, GitHub markdown, etc.) or with the mcp-mermaid server.`,
  };
}

/**
 * Generates a Mermaid timeline diagram for a person's life events.
 */
export async function generateTimelineChart(
  client: FamilySearchClient,
  personId: string,
  includeRelatives: boolean = false
): Promise<{ mermaid: string; description: string }> {
  const person = await client.getPerson(personId);
  const name = person?.display?.name || 'Unknown';
  const birthDate = person?.display?.birthDate || '';
  const birthPlace = person?.display?.birthPlace || '';
  const deathDate = person?.display?.deathDate || '';
  const deathPlace = person?.display?.deathPlace || '';

  const lines: string[] = ['timeline'];
  lines.push(`    title Life Timeline of ${name}`);

  if (birthDate) {
    lines.push(`    ${birthDate} : Born`);
    if (birthPlace) {
      lines.push(`           : in ${birthPlace}`);
    }
  }

  if (includeRelatives) {
    const data = await client.getPersonWithRelationships(personId);
    const relationships = data?.relationships || [];
    const persons = data?.persons || [];

    // Find marriage relationships
    for (const rel of relationships) {
      if (rel.type?.includes('Couple')) {
        const spouseId = rel.person1?.resourceId === personId
          ? rel.person2?.resourceId
          : rel.person1?.resourceId;
        const spouse = persons.find((p: any) => p.id === spouseId);
        if (spouse) {
          const spouseName = spouse.display?.name || 'Unknown';
          lines.push(`    : Married ${spouseName}`);
        }
      }
    }

    // Find children
    const children = persons.filter((p: any) =>
      relationships.some((r: any) =>
        r.type?.includes('ParentChild') &&
        r.person1?.resourceId === personId &&
        r.person2?.resourceId === p.id
      )
    );
    for (const child of children) {
      const childName = child.display?.name || 'Unknown';
      const childBirth = child.display?.birthDate || '';
      if (childBirth) {
        lines.push(`    ${childBirth} : Child born - ${childName}`);
      } else {
        lines.push(`    : Child - ${childName}`);
      }
    }
  }

  if (deathDate) {
    lines.push(`    ${deathDate} : Died`);
    if (deathPlace) {
      lines.push(`           : in ${deathPlace}`);
    }
  }

  const mermaid = lines.join('\n');

  return {
    mermaid,
    description: `Timeline chart for ${name} (${personId})${includeRelatives ? ' including relatives' : ''}. Render this Mermaid diagram using any Mermaid-compatible viewer or with the mcp-mermaid server.`,
  };
}

/**
 * Generates a Mermaid pedigree/ancestry chart (ancestors only).
 */
export async function generatePedigreeChart(
  client: FamilySearchClient,
  personId: string,
  generations: number = 4
): Promise<{ mermaid: string; description: string }> {
  const lines: string[] = ['graph BT'];
  const visited = new Set<string>();

  async function addAncestors(pid: string, gen: number): Promise<void> {
    if (gen > generations || visited.has(pid)) return;
    visited.add(pid);

    const person = await client.getPerson(pid);
    const name = person?.display?.name || 'Unknown';
    const birth = person?.display?.birthDate || '';
    const death = person?.display?.deathDate || '';
    const lifespan = birth || death ? `\\n${birth} - ${death}` : '';

    lines.push(`    ${pid}["${name}${lifespan}"]`);

    if (gen < generations) {
      try {
        const parents = await client.getParents(pid);
        for (const parent of parents) {
          const parentName = parent?.display?.name || 'Unknown';
          const pBirth = parent?.display?.birthDate || '';
          const pDeath = parent?.display?.deathDate || '';
          const pLifespan = pBirth || pDeath ? `\\n${pBirth} - ${pDeath}` : '';

          if (!visited.has(parent.id)) {
            lines.push(`    ${parent.id}["${parentName}${pLifespan}"]`);
            lines.push(`    ${pid} --> ${parent.id}`);
            await addAncestors(parent.id, gen + 1);
          }
        }
      } catch {
        // No parents found, end of line
      }
    }
  }

  await addAncestors(personId, 1);

  // Add styling
  lines.push('');
  lines.push('    classDef gen1 fill:#f5a623,stroke:#d4891a,color:#fff');
  lines.push('    classDef gen2 fill:#4a90d9,stroke:#2c5aa0,color:#fff');
  lines.push('    classDef gen3 fill:#7ed321,stroke:#5ea01a,color:#fff');
  lines.push('    classDef gen4 fill:#d94a8a,stroke:#a02c5a,color:#fff');

  if (visited.has(personId)) {
    lines.push(`    class ${personId} gen1`);
  }

  const mermaid = lines.join('\n');
  const rootPerson = await client.getPerson(personId);
  const rootName = rootPerson?.display?.name || 'Unknown';

  return {
    mermaid,
    description: `Pedigree chart for ${rootName} (${personId}) showing up to ${generations} generations of ancestors (${visited.size} people found). Render this Mermaid diagram using any Mermaid-compatible viewer or with the mcp-mermaid server.`,
  };
}

/**
 * Generates an Excalidraw-compatible JSON drawing of a family tree.
 * Inspired by excalidraw-mcp (https://github.com/excalidraw/excalidraw-mcp) approach
 * of generating Excalidraw JSON that can be rendered in Excalidraw viewers or MCP Apps.
 */
export async function generateFamilyTreeDrawing(
  client: FamilySearchClient,
  personId: string,
  generations: number = 3
): Promise<{ excalidraw: any; description: string }> {
  const data = await client.getPersonWithRelationships(personId);
  const persons = data?.persons || [];
  const relationships = data?.relationships || [];
  const rootPerson = persons.find((p: any) => p.id === personId);
  const rootName = rootPerson?.display?.name || 'Unknown';

  const elements: any[] = [];
  const personPositions = new Map<string, { x: number; y: number }>();

  // Layout persons in a grid
  const cols = Math.ceil(Math.sqrt(persons.length));
  const boxWidth = 200;
  const boxHeight = 80;
  const gapX = 60;
  const gapY = 100;

  persons.forEach((person: any, index: number) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * (boxWidth + gapX) + 50;
    const y = row * (boxHeight + gapY) + 50;

    personPositions.set(person.id, { x, y });

    const name = person.display?.name || 'Unknown';
    const birth = person.display?.birthDate || '';
    const death = person.display?.deathDate || '';
    const lifespan = birth || death ? `${birth} - ${death}` : '';
    const isRoot = person.id === personId;
    const gender = normalizeGender(person);

    const { bgColor, strokeColor } = getPersonColors(isRoot, gender);

    // Rectangle element
    elements.push({
      type: 'rectangle',
      id: `rect-${person.id}`,
      x,
      y,
      width: boxWidth,
      height: boxHeight,
      strokeColor,
      backgroundColor: bgColor,
      fillStyle: 'solid',
      strokeWidth: isRoot ? 3 : 2,
      roundness: { type: 3, value: 10 },
      angle: 0,
      opacity: 100,
      seed: Math.floor(Math.random() * 2000000000),
      version: 1,
      isDeleted: false,
      boundElements: [],
      groupIds: [],
      frameId: null,
      link: null,
      locked: false,
      updated: Date.now(),
    });

    // Name text element
    elements.push({
      type: 'text',
      id: `name-${person.id}`,
      x: x + 10,
      y: y + 10,
      width: boxWidth - 20,
      height: 24,
      text: name,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'top',
      strokeColor: '#1e293b',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      angle: 0,
      opacity: 100,
      seed: Math.floor(Math.random() * 2000000000),
      version: 1,
      isDeleted: false,
      boundElements: [],
      groupIds: [],
      frameId: null,
      link: null,
      locked: false,
      updated: Date.now(),
    });

    // Lifespan text element
    if (lifespan) {
      elements.push({
        type: 'text',
        id: `dates-${person.id}`,
        x: x + 10,
        y: y + 40,
        width: boxWidth - 20,
        height: 20,
        text: lifespan,
        fontSize: 12,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'top',
        strokeColor: '#64748b',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        angle: 0,
        opacity: 100,
        seed: Math.floor(Math.random() * 2000000000),
        version: 1,
        isDeleted: false,
        boundElements: [],
        groupIds: [],
        frameId: null,
        link: null,
        locked: false,
        updated: Date.now(),
      });
    }
  });

  // Add relationship arrows
  for (const rel of relationships) {
    const p1 = rel.person1?.resourceId;
    const p2 = rel.person2?.resourceId;
    if (!p1 || !p2) continue;

    const pos1 = personPositions.get(p1);
    const pos2 = personPositions.get(p2);
    if (!pos1 || !pos2) continue;

    const isParentChild = rel.type?.includes('ParentChild');
    const startX = pos1.x + boxWidth / 2;
    const startY = pos1.y + boxHeight;
    const endX = pos2.x + boxWidth / 2;
    const endY = pos2.y;

    elements.push({
      type: 'arrow',
      id: `arrow-${p1}-${p2}`,
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      points: [[0, 0], [endX - startX, endY - startY]],
      strokeColor: isParentChild ? '#2563eb' : '#db2777',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: isParentChild ? 'solid' : 'dashed',
      angle: 0,
      opacity: 100,
      seed: Math.floor(Math.random() * 2000000000),
      version: 1,
      isDeleted: false,
      boundElements: [],
      groupIds: [],
      frameId: null,
      link: null,
      locked: false,
      updated: Date.now(),
      startBinding: null,
      endBinding: null,
      startArrowhead: null,
      endArrowhead: 'arrow',
    });
  }

  const excalidraw = {
    type: 'excalidraw',
    version: 2,
    source: 'family-mcp',
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      gridSize: null,
    },
    files: {},
  };

  return {
    excalidraw,
    description: `Excalidraw family tree drawing for ${rootName} (${personId}) with ${persons.length} family members and ${relationships.length} relationships. This JSON can be imported into Excalidraw (excalidraw.com) or rendered via the excalidraw-mcp server. Blue boxes = male, pink = female, gold = root person. Solid arrows = parent-child, dashed = couple.`,
  };
}
