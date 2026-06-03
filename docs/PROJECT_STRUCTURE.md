# PROJECT_STRUCTURE.md
# Catch A Tattoo — 프로젝트 구조 문서

> **목적:** 새 채팅이나 새 개발자가 코드베이스를 이해하고 즉시 작업할 수 있도록 작성된 구조 문서입니다.
> 파일을 추가하거나 삭제할 때마다 이 문서를 함께 업데이트해주세요.

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Catch A Tattoo |
| 목적 | 전 세계 타투이스트의 게스트워크(타 도시 방문 작업) 일정 발견 플랫폼 |
| 핵심 원칙 | "누가 / 어디에 / 언제 오는지"를 3초 안에 파악 |
| 프레임워크 | Next.js 14 App Router (TypeScript) |
| 스타일 | Tailwind CSS (mobile-first, max-w 430px) |
| 백엔드 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel (GitHub main 브랜치 자동 배포) |
| 현재 Sprint | Sprint 2 완료 / Sprint 3 진행 예정 |

---

## 전체 디렉토리 구조

```
catch-a-tattoo/
├── src/
│   ├── app/                          # Next.js App Router 페이지
│   │   ├── layout.tsx                # 루트 레이아웃 (BottomNav 포함, PWA metadata)
│   │   ├── page.tsx                  # 홈 피드 (/)
│   │   ├── globals.css               # Tailwind base + 전역 스타일
│   │   ├── not-found.tsx             # 404 페이지
│   │   ├── artists/
│   │   │   └── [handle]/
│   │   │       └── page.tsx          # 아티스트 프로필 (/artists/:handle)
│   │   ├── city/
│   │   │   └── [citySlug]/
│   │   │       └── page.tsx          # 도시 페이지 (/city/:citySlug)
│   │   ├── map/
│   │   │   └── page.tsx              # 지도 (/map) — 도시 핀 목록
│   │   ├── me/
│   │   │   └── page.tsx              # 내 정보 (/me) — placeholder
│   │   ├── notifications/
│   │   │   └── page.tsx              # 알림 (/notifications) — placeholder
│   │   └── search/
│   │       └── page.tsx              # 검색 (/search)
│   │
│   ├── components/
│   │   ├── artist/
│   │   │   └── FeedCard.tsx          # 홈 피드 카드 (누가·어디·언제)
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx         # 하단 5탭 네비게이션
│   │   │   ├── PageContainer.tsx     # 페이지 래퍼 (max-w, BottomNav 여백)
│   │   │   └── TopBar.tsx            # 상단 헤더 (left/right slot)
│   │   ├── schedule/
│   │   │   └── ScheduleBlock.tsx     # 일정 블록 (도시·날짜·D-day·채널)
│   │   ├── search/
│   │   │   ├── CityFilterBar.tsx     # 홈 가로 스크롤 도시 필터 칩
│   │   │   └── SearchFilterBar.tsx   # 검색 Filter 버튼 + 드로어 + URL 반영
│   │   └── ui/
│   │       ├── Avatar.tsx            # 이니셜 폴백 아바타
│   │       ├── ErrorState.tsx        # 에러 + 다시 시도 버튼 (compact/full)
│   │       ├── Skeleton.tsx          # 로딩 스켈레톤 (Feed, Profile용)
│   │       ├── TagChip.tsx           # 태그 칩 + TagList (하이라이트 지원)
│   │       └── VerifiedBadge.tsx     # 인증 뱃지 아이콘
│   │
│   ├── data/
│   │   └── dummy.ts                  # ⚠️ 삭제 금지 — Supabase 실패 시 fallback 데이터
│   │                                 #   DUMMY_ARTISTS (4명), DUMMY_FEED, ALL_TAGS (32개)
│   │
│   ├── lib/
│   │   ├── queries/
│   │   │   └── artists.ts            # 모든 Supabase 쿼리 함수 (서버 전용)
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저 클라이언트 (싱글턴)
│   │   │   ├── server.ts             # 서버 컴포넌트용 (cookies 기반, 매 요청 새 인스턴스)
│   │   │   └── admin.ts             # Service Role 클라이언트 (RLS 우회, 서버 전용)
│   │   └── utils.ts                  # cn(), formatDateRange(), calcDDay(), isScheduleActive()
│   │
│   └── types/
│       ├── database.types.ts         # Supabase DB 타입 (CLI로 재생성 가능)
│       └── index.ts                  # 앱 레벨 타입 (Tag, ArtistProfile, GuestSchedule, FeedCard)
│
├── supabase/
│   └── migrations/
│       ├── 001_init.sql              # 전체 DDL (11개 테이블 + RPC + Materialized View)
│       ├── 002_rls.sql               # Row Level Security 전체 정책
│       └── 003_seed.sql             # 태그 32개 + 개발용 샘플 아티스트 4명
│
├── docs/
│   ├── PROJECT_STRUCTURE.md          # 이 파일 — 프로젝트 구조 전체 설명
│   ├── ARCHITECTURE.md               # 아키텍처 결정사항, 클라이언트 사용 규칙
│   ├── KNOWN_ISSUES.md               # 발생한 이슈 + 해결책 기록
│   ├── MASTER_LOG.md                 # 파일 변경 이력, 환경 변수 목록
│   └── SPRINT_HISTORY.md             # Sprint별 완료 항목 및 계획
│
├── public/
│   └── manifest.json                 # PWA manifest (standalone, 아이콘 경로 미설정)
│
├── tailwind.config.ts                # 커스텀 색상(cat-black, cat-purple), mobile breakpoint
├── next.config.ts                    # 기본값 (이미지 도메인 추가 필요)
├── .env.local                        # 환경 변수 (gitignore)
└── .env.example                      # 환경 변수 템플릿 (커밋됨)
```

---

## 파일별 상세 설명

### `src/app/layout.tsx`
루트 레이아웃. 모든 페이지를 감싸며 `<BottomNav />`를 전역 렌더링.  
PWA metadata (`manifest`, `appleWebApp`, `viewport`), Inter 폰트, `globals.css` import.

```tsx
// 핵심 구조
<html lang="ko">
  <body>
    {children}        // 각 페이지
    <BottomNav />     // 하단 5탭 — 모든 페이지에 고정
  </body>
</html>
```

**주의:** `revalidate`는 각 page.tsx에서 개별 설정. layout에서 설정 금지.

---

### `src/app/page.tsx` (홈 피드)
```
revalidate: 30초
렌더링: 서버 컴포넌트 + Suspense
데이터: getFeedSchedules() → 실패 시 DUMMY_FEED fallback
```
- 상단 고정 헤더: 검색 인풋(더미) + `<CityFilterBar />`
- 피드: 팔로우 중 섹션 / 다가오는 게스트워크 섹션 2단 구성
- `isFollowing`은 현재 항상 `false` → Sprint 3에서 세션 기반으로 교체 예정

---

### `src/app/artists/[handle]/page.tsx` (아티스트 프로필)
```
params: Promise<{ handle: string }> — await 필수 (Next.js 14)
데이터: getArtistProfile(handle) → 실패 시 getArtistByHandle(handle) fallback
렌더링: 서버 컴포넌트 + Suspense (ProfileContent 분리)
```
- 상단 네비 (← 뒤로, 공유, 더보기)
- 프로필 헤더: 아바타 + 이름 + 인증뱃지 + 기반 도시 + 태그
- 팔로우 버튼 / Instagram 버튼 (SVG 직접 인라인 — lucide Instagram 사용 금지)
- 다음 게스트워크 섹션 (`<ScheduleBlock />`)
- 대표 작품 3장 그리드 (현재 placeholder)
- 미인증 시 Claim 배너

---

### `src/app/search/page.tsx` (검색)
```
searchParams: Promise<{ city, tags, start, end, type }>
데이터: searchArtists(params) — URL 쿼리 기반
렌더링: 서버 컴포넌트 + Suspense
```
URL 예: `/search?city=Seoul&tags=blackwork,fine-line&type=guest`  
`<SearchFilterBar />` 컴포넌트가 URL을 직접 업데이트 (router.push).  
결과 없음 → 안내 메시지 표시.

---

### `src/app/city/[citySlug]/page.tsx` (도시 페이지)
```
citySlug 형식: "seoul-kr" → city="Seoul", country="KR"
파싱: parseCitySlug() 함수로 city, country 분리
데이터: getCityArtists(city) → { guests, based }
```
- 요약 수치: 게스트워크 수 / 거주 아티스트 수
- **Guest Artists Coming to [City]** 섹션
- **Based in [City]** 섹션

---

### `src/app/map/page.tsx` (지도)
```
revalidate: 3600초 (Materialized View 갱신 주기와 동일)
데이터: getCityPins(region) — city_pin_summary 뷰 사용
```
현재: 지역별 도시 핀 목록 (텍스트). Mapbox GL JS는 Sprint 3 이후 추가 예정.  
각 도시 클릭 → `/city/:citySlug` 이동.

---

### `src/components/artist/FeedCard.tsx`
피드의 핵심 컴포넌트. "누가 / 어디에 / 언제"를 한 카드에 표현.
```
Props: data: FeedCard (artist + schedule + isFollowing)
- 아바타 + 아티스트명 + 인증뱃지 + 태그 목록 + 팔로우 버튼
- 어디(city) / 언제(dateRange + D-day) 블록
- 카드 전체 클릭 → /artists/:handle
```
**팔로우 버튼:** 현재 UI만 (클릭 시 실제 동작 없음) → Sprint 3 D1에서 useFollow 연결.

---

### `src/components/schedule/ScheduleBlock.tsx`
일정 하나를 표현하는 블록. `variant` prop으로 두 가지 형태.
```
variant="card" (기본): 도시명 + 날짜 + D-day + 예약 채널 전체
variant="inline": 한 줄 요약 (도시 · 날짜 · D-day)
```
진행 중인 일정: 초록 배경 (`emerald`).  
예정 일정: 회색 배경.  
종료된 일정: opacity 50%.

---

### `src/components/search/SearchFilterBar.tsx`
`"use client"` — 검색 필터 전체 로직.
```
상태: city, type(all/guest/based), selectedTags[]
URL 반영: router.push()로 searchParams 업데이트
드로어: 태그 그룹별 선택 (Color·Main·Art)
적용된 태그: 상단 칩으로 표시, X 클릭으로 개별 제거
```
**Color/Main 그룹:** 단일 선택 (동일 그룹 내 다른 태그 클릭 시 기존 해제).  
**Art 그룹:** 복수 선택 가능.

---

### `src/lib/queries/artists.ts`
모든 Supabase 읽기 쿼리를 모아둔 서버 전용 파일.  
**절대 `"use client"` 컴포넌트에서 직접 import 금지.**

| 함수 | 용도 |
|---|---|
| `getFeedSchedules()` | 홈 피드용 일정 목록 |
| `getArtistProfile(handle)` | 아티스트 프로필 전체 |
| `searchArtists(params)` | 태그·도시·날짜·타입 필터 검색 |
| `getCityArtists(city)` | 도시 페이지 Guest + Based |
| `getCityPins(region?)` | 지도 도시 핀 |
| `getAllTags()` | 태그 전체 목록 |

쿼리 결과는 내부 변환 함수(`toTag`, `toSchedule`)로 앱 타입으로 변환.  
타입 단언(`as`) 대신 변환 함수 사용 — `never` 타입 오류 방지.

---

### `src/lib/supabase/` — 클라이언트 3종

| 파일 | 사용 위치 | 생성 방식 | 특이사항 |
|---|---|---|---|
| `client.ts` | `"use client"` 컴포넌트 | 싱글턴 | 브라우저 전용 |
| `server.ts` | 서버 컴포넌트, Server Actions | 매 요청마다 새 인스턴스 | `await cookies()` 필수 |
| `admin.ts` | Server Actions, Route Handlers | 싱글턴 | RLS 완전 우회, 서버 전용 절대 규칙 |

```ts
// server.ts 사용 패턴 (항상 await)
const supabase = await getSupabaseServerClient();
```

---

### `src/data/dummy.ts` ⚠️ 삭제 금지

Supabase 연결 실패 또는 빈 결과 시 폴백으로 사용.  
Sprint 6 이후에도 영구 유지.

| export | 내용 |
|---|---|
| `ALL_TAGS` | 태그 32개 전체 (color 2 + main 14 + art 16) |
| `DUMMY_ARTISTS` | 샘플 아티스트 4명 (yuki.ink, marco.bold, soo.jin_tattoo, dot.by.ara) |
| `DUMMY_FEED` | 홈 피드용 FeedCard 4개 |
| `CITY_FILTERS` | 도시 필터 칩 레이블 목록 |
| `getArtistByHandle(handle)` | handle로 DUMMY_ARTISTS에서 찾기 |

```ts
// fallback 패턴 (page.tsx에서 일관되게 사용)
const data = await fetchFromSupabase().catch(() => null);
if (!data || data.length === 0) return DUMMY_DATA;
```

---

### `src/types/index.ts` — 앱 레벨 타입

```ts
Tag           // { id, name, slug, group: "color"|"main"|"art" }
GuestSchedule // { id, city, country, cityLat, cityLng, region,
              //   startDate, endDate, note, contactType, contactValue, isActive }
ArtistProfile // 아티스트 전체 정보
FeedCard      // { artist(일부), schedule, isFollowing }
ContactType   // "instagram" | "email" | "website"
```

### `src/types/database.types.ts` — DB 타입
Supabase CLI로 재생성 가능한 파일. 수동 편집 최소화.
```bash
# 재생성 명령
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > src/types/database.types.ts
```

---

### `src/lib/utils.ts` — 공통 유틸

| 함수 | 설명 |
|---|---|
| `cn(...classes)` | clsx + tailwind-merge 조합 |
| `formatDateRange(start, end)` | `"7/14 – 7/20"` 형식 |
| `calcDDay(start, end)` | `"D-3 · 진행 중"`, `"D-5"`, `"종료됨"` |
| `isScheduleActive(start, end)` | `"active" \| "upcoming" \| "ended"` |

---

## 데이터 흐름 요약

```
[서버 컴포넌트 Page]
  └─ lib/queries/artists.ts          # 쿼리 함수
       └─ lib/supabase/server.ts     # 서버 클라이언트
            └─ Supabase PostgreSQL   # DB

[클라이언트 컴포넌트]
  └─ lib/supabase/client.ts          # 브라우저 클라이언트
       └─ Supabase Realtime / Auth   # (Sprint 3~)

[Server Actions]
  └─ lib/supabase/server.ts or admin.ts
       └─ Supabase PostgreSQL
```

---

## Supabase 마이그레이션 현황

| 파일 | 내용 | 실행 여부 |
|---|---|---|
| `001_init.sql` | 전체 DDL (users, artist_profiles, tags, artist_tags, portfolio_items, guest_schedules, follows, city_follows, city_demand_cache, notifications, demand_notifications, claim_requests + RPC + Materialized View) | ✅ 실행 완료 |
| `002_rls.sql` | 모든 테이블 RLS 활성화 + 정책 적용 | ✅ 실행 완료 |
| `003_seed.sql` | 태그 32개 + 샘플 아티스트 4명 + 일정 5개 | ✅ 실행 완료 |

---

## 환경 변수

| 변수 | 용도 | Vercel 등록 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 키 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 관리자 키 | ✅ |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 지도 API (Sprint 3~) | ⏳ 미등록 |

---

## 페이지별 revalidate (캐시 전략)

| 페이지 | revalidate | 이유 |
|---|---|---|
| 홈 피드 (`/`) | 30초 | 새 일정 빠른 반영 |
| 아티스트 프로필 (`/artists/[handle]`) | 없음 (동적) | 프로필 수정 즉시 반영 |
| 검색 (`/search`) | 없음 (동적) | 실시간 필터 |
| 지도 (`/map`) | 3600초 | Materialized View 갱신 주기 |
| 도시 페이지 (`/city/[citySlug]`) | 없음 (동적) | 일정 변경 즉시 반영 |

---

## 빌드 & 배포 체크리스트

새 코드 추가 전 반드시 확인:

```bash
npm run build      # 반드시 통과 (dev 서버 기준 금지)
npm run lint       # ESLint 통과
```

### 자주 발생하는 빌드 오류

| 오류 | 원인 | 해결 |
|---|---|---|
| `Module not found: Instagram` | lucide-react Instagram 미지원 | SVG 직접 인라인 |
| `params must be awaited` | Next.js 14 async params | `const { x } = await params` |
| `Type 'never'` | DB 타입 불일치 | toTag(), toSchedule() 변환 함수 사용 |
| `alt is required` | Image/img alt 누락 | 의미 있는 alt 또는 `alt=""` |
| unused `searchParams` | 선언만 하고 미사용 | 사용하지 않으면 props에서 제거 |

---

## Sprint 진행 현황

| Sprint | 목표 | 상태 |
|---|---|---|
| Sprint 1 | 더미 데이터 기반 홈·프로필 화면 | ✅ 완료 |
| Sprint 2 | Supabase 연결, 검색·지도·도시 페이지 | ✅ 완료 |
| Sprint 3 | 회원가입·프로필 생성·편집·업로드 | 🔄 진행 예정 |
| Sprint 4 | 일정 등록·Claim·알림 | ⏳ 예정 |
| Sprint 5 | 팔로우 실동작·Analytics | ⏳ 예정 |
| Sprint 6 | QA·최적화·출시 | ⏳ 예정 |

---

## 절대 규칙 (새 채팅에서도 반드시 준수)

```
❌ import { Instagram } from "lucide-react"
   → SVG 직접 인라인 사용

❌ export default function Page({ params }: { params: { x: string } })
   → export default async function Page({ params }: { params: Promise<{ x: string }> })

❌ const { searchParams } = props  // 사용하지 않으면서 선언
   → 사용하지 않는 props는 선언하지 않음

❌ const result = data as ArtistProfile[]
   → toTag(), toSchedule() 변환 함수로 타입 변환

❌ import { getSupabaseAdminClient } from "@/lib/supabase/admin" // in "use client"
   → admin.ts는 서버 전용. 클라이언트 컴포넌트에서 절대 import 금지

❌ npm run dev 에서만 확인하고 제출
   → npm run build 통과 필수

❌ <img src="..." />  // alt 없음
   → alt 필수. 장식용은 alt=""
```
