# Configuration Guide

This guide explains all configuration options for the FamilySearch MCP server.

## Environment Variables

### Required

#### FAMILYSEARCH_TOKEN

Your FamilySearch OAuth access token. Required to authenticate with the FamilySearch API.

```bash
export FAMILYSEARCH_TOKEN="your-access-token-here"
```

**How to get a token:**
1. Go to [FamilySearch Developers](https://www.familysearch.org/developers/)
2. Create an application
3. Use the OAuth flow to obtain an access token
4. Token will look like: `USYS1234567890ABCDEF`

### Optional

#### FAMILY_MCP_PASSWORD

Password used to encrypt/decrypt tokens stored locally.

```bash
export FAMILY_MCP_PASSWORD="your-secure-password"
```

**Default:** `"default-password-change-me"`

**Security Note:** Change this to a strong password in production.

#### FAMILYSEARCH_BASE_URL

Base URL for the FamilySearch API.

```bash
export FAMILYSEARCH_BASE_URL="https://api.familysearch.org/platform"
```

**Default:** `"https://api.familysearch.org/platform"`

**Sandbox:** Use `"https://sandbox.familysearch.org/platform"` for testing

#### PORT (HTTP server only)

Port number for the HTTP server.

```bash
export PORT=3000
```

**Default:** `3000`

#### HOST (HTTP server only)

Host address to bind the HTTP server.

```bash
export HOST="0.0.0.0"
```

**Default:** `"0.0.0.0"` (all interfaces)

## Token Storage

### Encrypted Token Store

The server can store your FamilySearch token encrypted on disk at `~/.family-mcp-tokens`.

**Save a token:**
```javascript
import { EncryptedTokenStore } from './dist/token-store.js';

const store = new EncryptedTokenStore('your-password');
store.saveToken('your-familysearch-token');
```

**Load a token:**
```javascript
const token = store.loadToken();
```

**Delete stored token:**
```javascript
store.deleteToken();
```

### Security Features

- **Encryption:** AES-256-GCM
- **Key Derivation:** scrypt with random salt
- **Authentication:** GCM authentication tag
- **IV:** Random 16-byte initialization vector per encryption

## Cache Configuration

The server includes built-in response caching to reduce API calls.

**Default timeout:** 5 minutes (300,000 ms)

**Modify in code:**
```typescript
const client = new FamilySearchClient({
  accessToken: token,
  cache: this.cache,
  cacheTimeout: 600000, // 10 minutes in milliseconds
});
```

**Clear cache via tool:**
```json
{
  "name": "cache_clear",
  "arguments": {}
}
```

## MCP Client Configuration

### Claude Desktop

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "familysearch": {
      "command": "node",
      "args": ["/absolute/path/to/Family-MCP/dist/index.js"],
      "env": {
        "FAMILYSEARCH_TOKEN": "your-access-token",
        "FAMILY_MCP_PASSWORD": "your-password"
      }
    }
  }
}
```

### Other MCP Clients

For clients that support stdio transport:

```bash
node /path/to/Family-MCP/dist/index.js
```

For clients that support HTTP/SSE transport:

```bash
# Start HTTP server
PORT=3000 node /path/to/Family-MCP/dist/http-server.js

# Connect to: http://localhost:3000/sse
```

## Production Configuration

### Security Checklist

- [ ] Set a strong `FAMILY_MCP_PASSWORD`
- [ ] Never commit tokens to version control
- [ ] Use environment variables or encrypted storage
- [ ] Restrict file permissions on token store (`chmod 600 ~/.family-mcp-tokens`)
- [ ] Use HTTPS if exposing HTTP server to network
- [ ] Implement rate limiting if serving multiple users
- [ ] Monitor API usage to stay within FamilySearch limits

### Performance Tuning

**Increase cache timeout for stable data:**
```typescript
cacheTimeout: 3600000 // 1 hour
```

**Decrease cache timeout for frequently changing data:**
```typescript
cacheTimeout: 60000 // 1 minute
```

**Clear cache periodically:**
Schedule regular cache clearing if memory is a concern.

### Monitoring

**Health check endpoint (HTTP mode):**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

**API health check (via tool):**
```json
{
  "name": "healthcheck",
  "arguments": {}
}
```

## Troubleshooting

### Token Issues

**Problem:** "FamilySearch client not initialized"

**Solution:** Ensure `FAMILYSEARCH_TOKEN` is set or token is saved in encrypted store.

**Problem:** Token decryption fails

**Solution:** Verify `FAMILY_MCP_PASSWORD` matches the password used to encrypt.

### API Issues

**Problem:** 401 Unauthorized

**Solution:** Token is invalid or expired. Get a new token.

**Problem:** 429 Too Many Requests

**Solution:** You've hit rate limits. Wait or implement request throttling.

**Problem:** 403 Forbidden

**Solution:** Check token permissions and API endpoint access.

### Connection Issues

**Problem:** Cannot connect to FamilySearch API

**Solution:** Check internet connection and `FAMILYSEARCH_BASE_URL`.

**Problem:** HTTP server won't start

**Solution:** Check if port is already in use. Try a different port.

## Advanced Configuration

### Custom API Client

You can extend the `FamilySearchClient` class for custom behavior:

```typescript
import { FamilySearchClient } from './dist/familysearch-client.js';

class CustomClient extends FamilySearchClient {
  async request(endpoint: string, options?: any): Promise<any> {
    // Add custom logging, metrics, etc.
    console.log(`API Request: ${endpoint}`);
    return super.request(endpoint, options);
  }
}
```

### Custom Transport

You can create custom transports for different protocols:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// Import your custom transport
```

## Getting Help

- **Documentation:** Check README.md and EXAMPLES.md
- **FamilySearch API Docs:** https://www.familysearch.org/developers/docs/api/
- **MCP Documentation:** https://modelcontextprotocol.io/
- **Issues:** https://github.com/shelbeely/Family-MCP/issues
