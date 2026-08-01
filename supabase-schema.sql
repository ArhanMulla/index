-- ============================================================
-- INDEX platform — complete database schema
-- Paste into: Supabase dashboard → SQL Editor → New query → Run
--
-- This is the ONE file you need. It's safe to run no matter what
-- state your database is currently in — brand new project, or an
-- existing one with tables already partly created — it brings
-- everything to the correct final state in a single pass.
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text,
  org text,
  skills text[] default '{}',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);


-- ---------- IDEAS ----------
-- Creates it fresh (with the correct "description" column) if it doesn't
-- exist yet. If it already exists, this line is simply skipped.
create table if not exists ideas (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade,
  type text,
  title text not null,
  description text,
  problem text,
  limitations text,
  skills text[] default '{}',
  team int default 1,
  max int default 4,
  timeline text,
  research_link text,
  work_link text,
  created_at timestamptz default now()
);

-- If an older, partially-created "ideas" table exists with the broken
-- unquoted "desc" column name, fix it now (properly quoted this time).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'ideas' and column_name = 'desc'
  ) then
    alter table ideas rename column "desc" to description;
  end if;
end $$;

alter table ideas enable row level security;

drop policy if exists "Ideas are viewable by everyone" on ideas;
create policy "Ideas are viewable by everyone" on ideas for select using (true);

drop policy if exists "Authenticated users can submit ideas" on ideas;
create policy "Authenticated users can submit ideas" on ideas for insert with check (auth.uid() = author_id);

drop policy if exists "Users can update their own ideas" on ideas;
create policy "Users can update their own ideas" on ideas for update using (auth.uid() = author_id);

drop policy if exists "Users can delete their own ideas" on ideas;
create policy "Users can delete their own ideas" on ideas for delete using (auth.uid() = author_id);


-- ---------- APPLICATIONS ----------
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references ideas(id) on delete cascade,
  applicant_id uuid references profiles(id) on delete cascade,
  message text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique (idea_id, applicant_id)
);

alter table applications enable row level security;

drop policy if exists "Applicants can view their own applications" on applications;
create policy "Applicants can view their own applications" on applications for select using (auth.uid() = applicant_id);

drop policy if exists "Idea authors can view applications to their ideas" on applications;
create policy "Idea authors can view applications to their ideas" on applications for select using (
  auth.uid() = (select author_id from ideas where ideas.id = idea_id)
);

drop policy if exists "Authenticated users can apply" on applications;
create policy "Authenticated users can apply" on applications for insert with check (auth.uid() = applicant_id);

drop policy if exists "Idea authors can update application status" on applications;
create policy "Idea authors can update application status" on applications for update using (
  auth.uid() = (select author_id from ideas where ideas.id = idea_id)
);


-- ---------- WAITLIST ----------
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;

drop policy if exists "Anyone can join the waitlist" on waitlist;
create policy "Anyone can join the waitlist" on waitlist for insert with check (true);


-- ---------- GRANTS ----------
-- The actual missing piece — RLS policies above only restrict access
-- on top of these. Without them, every request is "permission denied"
-- regardless of how correct the policies are.
grant usage on schema public to anon, authenticated;

grant select on profiles to anon;
grant select, insert, update on profiles to authenticated;

grant select on ideas to anon;
grant select, insert, update, delete on ideas to authenticated;

grant select, insert, update on applications to authenticated;

grant select, insert on waitlist to anon, authenticated;

notify pgrst, 'reload schema';

-- ============================================================
-- Done. Table Editor (left sidebar) should now show all four
-- tables: profiles, ideas, applications, waitlist.
-- ============================================================

-- ============================================================
-- Update: richer profiles (bio, CV/portfolio/LinkedIn, domains)
-- and a proper multi-question Apply form on applications.
-- All additive — safe to run again on an existing database.
-- ============================================================
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists cv_link text;
alter table profiles add column if not exists portfolio_link text;
alter table profiles add column if not exists linkedin_link text;
alter table profiles add column if not exists domains text[] default '{}';

alter table applications add column if not exists motivation text;
alter table applications add column if not exists contribution text;
alter table applications add column if not exists certificate_link text;
alter table applications add column if not exists portfolio_link text;
alter table applications add column if not exists contact_email text;

notify pgrst, 'reload schema';

-- ============================================================
-- Update: admin/moderation, verification badges, notifications,
-- post-acceptance chat, and outcome tracking. All additive.
-- ============================================================
alter table profiles add column if not exists is_admin boolean default false;
alter table profiles add column if not exists is_verified boolean default false;
alter table profiles add column if not exists verification_type text;

alter table ideas add column if not exists status text default 'open';
alter table ideas add column if not exists outcome_report text;
alter table ideas add column if not exists completed_at timestamptz;

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  related_idea_id uuid references ideas(id) on delete set null,
  read boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
drop policy if exists "Users see their own notifications" on notifications;
create policy "Users see their own notifications" on notifications for select using (auth.uid() = user_id);
drop policy if exists "Users can mark their own notifications read" on notifications;
create policy "Users can mark their own notifications read" on notifications for update using (auth.uid() = user_id);
drop policy if exists "Authenticated users can create notifications" on notifications;
create policy "Authenticated users can create notifications" on notifications for insert with check (auth.uid() is not null);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  idea_id uuid references ideas(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
drop policy if exists "Participants can view their messages" on messages;
create policy "Participants can view their messages" on messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Accepted collaborators can message each other" on messages;
create policy "Accepted collaborators can message each other" on messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from applications a join ideas i on i.id = a.idea_id
    where a.idea_id = messages.idea_id and a.status = 'accepted'
      and ((a.applicant_id = sender_id and i.author_id = recipient_id)
        or (a.applicant_id = recipient_id and i.author_id = sender_id))
  )
);

drop policy if exists "Admins can delete any idea" on ideas;
create policy "Admins can delete any idea" on ideas for delete using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
);

grant select, insert, update on notifications to authenticated;
grant select, insert on messages to authenticated;

notify pgrst, 'reload schema';

-- ============================================================
-- Update: profile pictures, file uploads (CV/portfolio/research
-- papers as real PDFs/docs), and fixing live chat sync.
-- ============================================================
alter table profiles add column if not exists avatar_url text;

-- Storage bucket for avatars, CVs, portfolios, and research papers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 10485760, array[
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg','image/png','image/webp'
])
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg','image/png','image/webp'
  ];

drop policy if exists "Public read access for uploads" on storage.objects;
create policy "Public read access for uploads" on storage.objects for select using (bucket_id = 'uploads');

drop policy if exists "Users can upload their own files" on storage.objects;
create policy "Users can upload their own files" on storage.objects for insert with check (
  bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update their own files" on storage.objects;
create policy "Users can update their own files" on storage.objects for update using (
  bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete their own files" on storage.objects;
create policy "Users can delete their own files" on storage.objects for delete using (
  bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Make sure live chat messages actually sync in real time between both people.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table messages;
  end if;
exception when others then
  raise notice 'Could not auto-enable realtime for messages — if chat feels delayed, enable it manually in Supabase Dashboard > Database > Replication.';
end $$;

notify pgrst, 'reload schema';
