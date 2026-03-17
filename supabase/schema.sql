create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.search_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  niche text not null,
  problem text not null,
  query text not null,
  provider text not null,
  match_mode text not null,
  result_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_search_usage_user_created_at
  on public.search_usage(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.search_usage enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can read their own usage" on public.search_usage;
create policy "Users can read their own usage"
  on public.search_usage
  for select
  to authenticated
  using (auth.uid() = user_id);
