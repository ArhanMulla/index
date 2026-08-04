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

-- ============================================================
-- Update: real group chat (was 1:1, now a shared team thread),
-- and the practice project library (Forage-style demo projects).
-- ============================================================

-- Group chat: anyone on the team (idea author + every accepted
-- applicant) can read and post in one shared thread per idea.
drop policy if exists "Participants can view their messages" on messages;
drop policy if exists "Accepted collaborators can message each other" on messages;
drop policy if exists "Team members can view idea messages" on messages;
drop policy if exists "Team members can send idea messages" on messages;

create policy "Team members can view idea messages" on messages for select using (
  exists (select 1 from ideas i where i.id = messages.idea_id and i.author_id = auth.uid())
  or exists (select 1 from applications a where a.idea_id = messages.idea_id and a.applicant_id = auth.uid() and a.status = 'accepted')
);

create policy "Team members can send idea messages" on messages for insert with check (
  auth.uid() = sender_id
  and (
    exists (select 1 from ideas i where i.id = messages.idea_id and i.author_id = auth.uid())
    or exists (select 1 from applications a where a.idea_id = messages.idea_id and a.applicant_id = auth.uid() and a.status = 'accepted')
  )
);

-- Practice Project Library
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null, type text, description text, logo_color text default '#4C6FEF',
  created_at timestamptz default now()
);
alter table organizations enable row level security;
drop policy if exists "Organizations are viewable by everyone" on organizations;
create policy "Organizations are viewable by everyone" on organizations for select using (true);
drop policy if exists "Admins can manage organizations" on organizations;
create policy "Admins can manage organizations" on organizations for all
  using (exists(select 1 from profiles p where p.id=auth.uid() and p.is_admin=true))
  with check (exists(select 1 from profiles p where p.id=auth.uid() and p.is_admin=true));

create table if not exists practice_projects (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade,
  title text not null, description text, skills text[] default '{}',
  common_problems text[] default '{}', difficulty text default 'Intermediate', estimated_hours int default 10,
  created_at timestamptz default now()
);
alter table practice_projects enable row level security;
drop policy if exists "Practice projects are viewable by everyone" on practice_projects;
create policy "Practice projects are viewable by everyone" on practice_projects for select using (true);
drop policy if exists "Admins can manage practice projects" on practice_projects;
create policy "Admins can manage practice projects" on practice_projects for all
  using (exists(select 1 from profiles p where p.id=auth.uid() and p.is_admin=true))
  with check (exists(select 1 from profiles p where p.id=auth.uid() and p.is_admin=true));

create table if not exists practice_completions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references practice_projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(project_id, user_id)
);
alter table practice_completions enable row level security;
drop policy if exists "Users can view their own completions" on practice_completions;
create policy "Users can view their own completions" on practice_completions for select using (auth.uid() = user_id);
drop policy if exists "Users can mark their own completions" on practice_completions;
create policy "Users can mark their own completions" on practice_completions for insert with check (auth.uid() = user_id);

grant select on organizations, practice_projects to anon, authenticated;
grant insert, update, delete on organizations, practice_projects to authenticated;
grant select, insert on practice_completions to authenticated;

-- A few starter practice projects so the library isn't empty on day one.
insert into organizations (name, type, description, logo_color) values
  ('GreenTech Energy Co.', 'Industry', 'Renewable energy and sustainability solutions across the UAE.', '#E2683F'),
  ('Applied AI Research Lab', 'Academia', 'University-affiliated lab focused on applied machine learning research.', '#9B59D6'),
  ('Urban Mobility Solutions', 'Industry', 'Smart transportation and logistics technology.', '#4C6FEF')
on conflict do nothing;

insert into practice_projects (organization_id, title, description, skills, common_problems, difficulty, estimated_hours)
select id, 'Solar Panel Efficiency Predictor', 'Build a model that predicts solar panel output degradation based on environmental factors — the kind of first task a new data analyst here would actually get.', array['Python','Machine Learning','Data Analysis'], array['Messy, incomplete sensor data with gaps','Conflicting readings from different sensor batches','Stakeholders wanting a dashboard, not just a model'], 'Intermediate', 12
from organizations where name = 'GreenTech Energy Co.'
on conflict do nothing;

insert into practice_projects (organization_id, title, description, skills, common_problems, difficulty, estimated_hours)
select id, 'Arabic Dialect Classifier', 'Build a simple classifier that distinguishes between Gulf Arabic dialects from short text samples — modeled on real early-stage research tasks.', array['Python','Arabic NLP','Data Analysis'], array['Very limited labeled training data','Dialects blending in real text','Balancing accuracy against overfitting to the dataset'], 'Advanced', 18
from organizations where name = 'Applied AI Research Lab'
on conflict do nothing;

insert into practice_projects (organization_id, title, description, skills, common_problems, difficulty, estimated_hours)
select id, 'Last-Mile Delivery Route Optimizer', 'Design a route optimization approach for a fleet of delivery vehicles across a dense urban area.', array['Python','Data Analysis','Urban Planning'], array['Real-world traffic data is noisy and delayed','Drivers deviate from optimal routes for real reasons','Balancing speed against fuel cost'], 'Beginner', 8
from organizations where name = 'Urban Mobility Solutions'
on conflict do nothing;

notify pgrst, 'reload schema';
