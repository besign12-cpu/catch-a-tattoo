# CHANGELOG.md
# Catch A Tattoo — 변경 이력

## Sprint 5 Final — Phase 1 Locale Navigation Refactor

### 신규 파일
- `src/lib/hooks/useLocaleNav.ts` — Client Component용 locale-aware 네비게이션 훅
- `src/lib/locale.server.ts` — Server Component / Action용 getLocaleServer()
- `src/components/me/MeLinks.tsx` — Me 페이지 locale-aware 링크 모음
- `src/app/me/settings/SettingsBackButton.tsx` — usePathname 기반 back 링크
- `src/app/artists/[handle]/BackButton.tsx` — router.back() Client Component
- `src/app/ko/me/settings/page.tsx` — /ko/me/settings 실제 라우트

### 수정 파일
| 파일 | 수정 내용 |
|---|---|
| middleware.ts | makeKoResponse에 x-locale 헤더 추가 |
| src/components/layout/BottomNav.tsx | locale-aware 링크 + buildT 번역 |
| src/components/artist/BringButton.tsx | router.push → useLocaleNav |
| src/app/following/FollowingClient.tsx | href="/" → useLocaleNav |
| src/app/artists/[handle]/page.tsx | href="/" → BackButton |
| src/app/city/[citySlug]/page.tsx | href="/calendar","/" → getLocaleServer |
| src/app/calendar/CalendarClient.tsx | href="/" → useLocaleNav, props 정비 |
| src/actions/auth.ts | signOut locale-aware redirect |
| src/app/search/page.tsx | href="/" → getLocaleServer |
| src/app/me/page.tsx | MeLinks Client Component 적용 |
| src/app/me/settings/page.tsx | SettingsBackButton 적용 |

---

## Sprint 5 Final — i18n QA 마무리

### 수정 파일
- `src/i18n/translations.ts` — 전체 번역 키 정비 (schedule 네임스페이스 추가)
- `src/lib/hooks/useT.ts` — getClientLocale → usePathname 기반으로 전환
- `src/components/home/HomeFilterBar.tsx` — useT("discover") 적용
- `src/components/artist/FollowButton.tsx` — useT 적용
- `src/components/artist/FeedCard.tsx` — calcDDay 플래그 번역
- `src/components/schedule/ScheduleBlock.tsx` — "use client" + useT 적용
- `src/app/artists/[handle]/schedule/new/ScheduleNewClient.tsx` — useT("schedule") 전면 적용
- `src/app/following/FollowingClient.tsx` — dday 플래그 번역, isLoggedIn CTA
- `src/app/calendar/CalendarClient.tsx` — locale-aware + 번역 전면 적용
- `src/lib/utils.ts` — calcDDay 플래그 방식 (__IN_TOWN__, __LAST_DAY__)
- `src/app/me/settings/page.tsx` — getT("settings") 적용

---

## Sprint 5 Final — Discover UX

### 수정 파일
- `src/app/page.tsx` — 검색 도시 → Discover 기준 도시 변경 (City Page 이동 X)
- `src/components/home/HomeFeedClient.tsx` — 도시 전환 UX
- `src/app/api/discover/city/route.ts` — 신규 Route Handler

---

## Sprint 5-9 — i18n 구조 수립

### 신규 파일
- `src/i18n/translations.ts`
- `src/i18n/translations.server.ts`
- `src/i18n/config.ts`
- `src/lib/hooks/useT.ts`

### 수정 파일
- `middleware.ts` — /ko/* 처리 + x-locale 헤더
- `src/components/layout/BottomNav.tsx` — locale-aware 4탭
- `src/components/layout/LanguageSwitcher.tsx` — /ko ↔ / 전환

---

## Sprint 5-1 ~ 5-8

- Artist Profile 통합 (Studio → artists/[handle])
- Bring/Follow 실동작
- Following 실데이터
- Calendar 실데이터
- Settings 저장
- Analytics 이벤트 수집

---

## Sprint 4

- Guest Work 5단계 등록
- City System (cities 마스터 테이블)
- Bring This Artist 실동작
- Calendar 구현
- Settings 구현

---

## Sprint 3

- Auth 전체 (signUp/signIn/signOut)
- Customer 프로필
- Artist 프로필 생성·수정
- Studio Dashboard
- 포트폴리오 업로드
- BottomNav 5탭→4탭

---

## Sprint 2

- Supabase 연결
- database.types.ts

---

## Sprint 1

- 프로젝트 초기화
- 더미 데이터 기반 홈·프로필
