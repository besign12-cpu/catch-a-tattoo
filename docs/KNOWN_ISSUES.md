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

## [ACTIVE] CityFilterBar.tsx 미사용 파일 잔존

**발생 Sprint:** Sprint 3
**상태:** 🔄 ACTIVE (빌드 영향 없음, 정리 필요)

**증상**
`src/components/search/CityFilterBar.tsx`와
`src/components/search/SearchFilterBar.tsx`가
어디서도 import되지 않는 상태로 남아 있음.

**영향**
빌드 오류 없음. 단, 코드베이스 혼란 가능성.

**해결 예정**
Sprint 3 마무리 시 두 파일 삭제.

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

## [RESOLVED] Import/Export 추측으로 인한 Build 실패

**발생 Sprint:** Sprint 3-1
**상태:** ✅ RESOLVED

**증상**
```ts
import TopBar from "@/components/layout/TopBar"   // ❌ named export
import { useActionState } from "react"            // ❌ React 18 미지원
```
**해결:** named import 사용, `useFormState` / `useFormStatus` from `react-dom`

**재발 방지**
```
□ export 방식 추측 금지 — 실제 파일 확인
□ React API: package.json react 버전 확인
□ 모르면 파일 업로드 먼저 요청
```

---

## [RESOLVED] Supabase .maybeSingle() 반환 타입 never

**발생 Sprint:** Sprint 3-2
**상태:** ✅ RESOLVED

**증상:** `Property 'x' does not exist on type 'never'.`

**해결:**
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
const row = data as any as Pick<SomeRow, "field"> | null;
```

---

## [RESOLVED] ESLint dead code — unused parameter

**발생 Sprint:** Sprint 3-3
**상태:** ✅ RESOLVED

**증상:**
```
'_ids' is defined but never used.
```
사용하지 않는 `handleTagChange(_ids: string[]) {}` 함수가 빌드 실패 유발.

**해결:** 함수 전체 제거.

**재발 방지**
```
□ 제출 전 사용하지 않는 함수/변수/파라미터 전수 확인
□ npm run build 는 ESLint까지 검사 — dev 서버와 다름
```

---

## [RESOLVED] Supabase .insert() 파라미터 never[] — database.types.ts Relationships 누락

**발생 Sprint:** Sprint 3-3 (3회 반복)
**상태:** ✅ RESOLVED
**재발 횟수:** 3회 → 반복 금지 항목으로 격상

**증상**
```
Object literal may only specify known properties,
and 'user_id' does not exist in type 'never[]'.

Argument of type 'ArtistProfileInsert' is not assignable
to parameter of type 'never[]'.
```
`.from("artist_profiles").insert(...)` 에서 모든 insert 파라미터가 `never[]`.

**근본 원인 (타입 정의 파일 직접 분석으로 확인)**

`@supabase/postgrest-js@2.107.0`의 `GenericTable` 타입 정의:
```ts
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];  // ← 필수 필드
};
```

`SupabaseClient<Database>`의 `Schema` 타입 파라미터:
```ts
Schema extends (Omit<Database, '__InternalSupabase'>[SchemaName]
  extends GenericSchema ? ... : never)
```

`database.types.ts`가 수동 작성이라 모든 테이블에 `Relationships` 필드가 없었음.
→ 각 테이블이 `GenericTable`을 만족하지 못함
→ `Database['public']`이 `GenericSchema`를 만족하지 못함
→ `Schema = never`
→ `.from().insert()` 파라미터 타입이 `never[]`

이전에 시도한 방법들이 실패한 이유:
- `SupabaseClient<Database>` 명시 → 무관. Schema 추론 실패가 원인
- Insert 타입 어노테이션 → 무관. insert() 파라미터 자체가 never[]

**해결책 — database.types.ts의 모든 테이블/뷰에 `Relationships: []` 추가**
```ts
// 모든 테이블 블록에 추가
artist_profiles: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← 이 줄 추가
};

// 뷰도 동일
city_pin_summary: {
  Row: { ... };
  Relationships: [];  // ← 이 줄 추가
};
```

**재발 방지 규칙**
```
□ Supabase CLI로 타입 재생성 시 Relationships 필드가 포함되는지 확인
□ database.types.ts 수동 작성 시 모든 테이블/뷰에 Relationships: [] 필수
□ .insert() / .update() / .upsert() never[] 오류 발생 시:
   1. database.types.ts에 Relationships 누락 여부 먼저 확인
   2. node_modules의 GenericTable 타입 정의 확인
   3. SupabaseClient 타입 수정으로 해결 시도 금지 (원인 아님)
□ 이 오류는 SupabaseClient 타입 변경으로 해결되지 않음
```

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
