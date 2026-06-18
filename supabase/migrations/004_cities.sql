-- ============================================================
-- 004_cities.sql
-- Catch A Tattoo — 관리형 City System
-- cities: 관리자가 승인한 도시 마스터
-- city_requests: 사용자 도시 추가 요청
-- ============================================================

-- ============================================================
-- 1. cities
-- ============================================================
create table public.cities (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  country      char(2) not null,
  country_name text not null,
  lat          numeric(9,6),
  lng          numeric(9,6),
  region       text not null check (region in ('asia','europe','americas','other')),
  is_approved  boolean not null default false,
  created_at   timestamptz not null default now(),
  approved_at  timestamptz,
  unique (name, country)
);

create index idx_cities_approved on public.cities (is_approved, region);
create index idx_cities_country  on public.cities (country);

-- ============================================================
-- 2. city_requests
-- ============================================================
create table public.city_requests (
  id           uuid primary key default uuid_generate_v4(),
  requested_by uuid references public.users(id) on delete set null,
  city_name    text not null,
  country      char(2) not null,
  reason       text,
  status       text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now()
);

create index idx_city_requests_status on public.city_requests (status, created_at desc);

-- ============================================================
-- 3. RLS
-- ============================================================
alter table public.cities        enable row level security;
alter table public.city_requests enable row level security;

-- cities: 승인된 도시는 누구나 읽기
create policy "cities_read_approved"
  on public.cities for select
  using (is_approved = true);

-- cities: 관리자는 service role로 처리 (RLS 우회)

-- city_requests: 본인 요청만 읽기
create policy "city_requests_read_own"
  on public.city_requests for select
  using (auth.uid() = requested_by);

-- city_requests: 로그인 유저만 생성
create policy "city_requests_insert_auth"
  on public.city_requests for insert
  with check (auth.uid() = requested_by);

-- ============================================================
-- 4. Seed — 주요 Guest Work 도시 (60개)
-- ============================================================

-- Asia (20개)
insert into public.cities (name, country, country_name, lat, lng, region, is_approved, approved_at) values
  ('Seoul',      'KR', 'South Korea',  37.5665,  126.9780, 'asia',     true, now()),
  ('Tokyo',      'JP', 'Japan',        35.6762,  139.6503, 'asia',     true, now()),
  ('Osaka',      'JP', 'Japan',        34.6937,  135.5023, 'asia',     true, now()),
  ('Bangkok',    'TH', 'Thailand',     13.7563,  100.5018, 'asia',     true, now()),
  ('Bali',       'ID', 'Indonesia',    -8.3405,  115.0920, 'asia',     true, now()),
  ('Singapore',  'SG', 'Singapore',     1.3521,  103.8198, 'asia',     true, now()),
  ('Hong Kong',  'HK', 'Hong Kong',    22.3193,  114.1694, 'asia',     true, now()),
  ('Taipei',     'TW', 'Taiwan',       25.0330,  121.5654, 'asia',     true, now()),
  ('Beijing',    'CN', 'China',        39.9042,  116.4074, 'asia',     true, now()),
  ('Shanghai',   'CN', 'China',        31.2304,  121.4737, 'asia',     true, now()),
  ('Chiang Mai', 'TH', 'Thailand',     18.7061,   98.9817, 'asia',     true, now()),
  ('Kuala Lumpur','MY','Malaysia',      3.1390,  101.6869, 'asia',     true, now()),
  ('Ho Chi Minh City','VN','Vietnam',  10.8231,  106.6297, 'asia',     true, now()),
  ('Hanoi',      'VN', 'Vietnam',      21.0285,  105.8542, 'asia',     true, now()),
  ('Jakarta',    'ID', 'Indonesia',    -6.2088,  106.8456, 'asia',     true, now()),
  ('Manila',     'PH', 'Philippines',  14.5995,  120.9842, 'asia',     true, now()),
  ('Mumbai',     'IN', 'India',        19.0760,   72.8777, 'asia',     true, now()),
  ('Busan',      'KR', 'South Korea',  35.1796,  129.0756, 'asia',     true, now()),
  ('Fukuoka',    'JP', 'Japan',        33.5904,  130.4017, 'asia',     true, now()),
  ('Kyoto',      'JP', 'Japan',        35.0116,  135.7681, 'asia',     true, now()),

-- Europe (25개)
  ('Berlin',     'DE', 'Germany',      52.5200,   13.4050, 'europe',   true, now()),
  ('London',     'GB', 'United Kingdom',51.5074,  -0.1278, 'europe',   true, now()),
  ('Paris',      'FR', 'France',       48.8566,    2.3522, 'europe',   true, now()),
  ('Amsterdam',  'NL', 'Netherlands',  52.3676,    4.9041, 'europe',   true, now()),
  ('Barcelona',  'ES', 'Spain',        41.3851,    2.1734, 'europe',   true, now()),
  ('Madrid',     'ES', 'Spain',        40.4168,   -3.7038, 'europe',   true, now()),
  ('Rome',       'IT', 'Italy',        41.9028,   12.4964, 'europe',   true, now()),
  ('Milan',      'IT', 'Italy',        45.4654,    9.1859, 'europe',   true, now()),
  ('Vienna',     'AT', 'Austria',      48.2082,   16.3738, 'europe',   true, now()),
  ('Prague',     'CZ', 'Czech Republic',50.0755,  14.4378, 'europe',   true, now()),
  ('Warsaw',     'PL', 'Poland',       52.2297,   21.0122, 'europe',   true, now()),
  ('Budapest',   'HU', 'Hungary',      47.4979,   19.0402, 'europe',   true, now()),
  ('Stockholm',  'SE', 'Sweden',       59.3293,   18.0686, 'europe',   true, now()),
  ('Copenhagen', 'DK', 'Denmark',      55.6761,   12.5683, 'europe',   true, now()),
  ('Oslo',       'NO', 'Norway',       59.9139,   10.7522, 'europe',   true, now()),
  ('Zurich',     'CH', 'Switzerland',  47.3769,    8.5417, 'europe',   true, now()),
  ('Brussels',   'BE', 'Belgium',      50.8503,    4.3517, 'europe',   true, now()),
  ('Lisbon',     'PT', 'Portugal',     38.7223,   -9.1393, 'europe',   true, now()),
  ('Athens',     'GR', 'Greece',       37.9838,   23.7275, 'europe',   true, now()),
  ('Moscow',     'RU', 'Russia',       55.7558,   37.6173, 'europe',   true, now()),
  ('Istanbul',   'TR', 'Turkey',       41.0082,   28.9784, 'europe',   true, now()),
  ('Kyiv',       'UA', 'Ukraine',      50.4501,   30.5234, 'europe',   true, now()),
  ('Helsinki',   'FI', 'Finland',      60.1699,   24.9384, 'europe',   true, now()),
  ('Dublin',     'IE', 'Ireland',      53.3498,   -6.2603, 'europe',   true, now()),
  ('Edinburgh',  'GB', 'United Kingdom',55.9533,  -3.1883, 'europe',   true, now()),

-- Americas (12개)
  ('New York',   'US', 'United States', 40.7128,  -74.0060, 'americas', true, now()),
  ('Los Angeles','US', 'United States', 34.0522, -118.2437, 'americas', true, now()),
  ('Miami',      'US', 'United States', 25.7617,  -80.1918, 'americas', true, now()),
  ('Chicago',    'US', 'United States', 41.8781,  -87.6298, 'americas', true, now()),
  ('San Francisco','US','United States',37.7749, -122.4194, 'americas', true, now()),
  ('Toronto',    'CA', 'Canada',        43.6532,  -79.3832, 'americas', true, now()),
  ('Vancouver',  'CA', 'Canada',        49.2827, -123.1207, 'americas', true, now()),
  ('Mexico City','MX', 'Mexico',        19.4326,  -99.1332, 'americas', true, now()),
  ('São Paulo',  'BR', 'Brazil',       -23.5505,  -46.6333, 'americas', true, now()),
  ('Buenos Aires','AR','Argentina',    -34.6037,  -58.3816, 'americas', true, now()),
  ('Bogotá',     'CO', 'Colombia',      4.7110,  -74.0721, 'americas', true, now()),
  ('Seattle',    'US', 'United States', 47.6062, -122.3321, 'americas', true, now()),

-- Other (3개)
  ('Sydney',     'AU', 'Australia',   -33.8688,  151.2093, 'other',    true, now()),
  ('Melbourne',  'AU', 'Australia',   -37.8136,  144.9631, 'other',    true, now()),
  ('Auckland',   'NZ', 'New Zealand', -36.8485,  174.7633, 'other',    true, now())

on conflict (name, country) do nothing;
