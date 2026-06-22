# ARCHITECTURE.md
# Catch A Tattoo — 아키텍처 문서

> **최종 업데이트:** Sprint 4 전체 완료 + QA 완료 + Sprint 5 확정 사항 반영
> **Single Source of Truth:** Sprint 5 착수 전 기준

---

## CAT Vision

CAT는 단순한 타투 검색 사이트가 아닙니다.
전 세계 타투이스트의 Guest Work를 발견하고,
도시별·국가별·스타일별 수요를 분석하는
**Tattoo Industry Data Platform**을 목표로 합니다.

```
CAT의 핵심:  Discovery + Guest Work + Analytics

CAT가 아닌 것:  예약 플랫폼 / 결제 플랫폼 / In-App 메시지 플랫폼
Not Planned:   Reservation System / Payment System / In-App Messaging
```

**기능 통과 기준 (Core Principle)**
모든 기능은 아래 두 질문 중 하나를 통과해야 합니다.
1. 이 기능이 **Discovery를 강화**하는가?
2. 이 기능이 **Demand Data를 생성**하는가?

---

## Long-Term Goal

```
고객     →  "누가 우리 도시에 오는가"를 확인하기 위해 CAT를 사용한다
아티스트 →  "다음 Guest Work를 어디로 가야 하는가"를 결정하기 위해 CAT를 사용한다
```

CAT는 타투 업계의 Instagram이 아니라, **타투 업계의 데이터 인프라**가 목표입니다.

---

## North Star Metric

**Monthly Demand Signals** — 사용자 수가 아닌 수요 신호 누적이 핵심 지표입니다.

| Demand Signal | 수집 방법 | 현재 상태 |
|---|---|---|
| Follow | `follows` 테이블 | ✅ 수집 중 |
| Bring This Artist | `city_follows` 테이블 | ✅ 수집 중 (실동작 Sprint 5) |
| Profile View | `demand_events` (event_type='profile_view') | ⏳ Sprint 5 |
| Schedule View | `demand_events` (event_type='schedule_view') | ⏳ Sprint 5 |
| Instagram Click | `demand_events` (event_type='instagram_click') | ⏳ Sprint 5 |
| City Click | `demand_events` (event_type='city_click') | ⏳ Sprint 5 |
| City Search | `search_logs` (query_type='city') | ⏳ Sprint 5 |
| Style Search | `search_logs` (query_type='style') | ⏳ Sprint 5 |

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 14 App Router | SSR + SSG 혼합 |
| 스타일 | Tailwind CSS | mobile-first, max-w-mobile=430px |
| 백엔드 | Supabase (PostgreSQL) | RLS 적용 |
| 인증 | Supabase Auth | Email + Google |
| 파일 저장 | Supabase Storage | portfolios 버킷 (연결 예정) |
| 배포 | Vercel | main 자동 배포 |
| 아이콘 | lucide-react | **Instagram 아이콘 제외 — SVG 직접 사용** |
| i18n | next-intl | Sprint 5 도입 예정 |
| 집계 자동화 | pg_cron | Sprint 6 Analytics 집계 예정 |

---

## i18n 정책 (Sprint 5 확정)

```
기본 언어:   / = English
한국어:      /ko = Korean
라이브러리:  next-intl

Language 버튼:
- Discover TopBar 우상단 (비로그인 접근 가능)
- /me/settings Language 섹션

번역 제외 고유 개념어 (양 언어 동일):
CAT, Guest Work, Bring, Bring This Artist,
Follow, Based City, Artist Profile, Discovery, Demand Signal

Admin Analytics: 한국어만 유지
```

---

## 사용자 구조

```
Artist = Customer 기능 전체 + Artist 관리 기능

Customer 기능: Discover / Following / Calendar / Me / City Page / Artist Profile
Artist 추가:   프로필 수정 / Guest Work 등록·수정·삭제 / 향후 인사이트
```

---

## 내비게이션 구조 (Sprint 4 확정)

```
하단 탭 (BottomNav) — 4탭
├── /           → Discover (Compass 아이콘)
├── /following  → Following (Heart 아이콘)
├── /calendar   → Calendar (Calendar 아이콘)
└── /me         → 나 (User 아이콘) — role 무관 /me 이동
```

**BottomNav 규칙:**
- `/auth/*` 경로에서 자동 숨김
- 비로그인 시 `/me` 탭 → `/auth/login` 이동
- `/me`와 `/studio` 경로 모두 나 탭 active 처리
- role 분기 없음 — 모두 /me로 이동, Me 페이지에서 Artist CTA 제공

---

## URL 구조 (Sprint 4 완료 기준)

### 현재 운영 중 (18개)
```
/                          Discover — Base City 기반 Guest 피드
/following                 Following — [일정] [팔로우] 탭 + 🔔 알림
/calendar                  Calendar — Customer/Artist View 분기
/city/:citySlug            City Page — Customer/Artist View 분기
/artists/:handle           Artist Profile (+ 본인 수정 링크)
/artists/new               아티스트 프로필 최초 생성
/auth/login                로그인
/auth/signup               회원가입
/auth/verify-email         이메일 인증 대기
/auth/callback             OAuth 콜백
/me                        내 정보 (Customer + Artist CTA)
/me/settings               설정 (Base City · 관심장르 · 알림)
/studio                    Artist Dashboard (⚠️ Sprint 5에서 제거 예정)
/studio/profile/edit       프로필 수정 (⚠️ Sprint 5에서 이동)
/studio/portfolio          포트폴리오 관리 (⚠️ Sprint 5에서 이동)
/studio/schedule/new       Guest Work 등록 (⚠️ Sprint 5에서 이동)
/studio/schedule/:id       일정 수정/삭제 (⚠️ Sprint 5에서 이동)
```

### Sprint 5에서 추가될 URL
```
/artists/:handle/edit               프로필 수정
/artists/:handle/schedule/new       Guest Work 등록
/artists/:handle/schedule/:id       일정 수정/삭제
/artists/:handle/portfolio          포트폴리오 관리
```

---

## 화면별 역할 분기 원칙

| 화면 | Customer / 비로그인 | Artist 추가 레이어 |
|---|---|---|
| **Discover** | Guest 피드 | 동일 |
| **Following** | [일정] [팔로우] 탭, 🔔 알림 | 동일 |
| **Calendar** | 달력 + 팔로우 일정 / CityDropdown | 도시 드롭다운 + 날짜 🟢🟡🔴 + Guest Work 등록 CTA |
| **City Page** | KPI (Guest/Based/Bring) + 아티스트 목록 | + Artist Insight 배너 (Bring 수, 일정 등록 CTA) |
| **Artist Profile** | 프로필 + Guest Work + 팔로우 + Bring | + [수정] 버튼, [+ Guest Work 등록], 수정 링크 |
| **Me** | 내 정보 + 설정 + 로그아웃 | + Studio CTA 카드 (→ /studio, Sprint 5에서 /artists/:handle로 변경) |
| **Settings** | Base City · 관심장르 · 알림 | 동일 |

---

## Bring 정책 (확정)

```
Bring = 현재 수요(Current Demand) 중심
누적 Bring보다 지금 활성 Bring이 중요
```

| 정책 | 내용 | 상태 |
|---|---|---|
| Bring 도시 | `users.base_city` 자동 적용 — 사용자 변경 불가 | ✅ DB 구현 |
| Base City 변경 제한 | 30일 (base_city_changed_at 기준) | ✅ 구현 완료 |
| Base City 변경 시 | 기존 Bring 전체 종료 → `expire_bring_by_base_city_change` RPC | ✅ 구현 완료 |
| Guest Work 완료 시 | end_date 이후 Bring 종료 → `expire_bring_for_completed_schedules` | ⏳ pg_cron 미설정 |
| Bring 버튼 위치 | Artist Profile 헤더 CTA ([팔로우] [Bring] [Instagram]) | ✅ UI만 / 실동작 Sprint 5 |
| Current Demand 쿼리 | `is_active=true` 필터 | ✅ DB 구조 완료 |

---

## City System 정책

관리형 City System — Analytics 품질을 위해 관리자 승인 도시만 사용.

```
✅ 관리자가 승인한 도시만 사용 (is_approved = true)
✅ 초기 60개 주요 Guest Work 도시 seed 등록 완료
❌ 사용자 임의 도시 생성 불가
✅ 사용자는 도시 추가 요청 가능 (city_requests) — UI Sprint 5
✅ 아티스트 프로필 Base City → CityDropdown
✅ 일정 등록 Step 1 → CityDropdown
```

---

## Guest Work 일정 등록 플로우 (5단계, 구현 완료)

```
Step 1: 도시 선택 (CityDropdown — 검색 + 드롭다운)
Step 2: 도시 인사이트 (현재 Guest 수 · Bring 수) ← Sprint 5 실데이터
Step 3: 날짜 선택 (달력 + 기존 일정 중복 방지)
Step 4: 날짜 인사이트 (선택 기간 Guest 수 · 장르 분포) ← Sprint 5 실데이터
Step 5: 상세 입력 → 등록 완료 (연락방법 · 메모)
```

---

## Analytics Data Collection

**원칙: MVP부터 모든 데이터를 수집합니다. 초기에는 관리자만 열람 가능합니다.**

테이블은 Sprint 4에서 생성됨. 실수집은 Sprint 5.

```sql
demand_events (id, event_type, user_id, artist_id, city_id, session_id, created_at)
search_logs   (id, query_type, query_value, user_id, session_id, result_count, filters_used, created_at)
analytics_snapshots (id, snapshot_type, target_id, period, value, created_at)
```

---

## 인증 흐름

```
비로그인 → /me, /studio 접근  → middleware → /auth/login?next=...
로그인 완료     → signIn Server Action → redirect("/")
회원가입 완료   → /auth/verify-email → 이메일 링크 → /auth/callback → redirect("/")
로그아웃        → signOut Server Action → redirect("/")
```

**보호 경로 (middleware):** `/me`, `/studio`, `/studio/**`, `/calendar` (로그인 시 View 분기)

---

## Supabase 클라이언트 3종 규칙

| 파일 | 사용 위치 | 생성 방식 |
|---|---|---|
| `lib/supabase/client.ts` | `"use client"` 컴포넌트 | 싱글턴 |
| `lib/supabase/server.ts` | 서버 컴포넌트, Server Actions | 매 요청 새 인스턴스 |
| `lib/supabase/admin.ts` | Server Actions, Route Handlers | 싱글턴, **RLS 완전 우회** |

- `admin.ts` 클라이언트 컴포넌트 import 절대 금지
- `SUPABASE_SERVICE_ROLE_KEY` → `NEXT_PUBLIC_` 절대 금지

---

## database.types.ts 필수 규칙

```
⚠️ 모든 Tables와 Views에 Relationships: [] 필수

  tableName: {
    Row: { ... };
    Insert: { ... };
    Update: { ... };
    Relationships: [];  ← 없으면 insert/update 타입이 never[]로 추론됨
  };
```

---

## 더미 데이터 fallback 정책

Supabase 연결 실패 또는 빈 결과 → `src/data/dummy.ts`로 폴백.
`dummy.ts`는 영구 유지. **절대 삭제 금지.**

---

## 반복 발생 이슈 — 코딩 시 체크리스트

```
□ Instagram 아이콘 → lucide-react 금지, SVG 직접 사용
□ hasNotif 속성 → 속성 제거 후 경로/상태 분기 처리
□ params → await 필수 (Next.js 14)
□ admin.ts → 클라이언트 컴포넌트 import 금지
□ npm run build 통과 확인 후 제출
□ img → alt 필수 + eslint-disable-next-line @next/next/no-img-element
□ database.types.ts 수동 작성 시 Relationships: [] 필수
□ export/import 방식 추측 금지 — 실제 파일 확인
□ React 18: useFormState / useFormStatus (react-dom), useActionState 금지
□ zip 제출 시 의존 파일도 함께 포함
□ Server Action에서 as any → eslint-disable 또는 DB Row 타입 직접 지정
□ 새 기능 추가 시 "Discovery 강화 or Demand Data 생성?" 통과 확인
□ Server Component에서 onClick 핸들러 금지 → Client Component 분리
□ isScheduleActive 반환값: "active" | "upcoming" | "ended" ("past" 아님)
□ CityDropdown 추가 시 컴포넌트별 중복 렌더 확인
□ Bring 쿼리: Current Demand = is_active=true 필터 필수
□ 도시 입력: 자유 텍스트 금지 → CityDropdown (cities 마스터 테이블 참조)
```
