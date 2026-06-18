-- ============================================================
-- 006_analytics.sql
-- Catch A Tattoo — Analytics Data Collection
-- demand_events: Profile View, Schedule View, Instagram Click, City Click
-- search_logs: City/Style/Artist 검색 로그
-- analytics_snapshots: 월별 집계 (Sprint 5 pg_cron 대상)
-- ============================================================

-- ============================================================
-- 1. demand_events
--    비로그인도 수집 — user_id nullable, session_id 필수
-- ============================================================
create table public.demand_events (
  id          uuid primary key default uuid_generate_v4(),
  event_type  text not null check (
                event_type in (
                  'profile_view',
                  'schedule_view',
                  'instagram_click',
                  'city_click'
                )
              ),
  user_id     uuid references public.users(id) on delete set null,
  artist_id   uuid references public.artist_profiles(id) on delete set null,
  city_id     uuid references public.cities(id) on delete set null,
  session_id  text not null,
  created_at  timestamptz not null default now()
);

create index idx_demand_events_artist    on public.demand_events (artist_id, event_type, created_at desc);
create index idx_demand_events_city      on public.demand_events (city_id, event_type, created_at desc);
create index idx_demand_events_session   on public.demand_events (session_id, created_at desc);
create index idx_demand_events_type_date on public.demand_events (event_type, created_at desc);

-- ============================================================
-- 2. search_logs
--    비로그인도 수집 — user_id nullable, session_id 필수
-- ============================================================
create table public.search_logs (
  id           uuid primary key default uuid_generate_v4(),
  query_type   text not null check (
                 query_type in ('city','style','artist','combined')
               ),
  query_value  text,
  user_id      uuid references public.users(id) on delete set null,
  session_id   text not null,
  result_count int  not null default 0,
  filters_used jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index idx_search_logs_type_date  on public.search_logs (query_type, created_at desc);
create index idx_search_logs_value      on public.search_logs (query_value, query_type);
create index idx_search_logs_session    on public.search_logs (session_id, created_at desc);

-- ============================================================
-- 3. analytics_snapshots (Sprint 5 pg_cron 월별 집계용)
--    구조만 생성 — 집계 로직은 Sprint 5에서 추가
-- ============================================================
create table public.analytics_snapshots (
  id            uuid primary key default uuid_generate_v4(),
  snapshot_type text not null check (
                  snapshot_type in (
                    'city_follows',
                    'style_search',
                    'guest_work_count',
                    'artist_profile_views',
                    'city_search'
                  )
                ),
  target_id     text,          -- city slug, tag slug, artist_id 등
  period        text not null, -- 'YYYY-MM' 형식
  value         int  not null default 0,
  created_at    timestamptz not null default now(),
  unique (snapshot_type, target_id, period)
);

create index idx_snapshots_type_period on public.analytics_snapshots (snapshot_type, period desc);
create index idx_snapshots_target      on public.analytics_snapshots (target_id, snapshot_type, period desc);

-- ============================================================
-- 4. RLS
-- ============================================================
alter table public.demand_events      enable row level security;
alter table public.search_logs        enable row level security;
alter table public.analytics_snapshots enable row level security;

-- demand_events: 누구나 insert 가능 (비로그인 수집)
create policy "demand_events_insert_any"
  on public.demand_events for insert
  with check (true);

-- demand_events: 관리자만 읽기 (service role로 처리)
-- 일반 사용자 select 정책 없음 → service role만 접근 가능

-- search_logs: 누구나 insert 가능 (비로그인 수집)
create policy "search_logs_insert_any"
  on public.search_logs for insert
  with check (true);

-- search_logs: 관리자만 읽기 (service role로 처리)

-- analytics_snapshots: 누구나 읽기 (공개 집계 데이터)
create policy "analytics_snapshots_read_all"
  on public.analytics_snapshots for select
  using (true);

-- analytics_snapshots: 관리자만 수정 (service role로 처리)
