# MASTER_LOG.md
# Catch A Tattoo — 개발 마스터 로그

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스 | 게스트워크 중심 타투이스트 발견 플랫폼 |
| 기술 스택 | Next.js 14 App Router · Supabase · Tailwind CSS |
| 배포 | Vercel (자동 배포, main 브랜치) |
| DB | Supabase (PostgreSQL + RLS) |
| 저장소 | GitHub |
| 현재 상태 | Sprint 4 전체 완료 (build ✅) / QA 완료 / Sprint 5 착수 준비 완료 |

---

## 환경 변수 목록

| 변수 | 용도 | 노출 범위 | 상태 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 | ✅ 등록 완료 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 클라이언트 | ✅ 등록 완료 |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회용 (Admin) | 서버 전용 | ✅ 등록 완료 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox 지도 | 클라이언트 | ⏳ 미등록 (미사용) |

> `.env.local`은 gitignore. `.env.example`만 커밋.

---

## 파일 변경 이력

### Sprint 1 — 초기 구축 ✅

| 파일 | 작업 |
|---|---|
| `src/app/layout.tsx` | 루트 레이아웃, PWA metadata, Inter 폰트 |
| `src/app/page.tsx` | 홈 피드 (더미 데이터) |
| `src/app/globals.css` | Tailwind base + scrollbar-none |
| `src/app/not-found.tsx` | 404 페이지 |
| `src/app/artists/[handle]/page.tsx` | 아티스트 프로필 |
| `src/app/search/page.tsx` | 검색 (placeholder) |
| `src/app/map/page.tsx` | 지도 (placeholder) |
| `src/app/me/page.tsx` | 내 정보 (placeholder) |
| `src/app/notifications/page.tsx` | 알림 (placeholder) |
| `src/components/layout/BottomNav.tsx` | 하단 5탭 네비게이션 |
| `src/components/layout/PageContainer.tsx` | 모바일 max-w 컨테이너 |
| `src/components/layout/TopBar.tsx` | 상단 헤더 슬롯 |
| `src/components/artist/FeedCard.tsx` | 피드 카드 (누가·어디·언제) |
| `src/components/schedule/ScheduleBlock.tsx` | 일정 블록 |
| `src/components/ui/Avatar.tsx` | 이니셜 폴백 아바타 |
| `src/components/ui/ErrorState.tsx` | 에러 + 재시도 버튼 |
| `src/components/ui/Skeleton.tsx` | 로딩 스켈레톤 |
| `src/components/ui/TagChip.tsx` | 태그 칩 + TagList |
| `src/components/ui/VerifiedBadge.tsx` | 인증 뱃지 |
| `src/data/dummy.ts` | 더미 아티스트 4명, 태그 32개 |
| `src/types/index.ts` | 앱 레벨 타입 |
| `src/lib/utils.ts` | cn, formatDateRange, calcDDay |
| `public/manifest.json` | PWA manifest |
| `tailwind.config.ts` | 커스텀 색상, 모바일 breakpoint |

### Sprint 2 — Supabase 연결 ✅

| 파일 | 작업 |
|---|---|
| `src/lib/supabase/client.ts` | 브라우저 클라이언트 싱글턴 |
| `src/lib/supabase/server.ts` | 서버 컴포넌트용 (cookies 기반) |
| `src/lib/supabase/admin.ts` | Service Role 클라이언트 (RLS 우회) |
| `src/types/database.types.ts` | DB 타입 (수동 작성) |
| `src/lib/queries/artists.ts` | 피드·프로필·검색·지도·태그 쿼리 함수 |
| `src/app/page.tsx` | Supabase 데이터 + dummy fallback |
| `src/app/artists/[handle]/page.tsx` | Supabase + dummy fallback |
| `src/app/search/page.tsx` | URL 기반 검색 |
| `src/app/map/page.tsx` | 도시 핀 목록 |
| `src/app/city/[citySlug]/page.tsx` | Guest / Based 섹션 |
| `supabase/migrations/001_init.sql` | 전체 DDL |
| `supabase/migrations/002_rls.sql` | RLS 정책 |
| `supabase/migrations/003_seed.sql` | 태그 32개 + 샘플 데이터 |

### Sprint 3 — UI 구조 개선 + 인증·프로필 시스템 ✅

| 파일 | 작업 |
|---|---|
| `src/components/layout/BottomNav.tsx` | 검색/팔로우 탭 구조 개편 |
| `src/components/artist/FeedCard.tsx` | 라벨 제거, 국가명 추가 |
| `src/components/search/SearchInput.tsx` | controlled/uncontrolled 하위 호환 |
| `src/components/home/HomeFeedClient.tsx` | Base City 섹션 피드 + AND 필터링 |
| `src/components/home/HomeFilterBar.tsx` | 전체/이번주/Filter 상단 바 |
| `src/components/home/HomeFilterSheet.tsx` | 태그 바텀시트 |
| `src/app/page.tsx` | Base City 기반 섹션형 홈 피드 |
| `src/app/following/page.tsx` | 팔로우 탭 신규 (빈 상태 UI) |
| `src/app/city/[citySlug]/page.tsx` | Guest/Based 탭 구조 |
| `src/app/auth/**` | 로그인·회원가입 화면 |
| `src/app/studio/**` | 아티스트 스튜디오 (Sprint 5에서 제거 예정) |
| `src/actions/auth.ts` | 인증 Server Actions |
| `src/actions/artist.ts` | 프로필 생성/수정 Server Actions |
| `src/actions/portfolio.ts` | 포트폴리오 Server Actions |
| `src/components/artist/TagSelector.tsx` | 태그 선택 UI |
| `src/lib/hooks/useSession.ts` | 세션 훅 |
| `middleware.ts` | 라우트 보호 |
| `src/lib/queries/studio.ts` | Studio 쿼리 함수 |
| `src/lib/queries/user.ts` | 유저 프로필 쿼리 |

### Sprint 4 — Navigation 재편 + City System + Bring 정책 + QA ✅

#### Sprint 4-1 — DB Migrations ✅

| 파일 | 작업 |
|---|---|
| `supabase/migrations/004_cities.sql` | cities + city_requests 테이블 + seed 60개 도시 |
| `supabase/migrations/005_bring_update.sql` | city_follows: is_active, expired_reason, expired_at + RPC 함수 3개 |
| `supabase/migrations/006_analytics.sql` | demand_events + search_logs + analytics_snapshots |
| `supabase/migrations/007_users_base_city.sql` | users.base_city_changed_at + can_change_base_city RPC |
| `src/types/database.types.ts` | Sprint 4 신규 테이블 타입 추가 (cities, city_requests, demand_events, search_logs, analytics_snapshots) |

#### Sprint 4-2 — BottomNav 5탭 → 4탭 ✅

| 파일 | 작업 |
|---|---|
| `src/components/layout/BottomNav.tsx` | 4탭 전환 (Discover/Following/Calendar/나), 나 탭 → /me 통일 |
| `src/lib/hooks/useSession.ts` | role 필드 추가 (UserRole 타입) |

#### Sprint 4-3 — Calendar 페이지 ✅

| 파일 | 작업 |
|---|---|
| `src/app/calendar/page.tsx` | Customer/Artist View 분기, 비로그인도 달력 표시 |
| `src/app/calendar/CalendarClient.tsx` | 월간 달력, CityDropdown 통일, 수요 레벨 범례 |

#### Sprint 4-4 — Following 페이지 ✅

| 파일 | 작업 |
|---|---|
| `src/app/following/page.tsx` | 서버 컴포넌트 전환, 로그인 확인 |
| `src/app/following/FollowingClient.tsx` | [일정][팔로우] 탭 + 🔔 알림 버튼 |

#### Sprint 4-5 — Studio Dashboard 개편 ✅

| 파일 | 작업 |
|---|---|
| `src/app/studio/page.tsx` | Guest Work 등록 CTA 최상단, 추천 도시 TOP 구조, 로그아웃 버튼 |

#### Sprint 4-6 — City Page 개편 ✅

| 파일 | 작업 |
|---|---|
| `src/app/city/[citySlug]/page.tsx` | KPI 카드 (Guest/Based/Bring), Artist View 인사이트 배너, 인기 스타일 섹션 |

#### Sprint 4-7 — Artist Profile 개편 ✅

| 파일 | 작업 |
|---|---|
| `src/app/artists/[handle]/page.tsx` | Bring 버튼 CTA 이동, 예약 상태 표시 (Available/Fully booked), 본인 수정 링크, ScheduleBlock availStatus |
| `src/components/schedule/ScheduleBlock.tsx` | availStatus prop 추가 |

#### Sprint 4-8 — /studio/schedule/new ✅

| 파일 | 작업 |
|---|---|
| `src/app/studio/schedule/new/page.tsx` | 서버 컴포넌트, cities 조회, 기존 일정 중복 방지 |
| `src/app/studio/schedule/new/ScheduleNewClient.tsx` | 5단계 플로우, CityDropdown 통일, 날짜 중복 비활성 |
| `src/actions/schedule.ts` | createGuestSchedule, 날짜 중복 서버 재검증 |

#### Sprint 4-9 — /studio/schedule/:id ✅

| 파일 | 작업 |
|---|---|
| `src/app/studio/schedule/[id]/page.tsx` | 서버 컴포넌트, 소유권 확인, 과거 일정 처리 |
| `src/app/studio/schedule/[id]/ScheduleEditClient.tsx` | 수정 폼, 삭제 모달 |
| `src/actions/schedule.ts` | updateGuestSchedule, deleteGuestSchedule 추가 |

#### Sprint 4-10 — /me/settings ✅

| 파일 | 작업 |
|---|---|
| `src/app/me/settings/page.tsx` | 서버 컴포넌트, 30일 제한 계산, cities/tags 조회 |
| `src/app/me/settings/SettingsClient.tsx` | Base City CityDropdown, 관심장르, 알림 설정 UI |
| `src/actions/settings.ts` | updateBaseCity (update_base_city RPC + expire_bring RPC), updateInterestTags |
| `src/app/page.tsx` | MOCK_BASE_CITY 제거 → 세션 기반 users.base_city 조회 |
| `src/lib/mock-preferences.ts` | MOCK 상수 제거, DEFAULT_BASE_CITY/DEFAULT_BASE_COUNTRY로 교체 |

#### Sprint 4-11 — 아티스트 프로필 Base City CityDropdown 전환 ✅

| 파일 | 작업 |
|---|---|
| `src/components/artist/CityDropdown.tsx` | 신규 — 공용 도시 선택 컴포넌트 (onSelect 콜백 모드 지원) |
| `src/app/artists/new/NewArtistForm.tsx` | 자유텍스트 → CityDropdown |
| `src/app/artists/new/page.tsx` | cities 조회 추가 |
| `src/app/studio/profile/edit/EditProfileForm.tsx` | 자유텍스트 → CityDropdown |
| `src/app/studio/profile/edit/page.tsx` | cities 조회 추가 |

#### Sprint 4 QA ✅

| 파일 | 작업 |
|---|---|
| `src/app/me/page.tsx` | Artist Studio CTA 카드, Settings 링크, 로그아웃 버튼, getUserProfile try-catch |
| `src/app/studio/page.tsx` | 로그아웃 버튼 추가 |
| `src/app/calendar/page.tsx` | 비로그인도 cities 조회, role=null 처리 |
| `src/app/calendar/CalendarClient.tsx` | CustomerCalendar CityDropdown, 범례 단순화 |

---

## 반복 금지 패턴 (2회 이상 발생)

| 패턴 | 발생 횟수 | 대체 방법 |
|---|---|---|
| `import { Instagram } from "lucide-react"` | 2회 | SVG 직접 인라인 |
| `hasNotif` 타입 오류 | 2회 | 속성 제거 후 경로 분기 |
| unused import → build 실패 | 5회+ | 파일 수정 후 import 전수 확인 필수 |
| Server Component에서 onClick | 2회 | `<div role="button" aria-disabled>` 또는 Client 분리 |
| isScheduleActive 반환값 오타 | 1회 | "active" \| "upcoming" \| "ended" — "past" 아님 |
| 컴포넌트 교체 후 호출부 미수정 | 3회 | 컴포넌트명 grep 후 전수 확인 |
| CityDropdown 중복 렌더 | 1회 | 컴포넌트별 CityDropdown 개수 확인 |

---

## 빌드 규칙

- 모든 코드는 `npm run build` 통과 후 제출
- `dev` 서버에서만 되는 코드 제출 금지
- TypeScript strict 모드 준수
- unused import 제출 금지 — ESLint build 실패 원인
- 공용 컴포넌트 API 변경 시 `grep -R "ComponentName" src` 전수 확인 필수
- 타입 오류 발생 시 `as unknown` 추론 수정 금지 — 관련 파일 먼저 요청
- **export/import 방식 추측 금지 — 실제 파일 확인 후 작성**
- **React 18: useFormState / useFormStatus (react-dom) 사용**
- **database.types.ts 수동 작성 시 Relationships: [] 필수**
- **zip 제출 시 의존 파일도 함께 포함**
- **Server Action에서 as any 사용 시 eslint-disable 또는 DB Row 타입 직접 지정**
- **Server Component에서 onClick 핸들러 금지 — Client Component로 분리**
- **isScheduleActive 반환값: "active" | "upcoming" | "ended" (not "past")**
- **CityDropdown 사용 시 컴포넌트별 중복 렌더 여부 확인**

## 배포 규칙

- main 브랜치 push → Vercel 자동 배포
- PR merge 전 로컬 빌드 확인 필수

---

## Sprint 5 전 확정 사항

### IA 확정 — Studio 제거, Artist Profile 중심 구조

```
Sprint 5 첫 작업: /studio 제거 → /artists/:handle 중심 전환

변경 URL
❌ /studio                   → redirect /artists/:handle
❌ /studio/profile/edit      → /artists/:handle/edit
❌ /studio/schedule/new      → /artists/:handle/schedule/new
❌ /studio/schedule/:id      → /artists/:handle/schedule/:id
❌ /studio/portfolio         → /artists/:handle/portfolio

/artists/:handle 탭 구조 (본인만 관리 UI 노출)
├── [프로필] 탭  — 공개 뷰 + 본인: [수정] 버튼
├── [일정]  탭  — Guest Work 목록 + 본인: [+ 등록] [수정/삭제]
└── [인사이트] 탭 — Sprint 6, 본인만 표시
```

### i18n 확정 — next-intl, 영어 기본

```
기본 언어:   / = English
한국어:      /ko = Korean
라이브러리:  next-intl (Sprint 5 초반 도입)

Language 버튼 위치:
- Discover TopBar 우상단 (비로그인 접근 가능)
- /me/settings Language 섹션

번역 제외 고유 개념어:
CAT, Guest Work, Bring, Bring This Artist,
Follow, Based City, Artist Profile, Discovery, Demand Signal

Admin Analytics: 한국어만 유지
```

---

## Product Direction (Sprint 5~)

> **CAT Vision:** Discovery + Guest Work + Analytics = Tattoo Industry Data Platform
> **North Star Metric:** Monthly Demand Signals

### Sprint 5 목표 (확정)

1. **Studio 제거 + Artist Profile 중심 IA 전환**
2. **next-intl 도입 (구조 먼저)**
   - messages/en.json, messages/ko.json 기본 구조
   - Discover TopBar Language 버튼
   - /me/settings Language 설정
3. **Following 실데이터 연결** — 팔로우 아티스트 일정/목록 쿼리
4. **Bring This Artist 실동작** — city_follows is_active 기반 Current Demand
5. **Analytics 수집 시작** — demand_events, search_logs
6. **city_requests 도시 추가 요청 UI**

### Sprint 6 목표
- /artists/:handle 인사이트 탭 (도시별 Bring 수, Profile View 등)
- /admin/analytics Admin Analytics Dashboard
- analytics_snapshots 월별 집계 + pg_cron
- Popular/Growing Cities, Style Demand, Route Analytics
