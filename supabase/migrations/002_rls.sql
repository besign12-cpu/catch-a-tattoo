-- ============================================================
-- 002_rls.sql
-- Row Level Security 정책
-- ============================================================

-- RLS 활성화
alter table public.users             enable row level security;
alter table public.artist_profiles   enable row level security;
alter table public.tags              enable row level security;
alter table public.artist_tags       enable row level security;
alter table public.portfolio_items   enable row level security;
alter table public.guest_schedules   enable row level security;
alter table public.follows           enable row level security;
alter table public.city_follows      enable row level security;
alter table public.city_demand_cache enable row level security;
alter table public.notifications     enable row level security;
alter table public.demand_notifications enable row level security;
alter table public.claim_requests    enable row level security;

-- ============================================================
-- users
-- ============================================================
create policy "users_read_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- artist_profiles — 누구나 읽기 / 본인만 수정
-- ============================================================
create policy "artist_profiles_read_all"
  on public.artist_profiles for select
  using (true);

create policy "artist_profiles_insert_own"
  on public.artist_profiles for insert
  with check (auth.uid() = user_id);

create policy "artist_profiles_update_own"
  on public.artist_profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- tags — 누구나 읽기 / 수정 불가 (admin은 service role)
-- ============================================================
create policy "tags_read_all"
  on public.tags for select
  using (true);

-- ============================================================
-- artist_tags — 누구나 읽기 / 아티스트 본인만 수정
-- ============================================================
create policy "artist_tags_read_all"
  on public.artist_tags for select
  using (true);

create policy "artist_tags_write_own"
  on public.artist_tags for all
  using (
    auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

-- ============================================================
-- portfolio_items — 누구나 읽기 / 아티스트 본인만 수정
-- ============================================================
create policy "portfolio_read_all"
  on public.portfolio_items for select
  using (true);

create policy "portfolio_write_own"
  on public.portfolio_items for all
  using (
    auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

-- ============================================================
-- guest_schedules — 누구나 읽기 / 아티스트 본인만 수정
-- ============================================================
create policy "schedules_read_all"
  on public.guest_schedules for select
  using (true);

create policy "schedules_write_own"
  on public.guest_schedules for all
  using (
    auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

-- ============================================================
-- follows — 본인 팔로우만 읽기/생성/삭제
-- ============================================================
create policy "follows_read_own"
  on public.follows for select
  using (auth.uid() = follower_id);

-- 팔로워 수 조회용 (아티스트 본인이 팔로워 목록 보는 것 허용)
create policy "follows_read_artist"
  on public.follows for select
  using (
    auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

create policy "follows_insert_own"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "follows_delete_own"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- city_follows — 본인만
-- ============================================================
create policy "city_follows_self"
  on public.city_follows for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- city_demand_cache — 누구나 읽기 (공개 수요 정보)
-- ============================================================
create policy "city_demand_read_all"
  on public.city_demand_cache for select
  using (true);

-- ============================================================
-- notifications — 수신자 본인만
-- ============================================================
create policy "notif_read_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notif_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ============================================================
-- demand_notifications — 아티스트 본인만
-- ============================================================
create policy "demand_notif_read_own"
  on public.demand_notifications for select
  using (
    auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

-- ============================================================
-- claim_requests — 신청자 + 해당 아티스트 본인
-- ============================================================
create policy "claim_read_own"
  on public.claim_requests for select
  using (
    auth.uid() = requested_by
    or auth.uid() = (
      select user_id from public.artist_profiles where id = artist_id
    )
  );

create policy "claim_insert_own"
  on public.claim_requests for insert
  with check (auth.uid() = requested_by);
