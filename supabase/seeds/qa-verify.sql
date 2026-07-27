-- =============================================================
-- CAT QA Verify — Supabase SQL Editor용
-- =============================================================
-- seed.sql 실행 후 이 파일을 실행해서 결과를 확인하세요.
-- 모든 항목이 PASS여야 정상입니다.
--
-- 실행 전 아래 두 값을 실제 UUID로 교체하세요.
-- =============================================================

DO $$
DECLARE
  -- ─── UUID 교체 영역 ────────────────────────────────────────
  ARTIST_PROFILE_ID  text := '40c5103f-e516-442e-8732-80ec8b21b440'; -- 고정값, 변경 불필요
  CUSTOMER_EMAIL     text := '7756122b-d61d-4705-b94e-b110754e0fb3';                     -- 고정값, 변경 불필요

  v_customer_id uuid;
  v_pass        int := 0;
  v_fail        int := 0;
  v_count       int;
  v_ok          boolean;
BEGIN

  -- customer UUID 조회
  SELECT id INTO v_customer_id FROM public.users WHERE email = CUSTOMER_EMAIL;
  IF v_customer_id IS NULL THEN
    RAISE WARNING '❌ customer@test.com 계정이 없습니다. seed.sql을 먼저 실행하세요.';
    RETURN;
  END IF;

  RAISE NOTICE '=== QA Seed 검증 시작 ===';
  RAISE NOTICE 'Artist Profile ID : %', ARTIST_PROFILE_ID;
  RAISE NOTICE 'Customer UUID     : %', v_customer_id;
  RAISE NOTICE '';

  -- ─────────────────────────────────────────────────────────────
  -- [1] users — role, base_city 확인
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.users
  WHERE email = 'artist@test.com' AND role = 'artist' AND base_city = 'Busan';
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[1] users - artist role/base_city : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (role=artist, base_city=Busan 확인)' END;

  SELECT COUNT(*) INTO v_count
  FROM public.users
  WHERE email = 'customer@test.com' AND role = 'customer' AND base_city = 'Busan';
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[1] users - customer role/base_city : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (role=customer, base_city=Busan 확인)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [2] artist_profiles — 프로필, 인증 상태
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.artist_profiles
  WHERE id = ARTIST_PROFILE_ID::uuid
    AND display_name = 'QA Artist Mira'
    AND instagram_handle = 'qa_artist_mira'
    AND is_claimed = true
    AND is_verified = true;
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[2] artist_profiles : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL' END;

  -- ─────────────────────────────────────────────────────────────
  -- [3] guest_schedules — 정확히 3개, 모두 is_active=true
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.guest_schedules
  WHERE id IN (
    'b1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003'
  ) AND is_active = true;
  v_ok := v_count = 3;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[3] guest_schedules (3개 is_active) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- Tokyo 진행 중 확인 (start <= today <= end)
  SELECT COUNT(*) INTO v_count
  FROM public.guest_schedules
  WHERE id = 'b1000000-0000-0000-0000-000000000001'
    AND start_date <= CURRENT_DATE
    AND end_date   >= CURRENT_DATE;
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[3] Tokyo 일정 진행 중 : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (진행 중 아님)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [4] portfolio_items — 정확히 3개 (재실행 후 증가 없음)
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.portfolio_items
  WHERE id IN (
    'e1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000003'
  );
  v_ok := v_count = 3;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[4] portfolio_items (3개) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개, 중복 확인)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [5] follows — 정확히 1개 (재실행 후 증가 없음)
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.follows
  WHERE follower_id = v_customer_id
    AND artist_id   = ARTIST_PROFILE_ID::uuid;
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[5] follows (1개) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [6] city_follows (Bring) — 정확히 1개, is_active=true
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.city_follows
  WHERE user_id   = v_customer_id
    AND artist_id = ARTIST_PROFILE_ID::uuid
    AND city      = 'Busan'
    AND is_active = true;
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[6] city_follows Bring (1개, active) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [7] city_demand_cache — follower_count >= 1
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.city_demand_cache
  WHERE artist_id    = ARTIST_PROFILE_ID::uuid
    AND city         = 'Busan'
    AND follower_count >= 1;
  v_ok := v_count = 1;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[7] city_demand_cache (Busan >= 1) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL' END;

  -- ─────────────────────────────────────────────────────────────
  -- [8] demand_events — 정확히 4개 (재실행 후 증가 없음)
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.demand_events
  WHERE id IN (
    'f1000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000003',
    'f1000000-0000-0000-0000-000000000004'
  );
  v_ok := v_count = 4;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[8] demand_events (4개) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [9] search_logs — 정확히 3개 (재실행 후 증가 없음)
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.search_logs
  WHERE id IN (
    'f2000000-0000-0000-0000-000000000001',
    'f2000000-0000-0000-0000-000000000002',
    'f2000000-0000-0000-0000-000000000003'
  );
  v_ok := v_count = 3;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[9] search_logs (3개) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- ─────────────────────────────────────────────────────────────
  -- [10] analytics_snapshots — 3개 UPSERT 확인
  -- ─────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_count
  FROM public.analytics_snapshots
  WHERE target_id = ARTIST_PROFILE_ID
    AND snapshot_type IN ('city_follows', 'artist_profile_views', 'guest_work_count');
  v_ok := v_count = 3;
  IF v_ok THEN v_pass := v_pass + 1; ELSE v_fail := v_fail + 1; END IF;
  RAISE NOTICE '[10] analytics_snapshots (3개) : %', CASE WHEN v_ok THEN '✅ PASS' ELSE '❌ FAIL (실제: ' || v_count || '개)' END;

  -- ─────────────────────────────────────────────────────────────
  -- 최종 요약
  -- ─────────────────────────────────────────────────────────────
  RAISE NOTICE '';
  RAISE NOTICE '=== 검증 완료 ===';
  RAISE NOTICE '✅ PASS : %개', v_pass;
  RAISE NOTICE '❌ FAIL : %개', v_fail;
  IF v_fail = 0 THEN
    RAISE NOTICE '🎉 모든 항목 통과 — QA 환경 준비 완료';
  ELSE
    RAISE WARNING '일부 항목 실패 — 위 로그를 확인하세요';
  END IF;

END $$;
