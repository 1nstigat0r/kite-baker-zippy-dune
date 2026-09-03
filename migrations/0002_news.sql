create table if not exists briefings (
  id text primary key,
  hour_label text not null,
  date_label text not null,
  generated_at timestamptz not null default now(),
  payload text not null,
  status text not null default 'ready',
  error text
);

create table if not exists ticker_items (
  id text primary key,
  title text not null,
  title_he text,
  source text not null,
  url text not null,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  arena text
);

create index if not exists ticker_items_published_idx
  on ticker_items (published_at desc nulls last);

create table if not exists seen_stories (
  fingerprint text primary key,
  first_seen timestamptz not null default now(),
  briefing_id text
);

create table if not exists gen_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
