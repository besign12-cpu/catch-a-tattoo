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

### ⏳ 미완료 (인증·프로필 시스템)

#### Phase A — 인증 기반
- [ ] `middleware.ts` — 라우트 보호 (studio, me → login 리다이렉트)
- [ ] `/auth/login/page.tsx` — 로그인 화면
- [ ] `/auth/signup/page.tsx` — 회원가입 화면
- [ ] `/auth/verify-email/page.tsx` — 이메일 인증 대기
- [ ] `/auth/callback/route.ts` — OAuth 콜백
- [ ] `src/actions/auth.ts` — Server Actions
- [ ] `src/lib/hooks/useSession.ts` — 세션 훅
- [ ] BottomNav 세션 상태 분기

#### Phase B — 프로필 생성
- [ ] `/artists/new/page.tsx` — 신규 프로필 생성 폼
- [ ] `src/components/artist/TagSelector.tsx` — 태그 선택 UI
- [ ] `/studio/page.tsx` — 아티스트 대시보드
- [ ] `src/lib/queries/studio.ts` — 스튜디오 쿼리
- [ ] `src/actions/artist.ts` — 프로필 Server Actions

#### Phase C — 프로필 편집
- [ ] `/studio/profile/edit/page.tsx` — 편집 화면
- [ ] `src/components/artist/PortfolioUploader.tsx` — 이미지 업로드
- [ ] `src/lib/image-utils.ts` — 이미지 압축 유틸
- [ ] `src/actions/portfolio.ts` — 포트폴리오 Server Actions

#### Phase D — 팔로우 실제 동작
- [ ] `src/lib/hooks/useFollow.ts` — Optimistic UI 훅
- [ ] `src/actions/follow.ts` — 팔로우 Server Action
- [ ] FeedCard 팔로우 버튼 실제 연결

#### Phase E — 내 정보 화면
- [ ] `/me/page.tsx` — 실제 사용자 정보 표시
- [ ] `/settings/page.tsx` — 알림 토글·계정

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
