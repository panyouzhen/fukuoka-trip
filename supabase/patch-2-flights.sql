-- 加在你已經建好的 DB 上，只新增 flights 表（其他表不受影響）
-- 貼到 Supabase SQL editor 執行一次即可

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

drop trigger if exists flights_updated_at on flights;
create trigger flights_updated_at before update on flights
  for each row execute function set_updated_at();

alter table flights enable row level security;
drop policy if exists "anon all" on flights;
create policy "anon all" on flights for all to anon using (true) with check (true);

alter publication supabase_realtime add table flights;
alter table flights replica identity full;
