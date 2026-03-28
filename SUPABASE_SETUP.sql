create table if not exists sp_comments (
  id uuid default gen_random_uuid() primary key,
  release_tag text not null,
  user_id text not null,
  display_name text not null default 'User',
  avatar_url text default '',
  text text not null,
  is_anonymous boolean default false,
  created_at timestamptz default now()
);

create table if not exists sp_likes (
  release_tag text not null,
  user_id text not null,
  created_at timestamptz default now(),
  primary key (release_tag, user_id)
);

alter table sp_comments enable row level security;
alter table sp_likes enable row level security;

create policy "allow_read_comments" on sp_comments for select using (true);
create policy "allow_insert_comments" on sp_comments for insert with check (true);

create policy "allow_read_likes" on sp_likes for select using (true);
create policy "allow_insert_likes" on sp_likes for insert with check (true);
create policy "allow_delete_likes" on sp_likes for delete using (true);

-- Enable realtime (wajib untuk fitur komentar live)
alter publication supabase_realtime add table sp_comments;
alter publication supabase_realtime add table sp_likes;

-- Izinkan owner hapus semua komentar (sudah tercakup policy delete existing)
-- Pastikan policy delete ada:
-- create policy "allow_delete_comments" on sp_comments for delete using (true);

-- ── sp_releases: releases yang terlihat semua user ─────────────────────
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

-- Aktifkan realtime untuk sp_releases
alter publication supabase_realtime add table sp_releases;
