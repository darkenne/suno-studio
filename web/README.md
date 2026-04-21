# Web App Setup

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

- `SUNO_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Supabase Table

Run `supabase/schema.sql` in your Supabase SQL editor to create `studio_snapshots`.

This table stores per-workspace snapshots for:

- `tracks`
- `playlists`
