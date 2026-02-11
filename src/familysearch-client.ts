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
