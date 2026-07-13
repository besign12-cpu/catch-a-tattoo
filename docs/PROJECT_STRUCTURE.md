# PROJECT_STRUCTURE.md
# Catch A Tattoo — 프로젝트 구조 문서

> **최종 업데이트:** Sprint 5 Final (Phase 1 Locale Refactor 완료)
> **Build 상태:** ✅ 통과
> **Next.js:** 14.2.35 App Router

---

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스명 | Catch A Tattoo (CAT) |
| 목적 | Tattoo Industry Data Platform — Discovery + Guest Work + Analytics |
| 프레임워크 | Next.js 14.2.35 App Router (TypeScript ^5) |
| 스타일 | Tailwind CSS (mobile-first, max-w-[430px]) |
| 백엔드 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 배포 | Vercel (GitHub main 자동 배포) |

---

## 전체 파일 트리 (Sprint 5 Final 기준)

```
catch-a-tattoo/
├── middleware.ts                          # 보호 라우트 + /ko/* locale 처리
│                                          # x-locale 헤더 + NEXT_LOCALE 쿠키 설정
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # 루트 레이아웃. BottomNav 전역 포함.
│   │   ├── page.tsx                       # Discover. Base City 기반 Guest 피드.
│   │   ├── globals.css
│   │   ├── not-found.tsx                  # 404. usePathname으로 /ko 감지.
│   │   │
│   │   ├── ko/                            # KO locale re-export 라우트
│   │   │   ├── page.tsx                   # /ko → Discover (KO)
│   │   │   ├── following/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── city/[citySlug]/page.tsx
│   │   │   ├── me/page.tsx
│   │   │   ├── me/settings/page.tsx
│   │   │   └── artists/
│   │   │       ├── [handle]/page.tsx
│   │   │       ├── [handle]/edit/page.tsx
│   │   │       ├── [handle]/portfolio/page.tsx
│   │   │       ├── [handle]/schedule/new/page.tsx
│   │   │       ├── [handle]/schedule/[id]/page.tsx
│   │   │       └── new/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── analytics/route.ts
│   │   │   ├── calendar/
│   │   │   │   ├── city-schedules/route.ts
│   │   │   │   ├── city/route.ts
│   │   │   │   └── following/route.ts
│   │   │   ├── discover/city/route.ts     # Discover 도시 전환 API
│   │   │   └── follow/route.ts
│   │   │
│   │   ├── artists/
│   │   │   ├── [handle]/
│   │   │   │   ├── page.tsx               # Artist Profile
│   │   │   │   ├── BackButton.tsx         # router.back() Client Component
│   │   │   │   ├── edit/
│   │   │   │   │   ├── EditProfileForm.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── portfolio/
│   │   │   │   │   ├── PortfolioClient.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── schedule/
│   │   │   │       ├── new/
│   │   │   │       │   ├── ScheduleNewClient.tsx
│   │   │   │       │   └── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           ├── ScheduleEditClient.tsx
│   │   │   │           └── page.tsx
│   │   │   └── new/
│   │   │       ├── NewArtistForm.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   ├── login/page.tsx             # useSearchParams로 next 파라미터 처리
│   │   │   ├── signup/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   │
│   │   ├── calendar/
│   │   │   ├── page.tsx
│   │   │   └── CalendarClient.tsx         # Customer/Artist View 분기
│   │   │                                  # CalendarClientProps: role, cities,
│   │   │                                  # artistHandle?, followingSchedules?,
│   │   │                                  # initialCitySchedules?, initialCustomerCity?,
│   │   │                                  # initialArtistCity?, initialCityData?,
│   │   │                                  # initialYear?, initialMonth?
│   │   │
│   │   ├── city/[citySlug]/page.tsx       # City Page (getLocaleServer 사용)
│   │   │
│   │   ├── following/
│   │   │   ├── page.tsx
│   │   │   └── FollowingClient.tsx        # [일정][팔로우] 탭
│   │   │
│   │   ├── me/
│   │   │   ├── page.tsx                   # MeLinks Client Component 사용
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── SettingsBackButton.tsx # usePathname 기반 back 링크
│   │   │       └── SettingsClient.tsx
│   │   │
│   │   ├── search/page.tsx                # 검색 (getLocaleServer 사용)
│   │   │
│   │   ├── studio/                        # Artist 전용
│   │   │   ├── page.tsx
│   │   │   ├── portfolio/
│   │   │   │   ├── PortfolioClient.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── profile/edit/
│   │   │   │   ├── EditProfileForm.tsx
│   │   │   │   └── page.tsx
│   │   │   └── schedule/
│   │   │       ├── new/
│   │   │       │   ├── ScheduleNewClient.tsx
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           ├── ScheduleEditClient.tsx
│   │   │           └── page.tsx
│   │   │
│   │   ├── map/page.tsx                   # 미사용 (레거시)
│   │   └── notifications/page.tsx         # 미사용 (레거시)
│   │
│   ├── actions/
│   │   ├── artist.ts                      # createArtistProfile, updateArtistProfile
│   │   ├── auth.ts                        # signUp, signIn, signOut (locale-aware)
│   │   ├── bring.ts                       # toggleBring
│   │   ├── follow.ts                      # toggleFollow
│   │   ├── portfolio.ts                   # addPortfolioItem, deletePortfolioItem
│   │   ├── schedule.ts                    # createGuestSchedule, updateGuestSchedule
│   │   └── settings.ts                    # updateBaseCity, updateInterestTags, updateNotifications
│   │
│   ├── components/
│   │   ├── artist/
│   │   │   ├── BringButton.tsx            # useLocaleNav 사용
│   │   │   ├── CityDropdown.tsx           # useT 적용
│   │   │   ├── FeedCard.tsx               # useT 적용, calcDDay 플래그 번역
│   │   │   ├── FollowButton.tsx           # useT 적용
│   │   │   ├── InstagramLink.tsx
│   │   │   └── TagSelector.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeFeedClient.tsx         # Discover UX. 검색→도시 변경. useT 적용.
│   │   │   ├── HomeFilterBar.tsx          # useT 적용
│   │   │   └── HomeFilterSheet.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx              # locale-aware 링크. buildT 번역.
│   │   │   ├── LanguageSwitcher.tsx       # /ko ↔ / 전환. 경로 유지.
│   │   │   ├── PageContainer.tsx
│   │   │   └── TopBar.tsx
│   │   │
│   │   ├── me/
│   │   │   └── MeLinks.tsx                # locale-aware Me 링크 모음
│   │   │                                  # ArtistProfileLink, SettingsLink,
│   │   │                                  # SettingsIconLink, LogoutButton
│   │   │
│   │   ├── schedule/
│   │   │   └── ScheduleBlock.tsx          # useT 적용 ("use client" 추가)
│   │   │
│   │   ├── search/
│   │   │   ├── ResultFilterBar.tsx
│   │   │   └── SearchInput.tsx
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
│   ├── i18n/
│   │   ├── config.ts                      # locales, Locale 타입
│   │   ├── translations.ts                # Client-safe 번역 데이터 + buildT()
│   │   ├── translations.server.ts         # Server전용 getT()
│   │   └── request.ts                     # (비워둠 — next-intl 제거됨)
│   │
│   ├── lib/
│   │   ├── analytics/
│   │   │   └── collect.ts                 # Demand Signal 수집
│   │   ├── hooks/
│   │   │   ├── useAnalytics.ts
│   │   │   ├── useLocale.ts
│   │   │   ├── useLocaleNav.ts            # locale-aware 네비게이션 훅
│   │   │   ├── useSession.ts
│   │   │   └── useT.ts                    # 번역 훅 (usePathname 기반)
│   │   ├── locale.server.ts               # getLocaleServer() — Server전용
│   │   ├── locale.client.ts               # localeFromPath(), lpFromPath()
│   │   ├── mock-preferences.ts            # DEFAULT_BASE_CITY, toCitySlug
│   │   ├── queries/
│   │   │   ├── artists.ts
│   │   │   ├── calendar.ts                # CalendarScheduleItem, CityCalendarData
│   │   │   ├── following.ts
│   │   │   ├── studio.ts
│   │   │   └── user.ts
│   │   ├── supabase/
│   │   │   ├── admin.ts
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── utils.ts                       # calcDDay (플래그 방식), formatDateRange, cn
│   │
│   └── types/
│       ├── database.types.ts              # Relationships: [] 포함 필수
│       └── index.ts
│
└── docs/
    ├── ARCHITECTURE.md
    ├── PROJECT_STRUCTURE.md
    ├── MASTER_LOG.md
    ├── SPRINT_HISTORY.md
    └── KNOWN_ISSUES.md
```

---

## export 방식 레퍼런스

| 파일 | export 방식 |
|---|---|
| `BottomNav.tsx` | `export default function BottomNav()` |
| `PageContainer.tsx` | `export function PageContainer()` — named |
| `TopBar.tsx` | `export function TopBar()` — named |
| `Avatar.tsx` | `export function Avatar()` — named |
| `VerifiedBadge.tsx` | `export function VerifiedBadge()` — named |
| `TagChip.tsx` | `export function TagChip(), TagList()` — named |
| `useSession.ts` | `export function useSession()` — named |
| `useT.ts` | `export function useT()` — named |
| `useLocaleNav.ts` | `export function useLocaleNav()` — named |
| `getLocaleServer` | `export async function getLocaleServer()` — named |
| `getT` | `export async function getT()` — named (server only) |
| `buildT` | `export function buildT()` — named (client safe) |

---

## DB 테이블 현황 (Sprint 5 기준)

| 테이블 | 용도 | 상태 |
|---|---|---|
| `users` | 사용자 기본 정보, base_city, base_city_changed_at | ✅ 운영 중 |
| `artist_profiles` | 아티스트 프로필 | ✅ 운영 중 |
| `tags` | 스타일 태그 | ✅ 운영 중 |
| `artist_tags` | 아티스트-태그 연결 | ✅ 운영 중 |
| `portfolio_items` | 포트폴리오 이미지 | ✅ 운영 중 |
| `guest_schedules` | Guest Work 일정 | ✅ 운영 중 |
| `follows` | 팔로우 | ✅ 운영 중 |
| `city_follows` | Bring This Artist (is_active 포함) | ✅ 운영 중 |
| `cities` | 관리형 도시 마스터 | ✅ 운영 중 |
| `city_requests` | 도시 추가 요청 | ✅ 운영 중 |
| `user_interests` | 사용자 관심 장르 | ✅ 운영 중 |
| `demand_events` | Demand Signal 이벤트 로그 | ✅ 운영 중 |
| `search_logs` | 검색 로그 | ✅ 운영 중 |
| `city_demand_cache` | 도시별 팔로우 집계 | ✅ 운영 중 |
| `city_pin_summary` | 도시별 일정 집계 (Materialized View) | ✅ 운영 중 |
| `analytics_snapshots` | 월별 Growth 집계 | ⏳ Sprint 6 |

---

## calcDDay 플래그 방식 (Sprint 5)

```ts
// utils.ts
// "진행 중" → "__LAST_DAY__" or "D-N·__IN_TOWN__"
// 각 컴포넌트에서 useT("artist").inTown, lastDay로 번역

// FeedCard.tsx, ScheduleBlock.tsx 참조
```

---

## 절대 규칙

```
❌ import { Instagram } from "lucide-react" → SVG 직접 인라인
❌ params 동기 접근 → await 필수
❌ admin.ts 클라이언트 import
❌ npm run build 통과 전 제출
❌ Relationships: [] 누락 (database.types.ts)
❌ href="/me/settings" 하드코딩 → useLocaleNav().href("/me/settings")
❌ redirect("/") 하드코딩 → getLocaleServer().href("/")
❌ KO 상태에서 EN 경로 이동
❌ 도시 자유 텍스트 입력 → cities 마스터 테이블
❌ Bring 집계 시 is_active 필터 누락
```
