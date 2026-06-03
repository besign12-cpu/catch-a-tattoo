-- ============================================================
-- 003_seed.sql
-- 태그 기초 데이터 + 개발용 샘플 아티스트
-- ============================================================

-- ── 태그 32개 ──────────────────────────────────────────────
insert into public.tags (name, slug, group_type) values
  -- color (2)
  ('Black',           'black',           'color'),
  ('Color',           'color-tag',       'color'),
  -- main (14)
  ('Blackwork',       'blackwork',       'main'),
  ('Realism',         'realism',         'main'),
  ('Japanese',        'japanese',        'main'),
  ('Neo Traditional', 'neo-traditional', 'main'),
  ('Old & New School','old-new-school',  'main'),
  ('Chicano',         'chicano',         'main'),
  ('Tribal',          'tribal',          'main'),
  ('Handpoke',        'handpoke',        'main'),
  ('Geometric',       'geometric',       'main'),
  ('Anime',           'anime',           'main'),
  ('Illustration',    'illustration',    'main'),
  ('Micro',           'micro',           'main'),
  ('Ornamental',      'ornamental',      'main'),
  ('Other',           'other',           'main'),
  -- art (16)
  ('Fine Line',       'fine-line',       'art'),
  ('Bold Line',       'bold-line',       'art'),
  ('Floral',          'floral',          'art'),
  ('Cute',            'cute',            'art'),
  ('Pet',             'pet',             'art'),
  ('Pixel',           'pixel',           'art'),
  ('Woodcut',         'woodcut',         'art'),
  ('Sketch',          'sketch',          'art'),
  ('Doodle',          'doodle',          'art'),
  ('Portrait',        'portrait',        'art'),
  ('Dark',            'dark',            'art'),
  ('Unique',          'unique',          'art'),
  ('Simple',          'simple',          'art'),
  ('Abstract',        'abstract',        'art'),
  ('Sigilism',        'sigilism',        'art'),
  ('Fantasy',         'fantasy',         'art')
on conflict (slug) do nothing;

-- ── 개발용 샘플 아티스트 ────────────────────────────────────
-- 실제 운영 환경에서는 이 블록을 실행하지 않음
-- 로컬 개발 / 스테이징에서만 사용

insert into public.artist_profiles
  (id, display_name, instagram_handle, bio, base_city, base_country,
   city_lat, city_lng, is_claimed, is_verified, contact_type, contact_value)
values
  (
    'a1000000-0000-0000-0000-000000000001',
    'yuki.ink', 'yuki.ink',
    'Fine line & micro tattoo specialist. Based in Tokyo, traveling worldwide ✈️',
    'Tokyo', 'JP', 35.6762, 139.6503,
    true, true, 'instagram', '@yuki.ink'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'marco.bold', 'marco.bold',
    'Bold lines, old school vibes. Berlin based.',
    'Berlin', 'DE', 52.5200, 13.4050,
    false, false, 'instagram', '@marco.bold'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'soo.jin_tattoo', 'soo.jin_tattoo',
    'Realism & color work. Seoul based, guest worldwide.',
    'Seoul', 'KR', 37.5665, 126.9780,
    true, true, 'instagram', '@soo.jin_tattoo'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'dot.by.ara', 'dot.by.ara',
    'Handpoke & geometric. Slow and intentional.',
    'Amsterdam', 'NL', 52.3676, 4.9041,
    true, false, 'email', 'booking@dotbyara.com'
  )
on conflict (instagram_handle) do nothing;

-- 아티스트 태그 연결
insert into public.artist_tags (artist_id, tag_id)
select 'a1000000-0000-0000-0000-000000000001', id
from public.tags where slug in ('black','blackwork','fine-line','pet')
on conflict do nothing;

insert into public.artist_tags (artist_id, tag_id)
select 'a1000000-0000-0000-0000-000000000002', id
from public.tags where slug in ('black','old-new-school','bold-line','dark')
on conflict do nothing;

insert into public.artist_tags (artist_id, tag_id)
select 'a1000000-0000-0000-0000-000000000003', id
from public.tags where slug in ('color-tag','realism','portrait','floral')
on conflict do nothing;

insert into public.artist_tags (artist_id, tag_id)
select 'a1000000-0000-0000-0000-000000000004', id
from public.tags where slug in ('black','handpoke','geometric','abstract')
on conflict do nothing;

-- 게스트 일정
insert into public.guest_schedules
  (artist_id, city, country, city_lat, city_lng, region,
   start_date, end_date, note, contact_type, contact_value)
values
  -- yuki.ink → Seoul (현재 진행 or 가까운 미래)
  (
    'a1000000-0000-0000-0000-000000000001',
    'Seoul', 'KR', 37.5665, 126.9780, 'asia',
    (current_date + interval '2 days')::date,
    (current_date + interval '8 days')::date,
    '홍대 스튜디오 · 예약 3자리 남음',
    'instagram', '@yuki.ink'
  ),
  -- yuki.ink → Paris
  (
    'a1000000-0000-0000-0000-000000000001',
    'Paris', 'FR', 48.8566, 2.3522, 'europe',
    (current_date + interval '30 days')::date,
    (current_date + interval '36 days')::date,
    null,
    'instagram', '@yuki.ink'
  ),
  -- marco.bold → Tokyo
  (
    'a1000000-0000-0000-0000-000000000002',
    'Tokyo', 'JP', 35.6762, 139.6503, 'asia',
    (current_date + interval '20 days')::date,
    (current_date + interval '26 days')::date,
    null,
    'instagram', '@marco.bold'
  ),
  -- soo.jin_tattoo → Seoul
  (
    'a1000000-0000-0000-0000-000000000003',
    'Seoul', 'KR', 37.5665, 126.9780, 'asia',
    (current_date + interval '10 days')::date,
    (current_date + interval '16 days')::date,
    '강남 스튜디오',
    'instagram', '@soo.jin_tattoo'
  ),
  -- dot.by.ara → New York
  (
    'a1000000-0000-0000-0000-000000000004',
    'New York', 'US', 40.7128, -74.0060, 'americas',
    (current_date + interval '25 days')::date,
    (current_date + interval '31 days')::date,
    null,
    'email', 'booking@dotbyara.com'
  );
