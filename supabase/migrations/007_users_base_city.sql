-- ============================================================
-- 007_users_base_city.sql
-- Catch A Tattoo — Base City 30일 변경 제한
-- users: base_city_changed_at 추가
-- can_change_base_city(): 변경 가능 여부 체크 함수
-- ============================================================

-- ============================================================
-- 1. users 컬럼 추가
-- ============================================================
alter table public.users
  add column if not exists base_city_changed_at timestamptz;

-- 기존 users: base_city가 이미 있는 경우 변경 이력 없음 → null 유지
-- (null = 한 번도 변경 안 함 = 언제든 변경 가능)

-- ============================================================
-- 2. Base City 변경 가능 여부 체크 함수
--    반환: true  → 변경 가능
--          false → 30일 제한 중
-- ============================================================
create or replace function public.can_change_base_city(
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      -- 한 번도 변경한 적 없으면 가능
      when base_city_changed_at is null then true
      -- 마지막 변경일로부터 30일 이상 지났으면 가능
      when base_city_changed_at < now() - interval '30 days' then true
      -- 30일 미만이면 불가
      else false
    end
  from public.users
  where id = p_user_id;
$$;

-- ============================================================
-- 3. Base City 변경 + Bring 종료 통합 처리 함수
--    Server Action에서 호출: 변경 가능 확인 → users 업데이트
--    → Bring 종료는 expire_bring_by_base_city_change() 별도 호출
-- ============================================================
create or replace function public.update_base_city(
  p_user_id    uuid,
  p_base_city  text,
  p_base_country char(2)
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_can_change boolean;
  v_changed_at timestamptz;
  v_days_left  int;
begin
  -- 변경 가능 여부 확인
  select can_change_base_city(p_user_id) into v_can_change;

  if not v_can_change then
    -- 남은 일수 계산
    select
      30 - extract(day from (now() - base_city_changed_at))::int
    into v_days_left
    from public.users
    where id = p_user_id;

    return jsonb_build_object(
      'success',    false,
      'error',      'rate_limited',
      'days_left',  greatest(v_days_left, 1)
    );
  end if;

  -- Base City 업데이트
  update public.users
  set
    base_city           = p_base_city,
    base_country        = p_base_country,
    base_city_changed_at = now()
  where id = p_user_id;

  return jsonb_build_object(
    'success', true
  );
end;
$$;
