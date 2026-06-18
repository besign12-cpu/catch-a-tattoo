-- ============================================================
-- 005_bring_update.sql
-- Catch A Tattoo — Bring 정책 구현
-- city_follows: is_active / expired_reason / expired_at 추가
-- ============================================================

-- ============================================================
-- 1. city_follows 컬럼 추가
-- ============================================================
alter table public.city_follows
  add column if not exists is_active      boolean     not null default true,
  add column if not exists expired_reason text        check (
                                            expired_reason in (
                                              'base_city_changed',
                                              'guest_work_completed'
                                            )
                                          ),
  add column if not exists expired_at     timestamptz;

-- 기존 rows: is_active = true (default 이미 적용됨, 명시적 업데이트)
update public.city_follows
set is_active = true
where is_active is null;

-- ============================================================
-- 2. 인덱스
-- ============================================================

-- Current Demand 쿼리 최적화: is_active=true 필터
create index if not exists idx_city_follows_artist_city_active
  on public.city_follows (artist_id, city, is_active);

-- 아티스트별 활성 Bring 조회
create index if not exists idx_city_follows_artist_active
  on public.city_follows (artist_id, is_active);

-- 사용자별 활성 Bring 조회
create index if not exists idx_city_follows_user_active
  on public.city_follows (user_id, is_active);

-- ============================================================
-- 3. Base City 변경 시 기존 Bring 전체 종료 함수
-- ============================================================
create or replace function public.expire_bring_by_base_city_change(
  p_user_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.city_follows
  set
    is_active      = false,
    expired_reason = 'base_city_changed',
    expired_at     = now()
  where
    user_id   = p_user_id
    and is_active = true;

  get diagnostics v_count = row_count;
  return v_count;  -- 종료된 Bring 수 반환
end;
$$;

-- ============================================================
-- 4. Guest Work 완료 시 해당 도시 Bring 종료 함수
--    guest_schedules.end_date 기준 호출 (pg_cron 또는 Server Action)
-- ============================================================
create or replace function public.expire_bring_by_schedule(
  p_artist_id uuid,
  p_city      text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.city_follows
  set
    is_active      = false,
    expired_reason = 'guest_work_completed',
    expired_at     = now()
  where
    artist_id = p_artist_id
    and city  = p_city
    and is_active = true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ============================================================
-- 5. 만료된 Guest Work 일정 기반 Bring 자동 종료 (pg_cron 대상)
--    end_date + 1일 이후인 일정의 Bring을 종료
-- ============================================================
create or replace function public.expire_bring_for_completed_schedules()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.city_follows cf
  set
    is_active      = false,
    expired_reason = 'guest_work_completed',
    expired_at     = now()
  from public.guest_schedules gs
  where
    cf.artist_id  = gs.artist_id
    and cf.city   = gs.city
    and cf.is_active = true
    and gs.is_active = false                   -- 이미 비활성화된 일정
    and gs.end_date < current_date             -- 종료일 지남
    and cf.expired_at is null;                 -- 아직 미처리
end;
$$;
