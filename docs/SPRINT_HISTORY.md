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

**빌드:** ✅ 통과

- [x] `middleware.ts` — 보호 라우트 접근 제어 (`/me`, `/studio`)
- [x] `/auth/login/page.tsx` — 로그인 화면
- [x] `/auth/signup/page.tsx` — 회원가입 화면
- [x] `/auth/verify-email/page.tsx` — 이메일 인증 대기
- [x] `/auth/callback/route.ts` — OAuth 콜백
- [x] `src/actions/auth.ts` — signUp / signIn / signOut
- [x] `src/lib/hooks/useSession.ts` — 클라이언트 세션 훅
- [x] `src/components/layout/BottomNav.tsx` — 세션 분기

### ✅ 완료 — Sprint 3-2 User Profile

**빌드:** ✅ 통과

- [x] `src/lib/queries/user.ts` — `getUserProfile()`
- [x] `src/app/me/page.tsx` — 실제 사용자 정보 화면

### ✅ 완료 — Sprint 3-3 Artist Creation

**빌드:** ✅ 통과 (3차 시도 — database.types.ts Relationships 누락이 근본 원인)

- [x] `src/types/database.types.ts` — Relationships: [] 추가 (근본 원인 해결)
- [x] `src/lib/supabase/admin.ts` — SupabaseClient<Database> 명시
- [x] `src/lib/queries/studio.ts` — `getMyArtistProfile()`
- [x] `src/actions/artist.ts` — `createArtistProfile()`
- [x] `src/components/artist/TagSelector.tsx` — 태그 선택 (Color/Main 필수, Art 0~4)
- [x] `src/app/artists/new/**` — 신규 프로필 생성 화면

### ✅ 완료 — Sprint 3-4 Studio Dashboard

**빌드:** ✅ 통과

- [x] `src/lib/queries/studio.ts` — artist_tags JOIN, tags: Tag[] 포함
- [x] `src/app/studio/page.tsx` — 아티스트 대시보드 (프로필 있음/없음 분기)

### ✅ 완료 — Sprint 3-5 Profile Edit

**빌드:** ✅ 통과
**수정 이슈:** Sprint 3-4에서 tags 추가된 studio.ts가 zip에 미포함 → profile.tags 타입 오류 → studio.ts 재포함으로 해결

- [x] `src/lib/queries/studio.ts` — Sprint 3-4 버전(tags: Tag[] 포함) zip 재포함
- [x] `src/components/artist/TagSelector.tsx` — `initialIds?: string[]` prop 추가
- [x] `src/actions/artist.ts` — `updateArtistProfile()` Server Action 추가
  - artist_profiles update
  - artist_tags 전체 삭제 후 재삽입
  - 핸들 변경 시 중복 확인
  - redirect 없이 `{ status: "success", handle }` 반환 (Client에서 router.push)
- [x] `src/app/studio/profile/edit/EditProfileForm.tsx` — Client Component
  - `useFormState` / `useFormStatus` 패턴
  - 성공 시 `router.push("/studio")` + `router.refresh()`
- [x] `src/app/studio/profile/edit/page.tsx` — 서버 컴포넌트
  - 프로필 없으면 `/artists/new` redirect

### ⏳ 미완료 (인증·프로필 시스템)

#### Phase A — 인증 기반 ✅ Sprint 3-1 전체 완료

#### Phase B — 프로필 생성 ✅ Sprint 3-3/3-4 전체 완료

#### Phase C — 프로필 편집
- [x] `/studio/profile/edit/page.tsx` ✅ Sprint 3-5
- [ ] `src/components/artist/PortfolioUploader.tsx` — 이미지 업로드 ⏳
- [ ] `src/lib/image-utils.ts` — 이미지 압축 유틸 ⏳
- [ ] `src/actions/portfolio.ts` — 포트폴리오 Server Actions ⏳

#### Phase D — 팔로우 실제 동작
- [ ] `src/lib/hooks/useFollow.ts` ⏳
- [ ] `src/actions/follow.ts` ⏳
- [ ] FeedCard 팔로우 버튼 실제 연결 ⏳

#### Phase E — 내 정보 화면
- [x] `/me/page.tsx` ✅ Sprint 3-2
- [ ] `/settings/page.tsx` ⏳

---

## Sprint 4 — 게스트워크 일정 등록 (예정)

**목표:** 인증된 아티스트가 일정을 올리면 팔로워에게 알림 발송
**상태:** ⏳ 예정

- [ ] 일정 등록 4단계 스텝 폼
- [ ] 일정 수정·삭제
- [ ] 자동 비활성화 (pg_cron)
- [ ] Claim/Verify Profile 3단계 흐름
- [ ] FCM/APNs push 알림 연동
- [ ] 알림 센터 화면

---

## Sprint 5 — 팔로우·알림·Analytics (예정)

**상태:** ⏳ 예정

- [ ] 팔로우 탭 실데이터 연결
- [ ] Bring This Artist (도시 지정 팔로우)
- [ ] Supabase Realtime 알림 구독
- [ ] 수요 임계값 알림
- [ ] 아티스트 Analytics

---

## Sprint 6 — QA·최적화·출시 (예정)

**상태:** ⏳ 예정

- [ ] Admin 대시보드
- [ ] 설정 화면
- [ ] 모바일 QA 전체
- [ ] 성능 최적화
- [ ] 보안 검토
- [ ] PWA 정식 적용
