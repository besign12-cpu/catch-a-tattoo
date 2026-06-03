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

---

## 환경 변수 목록

| 변수 | 용도 | 노출 범위 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회용 (Admin) | 서버 전용 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox 지도 | 클라이언트 |

> `.env.local` 은 gitignore. `.env.example` 만 커밋.

---

## 파일 변경 이력

### Sprint 1 (초기 구축)

| 파일 | 작업 |
|---|---|
| `src/app/layout.tsx` | 루트 레이아웃, PWA metadata |
| `src/app/page.tsx` | 홈 피드 (더미 데이터) |
| `src/app/artists/[handle]/page.tsx` | 아티스트 프로필 (더미) |
| `src/components/layout/BottomNav.tsx` | 하단 5탭 네비게이션 |
| `src/components/layout/PageContainer.tsx` | 모바일 max-w 컨테이너 |
| `src/components/artist/FeedCard.tsx` | 피드 카드 (누가·어디·언제) |
| `src/components/schedule/ScheduleBlock.tsx` | 일정 블록 컴포넌트 |
| `src/components/ui/TagChip.tsx` | 태그 칩 |
| `src/components/ui/Avatar.tsx` | 이니셜 폴백 아바타 |
| `src/components/ui/Skeleton.tsx` | 로딩 스켈레톤 |
| `src/components/ui/ErrorState.tsx` | 에러 + 재시도 버튼 |
| `src/data/dummy.ts` | 더미 아티스트 4명, 태그 전체 |
| `src/types/index.ts` | 핵심 타입 정의 |
| `src/lib/utils.ts` | cn(), formatDateRange(), calcDDay() |
| `public/manifest.json` | PWA manifest |
| `tailwind.config.ts` | 커스텀 색상·spacing |

### Sprint 2 (Supabase 연결)

| 파일 | 작업 |
|---|---|
| `src/lib/supabase/client.ts` | 브라우저 클라이언트 싱글턴 |
| `src/lib/supabase/server.ts` | 서버 컴포넌트용 (cookies 기반) |
| `src/lib/supabase/admin.ts` | Service Role 클라이언트 |
| `src/types/database.types.ts` | DB 타입 (수동 작성, CLI 재생성 가능) |
| `src/lib/queries/artists.ts` | 피드·프로필·검색·지도·태그 쿼리 |
| `src/app/page.tsx` | Supabase 데이터 + dummy fallback |
| `src/app/artists/[handle]/page.tsx` | Supabase + dummy fallback |
| `src/app/search/page.tsx` | URL 기반 검색 |
| `src/app/map/page.tsx` | 도시 핀 목록 |
| `src/app/city/[citySlug]/page.tsx` | Guest / Based 섹션 |
| `src/components/search/SearchFilterBar.tsx` | Filter 드로어 |
| `supabase/migrations/001_init.sql` | 전체 DDL |
| `supabase/migrations/002_rls.sql` | RLS 정책 |
| `supabase/migrations/003_seed.sql` | 태그 32개 + 샘플 데이터 |

---

## 빌드 규칙

- 모든 코드는 `npm run build` 통과 후 제출
- `dev` 서버에서만 되는 코드 제출 금지
- TypeScript strict 모드 준수
- `any` 타입 사용 최소화

## 배포 규칙

- main 브랜치 push → Vercel 자동 배포
- PR merge 전 로컬 빌드 확인 필수
- 환경 변수 변경 시 Vercel 대시보드에도 반영
