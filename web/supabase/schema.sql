create table if not exists public.studio_snapshots (
  workspace_id text primary key,
  user_id text,
  tracks jsonb not null default '[]'::jsonb,
  playlists jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists studio_snapshots_user_id_idx
  on public.studio_snapshots(user_id)
  where user_id is not null;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists studio_snapshots_set_updated_at on public.studio_snapshots;
create trigger studio_snapshots_set_updated_at
before update on public.studio_snapshots
for each row
execute function public.set_updated_at();

-- Per-user settings (API key, credits)
create table if not exists public.user_settings (
  user_id           text primary key,
  suno_api_key      text,
  credits_purchased integer not null default 0,
  updated_at        timestamptz not null default now()
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_updated_at();
