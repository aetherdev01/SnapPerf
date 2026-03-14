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
