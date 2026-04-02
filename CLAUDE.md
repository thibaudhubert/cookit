# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cookit is a social recipe sharing platform built with Next.js 16, React 19, Supabase, and TypeScript. Users can create, share, discover recipes, follow friends, like/comment on recipes, and bookmark favorites.

## Development Commands

```bash
# Start development server (uses Turbopack)
pnpm dev

# Type check without emitting files
pnpm tsc --noEmit

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Database Management

```bash
# Link local project to Supabase (requires SUPABASE_ACCESS_TOKEN env var)
export SUPABASE_ACCESS_TOKEN="your_token"
supabase db push

# Run seed scripts (requires .env.local with Supabase credentials)
pnpm tsx scripts/seed-famous-chefs-with-auth.ts
pnpm tsx scripts/check-tables.ts
```

## Architecture

### Supabase Client Pattern

**Critical**: The codebase uses two separate Supabase clients that must never be confused:

- **Server Components/Server Actions**: `import { createClient } from '@/lib/supabase/server'` - Uses SSR cookies, must be awaited
- **Client Components**: `import { createClient } from '@/lib/supabase/client'` - Browser client, instantiated in event handlers/useEffect only

Never instantiate the client-side Supabase client during component render (pre-rendering). Always call `createClient()` inside event handlers or `useEffect` hooks.

### Database Query Patterns

#### Foreign Key Disambiguation

When querying tables with multiple foreign key relationships to the same table (e.g., `recipes` → `profiles`), always specify the exact FK using the `!` syntax:

```typescript
// ❌ WRONG - Causes PGRST201 ambiguous relationship error
.select('*, author:profiles(*)')

// ✅ CORRECT - Explicit FK specification
.select('*, author:profiles!recipes_author_id_fkey(*)')
```

The `recipes` table has multiple relationships to `profiles` (author_id, via likes, via bookmarks), so disambiguation is required.

#### RPC Functions for Performance

Use the `get_feed_recipes` RPC function instead of manual queries when fetching recipe lists with social data (likes, bookmarks, comments). This function:
- Avoids N+1 queries
- Aggregates like/comment counts efficiently
- Returns user-specific interaction data (is_liked_by_me, is_bookmarked_by_me)
- Supports pagination, search, and friend filtering

```typescript
const { data: recipes } = await supabase.rpc('get_feed_recipes', {
  p_user_id: user.id,
  p_limit: 20,
  p_offset: 0,
  p_search_query: searchQuery || null,
  p_friends_only: false, // Set false to show all recipes, true for friends only
})
```

### Error Handling

#### PostgREST Error Codes

When handling Supabase errors, distinguish between error types:

- `PGRST116`: Resource not found (404) - Call `notFound()`
- `PGRST201`: Ambiguous relationship - Fix with FK disambiguation
- Other errors: Real database/query errors - Log and throw

```typescript
if (error) {
  if (error.code === 'PGRST116') {
    notFound()
  }
  console.error('Database error:', error)
  throw new Error(`Failed to fetch: ${error.message}`)
}
```

**Never** blindly convert all errors to 404s. This hides real bugs.

#### Image Error Handling

Use the `RecipeImage` component for all recipe images. It provides:
- Automatic fallback to placeholder (🍴) for missing/invalid/failed images
- Error state tracking with `useState` and `onError` handler
- Configurable fallback sizes (small/medium/large)
- Lazy loading support

```typescript
import RecipeImage from '@/components/RecipeImage'

<RecipeImage
  src={recipe.image_url}
  alt={recipe.title}
  className="w-full h-80 object-cover"
  fallbackClassName="w-full h-80"
  fallbackSize="large"
/>
```

### App Structure

```
app/
├── auth/page.tsx              # Sign in/up with recipe showcase
├── feed/page.tsx              # Personalized feed (following + own recipes)
├── explore/page.tsx           # Discover all public recipes
├── recipes/
│   ├── new/page.tsx           # Create recipe form
│   └── [id]/page.tsx          # Recipe detail page
├── profile/
│   ├── [username]/page.tsx    # User profile with recipes
│   └── [username]/bookmarks/page.tsx
├── notifications/page.tsx
└── settings/profile/page.tsx

components/
├── RecipeCard.tsx             # Feed/explore recipe card with interactions
├── RecipeCardGrid.tsx         # Grid layout for profile pages
├── TrendingRecipes.tsx        # Horizontal scroll trending section
├── RecipeImage.tsx            # Image with error handling/fallback
├── CommentSection.tsx
└── ui/                        # Reusable UI components

lib/
├── supabase/
│   ├── client.ts              # Browser client (client components)
│   └── server.ts              # SSR client (server components)
└── types/
    └── recipe.ts              # TypeScript interfaces

supabase/migrations/           # Database schema migrations
scripts/                       # Database seed/utility scripts
```

### Key Pages

- **`/auth`**: Split-screen auth with recipe showcase images (desktop) or stacked (mobile)
- **`/feed`**: Personalized feed showing recipes from friends + own recipes
- **`/explore`**: Discovery page with search, showing ALL recipes (public + private)
- **`/recipes/[id]`**: Recipe detail with ingredients, steps, comments, like/bookmark interactions

### TypeScript Types

Two main recipe types based on context:

- `RecipeWithSocialData`: Used in lists/feeds, includes aggregated social data (like_count, comment_count, is_liked_by_me)
- `RecipeWithDetails`: Used on detail pages, includes full author profile, ingredients array, steps array

## Row Level Security (RLS)

All tables use RLS policies. The `get_feed_recipes` function uses `SECURITY DEFINER` to bypass RLS for efficient queries. Direct table access requires proper RLS policies.

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_cli_access_token  # Only for DB push operations
```

## Common Gotchas

1. **Dev server cache**: If you see "Compaction failed" errors, kill all dev servers on ports 3000/3001, remove `.next` directory, restart
2. **Empty database**: Run seed script if recipes aren't appearing: `pnpm tsx scripts/seed-famous-chefs-with-auth.ts`
3. **Client instantiation**: Never call `createClient()` from `@/lib/supabase/client` during component render - only in handlers/effects
4. **Recipe 404s**: Usually caused by ambiguous FK relationships - use explicit `!recipes_author_id_fkey` syntax
5. **Broken images**: Always use `RecipeImage` component instead of raw `<img>` tags
