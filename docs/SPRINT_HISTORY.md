# SPRINT_HISTORY.md
# Catch A Tattoo — Sprint 이력

---

## Sprint 1 — 기반 구축 ✅
더미 데이터로 홈·프로필 동작. BottomNav, PageContainer, TopBar.

## Sprint 2 — Supabase 연결 ✅
Supabase 3종 클라이언트, database.types.ts, 홈·프로필·검색·지도·도시 연동.

## Sprint 3 — Auth + Studio + QA ✅
Auth 전체, Customer 프로필, Artist 프로필 생성·수정, Studio, 포트폴리오 업로드.
BottomNav 5탭→4탭 전환. 미사용 파일 정리.

## Sprint 4 — Guest Work + City System + Analytics ✅
Guest Work 5단계 등록, City System, Bring/Follow 실동작, Calendar, Following 탭, Settings.
Analytics 수집 시작.

---

## Sprint 5 — i18n + Discover UX + Locale Refactor ✅

### Sprint 5-1 ~ 5-8: 핵심 기능
- Studio → Artist Profile 통합 (Studio 별도 페이지 유지)
- Bring/Follow 실동작 완성
- Following [일정][팔로우] 탭 실데이터
- Calendar Customer/Artist View 실데이터
- Settings 저장 (Base City · 관심장르 · 알림)
- Analytics 이벤트 수집

### Sprint 5-9: i18n 구조 수립
- next-intl 완전 제거
- 자체 번역 시스템: translations.ts / translations.server.ts
- URL 구조: / (EN) ↔ /ko (KO), /ko/* re-export 방식
- middleware: /ko/* 요청 시 x-locale 헤더 + NEXT_LOCALE 쿠키
- useT.ts: usePathname() 기반 locale 판단
- BottomNav: locale-aware 링크 + buildT 번역

**Sprint 5-9 Fix 1~5:** /ko 404 해결, LanguageSwitcher 경로 유지, BottomNav trailing slash 수정, getClientLocale SSR 문제 → pathname 기반으로 전환

### Sprint 5 Final-1: Discover UX 개선
- 검색 Cities → Discover 기준 도시 변경 (City Page 이동 X)
- 상단 현재 도시 헤더 (도시명 + 더보기)
- /api/discover/city Route Handler
- Upcoming Guest Artists / Based Artists 섹션 제목 단순화

### Sprint 5 Final-2: i18n 마무리
- translations.ts 전체 번역 키 정비 (nav/common/discover/following/calendar/me/settings/artist/city/schedule)
- CalendarClient 수요 레벨 번역 (getDemandLabels)
- City Page getLocaleServer 적용
- Artist Profile t prop 전달 패턴
- HomeFeedClient 현재 배지·더보기·로딩 번역
- BringButton / CityDropdown / FollowButton useT 적용
- ScheduleBlock "use client" 추가 + useT 적용
- FollowingClient calcDDay 플래그 번역

**Sprint 5 Final-2 Fix 1~4:**
- useT SSR 문제: getClientLocale → usePathname 기반으로 근본 수정
- /ko/me 비로그인: BottomNav locale-aware 복원 (locale 없는 구버전으로 덮어써진 것 발견)
- auth.ts signIn: next 파라미터 처리
- not-found.tsx: usePathname으로 /ko 감지

**Sprint 5 Final QA 1~5:**
- HomeFilterBar useT 적용 (필터 버튼 한글 고정 버그)
- CalendarClient "Guest Work 등록" 키 수정
- ScheduleNewClient Step1~5 전체 번역
- BottomNav locale-aware 복원 (재발)
- me/page.tsx MeLinks Client Component 적용
- SettingsBackButton 분리
- /ko/me/settings 실제 라우트 추가

### Sprint 5 Final — Phase 1 Locale Navigation Refactor
**목표:** locale navigation 버그 근본 원인 제거

**신규 파일:**
- `src/lib/hooks/useLocaleNav.ts` — Client locale-aware 네비게이션 훅
- `src/lib/locale.server.ts` — getLocaleServer() with href helper

**하드코딩 제거:**
| 파일 | 수정 |
|---|---|
| BringButton.tsx | router.push("/me/settings") → useLocaleNav().push |
| FollowingClient.tsx | href="/" → useLocaleNav().href |
| artists/[handle]/page.tsx | href="/" → BackButton (router.back()) |
| city/[citySlug]/page.tsx | href="/calendar", "/" → getLocaleServer().href |
| CalendarClient.tsx | href="/" → useLocaleNav().href |
| auth.ts | signOut redirect("/") → getLocaleServer().href |
| search/page.tsx | href="/" → getLocaleServer().href |

**CalendarClientProps 정비 (Phase 1 Patch 1~3):**
```ts
interface CalendarClientProps {
  role: "customer" | "artist" | "admin" | null;
  cities: CalendarCity[];
  artistHandle?: string | null;
  followingSchedules?: CalendarScheduleItem[];
  initialCitySchedules?: CalendarScheduleItem[];
  initialCustomerCity?: CalendarCity | null;
  initialArtistCity?: CalendarCity | null;
  initialCityData?: CityCalendarData | null;
  initialYear?: number;
  initialMonth?: number;
}
```

---

## Sprint 6 — 예정
- Admin Analytics Dashboard
- Popular/Growing Cities, Style Demand, Route Analytics
- analytics_snapshots 월별 집계 + pg_cron
- 모바일 QA 전체 + 성능 최적화
