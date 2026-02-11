import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'http';
import { URL } from 'url';
import { FamilySearchClient } from './familysearch-client.js';
import { EncryptedTokenStore } from './token-store.js';

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
    const token = process.env.FAMILYSEARCH_TOKEN || this.tokenStore.loadToken();
    
    if (token) {
      this.client = new FamilySearchClient({
        accessToken: token,
        cache: this.cache,
      });
    }
  }

  private setupHandlers(): void {
    // Handler setup would go here - similar to stdio version
    // For brevity, importing from the main server would be better
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
