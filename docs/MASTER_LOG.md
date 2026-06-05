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
| 현재 상태 | Sprint 3 Pre-Home 완료 (build ✅) / Sprint 3 Auth + User Profile 진행 예정 |

---

## 환경 변수 목록

| 변수 | 용도 | 노출 범위 | 상태 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 | ✅ 등록 완료 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 클라이언트 | ✅ 등록 완료 |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회용 (Admin) | 서버 전용 | ✅ 등록 완료 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox 지도 | 클라이언트 | ⏳ 미등록 (Sprint 4~) |

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
| `src/components/search/CityFilterBar.tsx` | 도시 필터 칩 (현재 미사용) |
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
| `src/components/search/SearchFilterBar.tsx` | 필터 드로어 (현재 미사용) |
| `supabase/migrations/001_init.sql` | 전체 DDL |
| `supabase/migrations/002_rls.sql` | RLS 정책 |
| `supabase/migrations/003_seed.sql` | 태그 32개 + 샘플 데이터 |

### Sprint 3 — UI 구조 개선 + Pre-Home 완료 ✅

| 파일 | 작업 | 상태 |
|---|---|---|
| `src/components/layout/BottomNav.tsx` | 검색/팔로우 탭 구조 개편, hasNotif 제거 | ✅ |
| `src/components/artist/FeedCard.tsx` | 라벨 제거, 국가명 추가, 팔로우 버튼 복원 | ✅ |
| `src/components/search/SearchInput.tsx` | controlled/uncontrolled 하위 호환 재작성 | ✅ |
| `src/components/search/HomeTagFilter.tsx` | 역할 종료 → `src/components/home/` 로 이동 | ✅ |
| `src/components/search/ResultFilterBar.tsx` | 검색 결과 내 필터 드로어 | ✅ |
| `src/components/home/HomeFeedClient.tsx` | Base City 섹션 피드 + AND 필터링 | ✅ |
| `src/components/home/HomeFilterBar.tsx` | 전체/이번주/Filter 상단 바 신규 | ✅ |
| `src/components/home/HomeFilterSheet.tsx` | 태그 바텀시트, draft/applied 분리, 드래그 닫기 | ✅ |
| `src/app/page.tsx` | Base City 기반 섹션형 홈 피드 | ✅ |
| `src/app/search/page.tsx` | SearchInput 복원 (uncontrolled) | ✅ |
| `src/app/following/page.tsx` | 팔로우 탭 신규 (빈 상태 UI) | ✅ |
| `src/app/map/page.tsx` | 지역 탐색 구조 (Asia/Europe/Americas 카드) | ✅ |
| `src/app/city/[citySlug]/page.tsx` | Guest/Based 탭 구조, SearchResult 기반 재작성 | ✅ |
| `src/app/artists/[handle]/page.tsx` | PortfolioPlaceholder SVG 교체, alt warning 해결 | ✅ |
| `src/lib/mock-preferences.ts` | MOCK_BASE_CITY 상수, toCitySlug/fromCitySlug 유틸 신규 | ✅ |
| `src/lib/queries/artists.ts` | (변경 없음) | - |
| `src/app/auth/**` | 로그인·회원가입 화면 | ✅ Sprint 3-1 완료 |
| `src/app/studio/**` | 아티스트 스튜디오 | ⏳ 미구현 |
| `src/actions/auth.ts` | 인증 Server Actions | ✅ Sprint 3-1 완료 |
| `src/actions/artist.ts` | 프로필 Server Actions | ✅ Sprint 3-3 완료 |
| `src/components/artist/TagSelector.tsx` | 태그 선택 UI | ✅ Sprint 3-3 완료 |
| `src/components/artist/PortfolioUploader.tsx` | 포트폴리오 업로드 | ⏳ 미구현 |
| `src/lib/hooks/useSession.ts` | 세션 훅 | ✅ Sprint 3-1 완료 |
| `middleware.ts` | 라우트 보호 | ✅ Sprint 3-1 완료 |

### Sprint 3-1 — Auth Foundation ✅

| 파일 | 작업 | 상태 |
|---|---|---|
| `middleware.ts` | 보호 라우트 접근 제어 | ✅ |
| `src/actions/auth.ts` | signUp / signIn / signOut | ✅ |
| `src/lib/hooks/useSession.ts` | 클라이언트 세션 훅 | ✅ |
| `src/app/auth/callback/route.ts` | 이메일 인증 콜백 | ✅ |
| `src/app/auth/login/page.tsx` | 로그인 화면 | ✅ |
| `src/app/auth/signup/page.tsx` | 회원가입 화면 | ✅ |
| `src/app/auth/verify-email/page.tsx` | 이메일 인증 대기 | ✅ |
| `src/components/layout/BottomNav.tsx` | 세션 분기 추가 | ✅ |

### Sprint 3-2 — User Profile ✅

| 파일 | 작업 | 상태 |
|---|---|---|
| `src/lib/queries/user.ts` | `getUserProfile()` | ✅ |
| `src/app/me/page.tsx` | 실제 사용자 정보 화면 | ✅ |

### Sprint 3-3 — Artist Creation ✅

| 파일 | 작업 | 비고 |
|---|---|---|
| `src/types/database.types.ts` | 모든 테이블/뷰에 `Relationships: []` 추가 | **근본 원인 수정** |
| `src/lib/supabase/admin.ts` | `SupabaseClient<Database>` 명시적 타입 선언 | Sprint 3-3 중 수정 |
| `src/lib/queries/studio.ts` | `getMyArtistProfile()` 신규 | ✅ |
| `src/actions/artist.ts` | `createArtistProfile()` Server Action | ✅ |
| `src/components/artist/TagSelector.tsx` | 태그 선택 Client Component | ✅ |
| `src/app/artists/new/NewArtistForm.tsx` | 폼 Client Component | ✅ |
| `src/app/artists/new/page.tsx` | 아티스트 프로필 생성 페이지 | ✅ |

**KNOWN_ISSUES.md 업데이트** (Sprint 3-3)
- ESLint dead code 오류 추가
- `.insert() never[]` 근본 원인 (`Relationships` 누락) 분석 및 해결책 추가

---

## 반복 금지 패턴 (2회 이상 발생)

| 패턴 | 발생 횟수 | 대체 방법 |
|---|---|---|
| `import { Instagram } from "lucide-react"` | 2회 | SVG 직접 인라인 |
| `hasNotif` 타입 오류 | 2회 | 속성 제거 후 경로 분기 |
| `HomeTagFilter`에서 `router.push` 사용 | 1회 | onSelect 콜백 + 클라이언트 state 필터링 |
| 공용 컴포넌트 API 변경 후 사용처 미확인 | 1회 | `grep -R "ComponentName" src` 전수 확인 |
| 반환 타입 미확인으로 타입 충돌 | 1회 | 관련 쿼리 파일 먼저 요청 후 실제 타입 확인 |
| unused import / dead code 잔존 | 2회 | 제출 전 전수 확인 + `npm run build` |
| export/import 방식 추측 | 1회 | 실제 파일 확인. 모르면 업로드 요청 |
| React 버전 무시한 API 사용 | 1회 | package.json react 버전 확인 |
| Supabase `.maybeSingle()` 반환 타입 never | 1회 | `data as any as DB_ROW \| null` 2단계 단언 |
| Supabase `.insert()` never[] — `Relationships` 누락 | 3회 | `database.types.ts` 모든 테이블/뷰에 `Relationships: []` 추가 |

---

## 빌드 규칙

- 모든 코드는 `npm run build` 통과 후 제출
- `dev` 서버에서만 되는 코드 제출 금지
- TypeScript strict 모드 준수
- unused import 제출 금지 — ESLint build 실패 원인
- 공용 컴포넌트 API 변경 시 `grep -R "ComponentName" src` 전수 확인 필수
- 타입 오류 발생 시 `as unknown` 추론 수정 금지 — 관련 파일 먼저 요청

## 배포 규칙

- main 브랜치 push → Vercel 자동 배포
- PR merge 전 로컬 빌드 확인 필수

## Next

- Sprint 3 Auth + User Profile 진행 예정
- `src/lib/mock-preferences.ts`의 `MOCK_BASE_CITY` → 세션 기반으로 교체 필요
