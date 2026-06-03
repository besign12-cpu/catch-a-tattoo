# ARCHITECTURE.md
# Catch A Tattoo — 아키텍처 문서

## 서비스 목표

사용자가 3초 안에 **누가 / 어디에 / 언제 오는지** 파악 가능한 게스트워크 일정 플랫폼.  
Instagram 포트폴리오 플랫폼이 **아님**.

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 14 App Router | SSR + SSG 혼합 |
| 스타일 | Tailwind CSS | mobile-first |
| 백엔드 | Supabase (PostgreSQL) | RLS 적용 |
| 인증 | Supabase Auth | Email + Google + Apple |
| 파일 저장 | Supabase Storage | 포트폴리오 이미지 |
| 배포 | Vercel | main 자동 배포 |
| 아이콘 | lucide-react | Instagram 아이콘 제외 (SVG 직접 사용) |

---

## 폴더 구조

```
src/
├── app/                        # Next.js App Router 페이지
│   ├── (public)/               # 비로그인 접근 가능
│   ├── (auth)/                 # 로그인·회원가입
│   ├── (protected)/            # 로그인 필요
│   ├── (studio)/               # 아티스트 전용
│   ├── (admin)/                # 관리자 전용
│   ├── artists/[handle]/       # 아티스트 프로필
│   ├── search/                 # 검색
│   ├── map/                    # 지도
│   └── city/[citySlug]/        # 도시 페이지
├── components/
│   ├── ui/                     # 원자 컴포넌트 (TagChip, Avatar, Skeleton...)
│   ├── layout/                 # BottomNav, TopBar, PageContainer
│   ├── artist/                 # FeedCard, ProfileHeader
│   ├── schedule/               # ScheduleBlock, ScheduleForm
│   └── search/                 # SearchFilterBar, CityFilterBar
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 싱글턴
│   │   ├── server.ts           # 서버 컴포넌트용 (cookies)
│   │   └── admin.ts            # Service Role (RLS 우회)
│   ├── queries/
│   │   └── artists.ts          # 모든 DB 쿼리 함수
│   └── utils.ts                # cn(), formatDateRange(), calcDDay()
├── data/
│   └── dummy.ts                # fallback 더미 데이터 (영구 유지)
└── types/
    ├── index.ts                # 앱 레벨 타입
    └── database.types.ts       # Supabase DB 타입 (CLI 재생성 가능)
```

---

## Supabase 클라이언트 사용 규칙

| 파일 | 사용 위치 | 특징 |
|---|---|---|
| `client.ts` | 클라이언트 컴포넌트 (`"use client"`) | 브라우저 싱글턴 |
| `server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 |
| `admin.ts` | Server Actions, Route Handlers | RLS 완전 우회, 서버 전용 |

> **절대 규칙:** `admin.ts`는 클라이언트 컴포넌트에서 절대 import 금지.

---

## 데이터 흐름

### 읽기 (서버 컴포넌트)
```
Page (Server Component)
  └─ lib/queries/artists.ts (getArtistProfile, getFeedSchedules...)
       └─ lib/supabase/server.ts (Supabase 쿼리)
            └─ Supabase PostgreSQL
```

### 쓰기 (Server Actions)
```
Client Component (form submit)
  └─ src/actions/*.ts (Server Action)
       └─ lib/supabase/server.ts 또는 admin.ts
            └─ Supabase PostgreSQL
```

### 실시간 (클라이언트 컴포넌트)
```
Client Component
  └─ lib/hooks/useNotifications.ts
       └─ lib/supabase/client.ts (Realtime 구독)
```

---

## 더미 데이터 fallback 정책

Supabase 연결 실패 또는 빈 결과 시 `src/data/dummy.ts` 데이터로 폴백.  
`dummy.ts`는 영구 유지. 삭제 금지.

```ts
// 패턴
const data = await fetchFromSupabase().catch(() => null);
if (!data || data.length === 0) return DUMMY_DATA;
```

---

## 태그 시스템

| 그룹 | 선택 규칙 | 예시 |
|---|---|---|
| `color` | 필수 1개 | Black, Color |
| `main` | 필수 1개 | Blackwork, Realism, Japanese... |
| `art` | 선택 0–4개 | Fine Line, Pet, Dark... |

- 전체 최소 2개, 최대 6개
- 태그 그룹 구분은 DB/검색 내부에서만 사용
- 프로필 화면에서는 단일 디자인으로 표시
- 검색한 태그만 강조 표시 (하이라이트)

---

## 인증 및 권한

| 역할 | 조건 | 주요 권한 |
|---|---|---|
| `visitor` | 비로그인 | 탐색·열람만 |
| `customer` | 로그인 | 팔로우·알림 |
| `artist` | is_claimed=true | 프로필 편집·일정 등록 |
| `artist (verified)` | is_verified=true | 모든 아티스트 기능 |
| `admin` | role=admin | 전체 관리 |

---

## URL 구조

```
/                          홈 피드
/search?city=&tags=        검색
/map                       지도
/city/:citySlug            도시 페이지 (예: seoul-kr)
/artists/:handle           아티스트 프로필
/artists/:handle/claim     Claim 시작
/artists/new               신규 프로필 생성
/auth/login                로그인
/auth/signup               회원가입
/studio                    아티스트 대시보드
/studio/profile/edit       프로필 편집
/studio/schedule/new       일정 등록
/studio/analytics          Analytics
/admin                     관리자 대시보드
```

---

## 성능 기준

| 지표 | 목표 |
|---|---|
| 홈 피드 LCP | 3초 이내 |
| 검색 응답 | 1초 이내 |
| 지도 핀 렌더링 | 2초 이내 |

### 캐시 전략

| 페이지 | revalidate |
|---|---|
| 홈 피드 | 30초 |
| 아티스트 프로필 | 60초 |
| 검색 | 동적 (캐시 없음) |
| 지도 | 3600초 (1시간) |

---

## 금지 사항

```
❌ import { Instagram } from "lucide-react"
❌ admin.ts를 클라이언트 컴포넌트에서 import
❌ params를 await 없이 직접 구조분해
❌ searchParams를 선언만 하고 사용하지 않음
❌ any 타입 남용
❌ <img> / <Image> 에 alt 미작성
❌ dev 서버에서만 되는 코드 제출
```
