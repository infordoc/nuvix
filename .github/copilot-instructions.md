# Nuvix Copilot Instructions

Nuvix is a high-performance Backend-as-a-Service (BaaS) platform built with TypeScript, NestJS, PostgreSQL, and Bun. The key architectural insight is the **three-schema system** that provides different abstractions for varying developer needs.

## Core Architecture

### Multi-App Monorepo Structure
- **`apps/server/`** - Main BaaS API server (GraphQL + REST, port 4000)  
- **`apps/platform/`** - Multi-tenant admin platform (port 4100)
- **`libs/core/`** - Shared NestJS decorators, guards, services  
- **`libs/pg-meta/`** - PostgreSQL metadata and schema management
- **`libs/utils/`** - Shared types, constants, configurations

Use Turbo for orchestration: `bun dev`, `bun build`, `bun test`

### Three Schema System (Core Differentiator)
1. **Document Schema** (`SchemaType.Document`) - NoSQL-like collections with relationship filtering, similar to Appwrite
2. **Managed Schema** (`SchemaType.Managed`) - Auto-provisions `_perms` tables with Row-Level Security (RLS) for fine-grained permissions
3. **Unmanaged Schema** (`SchemaType.Unmanaged`) - Raw PostgreSQL access, similar to Supabase

Schema routes: `/v1/schemas/{schemaId}/` with different controllers per type.

## Key Development Patterns

### Custom Decorators System
Nuvix uses extensive custom NestJS decorators in `libs/core/src/decorators/`:

```typescript
// Standard controller pattern
@Controller({ version: ['1'], path: 'account' })
@Namespace('account')
@UseGuards(ProjectGuard)
export class AccountController {
  @Route({
    method: 'POST',
    scopes: ['account.create'],
    throttle: { limit: 10, ttl: 60 },
    sdk: {
      name: 'createAccount',
      descMd: 'docs/references/account/create-account.md',
    },
    resModel: AccountModel,
  })
  async createAccount(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc,
    @Body() createAccountDto: CreateAccountDto
  ): Promise<AccountModel> {
    // Implementation here
  }

  @Get('prefs', {
    scopes: ['account.read'],
    throttle: { limit: 100, ttl: 60 },
    sdk: {
      name: 'getAccountPreferences',
      descMd: 'docs/references/account/get-preferences.md',
    },
    resModel: AccountPreferencesModel,
  })
  async getPreferences(
    @AuthDatabase() db: Database,
    @User() user: UsersDoc
  ): Promise<AccountPreferencesModel> {
    // Implementation here
  }
}
```

**Essential decorators:**
- `@Route()` - Combines HTTP method, auth, scoping, throttling
- `@AuthDatabase()` / `@CurrentDatabase()` - Inject project-specific DB connection
- `@User()` - Current authenticated user
- `@Project()` - Current project context  
- `@Scope()` - Permission scoping (e.g., 'account', 'sessions.create')
- `@ResModel()` - Response serialization model
- `@AuditEvent()` - Automatic audit logging

### Database Context & Multi-tenancy
Projects are isolated via schema-based multi-tenancy. The `ProjectGuard` and hooks system (`libs/core/src/resolvers/hooks/`) inject the correct database context:

```typescript
// Each project gets isolated database access
@AuthDatabase() db: Database  // For auth operations
@ProjectPg() pg: DataSource   // For schema operations  
@CurrentSchema() pg: DataSource // For document/managed schemas
```

### Project Structure Conventions
- Controllers in `{module}/{module}.controller.ts` 
- Services in `{module}/{module}.service.ts`
- DTOs in `{module}/DTO/` directory
- Route paths follow REST + custom patterns: `/v1/account`, `/v1/schemas/:schemaId/collections`

## Build & Development Workflow

### Local Development
```bash
bun install                    # Install dependencies
bun dev                       # Start all apps in watch mode  
docker compose up             # Start PostgreSQL + Redis + PGCat
bun gen:types                 # Generate database types from nuvix-db.config.ts
```

### Docker Production
Uses multi-stage builds with `merge-pkg.js` script that consolidates workspace dependencies into standalone deployable packages. Each app gets its own container.

### Key Commands
- `bun turbo build --filter=@nuvix/{app}` - Build specific app
- `scripts/merge-pkg.js {appName}` - Prepare deployment package  
- `bun test` - Run tests across workspace
- `bun lint` / `bun format` - Code quality

## External Dependencies & Integrations

### Database Layer
- **Primary:** PostgreSQL with custom connection pooling via PGCat
- **ORM:** Custom Database class (`@nuvix/db`)
- **Schema Management:** `@nuvix/pg-meta` for introspection and DDL operations
- **Type Generation:** Custom system generates TypeScript types from schema definitions

### Background Processing  
Uses BullMQ with Redis for:
- Email/SMS via `@nuvix/messaging`
- Audit logging (`AuditsQueue`)
- Database schema initialization (`DatabasesQueue`)
- Statistics collection (`StatsQueue`)

### Storage & Assets
- File uploads via `@nuvix/storage` with S3/local adapters
- Static assets in `assets/` directory (avatars, locale templates, SQL scripts)
- Chunked upload support with Sharp for image processing

## Common Pitfalls & Conventions

1. **Schema Type Guards** - Use `DocSchemaGuard` for document schema routes, prevents access to wrong schema types

2. **Response Models** - Always use `@ResModel()` with predefined models from `libs/core/src/helper/response.helper.ts`

3. **Multi-replace Edits** - Use `multi_replace_string_in_file` for multiple changes rather than sequential `replace_string_in_file` calls

4. **Database Connections** - Never directly import database connections; use decorators to get project-scoped instances

5. **Type Generation** - After schema changes, run `bun gen:types` to update TypeScript definitions

6. **Environment Variables** - Apps use both `.env` and app-specific `.env.{app}` files in Docker

The architecture prioritizes developer experience with the flexible schema system while maintaining security through the permission system and multi-tenancy isolation.
