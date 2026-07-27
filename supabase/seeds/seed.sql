-- =============================================================
-- CAT QA Seed Data — Sprint 6
-- =============================================================
-- 실행 전 아래 두 UUID를 실제 값으로 교체하세요.
--   Supabase Dashboard → Authentication → Users
-- =============================================================

DO $$
DECLARE
  -- ─── ① UUID 교체 영역 (여기만 수정) ─────────────────────
  ARTIST_UUID   uuid := '40c5103f-e516-442e-8732-80ec8b21b440';
  CUSTOMER_UUID uuid := '7756122b-d61d-4705-b94e-b110754e0fb3';

  -- ─── 고정 초기값 (충돌 시 자동 우회됨) ──────────────────
  QA_PROFILE_INIT_ID uuid := 'a1000000-0000-0000-0000-000000000001';

  -- ─── 런타임에 결정되는 실제 Profile ID ───────────────────
  -- 모든 하위 INSERT는 이 변수만 사용
  v_artist_id       uuid := NULL;
  v_customer_id     uuid := NULL;
  v_existing_handle text := NULL;

  -- ─── 고정 하위 레코드 ID ─────────────────────────────────
  SCHEDULE_TOKYO_ID  uuid := 'b1000000-0000-0000-0000-000000000001';
  SCHEDULE_SEOUL_ID  uuid := 'b1000000-0000-0000-0000-000000000002';
  SCHEDULE_TAIPEI_ID uuid := 'b1000000-0000-0000-0000-000000000003';
  FOLLOW_ID          uuid := 'c1000000-0000-0000-0000-000000000001';
  BRING_BUSAN_ID     uuid := 'd1000000-0000-0000-0000-000000000001';
  PORTFOLIO_1_ID     uuid := 'e1000000-0000-0000-0000-000000000001';
  PORTFOLIO_2_ID     uuid := 'e1000000-0000-0000-0000-000000000002';
  PORTFOLIO_3_ID     uuid := 'e1000000-0000-0000-0000-000000000003';
  DEMAND_EVENT_1_ID  uuid := 'f1000000-0000-0000-0000-000000000001';
  DEMAND_EVENT_2_ID  uuid := 'f1000000-0000-0000-0000-000000000002';
  DEMAND_EVENT_3_ID  uuid := 'f1000000-0000-0000-0000-000000000003';
  DEMAND_EVENT_4_ID  uuid := 'f1000000-0000-0000-0000-000000000004';
  SEARCH_LOG_1_ID    uuid := 'f2000000-0000-0000-0000-000000000001';
  SEARCH_LOG_2_ID    uuid := 'f2000000-0000-0000-0000-000000000002';
  SEARCH_LOG_3_ID    uuid := 'f2000000-0000-0000-0000-000000000003';

  TODAY date := CURRENT_DATE;
BEGIN

-- =============================================================
-- STEP 1. users
-- PK: id | UNIQUE: email, username
-- 트리거(handle_new_user)가 Auth 가입 시 id+email row 자동 생성
-- ON CONFLICT (id) DO UPDATE → role/city 갱신
-- =============================================================
INSERT INTO public.users (
  id, email, username, role,
  base_city, base_country, notif_schedule, notif_bring
) VALUES (
  ARTIST_UUID, 'artist@test.com', 'qa_artist', 'artist',
  'Busan', 'KR', true, true
)
ON CONFLICT (id) DO UPDATE SET
  role           = 'artist',
  username       = 'qa_artist',
  base_city      = 'Busan',
  base_country   = 'KR',
  notif_schedule = true,
  notif_bring    = true;

INSERT INTO public.users (
  id, email, username, role,
  base_city, base_country, notif_schedule, notif_bring
) VALUES (
  CUSTOMER_UUID, 'customer@test.com', 'qa_customer', 'customer',
  'Busan', 'KR', true, true
)
ON CONFLICT (id) DO UPDATE SET
  username       = 'qa_customer',
  base_city      = 'Busan',
  base_country   = 'KR',
  notif_schedule = true,
  notif_bring    = true;

-- customer UUID 런타임 확인
SELECT id INTO v_customer_id
FROM public.users WHERE email = 'customer@test.com';

IF v_customer_id IS NULL THEN
  RAISE EXCEPTION '[ABORT] customer@test.com users 행 없음. Auth 계정 생성 후 재실행하세요.';
END IF;

-- =============================================================
-- STEP 2. cities
-- UNIQUE: (name, country)
-- =============================================================
INSERT INTO public.cities
  (name, country, country_name, lat, lng, region, is_approved)
VALUES
  ('Busan',  'KR', 'South Korea', 35.1796, 129.0756, 'asia', true),
  ('Tokyo',  'JP', 'Japan',       35.6762, 139.6503, 'asia', true),
  ('Seoul',  'KR', 'South Korea', 37.5665, 126.9780, 'asia', true),
  ('Taipei', 'TW', 'Taiwan',      25.0330, 121.5654, 'asia', true)
ON CONFLICT (name, country) DO NOTHING;

-- =============================================================
-- STEP 3. tags
-- UNIQUE: name (독립) / UNIQUE: slug (독립)
-- name·slug 양쪽 충돌 방어 → WHERE NOT EXISTS 패턴
-- =============================================================
INSERT INTO public.tags (name, slug, group_type)
SELECT 'Black & Grey', 'black-grey', 'color'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tags WHERE slug = 'black-grey' OR name = 'Black & Grey');

INSERT INTO public.tags (name, slug, group_type)
SELECT 'Color', 'color', 'color'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tags WHERE slug = 'color' OR name = 'Color');

INSERT INTO public.tags (name, slug, group_type)
SELECT 'Fine Line', 'fine-line', 'main'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tags WHERE slug = 'fine-line' OR name = 'Fine Line');

INSERT INTO public.tags (name, slug, group_type)
SELECT 'Blackwork', 'blackwork', 'main'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tags WHERE slug = 'blackwork' OR name = 'Blackwork');

INSERT INTO public.tags (name, slug, group_type)
SELECT 'Illustrative', 'illustrative', 'art'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tags WHERE slug = 'illustrative' OR name = 'Illustrative');

-- =============================================================
-- STEP 4. artist_profiles → v_artist_id 확정
--
-- ★ 핵심 원칙: 같은 user_id에 profile이 이미 있으면 절대 새로 생성하지 않음
--              (중복 생성이 maybeSingle() PGRST116 에러의 원인)
--
-- CASE A: user_id로 이미 profile 존재 → 그 id를 v_artist_id로 사용
--         (실서비스 profile 포함 — seed는 하위 데이터만 연결)
-- CASE B: qa_artist_mira handle 존재하지만 다른 user_id
--         → 이메일로 조회한 user_id로 UPDATE
-- CASE C: 아무것도 없음 → 새로 INSERT
--
-- ★ v_artist_id = NULL이면 하위 STEP 전체 중단
-- =============================================================

IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'artist@test.com') THEN
  RAISE EXCEPTION '[ABORT] artist@test.com users 행 없음. Auth 계정 생성 후 재실행하세요.';
END IF;

IF EXISTS (
  -- CASE A: 이 user_id로 이미 profile이 있음 (실서비스 or QA 무관)
  SELECT 1 FROM public.artist_profiles
  WHERE user_id = (SELECT id FROM public.users WHERE email = 'artist@test.com')
) THEN
  -- 가장 먼저 생성된 profile 1개를 사용 (중복 있으면 이 seed를 실행하기 전에 cleanup 필요)
  SELECT id, instagram_handle INTO v_artist_id, v_existing_handle
  FROM public.artist_profiles
  WHERE user_id = (SELECT id FROM public.users WHERE email = 'artist@test.com')
  ORDER BY created_at ASC
  LIMIT 1;
  RAISE NOTICE '[CASE A] 기존 profile 사용 → v_artist_id = %, handle = %', v_artist_id, v_existing_handle;
  RAISE NOTICE '         QA 하위 데이터(schedules/follows 등)는 이 profile에 연결됩니다.';

ELSIF EXISTS (
  -- CASE B: qa_artist_mira handle이 있지만 다른 user_id 소속
  SELECT 1 FROM public.artist_profiles WHERE instagram_handle = 'qa_artist_mira'
) THEN
  UPDATE public.artist_profiles
  SET user_id = (SELECT id FROM public.users WHERE email = 'artist@test.com')
  WHERE instagram_handle = 'qa_artist_mira';

  SELECT id INTO v_artist_id
  FROM public.artist_profiles WHERE instagram_handle = 'qa_artist_mira';
  RAISE NOTICE '[CASE B] qa_artist_mira profile의 user_id 갱신 → v_artist_id = %', v_artist_id;

ELSE
  -- CASE C: profile 없음 → 신규 INSERT
  INSERT INTO public.artist_profiles (
    id, user_id, display_name, instagram_handle, bio,
    base_city, base_country, city_lat, city_lng,
    is_claimed, is_verified, contact_type, contact_value
  ) VALUES (
    QA_PROFILE_INIT_ID,
    (SELECT id FROM public.users WHERE email = 'artist@test.com'),
    'QA Artist Mira', 'qa_artist_mira',
    'Busan-based tattoo artist. Fine line & blackwork. Guest work in Tokyo, Seoul, Taipei.',
    'Busan', 'KR', 35.1796, 129.0756,
    true, true, 'instagram', 'qa_artist_mira'
  )
  RETURNING id INTO v_artist_id;
  RAISE NOTICE '[CASE C] 신규 QA profile 생성 → v_artist_id = %', v_artist_id;
END IF;

-- ★ v_artist_id 확정 실패 시 전체 중단
IF v_artist_id IS NULL THEN
  RAISE EXCEPTION '[ABORT] v_artist_id 확정 실패. cleanup-duplicate-profile.sql 실행 후 재시도하세요.';
END IF;

-- =============================================================
-- STEP 5. artist_tags  (v_artist_id 사용)
-- PK: (artist_id, tag_id)
-- =============================================================
INSERT INTO public.artist_tags (artist_id, tag_id)
SELECT v_artist_id, id
FROM public.tags
WHERE slug IN ('fine-line', 'blackwork', 'black-grey')
ON CONFLICT (artist_id, tag_id) DO NOTHING;

-- =============================================================
-- STEP 6. guest_schedules  (v_artist_id 사용)
-- PK: id | UNIQUE 없음 → 고정 id로 멱등성 보장
-- =============================================================
INSERT INTO public.guest_schedules (
  id, artist_id, city, country, city_lat, city_lng, region,
  start_date, end_date, note, contact_type, contact_value, is_active
) VALUES (
  SCHEDULE_TOKYO_ID, v_artist_id,
  'Tokyo', 'JP', 35.6762, 139.6503, 'asia',
  TODAY - INTERVAL '3 days', TODAY + INTERVAL '7 days',
  'DM for booking. Limited spots available.',
  'instagram', 'qa_artist_mira', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.guest_schedules (
  id, artist_id, city, country, city_lat, city_lng, region,
  start_date, end_date, note, contact_type, contact_value, is_active
) VALUES (
  SCHEDULE_SEOUL_ID, v_artist_id,
  'Seoul', 'KR', 37.5665, 126.9780, 'asia',
  TODAY + INTERVAL '30 days', TODAY + INTERVAL '44 days',
  'Seoul guest work. Fine line and blackwork only.',
  'instagram', 'qa_artist_mira', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.guest_schedules (
  id, artist_id, city, country, city_lat, city_lng, region,
  start_date, end_date, note, contact_type, contact_value, is_active
) VALUES (
  SCHEDULE_TAIPEI_ID, v_artist_id,
  'Taipei', 'TW', 25.0330, 121.5654, 'asia',
  TODAY + INTERVAL '60 days', TODAY + INTERVAL '74 days',
  'Taipei debut guest work. Early booking recommended.',
  'instagram', 'qa_artist_mira', true
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 7. portfolio_items  (v_artist_id 사용)
-- PK: id | sort_order CHECK: 0~2
-- =============================================================
INSERT INTO public.portfolio_items (id, artist_id, image_url, sort_order)
VALUES
  (PORTFOLIO_1_ID, v_artist_id, 'https://picsum.photos/seed/cat-qa-p1/400/400', 0),
  (PORTFOLIO_2_ID, v_artist_id, 'https://picsum.photos/seed/cat-qa-p2/400/400', 1),
  (PORTFOLIO_3_ID, v_artist_id, 'https://picsum.photos/seed/cat-qa-p3/400/400', 2)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 8. follows  (v_artist_id 사용)
-- PK: id | UNIQUE: (follower_id, artist_id)
-- =============================================================
INSERT INTO public.follows (id, follower_id, artist_id)
VALUES (FOLLOW_ID, v_customer_id, v_artist_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.follows (follower_id, artist_id)
VALUES (v_customer_id, v_artist_id)
ON CONFLICT (follower_id, artist_id) DO NOTHING;

-- =============================================================
-- STEP 9. city_follows  (v_artist_id 사용)
-- PK: id | UNIQUE: (user_id, artist_id, city)
-- =============================================================
INSERT INTO public.city_follows (
  id, user_id, artist_id, city, country, is_active
) VALUES (
  BRING_BUSAN_ID, v_customer_id, v_artist_id, 'Busan', 'KR', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.city_follows (user_id, artist_id, city, country, is_active)
VALUES (v_customer_id, v_artist_id, 'Busan', 'KR', true)
ON CONFLICT (user_id, artist_id, city) DO NOTHING;

-- =============================================================
-- STEP 10. city_demand_cache  (v_artist_id 사용)
-- PK: (artist_id, city)
-- =============================================================
INSERT INTO public.city_demand_cache (artist_id, city, country, follower_count)
VALUES (v_artist_id, 'Busan', 'KR', 1)
ON CONFLICT (artist_id, city) DO UPDATE SET
  follower_count = GREATEST(city_demand_cache.follower_count, 1),
  updated_at     = now();

-- =============================================================
-- STEP 11. user_interests  (v_customer_id 사용)
-- PK: (user_id, tag_id)
-- =============================================================
INSERT INTO public.user_interests (user_id, tag_id)
SELECT v_customer_id, id
FROM public.tags
WHERE slug IN ('fine-line', 'black-grey')
ON CONFLICT (user_id, tag_id) DO NOTHING;

-- =============================================================
-- STEP 12. demand_events  (v_artist_id 사용)
-- PK: id | UNIQUE 없음 → 고정 id로 멱등성 보장
-- =============================================================
INSERT INTO public.demand_events
  (id, event_type, user_id, artist_id, session_id, created_at)
VALUES
  (DEMAND_EVENT_1_ID, 'profile_view',    v_customer_id, v_artist_id, 'qa-session-001', now() - INTERVAL '2 days'),
  (DEMAND_EVENT_2_ID, 'profile_view',    v_customer_id, v_artist_id, 'qa-session-002', now() - INTERVAL '1 day'),
  (DEMAND_EVENT_3_ID, 'schedule_view',   v_customer_id, v_artist_id, 'qa-session-003', now() - INTERVAL '1 day'),
  (DEMAND_EVENT_4_ID, 'instagram_click', v_customer_id, v_artist_id, 'qa-session-004', now())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 13. search_logs  (v_customer_id 사용)
-- PK: id | UNIQUE 없음 → 고정 id로 멱등성 보장
-- =============================================================
INSERT INTO public.search_logs
  (id, query_type, query_value, user_id, session_id, result_count, filters_used, created_at)
VALUES
  (SEARCH_LOG_1_ID, 'city',  'Busan',     v_customer_id, 'qa-search-001', 3, '{}', now() - INTERVAL '3 days'),
  (SEARCH_LOG_2_ID, 'style', 'fine-line', v_customer_id, 'qa-search-002', 5, '{}', now() - INTERVAL '1 day'),
  (SEARCH_LOG_3_ID, 'city',  'Tokyo',     v_customer_id, 'qa-search-003', 2, '{}', now())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- STEP 14. analytics_snapshots  (v_artist_id 사용)
-- UNIQUE: (snapshot_type, target_id, period)
-- =============================================================
INSERT INTO public.analytics_snapshots
  (snapshot_type, target_id, period, value)
VALUES
  ('city_follows',         v_artist_id::text, to_char(now(), 'YYYY-MM'), 3),
  ('artist_profile_views', v_artist_id::text, to_char(now(), 'YYYY-MM'), 12),
  ('guest_work_count',     v_artist_id::text, to_char(now(), 'YYYY-MM'), 3)
ON CONFLICT (snapshot_type, target_id, period) DO UPDATE SET
  value = EXCLUDED.value;

-- =============================================================
-- 완료
-- =============================================================
RAISE NOTICE '';
RAISE NOTICE '✅ QA Seed 완료';
RAISE NOTICE '   v_artist_id   = %', v_artist_id;
RAISE NOTICE '   v_customer_id = %', v_customer_id;
RAISE NOTICE '   verify-artist-profile.sql 로 결과를 확인하세요.';

END $$;

-- =============================================================
-- 실행 직후 결과 확인 (SELECT 결과표)
-- =============================================================
SELECT
  ap.id                AS artist_profile_id,
  u_a.email            AS artist_email,
  ap.display_name,
  ap.instagram_handle,
  ap.base_city,
  ap.is_claimed,
  ap.is_verified,
  (SELECT COUNT(*) FROM public.guest_schedules gs
   WHERE gs.artist_id = ap.id AND gs.is_active = true)  AS active_schedules,
  (SELECT COUNT(*) FROM public.portfolio_items pi
   WHERE pi.artist_id = ap.id)                           AS portfolio_count,
  (SELECT COUNT(*) FROM public.follows f
   WHERE f.artist_id = ap.id)                            AS follow_count,
  (SELECT COUNT(*) FROM public.city_follows cf
   WHERE cf.artist_id = ap.id AND cf.is_active = true)   AS bring_count
FROM public.artist_profiles ap
JOIN public.users u_a ON u_a.id = ap.user_id
WHERE ap.instagram_handle = 'qa_artist_mira';
