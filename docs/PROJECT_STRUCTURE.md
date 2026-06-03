# PROJECT_STRUCTURE.md
# Catch A Tattoo — 프로젝트 구조 문서

> **목적:** 새 채팅 또는 새 개발자가 코드베이스를 이해하고 즉시 작업할 수 있도록 작성된 구조 문서.
> 파일을 추가·삭제할 때마다 이 문서를 업데이트해주세요.
>
> **최종 업데이트:** Sprint 3 UI 개선 완료 시점

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Catch A Tattoo |
| 목적 | 전 세계 타투이스트의 게스트워크 일정 발견 플랫폼 |
| 핵심 원칙 | "누가 / 어디에 / 언제 오는지"를 3초 안에 파악 |
| 프레임워크 | Next.js 14 App Router (TypeScript) |
| 스타일 | Tailwind CSS (mobile-first, max-w-mobile = 430px) |
| 백엔드 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel (GitHub main 브랜치 자동 배포) |
| 현재 Sprint | Sprint 3 진행 중 (UI 완료 / 인증·프로필 구현 예정) |

---

## 전체 파일 트리 (현재 기준)

```
catch-a-tattoo/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # 루트 레이아웃. BottomNav 전역 포함. PWA metadata.
│   │   ├── page.tsx                       # 홈 = 검색 중심 (SearchInput + HomeTagFilter + 피드)
│   │   ├── globals.css                    # Tailwind base + scrollbar-none
│   │   ├── not-found.tsx                  # 404 페이지
│   │   ├── artists/
│   │   │   └── [handle]/
│   │   │       └── page.tsx               # 아티스트 프로필. Supabase + dummy fallback.
│   │   ├── city/
│   │   │   └── [citySlug]/
│   │   │       └── page.tsx               # 도시 페이지. Guest / Based 섹션.
│   │   ├── following/
│   │   │   └── page.tsx                   # 팔로우 탭. 현재 빈 상태 UI. Sprint 5에서 실데이터 연결.
│   │   ├── map/
│   │   │   └── page.tsx                   # 지역 탐색. Asia/Europe/Americas 도시 카드 그리드.
│   │   ├── me/
│   │   │   └── page.tsx                   # 내 정보. 현재 placeholder. Sprint 3 후반 구현.
│   │   ├── notifications/
│   │   │   └── page.tsx                   # 알림. 현재 placeholder. Sprint 4에서 구현.
│   │   └── search/
│   │       └── page.tsx                   # 검색 결과. ?q= 파라미터 기반. ResultFilterBar 포함.
│   │
│   ├── components/
│   │   ├── artist/
│   │   │   └── FeedCard.tsx               # 피드 카드. 아티스트+일정 표시. 팔로우 버튼 포함.
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx              # 하단 5탭: 검색/팔로우/지역/알림/내 정보
│   │   │   ├── PageContainer.tsx          # 페이지 래퍼. max-w-mobile, BottomNav 여백.
│   │   │   └── TopBar.tsx                 # 상단 헤더. left/right 슬롯.
│   │   ├── schedule/
│   │   │   └── ScheduleBlock.tsx          # 일정 블록. card/inline 두 가지 variant.
│   │   ├── search/
│   │   │   ├── CityFilterBar.tsx          # ⚠️ 미사용. Sprint 3 마무리 시 삭제 예정.
│   │   │   ├── HomeTagFilter.tsx          # 홈 태그 필터 칩. 클릭 시 /search?tags= 이동.
│   │   │   ├── ResultFilterBar.tsx        # 검색 결과 내 태그·타입 필터 드로어.
│   │   │   ├── SearchFilterBar.tsx        # ⚠️ 미사용. Sprint 3 마무리 시 삭제 예정.
│   │   │   └── SearchInput.tsx            # 검색창 input. /search?q= 라우팅.
│   │   └── ui/
│   │       ├── Avatar.tsx                 # 이니셜 폴백 아바타. 색상 자동 배정.
│   │       ├── ErrorState.tsx             # 에러 상태. compact/full variant. 재시도 버튼.
│   │       ├── Skeleton.tsx               # 로딩 스켈레톤. FeedSkeleton, ProfileSkeleton.
│   │       ├── TagChip.tsx                # TagChip + TagList. highlightedSlugs prop으로 강조.
│   │       └── VerifiedBadge.tsx          # 인증 뱃지. BadgeCheck 아이콘.
│   │
│   ├── data/
│   │   └── dummy.ts                       # ⚠️ 삭제 금지. Supabase 실패 시 fallback.
│   │                                      # DUMMY_ARTISTS(4명), DUMMY_FEED, ALL_TAGS(32개)
│   │
│   ├── lib/
│   │   ├── queries/
│   │   │   └── artists.ts                 # 모든 Supabase 읽기 쿼리. 서버 전용.
│   │   ├── supabase/
│   │   │   ├── client.ts                  # 브라우저 싱글턴. "use client"에서만.
│   │   │   ├── server.ts                  # 서버 컴포넌트용. await cookies(). 매 요청 새 인스턴스.
│   │   │   └── admin.ts                   # Service Role. RLS 우회. 절대 클라이언트 금지.
│   │   └── utils.ts                       # cn(), formatDateRange(), calcDDay(), isScheduleActive()
│   │
│   └── types/
│       ├── database.types.ts              # Supabase DB 타입. CLI로 재생성 가능.
│       └── index.ts                       # 앱 레벨 타입: Tag, ArtistProfile, GuestSchedule, FeedCard
│
├── supabase/
│   └── migrations/
│       ├── 001_init.sql                   # DDL 전체. 11개 테이블 + RPC + Materialized View. ✅ 실행됨
│       ├── 002_rls.sql                    # RLS 정책 전체. ✅ 실행됨
│       └── 003_seed.sql                   # 태그 32개 + 샘플 아티스트 4명. ✅ 실행됨
│
├── docs/
│   ├── PROJECT_STRUCTURE.md              # 이 파일
│   ├── ARCHITECTURE.md                   # 아키텍처 결정사항, 클라이언트 사용 규칙
│   ├── KNOWN_ISSUES.md                   # 이슈 + 해결책 기록
│   ├── MASTER_LOG.md                     # 파일 변경 이력, 환경 변수
│   └── SPRINT_HISTORY.md                 # Sprint별 완료 항목 및 계획
│
├── public/
│   └── manifest.json                     # PWA manifest
│
├── tailwind.config.ts                    # cat-black, cat-purple, max-w-mobile
├── next.config.ts                        # 기본값 (이미지 도메인 추가 필요)
├── .env.local                            # 환경 변수 (gitignore)
└── .env.example                          # 환경 변수 템플릿 (커밋됨)
```

---

## 페이지별 핵심 정보

### `/` — 홈 (검색 중심)
```
revalidate: 30초
헤더: SearchInput + HomeTagFilter (태그 칩 가로 스크롤)
피드: getFeedSchedules() → 실패 시 DUMMY_FEED fallback
렌더링: 서버 컴포넌트 + Suspense
```

### `/search` — 검색 결과
```
쿼리: ?q=검색어&tags=slug1,slug2&type=all|guest|based
데이터: searchArtists() — 도시명 + 아티스트명 병렬 처리
필터: ResultFilterBar (검색 후에만 표시)
렌더링: 서버 컴포넌트 + Suspense
```

### `/following` — 팔로우 탭
```
상태: 빈 상태 UI (Sprint 5에서 실데이터 연결)
표시: 팔로우 아티스트 없을 때 아티스트 찾기 유도
```

### `/map` — 지역 탐색
```
revalidate: 3600초
구조: Asia / Europe / Americas 섹션별 도시 카드 2열 그리드
데이터: getCityPins(region) — city_pin_summary Materialized View
클릭: /city/:citySlug 이동
```

### `/city/:citySlug` — 도시 페이지
```
citySlug 형식: "seoul-kr" → city="Seoul", country="KR"
섹션 1: Guest Artists Coming to [City]
섹션 2: Based in [City]
데이터: getCityArtists(city) → { guests, based }
```

### `/artists/:handle` — 아티스트 프로필
```
params: Promise<{ handle: string }> — await 필수
데이터: getArtistProfile(handle) → 실패 시 getArtistByHandle(handle) fallback
미인증 배너: "Verify Profile" 버튼 (Claim Profile 아님)
작품 3장: 현재 placeholder (Sprint 3 후반 업로드 구현)
```

---

## FeedCard 구조 (Sprint 3 현재)

```
┌────────────────────────────────────────┐
│ [아바타] 아티스트명 ✓        [팔로우]  │  ← 상단 행
│         Tag1  Tag2  Tag3              │
├────────────────────────────────────────┤
│  Seoul              6/5 – 6/11        │  ← 어디/언제 블록
│  South Korea        D-3               │    (라벨 없음)
└────────────────────────────────────────┘
```

- "어디", "언제" 한글 라벨 제거 (Sprint 3에서)
- 도시명 아래 국가명 소자 표시 (countryName() 변환)
- 팔로우 버튼 오른쪽 상단 (현재 UI만, Sprint 3 후반에 실연결)

---

## BottomNav 탭 구조 (Sprint 3 현재)

| 순서 | href | 아이콘 | 라벨 |
|---|---|---|---|
| 1 | `/` | Search | 검색 |
| 2 | `/following` | Heart | 팔로우 |
| 3 | `/map` | MapPin | 지역 |
| 4 | `/notifications` | Bell | 알림 |
| 5 | `/me` | User | 내 정보 |

> Sprint 2 이전: 1번이 Home 아이콘 "홈" 라벨이었음.

---

## Supabase 클라이언트 3종 — 사용 규칙

| 파일 | 사용 위치 | 인스턴스 | 주의 |
|---|---|---|---|
| `client.ts` | `"use client"` 컴포넌트 | 싱글턴 | 브라우저 전용 |
| `server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 | `await` 필수 |
| `admin.ts` | Server Actions, Route Handlers | 싱글턴 | RLS 우회. **클라이언트 import 절대 금지** |

```ts
// server.ts 사용 패턴
const supabase = await getSupabaseServerClient();

// client.ts 사용 패턴
const supabase = getSupabaseBrowserClient();
```

---

## dummy.ts fallback 패턴 (모든 page.tsx 일관 적용)

```ts
const data = await fetchFromSupabase().catch(() => null);
if (!data || data.length === 0) return DUMMY_DATA;
```

`dummy.ts`는 영구 유지. 삭제 금지.

---

## 태그 시스템

| 그룹 | 선택 규칙 | 태그 수 |
|---|---|---|
| `color` | 필수 1개 | 2개 (Black, Color) |
| `main` | 필수 1개 | 14개 (Blackwork, Realism...) |
| `art` | 선택 0–4개 | 16개 (Fine Line, Pet...) |

- 전체 최소 2개, 최대 6개
- 태그 그룹 구분은 DB/검색 내부에서만 사용
- 프로필 화면: 단일 디자인으로 표시 (그룹 색상 구분 없음)
- 검색 시: 일치하는 태그만 강조 (highlightedSlugs prop)

---

## 환경 변수

| 변수 | 서버/클라이언트 | 상태 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 | ✅ Vercel 등록 완료 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 클라이언트 | ✅ Vercel 등록 완료 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 | ✅ Vercel 등록 완료 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 클라이언트 | ⏳ Sprint 4에서 등록 예정 |

---

## 빌드 자주 발생하는 오류

| 오류 | 원인 | 해결 |
|---|---|---|
| `Module not found: Instagram` | lucide-react 미지원 | SVG 직접 인라인 (KNOWN_ISSUES 참조) |
| `hasNotif` 타입 오류 | as const 배열 타입 추론 실패 | 속성 제거 후 경로 분기로 처리 |
| `params must be awaited` | Next.js 14 async params | `const { x } = await params` |
| `Type 'never'` | DB 타입 불일치 | toTag(), toSchedule() 변환 함수 |
| `alt is required` | img alt 누락 | alt 필수. 장식용은 `alt=""` |
| unused `searchParams` | 선언만 하고 미사용 | 사용 안 하면 props에서 제거 |

---

## Sprint 진행 현황

| Sprint | 목표 | 상태 | 완료율 |
|---|---|---|---|
| Sprint 1 | 더미 기반 홈·프로필 화면 | ✅ 완료 | 100% |
| Sprint 2 | Supabase 연결, 검색·지도 | ✅ 완료 | 100% |
| Sprint 3 | UI 구조 개선 + 인증·프로필 | 🔄 진행 중 | 40% |
| Sprint 4 | 일정 등록·Claim·알림 | ⏳ 예정 | 0% |
| Sprint 5 | 팔로우 실동작·Analytics | ⏳ 예정 | 0% |
| Sprint 6 | QA·최적화·출시 | ⏳ 예정 | 0% |

---

## 절대 규칙 (새 채팅에서도 반드시 준수)

```
❌ import { Instagram } from "lucide-react"
   → SVG 직접 인라인. KNOWN_ISSUES.md의 InstagramIcon 컴포넌트 참조.

❌ hasNotif: true  (as const 배열에서)
   → 속성 제거. 알림 점은 경로 또는 별도 상태로 처리.

❌ export default function Page({ params }: { params: { handle: string } })
   → export default async function Page({ params }: { params: Promise<{ handle: string }> })

❌ props에 searchParams 선언 후 미사용
   → 사용하지 않으면 선언 자체를 제거.

❌ const result = data as SomeType[]
   → toTag(), toSchedule() 변환 함수 사용.

❌ admin.ts를 "use client" 컴포넌트에서 import
   → admin.ts는 Server Actions, Route Handlers 전용.

❌ npm run dev에서만 확인 후 제출
   → npm run build 통과 필수.

❌ <img src="..." /> — alt 없음
   → alt 필수. 장식용은 alt="".
```
