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
