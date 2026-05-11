-- Migration: Add credit_usage table for per-user credit consumption tracking
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.credit_usage (
  id              bigserial PRIMARY KEY,
  user_id         text NOT NULL,
  credits_used    integer NOT NULL,
  remaining_after integer NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_usage_user_created_idx
  ON public.credit_usage(user_id, created_at DESC);
