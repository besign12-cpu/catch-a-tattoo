# ARCHITECTURE.md
# Catch A Tattoo — 아키텍처 문서

> **최종 업데이트:** Sprint 3-7 완료 + Product Direction Update 반영
> **Single Source of Truth:** UX/IA 최종 확정 (Sprint 4 착수 전)

---

## CAT Vision

CAT는 단순한 타투 검색 사이트가 아닙니다.
전 세계 타투이스트의 Guest Work를 발견하고,
도시별·국가별·스타일별 수요를 분석하는
**Tattoo Industry Data Platform**을 목표로 합니다.

```
CAT의 핵심:  Discovery + Guest Work + Analytics

CAT가 아닌 것:  예약 플랫폼 / 결제 플랫폼 / In-App 메시지 플랫폼
Not Planned:   Reservation System / Payment System / In-App Messaging
```

**기능 통과 기준 (Core Principle)**
모든 기능은 아래 두 질문 중 하나를 통과해야 합니다.
1. 이 기능이 **Discovery를 강화**하는가?
2. 이 기능이 **Demand Data를 생성**하는가?

둘 다 아니라면 MVP 우선순위가 낮습니다.

---

## Long-Term Goal

CAT는 타투 고객과 타투이스트 모두가 **반드시 사용하는 업계 표준 플랫폼(Must-Have Platform)** 이 되는 것을 목표로 합니다.

```
고객     →  "누가 우리 도시에 오는가"를 확인하기 위해 CAT를 사용한다
아티스트 →  "다음 Guest Work를 어디로 가야 하는가"를 결정하기 위해 CAT를 사용한다
```

CAT는 타투 업계의 Instagram이 아니라, **타투 업계의 데이터 인프라**가 되는 것을 목표로 합니다.

---

## North Star Metric

**Monthly Demand Signals** — 사용자 수가 아닌 수요 신호 누적이 핵심 지표입니다.

| Demand Signal | 수집 방법 | 현재 상태 |
|---|---|---|
| Follow | `follows` 테이블 | ✅ 수집 중 |
| Bring This Artist | `city_follows` 테이블 | ✅ 수집 중 |
| Profile View | `demand_events` (event_type='profile_view') | ⏳ Sprint 4 |
| Schedule View | `demand_events` (event_type='schedule_view') | ⏳ Sprint 4 |
| Instagram Click | `demand_events` (event_type='instagram_click') | ⏳ Sprint 4 |
| City Click | `demand_events` (event_type='city_click') | ⏳ Sprint 4 |
| City Search | `search_logs` (query_type='city') | ⏳ Sprint 4 |
| Style Search | `search_logs` (query_type='style') | ⏳ Sprint 4 |

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 14 App Router | SSR + SSG 혼합 |
| 스타일 | Tailwind CSS | mobile-first, max-w-mobile=430px |
| 백엔드 | Supabase (PostgreSQL) | RLS 적용 |
| 인증 | Supabase Auth | Email + Google (Sprint 3-1~) |
| 파일 저장 | Supabase Storage | portfolios 버킷 (Sprint 4~) |
| 배포 | Vercel | main 자동 배포 |
| 아이콘 | lucide-react | **Instagram 아이콘 제외 — SVG 직접 사용** |
| 집계 자동화 | pg_cron | 월별 Analytics 집계 + 일정 자동 비활성화 |

---

## 사용자 구조

```
Artist = Customer 기능 전체 + Studio 기능

Customer 기능: Discover / Following / Calendar / Me / City Page / Artist Profile
Artist 추가:   Studio Dashboard / 일정 등록·수정 / Artist Calendar View
```

별도 계정이 아닙니다. 하나의 계정에 Studio 레이어가 추가됩니다.

---

## 내비게이션 구조 (최종 확정)

```
하단 탭 (BottomNav) — 4탭
├── /           → Discover (Compass 아이콘)
├── /following  → Following (Heart 아이콘)
├── /calendar   → Calendar (Calendar 아이콘)
└── /me         → 나 (User 아이콘) — Customer: /me, Artist: /studio
```

**BottomNav 규칙:**
- `/auth/*` 경로에서 자동 숨김
- 비로그인 시 `/me` 탭 → `/auth/login` 이동
- Calendar 탭: 단일 URL, role 기반 View 분기

**기존 탭 제거:**
- `/map` — Discover 하단 "다른 도시 바로가기"로 통합
- `/notifications` — Following 탭 🔔 알림 버튼으로 통합
- `/search` — Discover 탭 돋보기(아티스트 검색)로 흡수

---

## URL 구조 (최종 확정 — 17개 페이지)

### 공통 (10개)
```
/                          Discover — Base City 기반 Guest 피드
/following                 Following — [일정] [팔로우] 탭 + 🔔 알림
/calendar                  Calendar — Customer/Artist View 분기
/city/:citySlug            City Page — Customer/Artist View 분기
/artists/:handle           Artist Profile
/auth/login                로그인
/auth/signup               회원가입
/auth/verify-email         이메일 인증 대기
/auth/callback             OAuth 콜백
/me/settings               설정 (Base City · 관심장르 · 알림)
```

### Customer 전용 (1개)
```
/me                        Customer 프로필 — 관심장르 · [팔로잉] [내 Bring] 탭
```

### Artist 전용 (6개)
```
/studio                    Artist Dashboard — 추천 도시 TOP + 도시 카드
/artists/new               아티스트 프로필 최초 생성
/studio/profile/edit       프로필 수정
/studio/portfolio          포트폴리오 관리
/studio/schedule/new       일정 등록 (5단계 플로우)
/studio/schedule/:id       일정 수정/삭제
```

### 제거된 URL (기존 대비)
```
❌ /map                    → Discover 하단 도시 링크로 통합
❌ /notifications          → Following 🔔 알림 버튼으로 통합
❌ /search                 → Discover 돋보기로 흡수
❌ /studio/analytics       → Studio Dashboard에 통합
❌ /calendar/city/:slug    → Calendar 도시 드롭다운으로 처리
```

---

## 화면별 역할 분기 원칙

| 화면 | Customer | Artist 추가 레이어 |
|---|---|---|
| **Discover** | Guest 피드 + 팔로우 | 동일 (시장 동향 파악) |
| **Following** | [일정] [팔로우] 탭, 🔔 알림 | 동일 |
| **Calendar** | 월 요약 + 팔로우 일정 + 달력 | 도시 드롭다운 + 날짜별 🟢🟡🔴 + 인사이트 + CTA |
| **City Page** | Guest 수 · Based 수 · 추천 아티스트 | + Bring 수 · 인기 스타일 · 루트 · 일정 인사이트 |
| **Artist Profile** | 프로필 + 일정 + 팔로우 + Bring | 동일 (타 아티스트 프로필) |
| **나 탭** | /me (팔로잉 · Bring 내역) | /studio (Dashboard) |

---

## Bring 정책 (최종 확정)

```
Bring = 현재 수요(Current Demand) 중심
누적 Bring보다 지금 활성 Bring이 중요
Historical 데이터는 Analytics 용도로만 보관
```

| 정책 | 내용 |
|---|---|
| Bring 도시 | `users.base_city` 자동 적용 — 사용자 변경 불가 |
| Base City 변경 제한 | 30일 (users.base_city_changed_at 컬럼 필요) |
| Base City 변경 시 | 기존 Bring 전체 종료 → "다시 Bring?" 알림 |
| Guest Work 완료 시 | end_date + 1~3일 후 해당 도시 Bring 종료 → "다시 Bring?" 알림 |

### city_follows 스키마 변경 (Sprint 4 필수)
```sql
-- 추가 필요 컬럼
is_active      boolean DEFAULT true
expired_reason text         -- 'base_city_changed' | 'guest_work_completed'
expired_at     timestamptz

-- Current Demand 쿼리
SELECT * FROM city_follows WHERE is_active = true;

-- Historical (Analytics용)
SELECT * FROM city_follows;  -- is_active 무관
```

### users 스키마 변경 (Sprint 4 필수)
```sql
-- 추가 필요 컬럼
base_city_changed_at timestamptz  -- 30일 제한 계산용
```

---

## City System 정책

City는 CAT의 핵심 데이터 자산입니다. Analytics 품질을 위해 **관리형 City System**을 운영합니다.

### 원칙
```
✅ 관리자가 승인한 도시만 사용 (is_approved = true)
✅ 초기 50~100개 주요 Guest Work 도시 seed 등록
❌ 사용자 임의 도시 생성 불가
✅ 사용자는 도시 추가 요청 가능 (city_requests)
✅ 관리자 승인 후 활성화
```

### 도시 추가 요청 진입점
- Discover 탭 하단 "도시 추가 요청"
- `/studio/schedule/new` Step 1 "도시 추가 요청" 링크

### DB 구조
```sql
cities (
  id           uuid PRIMARY KEY,
  name         text NOT NULL,        -- "Seoul"
  country      text NOT NULL,        -- "KR"
  country_name text NOT NULL,        -- "South Korea"
  lat          numeric,
  lng          numeric,
  region       text,                 -- "asia" | "europe" | "americas" | "other"
  is_approved  boolean DEFAULT false,
  created_at   timestamptz,
  approved_at  timestamptz
)

city_requests (
  id            uuid PRIMARY KEY,
  requested_by  uuid REFERENCES users,
  city_name     text NOT NULL,
  country       text NOT NULL,
  reason        text,
  status        text DEFAULT 'pending',  -- pending | approved | rejected
  created_at    timestamptz
)
```

### 마이그레이션 계획
```
현재 (Sprint 3): base_city, guest_schedules.city, city_follows.city 모두 자유 텍스트
Sprint 4:        cities 테이블 생성 + seed 데이터
                 일정 등록 + Base City → cities dropdown 전환
Sprint 5:        city_requests 도시 추가 요청 UI 연결
```

---

## Guest Work 일정 등록 플로우 (5단계)

```
Step 1: 도시 선택
  → cities 드롭다운 (검색 가능)
  → "도시 추가 요청" 링크

Step 2: 도시 인사이트 (즉시 표시)
  → 현재 Guest Artist 수
  → 고객 관심 장르
  → 현재 활성 Bring 수

Step 3: 날짜 선택
  → 달력 + 날짜별 Guest 수 🟢🟡🔴 오버레이

Step 4: 날짜 인사이트 (즉시 표시)
  → 선택 기간 Guest 수
  → 장르 분포

Step 5: 상세 입력 → 등록 완료
  → 연락 방법 (Instagram 기본)
  → 메모 (선택)
  → Discover 피드 자동 노출
```

---

## Analytics Data Collection

**원칙: MVP부터 모든 데이터를 수집합니다. 초기에는 관리자만 열람 가능합니다.**

### 신규 테이블 설계 (Sprint 4)

```sql
demand_events (
  id          uuid PRIMARY KEY,
  event_type  text NOT NULL,     -- profile_view | schedule_view | instagram_click | city_click
  user_id     uuid REFERENCES users,   -- nullable (비로그인 수집)
  artist_id   uuid REFERENCES artist_profiles,
  city_id     uuid REFERENCES cities,
  session_id  text,
  created_at  timestamptz DEFAULT now()
)

search_logs (
  id           uuid PRIMARY KEY,
  query_type   text NOT NULL,    -- city | style | artist | combined
  query_value  text,
  user_id      uuid REFERENCES users,
  result_count int,
  filters_used jsonb,
  created_at   timestamptz DEFAULT now()
)

analytics_snapshots (
  id            uuid PRIMARY KEY,
  snapshot_type text NOT NULL,   -- city_follows | style_search | guest_work_count | ...
  target_id     text,
  period        text NOT NULL,   -- '2025-05' (YYYY-MM)
  value         int NOT NULL,
  created_at    timestamptz
)
```

---

## Guest Work Route Data

### Origin Route (Base City → Guest City)
```
artist_profiles.base_city + guest_schedules.city (artist_id JOIN)
→ 현재 스키마로 분석 가능
```

### Sequential Route (Guest City → Guest City)
```
guest_schedules (artist_id + start_date ORDER BY)
→ 현재 스키마로 분석 가능
→ 집계 뷰는 Sprint 6에서 추가
```

---

## 인증 흐름

```
비로그인 → /me, /studio 접근  → middleware → /auth/login?next=...
로그인 완료     → signIn Server Action → redirect("/")
회원가입 완료   → /auth/verify-email → 이메일 링크 → /auth/callback → redirect("/")
로그아웃        → signOut Server Action → redirect("/")
```

**보호 경로 (middleware):** `/me`, `/studio`, `/studio/**`, `/calendar` (로그인 시 View 분기)

---

## Supabase 클라이언트 3종 규칙

| 파일 | 사용 위치 | 생성 방식 |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` 컴포넌트 | 싱글턴 |
| `lib/supabase/server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 |
| `lib/supabase/admin.ts` | Server Actions, Route Handlers | 싱글턴, **RLS 완전 우회** |

- `admin.ts` 클라이언트 컴포넌트 import 절대 금지
- `SUPABASE_SERVICE_ROLE_KEY` → `NEXT_PUBLIC_` 절대 금지
- `admin.ts` → `SupabaseClient<Database>` 반환 타입 명시 필수

---

## database.types.ts 필수 규칙

```
⚠️ 모든 Tables와 Views에 Relationships: [] 필수

  tableName: {
    Row: { ... };
    Insert: { ... };
    Update: { ... };
    Relationships: [];  ← 없으면 insert/update 타입이 never[]로 추론됨
  };
```

---

## 데이터 흐름

### 읽기
```
Page (Server Component)
  └─ lib/queries/*.ts → lib/supabase/server.ts → Supabase PostgreSQL
```

### 쓰기
```
Client Component (form)
  └─ src/actions/*.ts ("use server")
       └─ lib/supabase/server.ts (세션 확인)
       └─ lib/supabase/admin.ts (RLS 우회 쓰기)
```

### Analytics 수집 (Sprint 4~)
```
Server Component / Action
  └─ lib/analytics/collect.ts (신규)
       └─ demand_events insert / search_logs insert
```

---

## 태그 시스템

| 그룹 | 선택 규칙 | 의미 |
|---|---|---|
| `color` | 필수 1개 | Black / Color |
| `main` | 필수 1개 | 대표 스타일 |
| `art` | 선택 0–4개 | 세부 스타일 |

전체 최소 2개, 최대 6개. Style Demand Analytics의 핵심 데이터 축.

---

## 인증 및 권한

| 역할 | 조건 | 주요 권한 |
|---|---|---|
| `visitor` | 비로그인 | 탐색·열람 |
| `customer` | 로그인 | 팔로우·Bring This Artist |
| `artist` | is_claimed=true | 프로필 편집·일정 등록 |
| `artist (verified)` | is_verified=true | 모든 아티스트 기능 |
| `admin` | role=admin | 전체 관리 + Analytics Dashboard |

---

## 더미 데이터 fallback 정책

Supabase 연결 실패 또는 빈 결과 → `src/data/dummy.ts`로 폴백.
`dummy.ts`는 영구 유지. **절대 삭제 금지.**

---

## 반복 발생 이슈 — 코딩 시 체크리스트

```
□ Instagram 아이콘 → lucide-react 금지, SVG 직접 사용
□ hasNotif 속성 → 속성 제거 후 경로/상태 분기 처리
□ params → await 필수 (Next.js 14)
□ admin.ts → 클라이언트 컴포넌트 import 금지
□ npm run build 통과 확인 후 제출
□ img → alt 필수 + eslint-disable-next-line @next/next/no-img-element
□ database.types.ts 수동 작성 시 Relationships: [] 필수
□ admin.ts getSupabaseAdminClient() → SupabaseClient<Database> 반환 타입 명시
□ export/import 방식 추측 금지 — 실제 파일 확인
□ React 18: useFormState / useFormStatus (react-dom), useActionState 금지
□ zip 제출 시 의존 파일도 함께 포함
□ Server Action에서 as any → eslint-disable 또는 DB Row 타입 직접 지정
□ 새 기능 추가 시 "Discovery 강화 or Demand Data 생성?" 통과 확인
□ Analytics 이벤트 수집 시 비로그인(session_id)도 처리
□ Bring 쿼리: Current Demand = is_active=true 필터 필수
□ 도시 입력: 자유 텍스트 금지 → cities 마스터 테이블 참조
```
