# ARCHITECTURE.md
# Catch A Tattoo — 아키텍처 문서

> **최종 업데이트:** Sprint 3 UI 개선 완료 시점

---

## 서비스 목표

사용자가 3초 안에 **누가 / 어디에 / 언제 오는지** 파악 가능한 게스트워크 일정 플랫폼.
Instagram 포트폴리오 플랫폼이 **아님**.

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 14 App Router | SSR + SSG 혼합 |
| 스타일 | Tailwind CSS | mobile-first, max-w-mobile=430px |
| 백엔드 | Supabase (PostgreSQL) | RLS 적용 |
| 인증 | Supabase Auth | Email + Google (Sprint 3~) |
| 파일 저장 | Supabase Storage | portfolios 버킷 (Sprint 3~) |
| 배포 | Vercel | main 자동 배포 |
| 아이콘 | lucide-react | **Instagram 아이콘 제외 — SVG 직접 사용** |

---

## 내비게이션 구조 (Sprint 3 현재)

```
하단 탭 (BottomNav)
├── /           → 검색 (Search 아이콘)   ← 첫 번째 탭
├── /following  → 팔로우 (Heart 아이콘)
├── /map        → 지역 (MapPin 아이콘)
├── /notifications → 알림 (Bell 아이콘)
└── /me         → 내 정보 (User 아이콘)
```

> Sprint 2 이전: 첫 번째 탭이 Home 아이콘 "홈"이었음.
> Sprint 3에서 Search 아이콘 "검색"으로 변경. URL은 동일하게 `/`.

---

## 폴더 구조 원칙

```
src/app/           # 페이지 (Next.js App Router)
src/components/    # 재사용 UI 컴포넌트
  ui/              # 원자 컴포넌트 (어디서든 사용 가능)
  layout/          # 레이아웃 컴포넌트 (BottomNav, PageContainer...)
  artist/          # 아티스트 관련 컴포넌트
  schedule/        # 일정 관련 컴포넌트
  search/          # 검색 관련 컴포넌트
src/lib/           # 비즈니스 로직, 쿼리, 훅
src/data/          # 더미 데이터 (fallback 전용, 삭제 금지)
src/types/         # 타입 정의
src/actions/       # Server Actions (Sprint 3 후반~)
```

---

## Supabase 클라이언트 3종 — 핵심 규칙

| 파일 | 사용 위치 | 생성 방식 |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` 컴포넌트 | 싱글턴 (재사용) |
| `lib/supabase/server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 |
| `lib/supabase/admin.ts` | Server Actions, Route Handlers | 싱글턴, **RLS 완전 우회** |

**절대 규칙:**
- `admin.ts`는 클라이언트 컴포넌트에서 절대 import 금지
- `server.ts`는 항상 `await`와 함께 사용
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_` 붙이지 않음

---

## 데이터 흐름

### 읽기 (서버 컴포넌트)
```
Page (async Server Component)
  └─ lib/queries/artists.ts
       └─ lib/supabase/server.ts
            └─ Supabase PostgreSQL
```

### 쓰기 (Sprint 3 후반~)
```
Client Component (form)
  └─ src/actions/*.ts (Server Action, "use server")
       └─ lib/supabase/server.ts 또는 admin.ts
            └─ Supabase PostgreSQL
```

### 실시간 (Sprint 5~)
```
Client Component
  └─ lib/hooks/useNotifications.ts
       └─ lib/supabase/client.ts (Realtime 구독)
```

---

## 검색 아키텍처 (Sprint 3 현재)

```
홈 (/)
  └─ SearchInput → /search?q=입력값
  └─ HomeTagFilter → /search?tags=slug

검색 결과 (/search)
  ├─ ?q= 기반 → 도시명 + 아티스트명 병렬 처리
  ├─ ?tags= 기반 → searchArtists({ tagSlugs })
  └─ ResultFilterBar → URL 업데이트 (router.push)
```

태그 필터는 검색창이 아니라 검색 결과 화면에서만 드로어로 노출.

---

## 더미 데이터 fallback 정책

Supabase 연결 실패 또는 빈 결과 → `src/data/dummy.ts`로 폴백.
`dummy.ts`는 영구 유지. 절대 삭제 금지.

```ts
// 모든 page.tsx에서 동일하게 적용
const data = await fetchFromSupabase().catch(() => null);
if (!data || data.length === 0) return DUMMY_DATA;
```

---

## 태그 시스템

| 그룹 | 선택 규칙 | 태그 수 |
|---|---|---|
| `color` | 필수 1개 | 2 (Black, Color) |
| `main` | 필수 1개 | 14 (Blackwork, Realism...) |
| `art` | 선택 0–4개 | 16 (Fine Line, Pet...) |

- 전체 최소 2개, 최대 6개
- 그룹 구분은 DB + 검색 내부 로직에서만 사용
- UI에서는 단일 디자인. 검색 시 일치 태그만 강조(highlightedSlugs).

---

## 인증 및 권한 (Sprint 3 후반 구현 예정)

| 역할 | 조건 | 주요 권한 |
|---|---|---|
| `visitor` | 비로그인 | 탐색·열람 |
| `customer` | 로그인 | 팔로우·알림 |
| `artist` | is_claimed=true | 프로필 편집·일정 등록 |
| `artist (verified)` | is_verified=true | 모든 아티스트 기능 |
| `admin` | role=admin | 전체 관리 |

---

## 캐시 전략

| 페이지 | revalidate | 이유 |
|---|---|---|
| 홈 (`/`) | 30초 | 새 일정 빠른 반영 |
| 아티스트 프로필 | 없음 (동적) | 수정 즉시 반영 |
| 검색 | 없음 (동적) | 실시간 필터 |
| 지역 지도 (`/map`) | 3600초 | Materialized View 주기 |
| 도시 페이지 | 없음 (동적) | 일정 변경 즉시 |

---

## URL 구조

```
/                          홈 = 검색 (첫 화면)
/following                 팔로우한 아티스트 피드
/search?q=&tags=&type=     검색 결과
/map                       지역 탐색
/city/:citySlug            도시 페이지 (예: seoul-kr)
/artists/:handle           아티스트 프로필
/artists/:handle/claim     Verify Profile 시작
/artists/new               신규 프로필 생성 (Sprint 3 후반)
/auth/login                로그인 (Sprint 3 후반)
/auth/signup               회원가입 (Sprint 3 후반)
/studio                    아티스트 대시보드 (Sprint 3 후반)
/studio/profile/edit       프로필 편집 (Sprint 3 후반)
/studio/schedule/new       일정 등록 (Sprint 4)
/studio/analytics          Analytics (Sprint 5)
/admin                     관리자 (Sprint 6)
```

---

## 성능 기준

| 지표 | 목표 |
|---|---|
| 홈 피드 LCP | 3초 이내 |
| 검색 응답 | 1초 이내 |
| 지역 지도 핀 | 2초 이내 |

---

## 반복 발생 이슈 — 코딩 시 체크리스트

코드 작성 전 반드시 확인:

```
□ Instagram 아이콘 → lucide-react 금지, SVG 직접 사용
□ hasNotif 속성 → as const 배열에서 타입 오류. 속성 제거 후 분기 처리
□ params → await 필수 (Next.js 14)
□ searchParams → 사용 안 하면 선언 자체 제거
□ 쿼리 결과 → as 단언 금지, 변환 함수 사용
□ admin.ts → 클라이언트 컴포넌트 import 금지
□ npm run build 통과 확인 후 제출
□ img/Image → alt 필수
```
