# PROJECT_STRUCTURE.md
# Catch A Tattoo — 프로젝트 구조 문서

> **최종 업데이트:** Sprint 3-7 완료 + Product Direction Update 반영
>
> **현재 Sprint:** Sprint 3 전체 완료 / Sprint 4 진입 준비 완료
> **Build 상태:** ✅ 통과
> **Single Source of Truth:** UX/IA 최종 확정 (Sprint 4 착수 전)

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Catch A Tattoo (CAT) |
| 목적 | Tattoo Industry Data Platform — Discovery + Guest Work + Analytics |
| 핵심 원칙 | Discovery 강화 또는 Demand Data 생성 |
| 프레임워크 | Next.js 14 App Router (TypeScript) |
| 스타일 | Tailwind CSS (mobile-first, max-w-mobile = 430px) |
| 백엔드 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel (GitHub main 브랜치 자동 배포) |

---

## 전체 파일 트리 (Sprint 3-7 기준)

```
catch-a-tattoo/
├── middleware.ts                          # 보호 라우트. /me, /studio → 비로그인 시 /auth/login
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # 루트 레이아웃. BottomNav 전역 포함. PWA metadata.
│   │   ├── page.tsx                       # Discover 탭. Base City 기반 Guest 피드.
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   │
│   │   ├── artists/
│   │   │   ├── [handle]/page.tsx          # Artist Profile. 일정 + 도시별 Bring 수 표시.
│   │   │   └── new/
│   │   │       ├── NewArtistForm.tsx      # ✅ Sprint 3-3. 신규 프로필 생성 폼 (Client)
│   │   │       └── page.tsx               # ✅ Sprint 3-3.
│   │   │
│   │   ├── auth/
│   │   │   ├── callback/route.ts          # ✅ Sprint 3-1. 이메일 인증 콜백
│   │   │   ├── login/page.tsx             # ✅ Sprint 3-1.
│   │   │   ├── signup/page.tsx            # ✅ Sprint 3-1.
│   │   │   └── verify-email/page.tsx      # ✅ Sprint 3-1.
│   │   │
│   │   ├── calendar/
│   │   │   └── page.tsx                   # ⏳ Sprint 4. Customer/Artist View 분기.
│   │   │                                  # Customer: 월 요약 + 팔로우 일정 + 달력
│   │   │                                  # Artist: 도시 드롭다운 + 🟢🟡🔴 + 인사이트
│   │   │
│   │   ├── city/[citySlug]/page.tsx       # City Page. Customer/Artist View 분기.
│   │   │                                  # Customer: Guest 수 · 추천 아티스트
│   │   │                                  # Artist: + Bring 수 · 스타일 · 루트 · 인사이트
│   │   │
│   │   ├── following/page.tsx             # Following. [일정][팔로우] 탭 + 🔔 알림.
│   │   │
│   │   ├── me/
│   │   │   ├── page.tsx                   # ✅ Sprint 3-2. Customer 프로필.
│   │   │   │                              # 관심장르 · 팔로우 수 · Bring 수
│   │   │   │                              # [팔로잉] [내 Bring] 탭
│   │   │   └── settings/page.tsx          # ⏳ Sprint 4. Base City · 관심장르 · 알림 설정.
│   │   │
│   │   ├── notifications/page.tsx         # ⚠️ 미사용 예정 — Following 🔔 알림으로 통합
│   │   │
│   │   └── studio/
│   │       ├── page.tsx                   # ✅ Sprint 3-4/3-6. Artist Dashboard.
│   │       │                              # ⏳ Sprint 4 수정: 추천 도시 TOP + 도시 카드
│   │       ├── portfolio/
│   │       │   ├── PortfolioClient.tsx    # ✅ Sprint 3-6.
│   │       │   └── page.tsx               # ✅ Sprint 3-6.
│   │       ├── profile/edit/
│   │       │   ├── EditProfileForm.tsx    # ✅ Sprint 3-5.
│   │       │   └── page.tsx               # ✅ Sprint 3-5.
│   │       └── schedule/
│   │           ├── new/page.tsx           # ⏳ Sprint 4. 5단계 일정 등록 플로우.
│   │           └── [id]/page.tsx          # ⏳ Sprint 4. 일정 수정/삭제.
│   │
│   ├── actions/
│   │   ├── artist.ts                      # ✅ Sprint 3-3/3-5. createArtistProfile, updateArtistProfile
│   │   ├── auth.ts                        # ✅ Sprint 3-1. signUp, signIn, signOut
│   │   └── portfolio.ts                   # ✅ Sprint 3-6. addPortfolioItem, deletePortfolioItem
│   │   # (예정) schedule.ts              — 일정 등록/수정/삭제 (Sprint 4)
│   │   # (예정) bring.ts                 — Bring 등록/종료 (Sprint 4)
│   │   # (예정) follow.ts                — 팔로우/언팔로우 (Sprint 5)
│   │
│   ├── components/
│   │   ├── artist/
│   │   │   ├── FeedCard.tsx               # 피드 카드. 팔로우 버튼 실연결 예정(Sprint 5).
│   │   │   └── TagSelector.tsx            # ✅ Sprint 3-3/3-5. initialIds prop 포함.
│   │   │
│   │   ├── home/
│   │   │   ├── HomeFeedClient.tsx         # 클라이언트 피드. 태그+기간 필터링.
│   │   │   ├── HomeFilterBar.tsx          # 전체/이번주/Filter 상단 바
│   │   │   └── HomeFilterSheet.tsx        # 태그 바텀시트.
│   │   │
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx              # ✅ Sprint 3-1. 세션 분기. /auth/* 숨김.
│   │   │   │                              # ⏳ Sprint 4: 5탭 → 4탭 변경 필요
│   │   │   │                              # (Discover/Following/Calendar/나)
│   │   │   ├── PageContainer.tsx          # 페이지 래퍼.
│   │   │   └── TopBar.tsx                 # 상단 헤더. left/right 슬롯.
│   │   │
│   │   ├── schedule/
│   │   │   └── ScheduleBlock.tsx          # 일정 블록. card/inline variant.
│   │   │
│   │   ├── search/
│   │   │   ├── ResultFilterBar.tsx        # 검색 결과 내 태그·타입 필터.
│   │   │   └── SearchInput.tsx            # 검색창 input.
│   │   │   # ⛔ CityFilterBar.tsx  삭제됨 (Sprint 3-7)
│   │   │   # ⛔ SearchFilterBar.tsx 삭제됨 (Sprint 3-7)
│   │   │
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── ErrorState.tsx
│   │       ├── Skeleton.tsx
│   │       ├── TagChip.tsx
│   │       └── VerifiedBadge.tsx
│   │
│   ├── data/
│   │   └── dummy.ts                       # ⚠️ 삭제 금지. Supabase 실패 시 fallback.
│   │
│   ├── lib/
│   │   ├── analytics/                     # (신규 예정 — Sprint 4)
│   │   │   └── collect.ts                 # Demand Signal 수집 함수
│   │   ├── hooks/
│   │   │   └── useSession.ts              # ✅ Sprint 3-1.
│   │   ├── mock-preferences.ts            # ⚠️ MOCK_BASE_CITY 하드코딩.
│   │   │                                  # Sprint 4에서 세션 기반으로 교체 필수
│   │   ├── queries/
│   │   │   ├── artists.ts                 # 모든 Supabase 읽기 쿼리. 서버 전용.
│   │   │   ├── cities.ts                  # (신규 예정 — Sprint 4) City System 쿼리
│   │   │   ├── studio.ts                  # ✅ Sprint 3-3/3-4/3-6. getMyArtistProfile, getMyPortfolio
│   │   │   └── user.ts                    # ✅ Sprint 3-2. getUserProfile
│   │   ├── supabase/
│   │   │   ├── admin.ts                   # ✅ Sprint 3-3. SupabaseClient<Database> 명시.
│   │   │   ├── client.ts                  # 브라우저 싱글턴.
│   │   │   └── server.ts                  # 서버 컴포넌트용.
│   │   └── utils.ts
│   │
│   └── types/
│       ├── database.types.ts              # ✅ Sprint 3-3. Relationships: [] 포함.
│       │                                  # Sprint 4: cities, demand_events, search_logs 추가 예정
│       └── index.ts                       # 앱 레벨 타입.
│
├── supabase/
│   └── migrations/
│       ├── 001_init.sql                   # ✅ 실행됨
│       ├── 002_rls.sql                    # ✅ 실행됨
│       ├── 003_seed.sql                   # ✅ 실행됨 (태그 32개 + 샘플 아티스트 4명)
│       # (예정) 004_cities.sql            — cities + city_requests 테이블 (Sprint 4)
│       # (예정) 005_bring_update.sql      — city_follows is_active 등 추가 (Sprint 4)
│       # (예정) 006_analytics.sql         — demand_events + search_logs (Sprint 4)
│       # (예정) 007_users_base_city.sql   — users.base_city_changed_at 추가 (Sprint 4)
│
└── docs/
    ├── ARCHITECTURE.md
    ├── PROJECT_STRUCTURE.md
    ├── MASTER_LOG.md
    ├── SPRINT_HISTORY.md
    └── KNOWN_ISSUES.md
```

---

## DB 테이블 현황 (Sprint 3-7 기준)

| 테이블 | 용도 | 상태 |
|---|---|---|
| `users` | 사용자 기본 정보 | ✅ 운영 중 |
| `artist_profiles` | 아티스트 프로필 | ✅ 운영 중 |
| `tags` | 스타일 태그 (32개) | ✅ 운영 중 |
| `artist_tags` | 아티스트-태그 연결 | ✅ 운영 중 |
| `portfolio_items` | 포트폴리오 이미지 | ✅ 운영 중 |
| `guest_schedules` | 게스트워크 일정 | ✅ 운영 중 |
| `follows` | 팔로우 (Demand Signal) | ✅ 운영 중 |
| `city_follows` | Bring This Artist (Demand Signal) | ✅ 운영 중 (Sprint 4에서 컬럼 추가 예정) |
| `city_demand_cache` | 도시별 팔로우 집계 | ✅ 운영 중 |
| `notifications` | 알림 | ✅ 구조 있음 |
| `demand_notifications` | 수요 임계값 알림 | ✅ 구조 있음 |
| `claim_requests` | Claim/Verify 요청 | ✅ 구조 있음 |
| `city_pin_summary` | 도시별 일정 집계 (Materialized View) | ✅ 운영 중 |
| `cities` | 관리형 도시 마스터 | ⏳ Sprint 4 신규 |
| `city_requests` | 도시 추가 요청 | ⏳ Sprint 4 신규 |
| `demand_events` | Demand Signal 이벤트 로그 | ⏳ Sprint 4 신규 |
| `search_logs` | 검색 로그 | ⏳ Sprint 4 신규 |
| `analytics_snapshots` | 월별 Growth 집계 | ⏳ Sprint 5 신규 |

---

## export 방식 레퍼런스 (추측 금지 — 실제 기준)

| 파일 | export 방식 |
|---|---|
| `BottomNav.tsx` | `export default function BottomNav()` |
| `PageContainer.tsx` | `export function PageContainer()` — named |
| `TopBar.tsx` | `export function TopBar()` — named |
| `Avatar.tsx` | `export function Avatar()` — named |
| `ErrorState.tsx` | `export function ErrorState()` — named |
| `TagChip.tsx` | `export function TagChip()`, `export function TagList()` — named |
| `VerifiedBadge.tsx` | `export function VerifiedBadge()` — named |
| `TagSelector.tsx` | `export function TagSelector()` — named |
| `useSession.ts` | `export function useSession()` — named |
| `getSupabaseServerClient` | named, async |
| `getSupabaseAdminClient` | named, returns `SupabaseClient<Database>` |

---

## Sprint 진행 현황

| Sprint | 목표 | 상태 |
|---|---|---|
| Sprint 1 | 더미 기반 홈·프로필 | ✅ 완료 |
| Sprint 2 | Supabase 연결, 검색·지도 | ✅ 완료 |
| Sprint 3 Pre | UI 구조 개선 | ✅ 완료 |
| Sprint 3-1 | Auth Foundation | ✅ 완료 |
| Sprint 3-2 | User Profile | ✅ 완료 |
| Sprint 3-3 | Artist Creation | ✅ 완료 |
| Sprint 3-4 | Studio Dashboard | ✅ 완료 |
| Sprint 3-5 | Profile Edit | ✅ 완료 |
| Sprint 3-6 | Portfolio Upload | ✅ 완료 |
| Sprint 3-7 | Cleanup & QA | ✅ 완료 |
| **Sprint 4** | **Guest Work + City System + Bring 정책 + Analytics** | ⏳ 예정 |
| **Sprint 5** | **Following 실데이터 + Demand Signals + Admin** | ⏳ 예정 |
| **Sprint 6** | **Admin Analytics Dashboard + QA** | ⏳ 예정 |

---

## 절대 규칙

```
❌ import { Instagram } from "lucide-react"   → SVG 직접 인라인
❌ hasNotif: true (as const 배열에서)         → 속성 제거
❌ params 동기 접근                           → await 필수
❌ admin.ts 클라이언트 import                 → Server Actions 전용
❌ npm run dev 확인 후 제출                   → npm run build 필수
❌ import TopBar from "..."   (default)       → import { TopBar } from "..."
❌ import { useActionState } from "react"     → useFormState from "react-dom"
❌ Relationships: [] 누락 (database.types.ts) → 모든 테이블/뷰에 필수
❌ zip 제출 시 의존 파일 누락                 → 수정 파일 + 의존 파일 모두 포함
❌ <img /> eslint 처리 없이                   → eslint-disable-next-line 주석 추가
❌ 예약/결제/In-App 메시지 기능 추가          → Not Planned
❌ 도시 자유 텍스트 입력                      → cities 마스터 테이블 참조
❌ Bring 집계 시 is_active 필터 누락          → Current Demand는 is_active=true만
```
