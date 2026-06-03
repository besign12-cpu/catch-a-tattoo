-- ============================================================
-- 001_init.sql
-- Catch A Tattoo — 전체 스키마 초기 설정
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. users
-- auth.users 와 1:1. 가입 트리거로 자동 생성.
-- ============================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  username      text unique,
  avatar_url    text,
  role          text not null default 'customer'
                  check (role in ('customer', 'artist', 'admin')),
  base_city     text,
  base_country  char(2),
  push_token    text,
  created_at    timestamptz not null default now()
);

-- auth 가입 시 public.users 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. artist_profiles
-- ============================================================
create table public.artist_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.users(id) on delete set null,
  display_name      text not null,
  instagram_handle  text unique,
  bio               text,
  base_city         text,
  base_country      char(2),
  city_lat          decimal(9,6),
  city_lng          decimal(9,6),
  is_claimed        boolean not null default false,
  is_verified       boolean not null default false,
  contact_type      text not null default 'instagram'
                      check (contact_type in ('instagram','email','website')),
  contact_value     text,
  created_at        timestamptz not null default now()
);

create index idx_artist_base_city on public.artist_profiles (base_city, base_country);
create index idx_artist_instagram on public.artist_profiles (instagram_handle);
create index idx_artist_verified  on public.artist_profiles (is_verified, is_claimed);

-- ============================================================
-- 3. tags (고정 목록 — 관리자만 추가)
-- ============================================================
create table public.tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  slug       text not null unique,
  group_type text not null check (group_type in ('color','main','art'))
);

-- ============================================================
-- 4. artist_tags
-- ============================================================
create table public.artist_tags (
  artist_id         uuid not null references public.artist_profiles(id) on delete cascade,
  tag_id            uuid not null references public.tags(id) on delete cascade,
  other_description text,
  primary key (artist_id, tag_id)
);

create index idx_artist_tags_tag on public.artist_tags (tag_id);

-- ============================================================
-- 5. portfolio_items (최대 3장)
-- ============================================================
create table public.portfolio_items (
  id          uuid primary key default uuid_generate_v4(),
  artist_id   uuid not null references public.artist_profiles(id) on delete cascade,
  image_url   text not null,
  sort_order  int not null default 0 check (sort_order between 0 and 2),
  created_at  timestamptz not null default now()
);

create index idx_portfolio_artist on public.portfolio_items (artist_id, sort_order);

-- ============================================================
-- 6. guest_schedules
-- ============================================================
create table public.guest_schedules (
  id            uuid primary key default uuid_generate_v4(),
  artist_id     uuid not null references public.artist_profiles(id) on delete cascade,
  city          text not null,
  country       char(2) not null,
  city_lat      decimal(9,6) not null,
  city_lng      decimal(9,6) not null,
  region        text not null check (region in ('asia','europe','americas','other')),
  start_date    date not null,
  end_date      date not null,
  note          text,
  contact_type  text not null default 'instagram'
                  check (contact_type in ('instagram','email','website')),
  contact_value text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint valid_dates check (end_date >= start_date)
);

create index idx_schedules_city     on public.guest_schedules (city, country);
create index idx_schedules_dates    on public.guest_schedules (start_date, end_date);
create index idx_schedules_region   on public.guest_schedules (region, is_active);
create index idx_schedules_artist   on public.guest_schedules (artist_id, is_active);

-- 자동 비활성화: 종료일이 지난 일정 처리 (pg_cron으로 호출)
create or replace function public.deactivate_expired_schedules()
returns void
language sql
as $$
  update public.guest_schedules
  set is_active = false
  where is_active = true
    and end_date < current_date;
$$;

-- ============================================================
-- 7. follows
-- ============================================================
create table public.follows (
  id          uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.users(id) on delete cascade,
  artist_id   uuid not null references public.artist_profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (follower_id, artist_id)
);

create index idx_follows_artist   on public.follows (artist_id);
create index idx_follows_follower on public.follows (follower_id);

-- ============================================================
-- 8. city_follows (Bring This Artist)
-- ============================================================
create table public.city_follows (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  artist_id   uuid not null references public.artist_profiles(id) on delete cascade,
  city        text not null,
  country     char(2) not null,
  created_at  timestamptz not null default now(),
  unique (user_id, artist_id, city)
);

create index idx_city_follows_artist_city on public.city_follows (artist_id, city);

-- 수요 집계 캐시
create table public.city_demand_cache (
  artist_id      uuid not null references public.artist_profiles(id) on delete cascade,
  city           text not null,
  country        char(2) not null,
  follower_count int not null default 0,
  updated_at     timestamptz not null default now(),
  primary key (artist_id, city)
);

-- atomic increment
create or replace function public.increment_city_demand(
  p_artist_id uuid,
  p_city      text,
  p_country   char
)
returns void
language sql
as $$
  insert into public.city_demand_cache (artist_id, city, country, follower_count)
  values (p_artist_id, p_city, p_country, 1)
  on conflict (artist_id, city)
  do update set
    follower_count = city_demand_cache.follower_count + 1,
    updated_at     = now();
$$;

-- atomic decrement
create or replace function public.decrement_city_demand(
  p_artist_id uuid,
  p_city      text
)
returns void
language sql
as $$
  update public.city_demand_cache
  set follower_count = greatest(follower_count - 1, 0),
      updated_at     = now()
  where artist_id = p_artist_id and city = p_city;
$$;

-- ============================================================
-- 9. notifications
-- ============================================================
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  artist_id   uuid references public.artist_profiles(id) on delete set null,
  schedule_id uuid references public.guest_schedules(id) on delete set null,
  type        text not null check (type in (
                'new_schedule',
                'city_schedule',
                'demand_milestone',
                'claim_approved',
                'claim_rejected'
              )),
  payload     jsonb not null default '{}',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notif_user   on public.notifications (user_id, is_read, created_at desc);
create index idx_notif_artist on public.notifications (artist_id);

-- ============================================================
-- 10. demand_notifications (임계값 중복 발송 방지)
-- ============================================================
create table public.demand_notifications (
  id          uuid primary key default uuid_generate_v4(),
  artist_id   uuid not null references public.artist_profiles(id) on delete cascade,
  city        text not null,
  threshold   int not null,
  sent_at     timestamptz not null default now(),
  unique (artist_id, city, threshold)
);

-- ============================================================
-- 11. claim_requests
-- ============================================================
create table public.claim_requests (
  id               uuid primary key default uuid_generate_v4(),
  artist_id        uuid not null references public.artist_profiles(id) on delete cascade,
  requested_by     uuid not null references public.users(id) on delete cascade,
  dm_token         text not null unique,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  rejection_reason text,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

create index idx_claim_status   on public.claim_requests (status);
create index idx_claim_artist   on public.claim_requests (artist_id);

-- ============================================================
-- 12. city_pin_summary (Materialized View — 지도용)
-- ============================================================
create materialized view public.city_pin_summary as
select
  gs.city,
  gs.country,
  gs.city_lat,
  gs.city_lng,
  gs.region,
  count(*) filter (
    where gs.start_date >= current_date
      and gs.is_active = true
  ) as upcoming_count
from public.guest_schedules gs
group by gs.city, gs.country, gs.city_lat, gs.city_lng, gs.region;

create unique index on public.city_pin_summary (city, country);

-- ============================================================
-- 13. search_artists RPC
-- ============================================================
create or replace function public.search_artists(
  p_tag_slugs  text[]   default '{}',
  p_city       text     default null,
  p_start_date date     default null,
  p_end_date   date     default null,
  p_type       text     default 'all'
)
returns table (
  artist_id        uuid,
  display_name     text,
  instagram_handle text,
  is_verified      boolean,
  is_claimed       boolean,
  base_city        text,
  base_country     text,
  contact_type     text,
  contact_value    text,
  matched_tags     bigint,
  total_tags       bigint,
  priority         int,
  next_schedule    jsonb,
  tags             jsonb
)
language sql
stable
as $$
  with
  -- 검색 태그 UUID 변환
  search_tag_ids as (
    select id from public.tags where slug = any(p_tag_slugs)
  ),
  -- 아티스트별 태그 집계
  tag_counts as (
    select
      at2.artist_id,
      count(*)                                             as total,
      count(*) filter (
        where at2.tag_id in (select id from search_tag_ids)
      )                                                    as matched
    from public.artist_tags at2
    group by at2.artist_id
  ),
  -- 게스트 아티스트 (도시 + 날짜 조건)
  guest_matches as (
    select distinct gs.artist_id
    from public.guest_schedules gs
    where gs.is_active = true
      and (p_city       is null or lower(gs.city) = lower(p_city))
      and (p_start_date is null or gs.end_date    >= p_start_date)
      and (p_end_date   is null or gs.start_date  <= p_end_date)
  ),
  -- 아티스트별 가장 가까운 다음 일정
  next_sched as (
    select distinct on (gs.artist_id)
      gs.artist_id,
      jsonb_build_object(
        'id',           gs.id,
        'city',         gs.city,
        'country',      gs.country,
        'start_date',   gs.start_date::text,
        'end_date',     gs.end_date::text,
        'contact_type', gs.contact_type,
        'contact_value',gs.contact_value,
        'note',         gs.note
      ) as sched
    from public.guest_schedules gs
    where gs.is_active = true
      and gs.end_date >= current_date
    order by gs.artist_id, gs.start_date asc
  ),
  -- 아티스트별 태그 배열
  artist_tag_list as (
    select
      at2.artist_id,
      jsonb_agg(
        jsonb_build_object(
          'id',    t.id,
          'name',  t.name,
          'slug',  t.slug,
          'group', t.group_type
        ) order by t.group_type, t.name
      ) as tags
    from public.artist_tags at2
    join public.tags t on t.id = at2.tag_id
    group by at2.artist_id
  )
  select
    ap.id,
    ap.display_name,
    ap.instagram_handle,
    ap.is_verified,
    ap.is_claimed,
    ap.base_city,
    ap.base_country,
    ap.contact_type,
    ap.contact_value,
    coalesce(tc.matched, 0)                                          as matched_tags,
    coalesce(tc.total, 0)                                            as total_tags,
    case
      when array_length(p_tag_slugs, 1) > 0
        and coalesce(tc.matched, 0) = coalesce(tc.total, 0)
        and coalesce(tc.total, 0) > 0 then 1
      else 2
    end                                                              as priority,
    ns.sched                                                         as next_schedule,
    coalesce(atl.tags, '[]'::jsonb)                                  as tags
  from public.artist_profiles ap
  left join tag_counts       tc  on tc.artist_id  = ap.id
  left join guest_matches    gm  on gm.artist_id  = ap.id
  left join next_sched       ns  on ns.artist_id  = ap.id
  left join artist_tag_list  atl on atl.artist_id = ap.id
  where
    -- 타입 필터
    (
      p_type = 'all'
      or (p_type = 'guest' and gm.artist_id is not null)
      or (p_type = 'based'
          and (p_city is null or lower(ap.base_city) = lower(p_city)))
    )
    -- 태그 필터: 1개 이상 일치하거나 태그 검색 없음
    and (
      array_length(p_tag_slugs, 1) is null
      or array_length(p_tag_slugs, 1) = 0
      or coalesce(tc.matched, 0) > 0
    )
  order by
    priority asc,
    coalesce(tc.total, 0) asc,
    ap.display_name asc;
$$;
