# MASTER_LOG.md
# Catch A Tattoo — 개발 마스터 로그

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 서비스 | Guest Work 중심 타투이스트 발견 플랫폼 |
| 기술 스택 | Next.js 14.2.35 App Router · Supabase · Tailwind CSS |
| 배포 | Vercel (자동 배포, main 브랜치) |
| 현재 상태 | Sprint 5 Final 완료 (Phase 1 Locale Refactor 포함) · Build ✅ |

---

## 환경 변수 목록

| 변수 | 용도 | 노출 범위 | 상태 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | 클라이언트 | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 | 클라이언트 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회용 (Admin) | 서버 전용 | ✅ |

---

## 파일 변경 이력

### Sprint 1 — 초기 구축 ✅
- Next.js 14 App Router + Tailwind 초기화
- BottomNav (5탭), PageContainer, TopBar
- 더미 데이터 기반 홈·아티스트 프로필
- 공통 UI 컴포넌트 (Avatar, Skeleton, TagChip, VerifiedBadge)

### Sprint 2 — Supabase 연결 ✅
- Supabase 3종 클라이언트 (client/server/admin)
- database.types.ts 수동 작성
- lib/queries/artists.ts — 피드·프로필·검색·지도·태그 쿼리
- 홈·아티스트 프로필 Supabase 연동 (dummy fallback 유지)
- 도시 페이지 (guest/based 섹션)

### Sprint 3 — Auth + Studio + QA ✅
- Auth (signUp/signIn/signOut, email 기반)
- Customer 프로필 (me/page.tsx)
- Artist 프로필 생성·수정 (artists/new, artists/[handle]/edit)
- Studio Dashboard
- 포트폴리오 업로드 (Supabase Storage)
- BottomNav 5탭→4탭 (Discover/Following/Calendar/나)
- 미사용 파일 정리

### Sprint 4 — Guest Work + City System + Analytics ✅
- Guest Work 등록 5단계 플로우 (ScheduleNewClient)
- City System (cities 마스터 테이블, CityDropdown)
- Bring This Artist 실동작 (city_follows, is_active)
- Calendar (Customer/Artist View 분기)
- Following ([일정][팔로우] 탭 실데이터)
- Settings (Base City · 관심장르 · 알림)
- Analytics 수집 (demand_events, search_logs)
- mock-preferences.ts → 세션 기반 교체

### Sprint 5 — i18n + Discover UX + Locale Refactor ✅

**Sprint 5-1~8: 핵심 기능**
- Studio 제거, Artist Profile 통합
- Bring/Follow 실동작
- Following/Calendar 실데이터
- Analytics 고도화
- Settings 저장 실동작

**Sprint 5-9: i18n 구조**
- next-intl 제거 → 자체 번역 시스템
- translations.ts (Client-safe) / translations.server.ts (Server-only)
- useT.ts (pathname 기반) / useLocaleNav.ts

**Sprint 5 Final-1: Discover UX**
- 검색에서 도시 클릭 → Discover 기준 도시 변경 (City Page 이동 X)
- 상단 도시 헤더 (도시명 + 더보기)
- /api/discover/city Route Handler

**Sprint 5 Final-2: i18n 마무리**
- 전체 UI 번역 적용 (Calendar, Settings, Artist Profile, City Page 등)
- BottomNav locale-aware 복원
- Me 페이지 MeLinks Client Component 적용
- SettingsBackButton 분리
- /ko/me/settings 실제 라우트 추가

**Sprint 5 Final — Phase 1 Locale Refactor**
- useLocaleNav 훅 도입 (Client locale-aware 네비게이션)
- getLocaleServer 고도화 (x-locale 헤더 1순위)
- 전체 하드코딩 내부 이동 제거:
  - BringButton: router.push("/me/settings") → useLocaleNav
  - FollowingClient: href="/" → useLocaleNav
  - artists/[handle]: href="/" → BackButton (router.back())
  - city/[citySlug]: href="/calendar", "/" → getLocaleServer
  - CalendarClient: href="/" → useLocaleNav
  - auth.ts signOut: redirect("/") → getLocaleServer
  - search/page: href="/" → getLocaleServer

---

## 주요 설계 결정

### i18n URL 구조
```
/ → EN,  /ko → KO (re-export 방식, middleware x-locale 헤더)
```
선택 이유: [locale] 폴더 구조 없이 최소 파일 변경으로 구현

### calcDDay 플래그 방식
```
"진행 중" 하드코딩 → "__IN_TOWN__" 플래그 반환
각 컴포넌트에서 useT("artist").inTown으로 번역
```

### locale 판단 기준
```
usePathname() 기반 — 쿠키/SSR 의존 없음
/ko 또는 /ko/로 시작하면 "ko", 나머지 "en"
```
