# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VERTEX is an ERP platform built with Nuxt 4, Vuetify 3, and Supabase. It provides a comprehensive admin dashboard with modules for users, invoices, ecommerce, logistics, calendar, kanban, and more. The application uses NextAuth for authentication with support for credentials and social providers (Google, Facebook).

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (with increased memory)
pnpm build

# Lint and fix code
pnpm lint

# Build iconify icons (runs automatically on postinstall)
pnpm build:icons

# Generate static site
pnpm generate
```

### Important Notes
- The build command uses `--max-old-space-size=8192` to allocate more memory due to the large codebase
- Icons are automatically built after install via the `postinstall` hook

## Architecture

### Core Structure

The project follows a modular architecture with custom path aliases:

- **`@core/`** - Reusable core components, utilities, and composables shared across the app
  - `@core/components/` - Base UI components (AppBar, Navigation, Cards, etc.)
  - `@core/utils/` - Shared utilities and validators
  - `@core/composable/` - Shared Vue composables
  - `@core/scss/` - Core SCSS styles

- **`@layouts/`** - Layout system with vertical and horizontal navigation
  - Contains `VerticalNavLayout.vue` and `HorizontalNavLayout.vue`
  - Layout plugins and stores for managing layout state

- **`pages/`** - Nuxt auto-routed pages
  - Organized by feature: `apps/`, `dashboards/`, `forms/`, `pages/`, etc.

- **`server/`** - Nuxt server-side code
  - `server/api/` - API endpoints
  - `server/fake-db/` - In-memory database for demo data (being migrated to Supabase)
  - `server/utils/` - Server utilities including auth helpers

- **`components/`** - Vue components auto-imported by Nuxt
  - `components/global/` - Globally available components

- **`navigation/`** - Navigation configuration
  - `navigation/vertical/` - Vertical nav menu items
  - `navigation/horizontal/` - Horizontal nav menu items

- **`plugins/`** - Nuxt plugins
  - `plugins/vuetify/` - Vuetify configuration
  - `plugins/casl/` - CASL ability-based access control
  - `plugins/iconify/` - Iconify icon setup

- **`middleware/`** - Nuxt middleware for route guards
  - `middleware/acl.global.ts` - Global ACL middleware

- **`stores/`** - Pinia stores for state management

### Path Aliases

```typescript
'@/*'         → Root directory
'@core/*'     → ./@core/*
'@layouts/*'  → ./@layouts/*
'@images/*'   → ./assets/images/*
'@styles/*'   → ./assets/styles/*
'@validators' → ./@core/utils/validators
'@db/*'       → ./server/fake-db/*
'@api-utils/*'→ ./server/utils/*
```

### Database & Backend

**Current State: Transitioning to Supabase**

- The app is migrating from `server/fake-db/` (in-memory data) to Supabase
- See `SUPABASE_MIGRATION_GUIDE.md` for detailed migration instructions
- Supabase client is available via `useSupabase()` composable in `utils/supabase.ts`

**Database Tables (Supabase):**
- `app_users` - Application users
- `invoices` & `invoice_clients` - Invoice management
- `ecommerce_products`, `ecommerce_customers`, `ecommerce_orders`, `ecommerce_reviews` - Ecommerce data
- `logistics_vehicles` - Logistics tracking
- `demo_auth_users` - Demo login users (legacy)
- `roles`, `permissions`, `role_permissions` - Authorization

**Server Utilities:**
- `server/utils/auth.ts` - Contains `setAuthOnlyRoute()` for protecting API routes
- `server/utils/paginateArray.ts` - Array pagination
- `server/utils/paginationMeta.ts` - Pagination metadata
- `server/utils/genId.ts` - ID generation

### Authentication

**NextAuth with JWT:**
- Config: `server/api/auth/[...].ts`
- Uses JWT tokens (signed with `AUTH_SECRET`)
- Supports Credentials (email/password), Google, and Facebook providers
- Session data includes: `username`, `fullName`, `avatar`, `role`, `abilityRules`

**Environment Variables:**
```bash
AUTH_ORIGIN=http://localhost:3000/api/auth  # Full URL to auth API
AUTH_SECRET=                                # JWT signing secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

**Important Auth Notes:**
- `nuxt.config.ts` sets `auth.baseURL` to `AUTH_ORIGIN` (must include `/api/auth`)
- `auth.globalAppMiddleware` is `false` - use route-specific middleware instead
- Protected API routes should use `setAuthOnlyRoute(event)` from `server/utils/auth.ts`

### Authorization (CASL)

- Uses `@casl/ability` and `@casl/vue` for role-based access control
- Ability rules stored in `userAbilityRules` cookie
- Plugin: `plugins/casl/index.ts`
- Global middleware: `middleware/acl.global.ts`

### UI Framework

**Vuetify 3:**
- Config: `plugins/vuetify/index.ts`
- Theme config: `themeConfig.ts`
- Supports light/dark themes (default: dark)
- Custom SCSS variables: `assets/styles/variables/_vuetify.scss`

**Iconify:**
- Icons built at compile time (see `plugins/iconify/build-icons.ts`)
- Generated CSS: `plugins/iconify/icons.css` (gitignored)
- Icons from: `@iconify-json/mdi`, `@iconify-json/ri`, `@iconify-json/bxl`

### State Management

- **Pinia** stores in `stores/`
- Layout state managed via `@layouts/stores/`

### Internationalization

- Module: `@nuxtjs/i18n`
- Config in `nuxt.config.ts` → `i18n.vueI18n: '../i18n.config.ts'`
- Supported languages: English (en), French (fr), Arabic (ar - RTL)
- Default locale: `en`

## Key Patterns

### API Development

When creating API endpoints in `server/api/`:

1. **Use Supabase** (preferred) over fake-db:
```typescript
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.from('table_name').select('*')

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
```

2. **Protect routes** with authentication:
```typescript
import { setAuthOnlyRoute } from '@/server/utils/auth'

export default defineEventHandler(async (event) => {
  const session = await setAuthOnlyRoute(event)
  // ... your logic
})
```

### Component Auto-Import

Nuxt auto-imports components from:
- `@/@core/components` (no prefix)
- `@/views/demos` (no prefix)
- `~/components/global` (globally available)
- `~/components` (no prefix)

### Composables Auto-Import

Auto-imported from:
- `./@core/utils`
- `./@core/composable/`
- `./plugins/*/composables/*`

### Environment Configuration

**Runtime Config:**
- Private keys (server-only): `AUTH_SECRET`, social auth secrets
- Public keys (client-exposed): `supabaseUrl`, `supabaseAnonKey`, `apiBaseUrl`, `mapboxAccessToken`

Access via:
```typescript
const config = useRuntimeConfig()
config.public.supabaseUrl  // client-side
config.AUTH_SECRET         // server-side only
```

## Special Considerations

### Build Configuration

- **Chunk size limit:** 5000 KB (large due to Vuetify)
- **Source maps:** Disabled until vuetify-loader issue #290 is resolved
- **Vite optimizeDeps:** Excludes `vuetify` to prevent issues
- **Custom elements:** `swiper-container` and `swiper-slide` registered as custom elements

### TypeScript

- **Typed Pages:** Experimental feature enabled (`experimental.typedPages: true`)
- **Path aliases** configured in both `tsconfig` and Vite config for consistency

### Known Issues

- Vuetify SSR compatibility requires `@ts-expect-error` comments in some provider imports
- Source maps disabled due to vuetify-loader bug

## Migration Notes

**Supabase Migration in Progress:**
- Refer to `SUPABASE_MIGRATION_GUIDE.md` for complete migration instructions
- When updating endpoints, transform snake_case DB fields to camelCase for frontend compatibility
- Use joins for related data (e.g., invoices with clients)

## Testing & Debugging

- ESLint config: `.eslintrc.cjs`
- Linting includes: `.ts`, `.js`, `.cjs`, `.vue`, `.tsx`, `.jsx` files
- Use `pnpm lint` to fix linting issues automatically
