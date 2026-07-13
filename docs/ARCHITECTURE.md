# ARCHITECTURE.md
# Catch A Tattoo — 아키텍처 문서

> **최종 업데이트:** Sprint 5 Final 완료 (Phase 1 Locale Refactor 포함)
> **Build 상태:** ✅ 통과

---

## CAT Vision

CAT는 전 세계 타투이스트의 Guest Work를 발견하고,
도시별·국가별·스타일별 수요를 분석하는
**Tattoo Industry Data Platform**을 목표로 합니다.

```
핵심: Discovery + Guest Work + Analytics
아닌 것: 예약 / 결제 / In-App 메시지
```

**기능 통과 기준**
1. 이 기능이 **Discovery를 강화**하는가?
2. 이 기능이 **Demand Data를 생성**하는가?

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 14.2.35 App Router | SSR + SSG 혼합 |
| 스타일 | Tailwind CSS | mobile-first, max-w-[430px] |
| 백엔드 | Supabase (PostgreSQL) | RLS 적용 |
| 인증 | Supabase Auth | Email 기반 |
| 파일 저장 | Supabase Storage | portfolios 버킷 |
| 배포 | Vercel | main 자동 배포 |
| 아이콘 | lucide-react | **Instagram 아이콘 → SVG 직접 사용** |
| 집계 자동화 | pg_cron | 월별 Analytics 집계 + 일정 자동 비활성화 |
| 타입스크립트 | ^5 | strict mode |

---

## i18n 구조 (Sprint 5)

### URL 구조
```
/           → EN (English)
/ko         → KO (Korean)
/following  → EN
/ko/following → KO
/me         → EN
/ko/me      → KO
(이하 동일 패턴)
```

### 라우팅 방식
- `src/app/ko/*` — 실제 라우트 파일 (re-export 방식)
- `middleware.ts` — `/ko/*` 요청 시 `x-locale: ko` 헤더 + `NEXT_LOCALE=ko` 쿠키 설정

### 번역 시스템
```
src/i18n/
├── translations.ts         → Client-safe 번역 데이터 + buildT()
├── translations.server.ts  → Server전용 getT() (next/headers 사용)
└── config.ts               → locales 배열, Locale 타입

src/lib/hooks/
├── useT.ts                 → Client 번역 훅 (usePathname 기반)
└── useLocaleNav.ts         → Client locale-aware 네비게이션 훅
```

### Locale 유지 원칙
- **판단 기준:** `usePathname()` — `/ko` 또는 `/ko/`로 시작하면 KO
- **Client:** `useLocaleNav()` → `{ href, push, replace }` — 모든 내부 이동에 사용
- **Server:** `getLocaleServer()` → `{ href, lp }` — Server Action / redirect에 사용
- **절대 규칙:** 사용자가 LanguageSwitcher에서 직접 변경하기 전까지 locale 변경 금지

---

## 사용자 구조

```
비로그인:  Discover / City / Artist Profile 열람 가능
Customer:  + Following / Calendar / Me / Settings / Bring / Follow
Artist:    + Guest Work 등록·수정 / Artist Calendar View / Analytics
```

---

## 내비게이션 구조

```
하단 탭 (BottomNav) — 4탭, locale-aware
├── / or /ko           → Discover
├── /following         → Following
├── /calendar          → Calendar
└── /me                → Me (비로그인 → /auth/login?next=)
```

**BottomNav 규칙:**
- `/auth/*` 경로에서 자동 숨김
- 비로그인 `/me` → `/auth/login?next=/ko/me` (locale 유지)
- `buildT(locale, "nav")` — pathname 기준 번역
- `withLocale()` — 모든 탭 링크에 locale prefix 적용

---

## URL 구조

### 공통 (prefix 없음 = EN, /ko/* = KO)
```
/                          Discover
/following                 Following — [일정][팔로우] 탭
/calendar                  Calendar — Customer/Artist View 분기
/city/:citySlug            City Page
/artists/:handle           Artist Profile
/me                        내 정보
/me/settings               설정
/auth/login                로그인
/auth/signup               회원가입
/auth/verify-email         이메일 인증 대기
/auth/callback             OAuth 콜백
/search                    검색 (아티스트·도시)
```

### Artist 전용
```
/artists/new               아티스트 프로필 최초 생성
/artists/:handle/edit      프로필 수정
/artists/:handle/schedule/new    Guest Work 등록 (5단계)
/artists/:handle/schedule/:id    일정 수정/삭제
/artists/:handle/portfolio       포트폴리오 관리
/studio                    Artist Dashboard
/studio/profile/edit       프로필 수정 (studio 버전)
/studio/portfolio          포트폴리오 관리 (studio 버전)
/studio/schedule/new       일정 등록 (studio 버전)
/studio/schedule/:id       일정 수정 (studio 버전)
```

---

## 인증 흐름

```
비로그인 → /me 접근 → middleware → /auth/login?next=/me (or /ko/me)
로그인 완료 → signIn → redirect(next) → 원래 페이지 복귀 (locale 유지)
로그아웃 → signOut → getLocaleServer().href("/") → /ko/ or / (locale 유지)
```

**보호 경로 (middleware):** `/me`, `/artists/new`, `/artists/*/edit`, `/artists/*/schedule/*`, `/artists/*/portfolio`

---

## Supabase 클라이언트 3종 규칙

| 파일 | 사용 위치 | 생성 방식 |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` 컴포넌트 | 싱글턴 |
| `lib/supabase/server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 |
| `lib/supabase/admin.ts` | Server Actions, Route Handlers | 싱글턴, **RLS 완전 우회** |

---

## 데이터 흐름

### 읽기
```
Page (Server Component)
  └─ lib/queries/*.ts → lib/supabase/server.ts → Supabase
```

### 쓰기
```
Client Component (form)
  └─ src/actions/*.ts ("use server")
       └─ lib/supabase/admin.ts (RLS 우회)
```

### Analytics 수집
```
Server Component / Action
  └─ lib/analytics/collect.ts
       └─ demand_events insert / search_logs insert
```

---

## Guest Work 일정 등록 플로우 (5단계)

```
Step 1: 도시 선택 (cities 드롭다운)
Step 2: 도시 인사이트 (Guest 수 · Bring 수)
Step 3: 날짜 선택 (달력 + 날짜별 🟢🟡🔴)
Step 4: 날짜 인사이트
Step 5: 상세 입력 → 등록 완료
```

---

## Bring 정책

| 정책 | 내용 |
|---|---|
| Bring 도시 | `users.base_city` 자동 적용 |
| Base City 변경 제한 | 30일 |
| Base City 변경 시 | 기존 Bring 전체 종료 |
| Current Demand | `is_active=true` 필터 필수 |

---

## 반복 발생 이슈 — 코딩 시 체크리스트

```
□ Instagram 아이콘 → lucide-react 금지, SVG 직접 사용
□ params → await 필수 (Next.js 14)
□ admin.ts → 클라이언트 컴포넌트 import 금지
□ npm run build 통과 확인 후 제출
□ database.types.ts 수동 작성 시 Relationships: [] 필수
□ export/import 방식 추측 금지 — 실제 파일 확인
□ React 18: useFormState / useFormStatus (react-dom)
□ 내부 링크: useLocaleNav().href() 또는 getLocaleServer().href() 사용
□ KO 상태에서 /me/settings 같은 EN 경로 이동 절대 금지
□ Server Action redirect: getLocaleServer().href(path) 사용
□ Bring 쿼리: Current Demand = is_active=true 필터 필수
□ 도시 입력: 자유 텍스트 금지 → cities 마스터 테이블 참조
```
