-- Migration: Add user_settings table for per-user API key and credits
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id           text PRIMARY KEY,
  suno_api_key      text,
  credits_purchased integer NOT NULL DEFAULT 0,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_user_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_settings_set_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_user_settings_updated_at();
