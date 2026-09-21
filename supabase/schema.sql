-- 福岡旅遊行程規劃 — 資料模型
-- 這是已經在 Supabase 上建好的版本（by 潘），存在 repo 裡備查／重建用。
-- 若要在新專案重建，直接整份貼到 Supabase SQL editor 執行即可。

-- 天數
create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text,
  region text,
  note text
);

-- 行程／候選景點（day_id 為空 = 在候選清單）
create table if not exists stops (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references days(id) on delete set null,
  order_index numeric not null default 0,
  time text,
  name text not null,
  type text not null default 'other'
    check (type in ('eat','see','buy','transport','other')),
  region text,
  address text,
  note text,
  hours text,
  map_url text,
  needs_booking boolean not null default false,
  image_url text,
  who_wants text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stops_day_order_idx on stops(day_id, order_index);

-- 想買清單
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  who text,
  store text,
  stop_id uuid references stops(id) on delete set null,
  price_jpy integer,
  note text,
  image_url text,
  bought boolean not null default false,
  created_at timestamptz not null default now()
);

-- 待辦提醒
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 航班資訊（總覽頁上方用）
create table if not exists flights (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('depart', 'return')),
  who text[] not null default '{}',
  date date,
  airline text,
  flight_no text,
  dep_airport text,
  dep_time text,
  arr_airport text,
  arr_time text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 自動更新 updated_at
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
drop trigger if exists stops_updated_at on stops;
create trigger stops_updated_at before update on stops
  for each row execute function set_updated_at();
drop trigger if exists flights_updated_at on flights;
create trigger flights_updated_at before update on flights
  for each row execute function set_updated_at();

-- 開啟 RLS，並允許網頁（anon）讀寫
alter table days enable row level security;
alter table stops enable row level security;
alter table wishlist enable row level security;
alter table todos enable row level security;
alter table flights enable row level security;

drop policy if exists "anon all" on days;
create policy "anon all" on days     for all to anon using (true) with check (true);
drop policy if exists "anon all" on stops;
create policy "anon all" on stops    for all to anon using (true) with check (true);
drop policy if exists "anon all" on wishlist;
create policy "anon all" on wishlist for all to anon using (true) with check (true);
drop policy if exists "anon all" on todos;
create policy "anon all" on todos    for all to anon using (true) with check (true);
drop policy if exists "anon all" on flights;
create policy "anon all" on flights  for all to anon using (true) with check (true);

-- 即時同步
alter publication supabase_realtime add table days, stops, wishlist, todos, flights;
alter table stops replica identity full;
alter table wishlist replica identity full;
alter table todos replica identity full;
alter table flights replica identity full;

-- 圖片儲存桶
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images read" on storage.objects;
create policy "images read"   on storage.objects for select using (bucket_id = 'images');
drop policy if exists "images upload" on storage.objects;
create policy "images upload" on storage.objects for insert to anon with check (bucket_id = 'images');
drop policy if exists "images delete" on storage.objects;
create policy "images delete" on storage.objects for delete to anon using (bucket_id = 'images');
