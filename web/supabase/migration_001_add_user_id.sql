-- Migration: Add user_id column for per-account data isolation
-- Run this in the Supabase SQL Editor

ALTER TABLE public.studio_snapshots
  ADD COLUMN IF NOT EXISTS user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS studio_snapshots_user_id_idx
  ON public.studio_snapshots(user_id)
  WHERE user_id IS NOT NULL;
