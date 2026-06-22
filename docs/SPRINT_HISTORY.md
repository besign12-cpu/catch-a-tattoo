# SPRINT_HISTORY.md
# Catch A Tattoo — Sprint 이력

---

## Sprint 1 — 기반 구축

**목표:** 더미 데이터로 홈 화면과 아티스트 프로필이 동작하는 상태
**상태:** ✅ 완료

### 완료 항목
- [x] Next.js 14 App Router + Tailwind 프로젝트 초기화
- [x] 공통 레이아웃 (BottomNav 5탭, PageContainer, TopBar)
- [x] 홈 피드 화면 (더미 데이터)
- [x] 아티스트 프로필 화면 (더미 데이터)
- [x] 태그 UI, 로딩/에러 상태, PWA manifest
- [x] 더미 데이터 4명 아티스트, 태그 32개

---

## Sprint 2 — Supabase 연결

**목표:** 실제 DB 데이터 교체, 검색·지도·도시 페이지 기초 구현
**상태:** ✅ 완료

### 완료 항목
- [x] Supabase 클라이언트 3종 (client / server / admin)
- [x] 001_init.sql ~ 003_seed.sql 마이그레이션
- [x] lib/queries/artists.ts 쿼리 함수 전체
- [x] 홈 피드, 아티스트 프로필, 검색, 지도, 도시 페이지 Supabase 연동

---

## Sprint 3 — UI 구조 개선 + 인증·프로필 시스템

**목표:** 검색 중심 UX 재편 + 아티스트 회원가입·프로필 관리
**상태:** ✅ 완료

### Sprint 3-1 — Auth Foundation ✅
- middleware.ts, actions/auth.ts, useSession.ts
- /auth/login, /auth/signup, /auth/verify-email, /auth/callback
- BottomNav 세션 분기 + /auth/* 숨김

### Sprint 3-2 — User Profile ✅
- lib/queries/user.ts, /me/page.tsx

### Sprint 3-3 — Artist Creation ✅
- database.types.ts Relationships: [] 추가 (근본 원인 해결)
- lib/queries/studio.ts, actions/artist.ts, TagSelector.tsx, /artists/new/**

### Sprint 3-4 — Studio Dashboard ✅
- lib/queries/studio.ts (tags JOIN), /studio/page.tsx

### Sprint 3-5 — Profile Edit ✅
- TagSelector.tsx (initialIds prop), updateArtistProfile(), /studio/profile/edit/**

### Sprint 3-6 — Portfolio Upload ✅
- getMyPortfolio(), actions/portfolio.ts, /studio/portfolio/**

### Sprint 3-7 — Cleanup & QA ✅
- 미사용 파일 삭제, 문서 전면 업데이트

---

## Sprint 4 — Navigation 재편 + City System + Bring 정책 + QA

**목표:** UX/IA 최종 확정 기준으로 핵심 구조 구현 + QA
**상태:** ✅ 완료 (build ✅ / QA ✅)

### Sprint 4-1 — DB Migrations ✅
- [x] 004_cities.sql — cities + city_requests 테이블 + seed 60개
- [x] 005_bring_update.sql — city_follows is_active 등 + RPC 3개
- [x] 006_analytics.sql — demand_events + search_logs + analytics_snapshots
- [x] 007_users_base_city.sql — users.base_city_changed_at + can_change_base_city RPC
- [x] database.types.ts Sprint 4 타입 전체 추가

### Sprint 4-2 — BottomNav 4탭 ✅
- [x] BottomNav.tsx: 5탭 → 4탭 (Discover/Following/Calendar/나)
- [x] 나 탭: role 무관 /me 통일 (본인 Studio는 /me에서 CTA로 이동)
- [x] useSession.ts: role 필드 추가

### Sprint 4-3 — Calendar 페이지 ✅
- [x] /calendar/page.tsx: Customer/Artist View 분기, 비로그인 달력 표시
- [x] CalendarClient.tsx: 월간 달력, CityDropdown 통일, Guest 수 범례

### Sprint 4-4 — Following 페이지 ✅
- [x] following/page.tsx: 서버 컴포넌트 전환
- [x] FollowingClient.tsx: [일정][팔로우] 탭 + 🔔 알림 버튼 (빈 상태 UI)

### Sprint 4-5 — Studio Dashboard ✅
- [x] studio/page.tsx: Guest Work 등록 CTA 최상단, 추천 도시 TOP, 로그아웃 버튼

### Sprint 4-6 — City Page ✅
- [x] city/[citySlug]/page.tsx: KPI 3개 (Guest/Based/Bring), Artist View 인사이트 배너, 인기 스타일

### Sprint 4-7 — Artist Profile ✅
- [x] artists/[handle]/page.tsx: Bring 버튼 CTA 이동, 예약 상태 표시, 본인 수정 링크
- [x] ScheduleBlock.tsx: availStatus prop 추가 (카드 내부 예약 문의 하단)

### Sprint 4-8 — Guest Work 등록 ✅
- [x] /studio/schedule/new: 5단계 플로우, CityDropdown, 날짜 중복 방지
- [x] actions/schedule.ts: createGuestSchedule + 서버 재검증

### Sprint 4-9 — 일정 수정/삭제 ✅
- [x] /studio/schedule/[id]: 수정 폼, 삭제 모달, 과거 일정 처리
- [x] actions/schedule.ts: updateGuestSchedule, deleteGuestSchedule

### Sprint 4-10 — /me/settings ✅
- [x] /me/settings: Base City 변경 (30일 제한 + Bring 종료), 관심장르, 알림 UI
- [x] actions/settings.ts: updateBaseCity, updateInterestTags
- [x] page.tsx (홈): MOCK_BASE_CITY → 세션 기반 교체
- [x] mock-preferences.ts: MOCK 상수 → DEFAULT 상수로 교체

### Sprint 4-11 — Base City CityDropdown 전환 ✅
- [x] CityDropdown.tsx: 공용 도시 선택 컴포넌트 신규 (onSelect 콜백 지원)
- [x] NewArtistForm.tsx, EditProfileForm.tsx: 자유 텍스트 → CityDropdown
- [x] /artists/new, /studio/profile/edit page.tsx: cities 조회 추가

### Sprint 4 QA ✅
- [x] Calendar: 비로그인 달력 표시, CityDropdown 통일, 범례 Guest 수 기준
- [x] Artist Profile: Bring → CTA 이동, Available/Fully booked 카드 내부 표시
- [x] Me 페이지: Studio CTA, Settings 링크, 로그아웃, getUserProfile try-catch
- [x] Studio: 로그아웃 버튼
- [x] BottomNav: 나 탭 /me 통일, /studio 경로에서도 나 탭 활성 유지
- [x] Calendar CityDropdown 중복 렌더 수정

### Sprint 4 미이월 사항 (Sprint 5로 이월)
- [ ] Following 실데이터 연결 (빈 배열 상태 → Sprint 5)
- [ ] Bring 실동작 (비활성 UI 상태 → Sprint 5)
- [ ] Analytics 수집 (lib/analytics/collect.ts → Sprint 5)
- [ ] Discover 하단 도시 추가 요청 UI (→ Sprint 5)
- [ ] 관심장르 실저장 (user_interests 테이블 → Sprint 5)
- [ ] 알림 실연결 (토글 UI만 → Sprint 5)

---

## Sprint 5 — Studio 제거 + i18n + Demand Signals (예정)

**목표:** Artist Profile 중심 IA 전환 + 글로벌화 기반 + 실데이터 연결
**상태:** ⏳ 예정

### 확정 사항 (Sprint 4 완료 시 확정)

**IA — Studio 제거**
- /studio/** 전체 제거 → /artists/:handle 중심으로 전환
- /artists/:handle 탭 구조: [프로필] [일정] [인사이트]
- 본인만 관리 UI (수정/등록/삭제 버튼)

**i18n — next-intl**
- / = English (기본), /ko = Korean
- Discover TopBar Language 버튼, /me/settings Language 설정
- 번역 제외 고유 개념어: CAT, Guest Work, Bring, Bring This Artist, Follow, Based City, Artist Profile, Discovery, Demand Signal

### 작업 순서 (권장)
1. next-intl 구조 도입 (middleware, layout, messages/)
2. Studio 제거 + Artist Profile 탭 구조
3. Language 버튼 (Discover TopBar + /me/settings)
4. Following 실데이터 연결
5. Bring 실동작 (useBring 훅)
6. Analytics 수집 시작 (demand_events, search_logs)
7. city_requests 도시 추가 요청 UI

---

## Sprint 6 — Analytics Dashboard + 인사이트 탭 (예정)

**목표:** 관리자 Analytics Dashboard + 아티스트 인사이트 탭 완성
**상태:** ⏳ 예정

- [ ] /artists/:handle 인사이트 탭 (도시별 Bring 수, Profile View 등)
- [ ] /admin/analytics Overview Dashboard
- [ ] City Analytics: Popular / Growing Cities, Style Demand by City
- [ ] analytics_snapshots 월별 집계 + pg_cron
- [ ] PWA 정식 적용

---

## Sprint 7+ — CAT Pro 방향 (장기)

**목표:** 아티스트를 위한 데이터 기반 의사결정 도구
**상태:** ⏳ 장기 계획

- [ ] Growing Cities 추천
- [ ] Recommended Guest Work Routes
- [ ] Market Trend Reports
- [ ] CAT Pro 구독 모델 검토
