# Developer Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (free tier works)
- API keys for: Anthropic, Pinecone, Voyage AI

## Quick Start

```bash
# Clone and install
git clone https://github.com/Vladislav-Voloshin/craftwell-health-adviser.git
cd craftwell-health-adviser
npm install

# Set up environment
cp .env.example .env.local   # then fill in your keys (see below)

# Run database migrations
# In the Supabase dashboard SQL editor, run:
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_restrict_content_rls.sql

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with the following:

### Required (Core)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Required (AI/Backend Routes)

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `PINECONE_API_KEY` | Pinecone vector database key |
| `PINECONE_INDEX` | Pinecone index name (default: `craftwell`) |
| `VOYAGE_API_KEY` | Voyage AI key for embeddings |

### Optional

| Variable | Description |
|----------|-------------|
| `YOUTUBE_API_KEY` | YouTube Data API key (for ingestion) |
| `ADMIN_API_KEY` | Bearer token for `/api/ingest` admin routes |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `http://localhost:3000`) |
| `LOG_LEVEL` | Pino log level (default: `debug` in dev, `info` in prod) |

Environment variables are validated at runtime by Zod schemas in `src/lib/env.ts`. The app exposes two validators:
- `coreEnv()` -- safe to call from any page (Supabase keys only)
- `serverEnv()` -- call from API routes only (includes all AI secrets)

## Available Scripts

```bash
npm run dev          # Start dev server (with Turbopack)
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npm run typecheck    # TypeScript check (tsc --noEmit)
npm test             # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright with interactive UI
```

## Database Setup

The app uses Supabase (PostgreSQL) with Row-Level Security. Run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` -- creates all tables, RLS policies, and seeds 10 protocol categories
2. `supabase/migrations/002_restrict_content_rls.sql` -- removes public read access on content tables (chunks, episodes, newsletters)

After running migrations, the database includes seed data for protocol categories (Sleep, Focus, Exercise, etc.).

## Ingestion Pipeline

To populate the knowledge base, use the admin ingestion API:

```bash
# Full pipeline (scrape, chunk, embed, extract protocols)
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"step": "full-pipeline"}'

# Or run individual steps:
# "scrape-podcasts", "scrape-newsletters", "chunk-podcasts",
# "chunk-newsletters", "embed", "extract-protocols"
```

## Deployment

The app is deployed to Vercel. Push to `main` triggers automatic deployment.

- Production URL: https://craftwell.vercel.app
- Set all environment variables in the Vercel dashboard
- Supabase connection works out of the box (no extra config needed)
