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
| 현재 상태 | Sprint 3 UI 개선 완료 / 인증·프로필 시스템 구현 예정 |

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

### Sprint 3 — UI 구조 개선 🔄 진행 중

| 파일 | 작업 | 상태 |
|---|---|---|
| `src/components/layout/BottomNav.tsx` | 검색/팔로우 탭 구조 개편, hasNotif 제거 | ✅ |
| `src/components/artist/FeedCard.tsx` | 라벨 제거, 국가명 추가, 팔로우 버튼 복원 | ✅ |
| `src/components/search/SearchInput.tsx` | 실제 input 컴포넌트 신규 | ✅ |
| `src/components/search/HomeTagFilter.tsx` | 도시 칩 대신 태그 칩 신규 | ✅ |
| `src/components/search/ResultFilterBar.tsx` | 검색 결과 내 필터 드로어 신규 | ✅ |
| `src/app/page.tsx` | 검색 중심 홈, 태그 필터 칩 | ✅ |
| `src/app/search/page.tsx` | 텍스트 기반 검색 (도시+이름 병렬) | ✅ |
| `src/app/following/page.tsx` | 팔로우 탭 신규 (빈 상태 UI) | ✅ |
| `src/app/map/page.tsx` | 지역 탐색 구조 (Asia/Europe/Americas 카드) | ✅ |
| `src/app/artists/[handle]/page.tsx` | Claim → Verify Profile 문구 변경 | ✅ |
| `src/lib/queries/artists.ts` | (변경 없음) | - |
| `src/app/auth/**` | 로그인·회원가입 화면 | ⏳ 미구현 |
| `src/app/studio/**` | 아티스트 스튜디오 | ⏳ 미구현 |
| `src/actions/auth.ts` | 인증 Server Actions | ⏳ 미구현 |
| `src/actions/artist.ts` | 프로필 Server Actions | ⏳ 미구현 |
| `src/components/artist/TagSelector.tsx` | 태그 선택 UI | ⏳ 미구현 |
| `src/components/artist/PortfolioUploader.tsx` | 포트폴리오 업로드 | ⏳ 미구현 |
| `src/lib/hooks/useSession.ts` | 세션 훅 | ⏳ 미구현 |
| `middleware.ts` | 라우트 보호 | ⏳ 미구현 |

---

## 반복 금지 패턴 (2회 이상 발생)

| 패턴 | 발생 횟수 | 대체 방법 |
|---|---|---|
| `import { Instagram } from "lucide-react"` | 2회 | SVG 직접 인라인 |
| `hasNotif` 타입 오류 | 2회 | 속성 제거 후 경로 분기 |

---

## 빌드 규칙

- 모든 코드는 `npm run build` 통과 후 제출
- `dev` 서버에서만 되는 코드 제출 금지
- TypeScript strict 모드 준수

## 배포 규칙

- main 브랜치 push → Vercel 자동 배포
- PR merge 전 로컬 빌드 확인 필수
