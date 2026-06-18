# KNOWN_ISSUES.md
# Catch A Tattoo — 알려진 이슈 및 해결책

## 규칙
- 이슈 발생 시 즉시 이 파일에 기록
- 해결 후 상태를 RESOLVED로 변경
- 동일 이슈 재발 방지를 위해 해결책 상세 기록

---

## [RESOLVED] Instagram 아이콘 — lucide-react 미지원 (2회 발생)

**발생 Sprint:** Sprint 2, Sprint 3 (재발)
**상태:** ✅ RESOLVED
**재발 횟수:** 2회 → 반복 금지 항목으로 격상

**증상**
```
Module not found: Can't resolve 'Instagram' from 'lucide-react'
```

**원인**
lucide-react 최신 버전에서 `Instagram` 아이콘이 제거됨.
새 파일 작성 시 반복적으로 재발하는 패턴 확인.

**해결책 — SVG 직접 인라인 (복사해서 쓸 것)**
```tsx
// ❌ 절대 금지
import { Instagram } from "lucide-react"

// ✅ 이 컴포넌트를 src/components/ui/InstagramIcon.tsx 에 두고 재사용
function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  );
}
```

**재발 방지 조치**
- 이 이슈는 문서 최상단에 배치
- 모든 Instagram 관련 UI는 위 SVG 컴포넌트만 사용
- `import { Instagram }` 코드 리뷰 시 즉시 반려

---

## [RESOLVED] BottomNav hasNotif 타입 오류 (2회 발생)

**발생 Sprint:** Sprint 2, Sprint 3 (재발)
**상태:** ✅ RESOLVED
**재발 횟수:** 2회 → 반복 금지 항목으로 격상

**증상**
```typescript
Property 'hasNotif' does not exist on type ...
// 또는
Object literal may only specify known properties
```

**원인**
`as const` 배열에서 일부 항목에만 `hasNotif` 속성이 있을 때
TypeScript가 타입을 정확히 추론하지 못하는 경우 발생.

**해결책**
```tsx
// ❌ 오류 발생 패턴
const NAV_ITEMS = [
  { href: "/",     icon: Home,  label: "홈" },
  { href: "/bell", icon: Bell,  label: "알림", hasNotif: true }, // 타입 불일치
] as const;

// ✅ 해결책 1 — 모든 항목에 hasNotif 포함 (undefined 허용)
const NAV_ITEMS: Array<{
  href: string;
  icon: React.ElementType;
  label: string;
  hasNotif?: boolean;
}> = [
  { href: "/",     icon: Home,  label: "홈" },
  { href: "/bell", icon: Bell,  label: "알림", hasNotif: true },
];

// ✅ 해결책 2 — hasNotif를 아예 제거하고 경로로 분기
{pathname.startsWith("/notifications") ? null : (
  <span className="absolute ... bg-red-500" />
)}
```

**현재 적용 방식:** Sprint 3에서 `hasNotif` 속성 제거, 알림 점은 별도 로직으로 처리.

---

## [RESOLVED] Next.js 14 params async 처리

**발생 Sprint:** Sprint 2
**상태:** ✅ RESOLVED

**증상**
`params.handle` 직접 접근 시 TypeScript 경고 또는 런타임 오류.

**해결책**
```tsx
// ❌ 금지
export default function Page({ params }: { params: { handle: string } }) {
  const { handle } = params;
}

// ✅ 허용
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
}
```

---

## [RESOLVED] searchParams 미사용 선언

**발생 Sprint:** Sprint 2
**상태:** ✅ RESOLVED

**해결책**
사용하지 않는 searchParams는 props에서 아예 제거.

---

## [RESOLVED] Supabase 타입 불일치 — never 오류

**발생 Sprint:** Sprint 2
**상태:** ✅ RESOLVED

**해결책**
쿼리 결과에 명시적 타입 단언 대신, 변환 함수(toTag, toSchedule) 사용.
```ts
// ❌ 금지
const result = data as ArtistProfile[];

// ✅ 허용
function toTag(raw: { id: string; name: string; slug: string; group_type: string }): Tag { ... }
function toSchedule(raw: { ... }): GuestSchedule { ... }
```

---

## [RESOLVED] Next.js Image/img alt 필수

**발생 Sprint:** Sprint 2
**상태:** ✅ RESOLVED

**해결책**
모든 `<img>`, `<Image>` 태그에 의미 있는 `alt` 필수.
장식용 이미지는 `alt=""` 명시.

---

## [ACTIVE] Materialized View 수동 갱신 필요

**발생 Sprint:** Sprint 2
**상태:** 🔄 ACTIVE (pg_cron 미설정)

**임시 해결책**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.city_pin_summary;
```

**영구 해결책 (Sprint 4 예정)**
Supabase → Extensions → pg_cron 활성화 후:
```sql
select cron.schedule(
  'refresh-city-pins',
  '0 * * * *',
  $$ refresh materialized view concurrently public.city_pin_summary; $$
);
```

---

## [ACTIVE] 포트폴리오 이미지 미표시

**발생 Sprint:** Sprint 1~3
**상태:** 🔄 ACTIVE (Sprint 3 후반 또는 Sprint 4에서 해결 예정)

**증상**
아티스트 프로필의 대표 작품 3장이 placeholder(회색 박스)로 표시.

**원인**
Supabase Storage 미연동, 업로드 UI 미구현.

---

## [RESOLVED] CityFilterBar.tsx 미사용 파일 잔존

**발생 Sprint:** Sprint 3
**상태:** ✅ RESOLVED — Sprint 3-7 Cleanup에서 삭제 완료

**해결**
`src/components/search/CityFilterBar.tsx`, `SearchFilterBar.tsx` 모두 삭제됨.

---

## [RESOLVED] TypeScript 타입 오류 — 반환 타입 미확인으로 인한 타입 충돌

**발생 Sprint:** Sprint 3 Pre-Home
**상태:** ✅ RESOLVED

**증상**
```
Type 'ArtistProfile[]' is not assignable to type 'SearchResult[]'.
Type 'ArtistProfile' is missing the following properties from type 'SearchResult':
artistId, matchedTags, totalTags, priority, nextSchedule
```
`getCityArtists()`가 `SearchResult[]`를 반환하는데,
`ArtistProfile[]` 기반 변환 함수를 작성하여 타입 충돌 발생.

**원인**
코드 작성 전 실제 반환 타입을 확인하지 않고 타입을 추정해서 구현.

**해결책**
`dummyToSearchResult()` 변환 함수를 작성해 `ArtistProfile` → `SearchResult` 변환 후 통일.
`toFeedCards()`도 `SearchResult[]` 기반으로 재작성.

**재발 방지 규칙**
```
□ TypeScript 타입 오류 발생 시 as unknown / as any 추론 수정 금지
□ 관련 파일(queries/artists.ts 등)을 먼저 요청하여 실제 반환 타입 확인
□ 변환 함수는 실제 타입 기준으로 작성
□ zip 제출 전 npm run build 필수
□ unused import 남기지 않기
□ build 성공 확인 후 zip 제출
```

---

## [RESOLVED] Unused import로 인한 빌드 실패 (반복 주의)

**발생 Sprint:** Sprint 3
**상태:** ✅ RESOLVED

**증상**
```
'DUMMY_ARTISTS' is defined but never used.
```
`page.tsx`에서 `DUMMY_ARTISTS`를 import했으나 실제 코드에서 사용하지 않아 ESLint build 실패.

**원인**
이전 버전 코드에서 사용하던 import를 로직 변경 후 제거하지 않음.
`getCityArtists`의 반환 타입이 `SearchResult[]`임을 확인하지 않고
`ArtistProfile[]` 기반 `toFeedCards`를 작성하다 리팩토링 과정에서 import 잔존.

**재발 방지 규칙**
코드 제출 전 반드시 아래를 확인한다:
```bash
# 1. 사용하지 않는 import 확인
grep "^import" src/app/page.tsx  # 각 파일별로 확인

# 2. 특히 아래 항목은 제거 후 잔존 여부 주의
#    DUMMY_ARTISTS / notFound / unused SearchResult 등

# 3. 빌드 통과 확인
npm run build
```

**추가 원칙**
- 반환 타입이 변경된 함수(`getCityArtists` 등)를 사용할 때
  반드시 실제 반환 타입을 확인 후 변환 함수 작성
- `Awaited<ReturnType<typeof fn>>` 패턴으로 타입 추론 활용

---

## [RESOLVED] SearchInput API 변경 후 사용처 누락으로 빌드 실패

**발생 Sprint:** Sprint 3
**상태:** ✅ RESOLVED

**증상**
```
Type '{ placeholder: string; }' is missing the following properties
from type 'SearchInputProps': value, onChange
```
`SearchInput`을 `value`/`onChange` 필수 props 방식으로 변경했으나
`/src/app/search/page.tsx`의 기존 사용처를 함께 수정하지 않아 빌드 실패.

**원인**
공용 컴포넌트 API 변경 시 전체 사용처를 확인하지 않고 제출.

**해결책**
`value`/`onChange`를 optional로 변경하여 두 가지 모드로 동작:
- **Controlled 모드** (`value` + `onChange` 있음) → 홈 화면, URL 이동 없이 내부 필터링
- **Uncontrolled 모드** (`value`/`onChange` 없음) → `/search` 페이지, Enter 시 `/search?q=` 이동

```tsx
// Controlled (홈)
<SearchInput value={query} onChange={setQuery} />

// Uncontrolled (/search 페이지)
<SearchInput placeholder="아티스트 이름, 도시 검색" />
```

**재발 방지 규칙**
공용 컴포넌트 API 변경 시 반드시 아래 순서를 따른다:
```bash
# 1. 전체 사용처 확인
grep -R "SearchInput" src

# 2. 모든 사용처 함께 수정

# 3. 빌드 통과 확인 후 제출
npm run build
```

---

## [RESOLVED] Home Tag Filter — 태그 클릭 시 /search 페이지로 이동하는 버그

**발생 Sprint:** Sprint 3
**상태:** ✅ RESOLVED

**증상**
홈 화면(`/`)에서 태그 필터 칩(Black, Fine Line 등)을 클릭하면
같은 화면에서 카드가 필터링되지 않고 `/search?tags=...` 로 페이지 이동.
뒤로가기 버튼이 있는 검색 결과 페이지로 이동하고, 결과도 비어 보임.

**원인**
`HomeTagFilter` 내부에서 `router.push(\`/search?tags=\${slug}\`)` 를 호출하고 있었음.
태그 선택 상태를 부모와 공유하지 않고 자체 `active` state만 갖고 있어
URL 이동 외에 피드 필터링 수단이 없었음.

**해결책**
1. `HomeTagFilter`를 `src/components/search/`에서 `src/components/home/`으로 이동
2. `router.push` 완전 제거. `onSelect` / `activeSlug` props 방식으로 변경
3. 태그 선택 상태를 `HomeFeedClient`(클라이언트 컴포넌트) 내부 `useState`로 관리
4. `page.tsx`(서버 컴포넌트)에서 피드 전체 fetch → `HomeFeedClient`에 props 전달
5. 클라이언트에서 선택된 태그 slug로 `items.filter()` 수행 — URL 이동 없음

```
page.tsx (서버) — getFeedSchedules() fetch
  └─ HomeFeedClient (클라이언트) — useState(activeTag)
       ├─ HomeTagFilter — activeSlug + onSelect props
       └─ FeedCard 목록 — filtered items
```

**재발 방지 규칙**
- 홈 태그 필터(`HomeTagFilter`)는 절대 `/search`로 이동시키지 않는다
- 검색창(`SearchInput`) 입력만 `/search?q=`로 이동한다
- `HomeTagFilter`는 반드시 `activeSlug`와 `onSelect` props를 받아서 동작한다
- `HomeTagFilter` 내부에서 `useRouter`, `router.push` 사용 금지

---

## [RESOLVED] Sprint 3-7 — 미사용 파일 정리

**발생 Sprint:** Sprint 3-7 Cleanup & QA
**상태:** ✅ RESOLVED

**증상**
코드베이스에 import되지 않는 파일이 잔존.

**삭제한 파일**
- `src/components/search/CityFilterBar.tsx` — KNOWN_ISSUES에서 Sprint 3부터 삭제 예정이었던 파일
- `src/components/search/SearchFilterBar.tsx` — 동일

**재발 방지 규칙**
```
□ 새 파일 추가 시 PROJECT_STRUCTURE.md 업데이트
□ 파일 제거 시 KNOWN_ISSUES.md에 삭제 이유 기록
□ Sprint 완료 시 미사용 파일 정리
```

---

## [RESOLVED] Import/Export 추측으로 인한 Build 실패

**발생 Sprint:** Sprint 3-1
**상태:** ✅ RESOLVED

**증상**
```ts
import TopBar from "@/components/layout/TopBar"   // ❌ named export임
import { useActionState } from "react"            // ❌ React 18 미지원
```

**실제 export 방식**
```ts
export default function BottomNav()  // → default
export function PageContainer()      // → named
export function TopBar()             // → named
// src/components/ui/* 전체, src/lib/hooks/useSession → named
```

**올바른 React 18 API**
```ts
import { useFormState, useFormStatus } from "react-dom"
```

**재발 방지**
```
□ export/import 방식 추측 금지 — PROJECT_STRUCTURE.md export 레퍼런스 확인
□ React API: package.json react 버전 확인
□ 모르면 파일 업로드 요청
```

---

## [RESOLVED] Supabase .maybeSingle() 반환 타입 never

**발생 Sprint:** Sprint 3-2
**상태:** ✅ RESOLVED

**해결책**
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
const row = data as any as Pick<SomeRow, "field"> | null;
```

---

## [RESOLVED] ESLint dead code — unused parameter

**발생 Sprint:** Sprint 3-3
**상태:** ✅ RESOLVED

**증상:** `'_ids' is defined but never used.`
**해결:** 사용하지 않는 함수 전체 제거.

---

## [RESOLVED] Supabase .insert() never[] — database.types.ts Relationships 누락

**발생 Sprint:** Sprint 3-3 (3회 반복)
**상태:** ✅ RESOLVED
**재발 횟수:** 3회 → 반복 금지 항목으로 격상

**근본 원인**
`@supabase/postgrest-js@2.107.0`의 `GenericTable`은 `Relationships: GenericRelationship[]`를 필수로 요구.
`database.types.ts` 수동 작성 시 누락 → `insert()` 파라미터가 `never[]`로 추론됨.

**해결책**
```ts
// 모든 테이블/뷰에 추가
tableName: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← 필수
};
```

**재발 방지**
```
□ database.types.ts 수동 작성 시 Relationships: [] 필수
□ .insert() never[] → Relationships 누락 먼저 확인
□ SupabaseClient 타입 변경으로는 해결 안 됨
```

---

## [RESOLVED] zip 제출 시 의존 파일 누락으로 타입 오류

**발생 Sprint:** Sprint 3-5
**상태:** ✅ RESOLVED

**증상**
```
Property 'tags' does not exist on type 'StudioArtistProfile'.
```
Sprint 3-4에서 `studio.ts`에 `tags: Tag[]` 추가했으나 Sprint 3-5 zip에 미포함.
→ 프로젝트에 tags 없는 버전 잔존 → 타입 오류.

**재발 방지**
```
□ 수정된 파일에 의존하는 새 코드 작성 시 해당 파일도 zip에 포함
□ sprint N-1에서 수정된 파일을 sprint N에서 참조할 때 특히 주의
```

---

## [RESOLVED] Sprint 3-6 — portfolio.ts as any + img 태그 ESLint 오류

**발생 Sprint:** Sprint 3-6
**상태:** ✅ RESOLVED

**증상**
```
Error: Unexpected any. Specify a different type.
Warning: Using <img>...
```

**해결 1 — DB Row 타입 인덱스 접근**
```ts
// ✅ Relationships: [] 추가 이후 정상 추론됨
const artistId: ArtistProfileRow["id"] = myProfile.id;
const maxSortOrder: PortfolioItemRow["sort_order"] | null = maxOrderData?.sort_order ?? null;
```

**해결 2 — eslint-disable-next-line (기존 프로젝트 패턴)**
```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={item.imageUrl} alt="포트폴리오 이미지" ... />
```

**재발 방지**
```
□ Server Action에서 as any 사용 시 eslint-disable 또는 DB Row 타입 직접 지정
□ <img> 태그: eslint-disable-next-line @next/next/no-img-element 주석 추가
□ ESLint warning도 build error로 처리됨 — 무시 금지
```

---

## [PENDING] City System 미구현 — 자유 텍스트 도시 저장

**발생 시점:** Sprint 4 전 진입 전 발견 (Product Direction Update)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 상태**
```
artist_profiles.base_city   → 자유 텍스트 (string | null)
guest_schedules.city        → 자유 텍스트 (string)
city_follows.city           → 자유 텍스트 (string)
city_pin_summary            → guest_schedules 기반 집계 (Materialized View)
```

**문제**
- "Seoul" / "서울" / "SEOUL" 등 동일 도시가 다른 문자열로 저장 가능
- Analytics 집계 시 도시 중복 계산 발생
- 검색 품질 저하

**해결 계획 (Sprint 4)**
- `cities` 마스터 테이블 생성 (is_approved 플래그 포함)
- 초기 50~100개 주요 Guest Work 도시 seed 등록
- 일정 등록 폼 + 아티스트 프로필에서 도시 dropdown으로 전환
- Migration: `004_cities.sql`

**재발 방지**
```
□ 도시 관련 필드는 반드시 cities 테이블 참조
□ 사용자 임의 도시 입력 필드 추가 금지
□ 도시 추가는 city_requests → 관리자 승인 흐름
```

---

## [PENDING] Demand Signal 이벤트 테이블 없음

**발생 시점:** Product Direction Update
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 수집 중인 Demand Signal**
```
✅ follows          — Follow Demand Signal
✅ city_follows     — Bring This Artist Demand Signal
✅ city_demand_cache — 도시별 팔로우 집계
```

**누락된 Demand Signal (테이블 없음)**
```
❌ Profile View     → demand_events 테이블 필요
❌ Schedule View    → demand_events 테이블 필요
❌ Instagram Click  → demand_events 테이블 필요
❌ City Click       → demand_events 테이블 필요
❌ City Search      → search_logs 테이블 필요
❌ Style Search     → search_logs 테이블 필요
```

**해결 계획 (Sprint 4)**
- `demand_events` 테이블 생성 (Migration: `005_analytics.sql`)
- `search_logs` 테이블 생성
- 비로그인도 수집 (session_id 기반)

**중요**
```
□ Analytics Data Collection = MVP 필수
□ 수집하지 않으면 나중에 복원 불가
□ Dashboard보다 Collection이 먼저
```

---

## [PENDING] analytics_snapshots 없음 — Growth Analytics 불가

**발생 시점:** Product Direction Update
**상태:** ⏳ PENDING — Sprint 5에서 해결 예정

**현재 문제**
시계열 Growth 데이터 집계 테이블이 없어 Growth Analytics 불가.

**해결 계획 (Sprint 5)**
- `analytics_snapshots` 테이블 생성
- pg_cron 월말 자동 집계 등록
- snapshot_type: city_follows | style_search | guest_work_count | ...

---

## [PENDING] mock-preferences.ts — MOCK_BASE_CITY 하드코딩

**발생 시점:** Sprint 3 Pre-Home (Auth 연결 전 임시)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 상태**
```ts
// src/lib/mock-preferences.ts
export const MOCK_BASE_CITY = "Seoul";
export const MOCK_BASE_COUNTRY = "KR";
```
홈 피드와 도시 페이지가 이 임시 상수에 의존함.

**해결 계획 (Sprint 4)**
Auth가 완료된 지금, 세션에서 `users.base_city`를 읽어 교체.
비로그인 시 → 기본 도시 표시 또는 도시 선택 유도.

---

## [PENDING] BottomNav 5탭 → 4탭 변경 필요

**발생 시점:** UX/IA 최종 확정 (Sprint 4 착수 전)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 상태**
```
현재 탭: Search | Following | Map | Notifications | Me (5탭)
최종 확정: Discover | Following | Calendar | 나 (4탭)
```

**변경 내용**
- Map 탭 제거 → Discover 하단 "다른 도시 바로가기"로 통합
- Notifications 탭 제거 → Following 탭 🔔 알림 버튼으로 통합
- Calendar 탭 신규 추가 (단일 URL, Customer/Artist View 분기)
- 나 탭: Customer → /me, Artist → /studio 분기

**영향 파일**
- `src/components/layout/BottomNav.tsx` 수정 필요
- `/app/calendar/page.tsx` 신규 생성 필요

---

## [PENDING] Following 페이지 — 피드형에서 탭형으로 구조 변경

**발생 시점:** UX/IA 최종 확정 (Sprint 4 착수 전)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 상태**
현재 `/following/page.tsx`는 빈 상태 UI만 있음.

**최종 확정 구조**
- [일정] 탭: 팔로우 아티스트의 현재/예정 일정 (진행 중 상단 우선)
- [팔로우] 탭: 아티스트 관리 (프로필 이동 · 언팔로우)
- 🔔 알림 (우상단): 일정 등록/수정 알림만

---

## [PENDING] Artist Profile — 총 Bring 수 제거, 도시별 Bring 수로 변경

**발생 시점:** UX/IA 최종 확정 (Sprint 4 착수 전)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**현재 상태**
Artist Profile 상단 stats에 "Bring 요청" 총계 표시 중.

**최종 확정**
- 상단 총 Bring 수 제거
- 일정 블록 아래에 도시별 Bring 수 표시
  예: Seoul Jun 15–22  D-7  Bring 48
      Tokyo Jul 1–10   D-23 Bring 13

---

## [PENDING] Studio Dashboard — 추천 도시 TOP + CTA 구조 변경

**발생 시점:** UX/IA 최종 확정 (Sprint 4 착수 전)
**상태:** ⏳ PENDING — Sprint 4에서 해결 예정

**최종 확정 구조**
1. [+ Guest Work 등록] CTA — 최상단
2. 추천 도시 TOP (Bring 순위): 1. Seoul Bring 48 / 2. Tokyo Bring 32 ...
3. 도시 카드: Bring 수 · Follow 수 · 관심 고객 수
4. 도시 카드 → Artist Calendar (해당 도시) 연결
- 경쟁도 점수 제거 (Calendar에서 날짜별 🟢🟡🔴로만 표시)

---

## 이슈 템플릿

```md
## [상태] 이슈 제목

**발생 Sprint:**
**상태:** ✅ RESOLVED | 🔄 ACTIVE | ⏳ PENDING
**재발 횟수:** (해당 시)

**증상**

**원인**

**해결책 / 임시 해결책**

**해결 예정:**
```
