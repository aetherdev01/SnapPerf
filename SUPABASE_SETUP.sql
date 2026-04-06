create table if not exists sp_releases (
  id           text primary key,
  title        text not null default '',
  version      text not null default '',
  tag          text not null default 'stable',
  description  text default '',
  download_url text default '',
  filename     text default '',
  file_size    bigint default 0,
  downloads    bigint default 0,
  mirrors      jsonb default '[]',
  release_date timestamptz default now()
);

alter table sp_releases enable row level security;

create policy "public_read_releases"   on sp_releases for select using (true);
create policy "public_insert_releases" on sp_releases for insert with check (true);
create policy "public_update_releases" on sp_releases for update using (true);
create policy "public_delete_releases" on sp_releases for delete using (true);

alter publication supabase_realtime add table sp_releases;