import fetch from 'node-fetch';

interface FamilySearchConfig {
  accessToken: string;
  baseUrl?: string;
  cache?: Map<string, { data: any; timestamp: number }>;
  cacheTimeout?: number;
}

export class FamilySearchClient {
  private accessToken: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number;

  constructor(config: FamilySearchConfig) {
    this.accessToken = config.accessToken;
    this.baseUrl = config.baseUrl || 'https://api.familysearch.org/platform';
    this.cache = config.cache || new Map();
    this.cacheTimeout = config.cacheTimeout || 300000; // 5 minutes default
  }

  private getCacheKey(url: string): string {
    return url;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  async request(endpoint: string, options: any = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.getCacheKey(url);

    if (options.method === 'GET' || !options.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`FamilySearch API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (options.method === 'GET' || !options.method) {
      this.setCache(cacheKey, data);
    }

    return data;
  }

  // Person endpoints
  async getPerson(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}`);
  }

  async searchPeople(query: string, params?: Record<string, string>): Promise<any> {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/tree/search?${searchParams}`);
  }

  // Family endpoints
  async getPersonWithRelationships(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/with-relationships`);
  }

  async getParents(personId: string): Promise<any> {
    const data = await this.getPersonWithRelationships(personId);
    return data?.persons?.filter((p: any) => 
      data.relationships?.some((r: any) => 
        r.type === 'http://gedcomx.org/ParentChild' && 
        r.person2?.resourceId === personId &&
        r.person1?.resourceId === p.id
      )
    ) || [];
  }

  async getChildren(personId: string): Promise<any> {
    const data = await this.getPersonWithRelationships(personId);
    return data?.persons?.filter((p: any) => 
      data.relationships?.some((r: any) => 
        r.type === 'http://gedcomx.org/ParentChild' && 
        r.person1?.resourceId === personId &&
        r.person2?.resourceId === p.id
      )
    ) || [];
  }

  async getSpouses(personId: string): Promise<any> {
    const data = await this.getPersonWithRelationships(personId);
    return data?.persons?.filter((p: any) => 
      data.relationships?.some((r: any) => 
        r.type === 'http://gedcomx.org/Couple' && 
        (r.person1?.resourceId === personId || r.person2?.resourceId === personId) &&
        (r.person1?.resourceId === p.id || r.person2?.resourceId === p.id)
      )
    ) || [];
  }

  // Sources endpoints
  async getSources(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/sources`);
  }

  async attachSource(personId: string, sourceDescription: any): Promise<any> {
    return this.request(`/tree/persons/${personId}/sources`, {
      method: 'POST',
      body: JSON.stringify(sourceDescription),
    });
  }

  async detachSource(personId: string, sourceId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  }

  // Records search
  async searchRecords(query: string, params?: Record<string, string>): Promise<any> {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/records/search?${searchParams}`);
  }

  // Memories
  async searchMemories(query: string, params?: Record<string, string>): Promise<any> {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/memories/search?${searchParams}`);
  }

  async uploadMemory(personId: string, memoryData: any): Promise<any> {
    return this.request(`/memories`, {
      method: 'POST',
      body: JSON.stringify(memoryData),
    });
  }

  // GEDCOM
  async importGedcom(gedcomData: string): Promise<any> {
    return this.request(`/tree/gedcomx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-gedcomx-v1+json',
      },
      body: gedcomData,
    });
  }

  async exportGedcom(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/gedcomx`);
  }

  // Phase 1: Ancestry & Pedigree
  async getAncestry(personId: string, generations?: number): Promise<any> {
    const params = new URLSearchParams({ person: personId });
    if (generations) params.set('generations', String(generations));
    return this.request(`/tree/ancestry?${params}`);
  }

  async getDescendancy(personId: string, generations?: number): Promise<any> {
    const params = new URLSearchParams({ person: personId });
    if (generations) params.set('generations', String(generations));
    return this.request(`/tree/descendancy?${params}`);
  }

  // Phase 1: Person CRUD
  async createPerson(personData: {
    givenName: string;
    surname: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    deathDate?: string;
    deathPlace?: string;
  }): Promise<any> {
    const names = [{
      nameForms: [{
        fullText: `${personData.givenName} ${personData.surname}`,
        parts: [
          { type: 'http://gedcomx.org/Given', value: personData.givenName },
          { type: 'http://gedcomx.org/Surname', value: personData.surname },
        ],
      }],
    }];

    const facts: any[] = [];
    if (personData.birthDate || personData.birthPlace) {
      facts.push({
        type: 'http://gedcomx.org/Birth',
        date: personData.birthDate ? { original: personData.birthDate } : undefined,
        place: personData.birthPlace ? { original: personData.birthPlace } : undefined,
      });
    }
    if (personData.deathDate || personData.deathPlace) {
      facts.push({
        type: 'http://gedcomx.org/Death',
        date: personData.deathDate ? { original: personData.deathDate } : undefined,
        place: personData.deathPlace ? { original: personData.deathPlace } : undefined,
      });
    }

    const body: any = {
      persons: [{
        names,
        gender: personData.gender ? { type: `http://gedcomx.org/${personData.gender}` } : undefined,
        facts: facts.length > 0 ? facts : undefined,
      }],
    };

    return this.request('/tree/persons', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updatePerson(personId: string, updates: {
    givenName?: string;
    surname?: string;
    gender?: string;
    birthDate?: string;
    birthPlace?: string;
    deathDate?: string;
    deathPlace?: string;
  }): Promise<any> {
    const body: any = { persons: [{ id: personId }] };
    const person = body.persons[0];

    if (updates.givenName || updates.surname) {
      person.names = [{
        nameForms: [{
          fullText: [updates.givenName, updates.surname].filter(Boolean).join(' '),
          parts: [
            ...(updates.givenName ? [{ type: 'http://gedcomx.org/Given', value: updates.givenName }] : []),
            ...(updates.surname ? [{ type: 'http://gedcomx.org/Surname', value: updates.surname }] : []),
          ],
        }],
      }];
    }

    if (updates.gender) {
      person.gender = { type: `http://gedcomx.org/${updates.gender}` };
    }

    const facts: any[] = [];
    if (updates.birthDate || updates.birthPlace) {
      facts.push({
        type: 'http://gedcomx.org/Birth',
        date: updates.birthDate ? { original: updates.birthDate } : undefined,
        place: updates.birthPlace ? { original: updates.birthPlace } : undefined,
      });
    }
    if (updates.deathDate || updates.deathPlace) {
      facts.push({
        type: 'http://gedcomx.org/Death',
        date: updates.deathDate ? { original: updates.deathDate } : undefined,
        place: updates.deathPlace ? { original: updates.deathPlace } : undefined,
      });
    }
    if (facts.length > 0) person.facts = facts;

    return this.request(`/tree/persons/${personId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deletePerson(personId: string, reason: string): Promise<any> {
    return this.request(`/tree/persons/${personId}`, {
      method: 'DELETE',
      headers: { 'X-Reason': reason },
    });
  }

  // Phase 1: Relationship management
  async createCoupleRelationship(person1Id: string, person2Id: string): Promise<any> {
    const body = {
      relationships: [{
        type: 'http://gedcomx.org/Couple',
        person1: { resourceId: person1Id, resource: `https://api.familysearch.org/platform/tree/persons/${person1Id}` },
        person2: { resourceId: person2Id, resource: `https://api.familysearch.org/platform/tree/persons/${person2Id}` },
      }],
    };
    return this.request('/tree/relationships', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async createParentChildRelationship(parentId: string, childId: string): Promise<any> {
    const body = {
      childAndParentsRelationships: [{
        parent1: { resourceId: parentId, resource: `https://api.familysearch.org/platform/tree/persons/${parentId}` },
        child: { resourceId: childId, resource: `https://api.familysearch.org/platform/tree/persons/${childId}` },
      }],
    };
    return this.request('/tree/child-and-parents-relationships', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteRelationship(relationshipId: string, type: string, reason: string): Promise<any> {
    const endpoint = type === 'couple'
      ? `/tree/couple-relationships/${relationshipId}`
      : `/tree/child-and-parents-relationships/${relationshipId}`;
    return this.request(endpoint, {
      method: 'DELETE',
      headers: { 'X-Reason': reason },
    });
  }

  // Phase 1: User & navigation
  async getCurrentUser(): Promise<any> {
    return this.request('/users/current');
  }

  async getCurrentTreePerson(): Promise<any> {
    return this.request('/tree/current-person');
  }

  async findRelationship(personId1: string, personId2: string): Promise<any> {
    return this.request(`/tree/relationships?person=${personId1}&person=${personId2}`);
  }

  // Phase 2: Change History
  async getPersonChangeHistory(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/change-history`);
  }

  async getRelationshipChangeHistory(relationshipId: string, type: string): Promise<any> {
    const endpoint = type === 'couple'
      ? `/tree/couple-relationships/${relationshipId}/change-history`
      : `/tree/child-and-parents-relationships/${relationshipId}/change-history`;
    return this.request(endpoint);
  }

  // Phase 2: Notes CRUD
  async getNotes(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/notes`);
  }

  async createNote(personId: string, subject: string, text: string): Promise<any> {
    const body = { persons: [{ notes: [{ subject, text }] }] };
    return this.request(`/tree/persons/${personId}/notes`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateNote(personId: string, noteId: string, subject: string, text: string): Promise<any> {
    const body = { persons: [{ notes: [{ id: noteId, subject, text }] }] };
    return this.request(`/tree/persons/${personId}/notes/${noteId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteNote(personId: string, noteId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Phase 2: Batch Person Retrieval
  async getPersonsBatch(personIds: string[]): Promise<any> {
    const pids = personIds.slice(0, 200).join(',');
    return this.request(`/tree/persons?pids=${pids}`);
  }

  // Phase 2: Person Merge
  async mergePerson(survivingPersonId: string, duplicatePersonId: string): Promise<any> {
    return this.request(`/tree/persons/${survivingPersonId}/merges/${duplicatePersonId}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Phase 2: Restore Operations
  async restorePerson(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/restore`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async restoreRelationship(relationshipId: string, type: string): Promise<any> {
    const endpoint = type === 'couple'
      ? `/tree/couple-relationships/${relationshipId}/restore`
      : `/tree/child-and-parents-relationships/${relationshipId}/restore`;
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async restoreChange(changeId: string): Promise<any> {
    return this.request(`/tree/changes/${changeId}/restore`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Phase 2: Match Management
  async getMatches(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/matches`);
  }

  async resolveMatch(personId: string, matchId: string, status: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/matches/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async createNotAMatch(personId: string, notMatchId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/not-a-matches`, {
      method: 'POST',
      body: JSON.stringify({ notMatchId }),
    });
  }

  async deleteNotAMatch(personId: string, declarationId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/not-a-matches/${declarationId}`, {
      method: 'DELETE',
    });
  }

  // Phase 2: Preferred Relationships
  async getPreferredParent(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/preferred-parent-relationship`);
  }

  async setPreferredParent(personId: string, relationshipId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/preferred-parent-relationship`, {
      method: 'PUT',
      body: JSON.stringify({ relationshipId }),
    });
  }

  async getPreferredSpouse(personId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/preferred-spouse-relationship`);
  }

  async setPreferredSpouse(personId: string, relationshipId: string): Promise<any> {
    return this.request(`/tree/persons/${personId}/preferred-spouse-relationship`, {
      method: 'PUT',
      body: JSON.stringify({ relationshipId }),
    });
  }

  // Phase 2: Conclusion Management
  async deleteConclusion(entityType: string, entityId: string, conclusionId: string): Promise<any> {
    let base: string;
    switch (entityType) {
      case 'couple':
        base = `/tree/couple-relationships/${entityId}`;
        break;
      case 'parent-child':
        base = `/tree/child-and-parents-relationships/${entityId}`;
        break;
      default:
        base = `/tree/persons/${entityId}`;
    }
    return this.request(`${base}/conclusions/${conclusionId}`, {
      method: 'DELETE',
    });
  }

  // Healthcheck
  async healthcheck(): Promise<any> {
    try {
      const response = await this.request('/');
      return { status: 'ok', response };
    } catch (error) {
      return { status: 'error', error: String(error) };
    }
  }
}
