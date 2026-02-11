# Family-MCP Project Summary

## Overview

This project implements a comprehensive Model Context Protocol (MCP) server for integrating FamilySearch.org genealogical data with AI assistants.

## Implementation Status: ✅ COMPLETE

### Core Features Implemented

1. **24 Production-Ready Tools** organized in 9 categories:
   - Person Management (2 tools)
   - Family Relationships (4 tools)
   - Sources & Citations (3 tools)
   - Historical Records (1 tool)
   - Memories & Media (2 tools)
   - GEDCOM Data Exchange (2 tools)
   - AI-Powered Research (5 tools)
   - Research Planning (1 tool)
   - Utilities (3 tools)

2. **Dual Transport Support**:
   - Stdio transport for MCP clients (Claude Desktop, etc.)
   - HTTP/SSE transport for web applications
   - Both transports share the same tool implementations

3. **Security**:
   - AES-256-GCM encryption for token storage
   - Scrypt key derivation for password-based encryption
   - Security warnings when using default passwords
   - No security vulnerabilities (CodeQL verified)
   - HTTPS-only API communication

4. **Performance**:
   - Built-in response caching (5-minute default TTL)
   - Configurable cache timeout
   - Cache management tools (get/clear)

5. **Type Safety**:
   - Full TypeScript implementation
   - Zod schemas for all tool inputs
   - Proper error handling throughout

6. **Documentation**:
   - README.md: Project overview and quickstart (200+ lines)
   - TOOLS.md: Complete reference for all 24 tools (400+ lines)
   - EXAMPLES.md: Usage examples and recipes (250+ lines)
   - CONFIGURATION.md: Configuration guide (250+ lines)
   - LICENSE: MIT license

## Project Structure

```
Family-MCP/
├── src/
│   ├── index.ts              # Main stdio server (240 lines)
│   ├── http-server.ts        # HTTP/SSE server (220 lines)
│   ├── familysearch-client.ts # API wrapper (180 lines)
│   ├── token-store.ts        # Encrypted storage (85 lines)
│   ├── tools.ts              # Shared tool definitions (480 lines)
│   └── schemas.ts            # Zod validation schemas (195 lines)
├── dist/                     # Compiled JavaScript (auto-generated)
├── test/
│   └── basic-test.js         # Basic functionality tests
├── README.md                 # Main documentation
├── TOOLS.md                  # Tool reference
├── EXAMPLES.md               # Usage examples
├── CONFIGURATION.md          # Configuration guide
├── LICENSE                   # MIT license
├── package.json              # NPM configuration
├── tsconfig.json             # TypeScript configuration
└── .gitignore               # Git ignore rules
```

## Build & Test Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start stdio server
npm start

# Start HTTP server
npm run start:http

# Development mode (watch)
npm run dev
```

## Configuration

### Required Environment Variables

- `FAMILYSEARCH_TOKEN`: FamilySearch OAuth access token

### Optional Environment Variables

- `FAMILY_MCP_PASSWORD`: Encryption password for token storage
- `PORT`: HTTP server port (default: 3000)
- `HOST`: HTTP server host (default: 0.0.0.0)
- `FAMILYSEARCH_BASE_URL`: API base URL (default: production API)

## Tool Categories & Counts

| Category | Count | Tools |
|----------|-------|-------|
| Person | 2 | person_get, people_search |
| Family | 4 | families_get, parents_get, children_get, spouses_get |
| Sources | 3 | sources_get, source_attach, source_detach |
| Records | 1 | records_search |
| Memories | 2 | memories_search, memory_upload |
| GEDCOM | 2 | gedcom_import, gedcom_export |
| AI Research | 5 | hints_generate, merges_suggest, match_explain_llm, hints_rank_llm, timeline_summary_llm |
| Planning | 1 | father_side_plan |
| Utility | 3 | cache_get, cache_clear, healthcheck |
| **Total** | **24** | |

## AI-Powered Features

The server includes several LLM-enhanced tools that provide intelligent analysis:

1. **match_explain_llm**: Analyzes why two person records might be the same individual
2. **hints_rank_llm**: Ranks research hints by relevance and importance
3. **timeline_summary_llm**: Generates narrative timelines from genealogical data
4. **hints_generate**: Creates research suggestions based on available data
5. **merges_suggest**: Identifies potential duplicate records for merging

## Architecture Highlights

### Shared Tools Module

Tool definitions are centralized in `src/tools.ts` and shared between both transport implementations. This ensures consistency and reduces code duplication.

### FamilySearch Client

The `FamilySearchClient` class wraps all FamilySearch API calls with:
- Automatic authentication header injection
- Response caching
- Error handling
- Type-safe method signatures

### Encrypted Token Store

The `EncryptedTokenStore` class provides:
- AES-256-GCM encryption
- Scrypt key derivation
- Random IVs and salts per encryption
- GCM authentication tags
- User warnings for weak passwords

## Testing

Basic test suite verifies:
- Token encryption/decryption correctness
- FamilySearch client initialization
- Cache functionality

All tests pass successfully.

## Security

- ✅ No security vulnerabilities (CodeQL verified)
- ✅ Strong encryption for sensitive data
- ✅ No secrets in code or version control
- ✅ HTTPS-only API communication
- ✅ Input validation on all tools
- ✅ Security warnings for weak configurations

## Dependencies

### Production Dependencies

- `@modelcontextprotocol/sdk`: ^1.0.4 - MCP protocol implementation
- `zod`: ^3.23.8 - Schema validation
- `node-fetch`: ^3.3.2 - HTTP client for API calls

### Development Dependencies

- `@types/node`: ^22.10.2 - Node.js type definitions
- `typescript`: ^5.7.2 - TypeScript compiler

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "familysearch": {
      "command": "node",
      "args": ["/path/to/Family-MCP/dist/index.js"],
      "env": {
        "FAMILYSEARCH_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Future Enhancement Opportunities

While the current implementation is complete and production-ready, potential enhancements could include:

1. Additional FamilySearch API endpoints
2. Batch operations for multiple persons
3. More sophisticated caching strategies
4. Rate limiting and request throttling
5. Comprehensive integration tests
6. Performance benchmarks
7. Docker containerization
8. CI/CD pipeline

## Code Quality Metrics

- **Total Lines of Code**: ~2,000+ (TypeScript)
- **Documentation**: ~1,100+ lines (Markdown)
- **Test Coverage**: Basic tests implemented
- **Build Status**: ✅ Passing
- **Security Scan**: ✅ No vulnerabilities
- **Code Review**: ✅ Addressed all feedback

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with Model Context Protocol SDK
- Integrates with FamilySearch.org API
- Uses Zod for runtime type validation

---

**Note**: This is an unofficial project and is not affiliated with or endorsed by FamilySearch International.

## Support & Contribution

- **Issues**: https://github.com/shelbeely/Family-MCP/issues
- **Pull Requests**: Welcome!
- **FamilySearch API**: https://developers.familysearch.org/
- **MCP Documentation**: https://modelcontextprotocol.io/
