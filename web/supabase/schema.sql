create table if not exists public.studio_snapshots (
  workspace_id text primary key,
  tracks jsonb not null default '[]'::jsonb,
  playlists jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

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
