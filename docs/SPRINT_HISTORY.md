# SPRINT_HISTORY.md
# Catch A Tattoo — Sprint 이력

---

## Sprint 1 — 기반 구축

**목표:** 더미 데이터로 홈 화면과 아티스트 프로필이 동작하는 상태
**상태:** ✅ 완료
**빌드:** 통과 / Vercel 배포 확인

### 완료 항목
- [x] Next.js 14 App Router + Tailwind 프로젝트 초기화
- [x] 공통 레이아웃 (BottomNav 5탭, PageContainer, TopBar)
- [x] 홈 피드 화면 (더미 데이터)
- [x] 아티스트 프로필 화면 (더미 데이터)
- [x] 태그 UI (TagChip, TagList, 하이라이트)
- [x] 로딩 상태 (Skeleton)
- [x] 에러 상태 (ErrorState + 재시도 버튼)
- [x] PWA manifest.json
- [x] 더미 데이터 4명 아티스트, 태그 32개
- [x] 핵심 타입 정의

---

## Sprint 2 — Supabase 연결

**목표:** 실제 DB 데이터 교체, 검색·지도·도시 페이지 기초 구현
**상태:** ✅ 완료
**빌드:** 통과 / Vercel 배포 확인

### 완료 항목
- [x] Supabase 클라이언트 3종 (client / server / admin)
- [x] database.types.ts 수동 작성
- [x] 001_init.sql — 전체 DDL (11개 테이블 + RPC + Materialized View)
- [x] 002_rls.sql — RLS 전체 적용
- [x] 003_seed.sql — 태그 32개 + 샘플 아티스트 4명
- [x] lib/queries/artists.ts — 쿼리 함수 전체
- [x] 홈 피드 Supabase 연동 (dummy fallback 유지)
- [x] 아티스트 프로필 Supabase 연동 (dummy fallback 유지)
- [x] 검색 페이지 (URL 기반, Filter 드로어)
- [x] 지도 페이지 (도시 핀 목록)
- [x] 도시 페이지 (Guest / Based 섹션)

### 해결한 이슈
- lucide-react Instagram 아이콘 미지원 → SVG 직접 사용
- Next.js 14 params async 처리
- Supabase never 타입 오류 → 변환 함수 분리

---

## Sprint 3 — UI 구조 개선 + 인증·프로필 시스템

**목표:** 검색 중심 UX 재편 + 아티스트 회원가입·프로필 관리
**상태:** 🔄 진행 중 (UI 개선 완료 / 인증·프로필 구현 대기)
**완료율:** 약 40%

### ✅ 완료 (UI 개선)

#### 구조 변경
- [x] 홈 → 검색 중심 페이지로 재편 (`/` = 검색창 + 태그 필터)
- [x] 하단 네비 1번 탭: 홈(Home) → 검색(Search) 아이콘·라벨 변경
- [x] 하단 네비 2번 탭: 기존 Search → 팔로우(Following) 탭으로 변경
- [x] 하단 네비 3번 탭: 지도 → 지역 탐색으로 개편
- [x] `hasNotif` 타입 오류 해결 (속성 제거)

#### 피드 카드 UI
- [x] "어디"·"언제" 한글 라벨 제거
- [x] 도시명 아래 국가명 추가 (KR→South Korea 등 변환 함수)
- [x] 날짜·D-day 라벨 없이 직접 표시
- [x] 팔로우 버튼 오른쪽 상단 복원

#### 검색 UX
- [x] 검색창 도시 칩 → 태그 칩으로 교체 (HomeTagFilter)
- [x] SearchInput 컴포넌트 신규 (실제 input, /search?q= 라우팅)
- [x] 검색 결과 내 ResultFilterBar (태그·타입 필터, 드로어)
- [x] 검색: 도시 + 아티스트 이름 병렬 처리

#### 기타
- [x] `/following` 팔로우 탭 페이지 신규 (빈 상태 UI)
- [x] 지역 탐색: Asia·Europe·Americas 카드 그리드
- [x] Claim Profile → Verify Profile 문구 변경
- [x] lucide-react Instagram 아이콘 재발 이슈 해결

### ✅ 완료 — Pre-Home 개선 (Sprint 3 진입 전)

**빌드:** ✅ 통과 (fix4b 기준)

#### Home Personalization
- [x] `src/lib/mock-preferences.ts` 신규 — `MOCK_BASE_CITY`, `MOCK_BASE_COUNTRY`, `toCitySlug()`, `fromCitySlug()` (Auth 연결 전 임시 상수)
- [x] 홈 피드를 Base City 기반 섹션형으로 재편
  - Upcoming Guest Artists in {City} — 최대 8개
  - Based Artists in {City} — 최대 3개
  - 각 섹션 "더보기" → `/city/{citySlug}?tab=guest` / `?tab=based`
- [x] `getCityArtists()` 반환 타입(`SearchResult[]`) 기반으로 `toFeedCards()` 재작성
- [x] Dummy fallback: `dummyToSearchResult()` 변환 함수로 타입 통일

#### 도시 페이지 탭 구조
- [x] `/city/[citySlug]` Guest / Based 탭 구조 추가
- [x] URL query 유지: `?tab=guest` / `?tab=based`
- [x] All 탭 없음 — CAT 서비스 특성상 Guest / Based만 구분

#### Home Filter Bottom Sheet
- [x] 상단 태그 칩 가로 스크롤 제거 → Filter 버튼 방식으로 교체
- [x] `HomeFilterBar` 신규: `[전체]` `[이번 주]` ··· `[Filter]`
- [x] `HomeFilterSheet` 신규: 바텀시트, Color / Main Style / Art Style 그룹별 태그
- [x] `appliedTags` / `draftTags` 상태 분리 — Apply 전까지 카드 반영 안 함
- [x] 드래그 닫기: 핸들 80px 이상 드래그 시 dismiss, draft 버림
- [x] X 버튼 닫기 + 배경 클릭 닫기 — 모두 draft 버림
- [x] 하단 액션바: Reset(텍스트, 비대칭) + Apply(w-220px, h-56px, rounded-2xl) — Airbnb 스타일
- [x] Reset: draft 선택 없을 때 비활성(opacity-40, no-underline)
- [x] BottomNav + safe-area 가림 방지 (`env(safe-area-inset-bottom) + 80px`)

#### 검색 UX 개선
- [x] `SearchInput` controlled / uncontrolled 하위 호환 방식으로 재작성
  - 홈: `value` + `onChange` props → URL 이동 없이 카드 필터링
  - `/search`: props 없음 → Enter 시 `/search?q=` 이동 (기존 동작 유지)
- [x] 홈 검색어 + 기간 + 태그 AND 누적 필터링

#### 버그 수정
- [x] `artists/[handle]/page.tsx` — lucide `Image` 컴포넌트 오용 → `PortfolioPlaceholder` SVG 교체, alt warning 해결
- [x] `HomeTagFilter` router.push 제거 — URL 이동 없이 클라이언트 필터링
- [x] `HomeTagFilter` 경로 이동: `src/components/search/` → `src/components/home/`

#### KNOWN_ISSUES 추가
- [x] Home Tag Filter navigation bug
- [x] SearchInput API 변경 후 사용처 누락
- [x] Unused import 빌드 실패
- [x] TypeScript 타입 오류 — 반환 타입 미확인

### ✅ 완료 — Sprint 3-1 Auth Foundation
- [x] `middleware.ts`, `src/actions/auth.ts`, `src/lib/hooks/useSession.ts`
- [x] `/auth/login`, `/auth/signup`, `/auth/verify-email`, `/auth/callback`
- [x] `BottomNav.tsx` 세션 분기 + `/auth/*` 숨김

### ✅ 완료 — Sprint 3-2 User Profile
- [x] `src/lib/queries/user.ts` — `getUserProfile()`
- [x] `src/app/me/page.tsx` — 실제 사용자 정보 화면

### ✅ 완료 — Sprint 3-3 Artist Creation
- [x] `src/types/database.types.ts` — Relationships: [] 추가 (근본 원인 해결)
- [x] `src/lib/supabase/admin.ts` — SupabaseClient<Database> 명시
- [x] `src/lib/queries/studio.ts`, `src/actions/artist.ts`
- [x] `TagSelector.tsx`, `src/app/artists/new/**`

### ✅ 완료 — Sprint 3-4 Studio Dashboard
- [x] `src/lib/queries/studio.ts` (tags JOIN), `src/app/studio/page.tsx`

### ✅ 완료 — Sprint 3-5 Profile Edit
- [x] `TagSelector.tsx` (initialIds prop), `updateArtistProfile()`, `src/app/studio/profile/edit/**`

### ✅ 완료 — Sprint 3-6 Portfolio Upload
- [x] `getMyPortfolio()`, `addPortfolioItem()`, `deletePortfolioItem()`
- [x] `src/app/studio/portfolio/**`, `src/app/studio/page.tsx` (포트폴리오 섹션)

### ✅ 완료 — Sprint 3-7 Cleanup & QA

**빌드:** ✅ 통과
**Build 상태:** 전체 프로젝트 clean build 확인

#### 삭제 파일
- [x] `src/components/search/CityFilterBar.tsx` — 미사용 파일 삭제
- [x] `src/components/search/SearchFilterBar.tsx` — 미사용 파일 삭제

#### QA 점검 결과
- [x] Auth 흐름: login → signup → verify-email → callback → me → studio 정상
- [x] BottomNav: `/auth/*`에서 숨김, `/me` 비로그인 시 `/auth/login` 이동
- [x] middleware: `/me`, `/studio`, `/studio/**` 보호 정상
- [x] 금지 패턴 전수 점검: Instagram import, hasNotif, useActionState, admin 클라이언트 남용, as any 없음
- [x] 미사용 파일 정리 완료

#### 문서 전면 업데이트
- [x] `docs/ARCHITECTURE.md` — Sprint 3 완료 기준 전면 재작성
- [x] `docs/PROJECT_STRUCTURE.md` — 파일 트리 최신화, export 방식 레퍼런스 추가
- [x] `docs/MASTER_LOG.md` — Sprint 3-1~3-7 이력 정리
- [x] `docs/SPRINT_HISTORY.md` — Sprint 3-7 완료 처리
- [x] `docs/KNOWN_ISSUES.md` — Sprint 3 전체 이슈 정리

### ⏳ 미완료 — Sprint 4 예정

#### Phase A — 완료 ✅ (Sprint 3-1)
#### Phase B — 완료 ✅ (Sprint 3-3/3-4)
#### Phase C — 부분 완료
- [x] `/studio/profile/edit/**` ✅ Sprint 3-5
- [x] `src/actions/portfolio.ts` ✅ Sprint 3-6 (URL 방식)
- [ ] `src/components/artist/PortfolioUploader.tsx` — Storage 실제 업로드 ⏳
- [ ] `src/lib/image-utils.ts` ⏳

#### Phase D — 팔로우 실제 동작 ⏳
- [ ] `src/lib/hooks/useFollow.ts`, `src/actions/follow.ts`
- [ ] FeedCard 팔로우 버튼 실제 연결

#### Phase E — 내 정보 화면
- [x] `/me/page.tsx` ✅ Sprint 3-2
- [ ] `/settings/page.tsx` ⏳

---

## Sprint 4 — Navigation 재편 + Guest Work + Bring 정책 + Analytics 기반 (예정)

**목표:** UX/IA 최종 확정 기준으로 핵심 구조 구현
**상태:** ⏳ 예정
**신규 페이지:** 4개 (`/calendar`, `/me/settings`, `/studio/schedule/new`, `/studio/schedule/:id`)
**수정 페이지:** 4개 (`/following`, `/studio`, `/city/:slug`, `/artists/:handle`)

### DB Migrations
- [ ] `004_cities.sql` — cities + city_requests 테이블 + seed 데이터
- [ ] `005_bring_update.sql` — city_follows: is_active, expired_reason, expired_at
- [ ] `006_analytics.sql` — demand_events + search_logs
- [ ] `007_users_base_city.sql` — users.base_city_changed_at

### BottomNav 5탭 → 4탭
- [ ] `BottomNav.tsx` 수정: Discover / Following / Calendar / 나
- [ ] `/map`, `/notifications` 탭 제거 (페이지는 유지, 탭 접근만 제거)

### 신규 페이지
- [ ] `/calendar/page.tsx` — Customer View: 월 요약 + 팔로우 일정 + 달력
- [ ] `/calendar/page.tsx` — Artist View: 도시 드롭다운 + 날짜별 🟢🟡🔴 + 인사이트 + CTA
- [ ] `/me/settings/page.tsx` — Base City 30일 제한 + 관심장르 + 알림
- [ ] `/studio/schedule/new/page.tsx` — 5단계 등록 (도시→인사이트→날짜→인사이트→상세)
- [ ] `/studio/schedule/[id]/page.tsx` — 일정 수정/삭제

### 기존 페이지 수정
- [ ] `following/page.tsx` — [일정][팔로우] 탭 + 🔔 알림 버튼 구현
- [ ] `studio/page.tsx` — [+ Guest Work 등록] CTA 최상단 + 추천 도시 TOP (Bring 순위)
- [ ] `city/[citySlug]/page.tsx` — Customer/Artist View 역할 분기
- [ ] `artists/[handle]/page.tsx` — 총 Bring 수 제거, 일정별 도시 Bring 수 표시

### Bring 정책 구현
- [ ] Bring 도시: users.base_city 자동 적용 (도시 선택 UI 없음)
- [ ] Base City 변경 30일 제한 로직 (base_city_changed_at 기준)
- [ ] Base City 변경 시 기존 Bring 전체 종료 처리
- [ ] Guest Work end_date + 1~3일 후 pg_cron → Bring 자동 종료 + 알림

### Analytics 수집 시작
- [ ] demand_events: Profile View, Schedule View, Instagram Click, City Click
- [ ] search_logs: 도시/스타일 검색 수집
- [ ] lib/analytics/collect.ts 신규 (비로그인 session_id 처리 포함)
- [ ] mock-preferences.ts → 세션 기반 교체

### City System
- [ ] cities dropdown (아티스트 프로필 Base City + 일정 등록)
- [ ] Discover 하단 "도시 추가 요청" UI
- [ ] 일정 등록 Step 1 "도시 추가 요청" 링크

---

## Sprint 5 — Following 실데이터 + Demand Signals + City System 고도화 (예정)

**목표:** Demand Signal 전체 수집 + 팔로우/Bring 실동작 + Analytics 집계 시작
**상태:** ⏳ 예정

- [ ] Following [일정] 탭 실데이터 연결
- [ ] Bring This Artist 실동작 (is_active 기반 Current Demand)
- [ ] City Click, City/Style Search 이벤트 수집
- [ ] city_requests 도시 추가 요청 UI + 관리자 승인 흐름
- [ ] analytics_snapshots 테이블 + pg_cron 월별 집계
- [ ] Follow Growth, City Growth, Style Demand Growth 집계 시작
- [ ] Supabase Realtime 알림 (수요 임계값)

---

## Sprint 6 — Admin Analytics Dashboard + QA (예정)

**목표:** 관리자 Analytics Dashboard 완성 + QA
**상태:** ⏳ 예정

- [ ] /admin/analytics Overview Dashboard
- [ ] City Analytics: Popular / Growing Cities, Style Demand by City
- [ ] Style Analytics: Popular / Growing Styles
- [ ] Route Analytics: Popular Routes, Country Movement
- [ ] 모바일 QA 전체 + 성능 최적화 + 보안 검토
- [ ] PWA 정식 적용

---

## Sprint 7+ — CAT Pro 방향 (장기)

**목표:** 아티스트를 위한 데이터 기반 의사결정 도구
**상태:** ⏳ 장기 계획

- [ ] Growing Cities 추천
- [ ] Recommended Guest Work Routes
- [ ] Market Trend Reports
- [ ] Event Calendar 완성 (타투 컨벤션 연동)
- [ ] CAT Pro 구독 모델 검토
