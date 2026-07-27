-- =============================================================
-- CAT QA — artist_profiles 생성 검증
-- Supabase SQL Editor에서 바로 실행
-- =============================================================

-- [1] artist@test.com users 행 확인
SELECT
  '1. users (artist)' AS check_item,
  id,
  email,
  role,
  base_city,
  CASE
    WHEN role = 'artist' AND base_city = 'Busan' THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS result
FROM public.users
WHERE email = 'artist@test.com';

-- [2] artist_profiles + users 연결 확인
SELECT
  '2. artist_profiles' AS check_item,
  ap.id                AS profile_id,
  ap.user_id,
  u.email              AS linked_email,
  ap.display_name,
  ap.instagram_handle,
  ap.base_city,
  ap.is_claimed,
  ap.is_verified,
  CASE
    WHEN u.email             = 'artist@test.com'
     AND ap.display_name     = 'QA Artist Mira'
     AND ap.instagram_handle = 'qa_artist_mira'
     AND ap.is_claimed       = true
     AND ap.is_verified      = true
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS result
FROM public.artist_profiles ap
LEFT JOIN public.users u ON u.id = ap.user_id
WHERE ap.instagram_handle = 'qa_artist_mira';

-- [3] 고정 ID 충돌 진단 (실서비스 데이터 충돌 여부)
SELECT
  '3. 고정 ID 충돌 진단' AS check_item,
  id,
  instagram_handle,
  display_name,
  CASE
    WHEN instagram_handle = 'qa_artist_mira'
      THEN '✅ QA 데이터 — 정상'
    ELSE '⚠️ 실서비스 데이터가 고정 ID 점유 중 — seed.sql의 ARTIST_PROFILE_ID를 다른 값으로 교체 필요'
  END AS result
FROM public.artist_profiles
WHERE id = 'a1000000-0000-0000-0000-000000000001';

-- [4] 종합 진단
SELECT
  '4. 종합 진단' AS check_item,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.users WHERE email = 'artist@test.com'
    )
      THEN '❌ artist@test.com Auth 계정 없음 → Auth에서 먼저 생성'
    WHEN NOT EXISTS (
      SELECT 1 FROM public.artist_profiles WHERE instagram_handle = 'qa_artist_mira'
    )
      THEN '❌ qa_artist_mira 프로필 없음 → seed.sql 재실행 후 Messages 탭 확인'
    WHEN EXISTS (
      SELECT 1 FROM public.artist_profiles ap
      JOIN public.users u ON u.id = ap.user_id
      WHERE ap.instagram_handle = 'qa_artist_mira'
        AND u.email = 'artist@test.com'
    )
      THEN '✅ artist_profiles 생성 및 user_id 연결 완료'
    WHEN EXISTS (
      SELECT 1 FROM public.artist_profiles
      WHERE instagram_handle = 'qa_artist_mira' AND user_id IS NULL
    )
      THEN '⚠️ 프로필 있으나 user_id NULL → seed.sql 재실행'
    ELSE '⚠️ 알 수 없는 상태 — 위 항목 확인'
  END AS result;
