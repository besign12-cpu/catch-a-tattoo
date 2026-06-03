# KNOWN_ISSUES.md
# Catch A Tattoo — 알려진 이슈 및 해결책

## 규칙
- 이슈 발생 시 즉시 이 파일에 기록
- 해결 후 상태를 RESOLVED로 변경
- 동일 이슈 재발 방지를 위해 해결책 상세 기록

---

## [RESOLVED] Instagram 아이콘 — lucide-react 미지원

**발생 Sprint:** Sprint 2  
**상태:** ✅ RESOLVED

**증상**
```
Module not found: Can't resolve 'Instagram' from 'lucide-react'
```

**원인**  
lucide-react 최신 버전에서 `Instagram` 아이콘이 제거됨.

**해결책**  
SVG 직접 인라인 사용 또는 `BrandInstagram` 사용.

```tsx
// 금지
import { Instagram } from "lucide-react"

// 허용 — SVG 인라인
function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/>
    </svg>
  );
}
```

---

## [RESOLVED] Next.js 14 params async 처리

**발생 Sprint:** Sprint 2  
**상태:** ✅ RESOLVED

**증상**  
`params.handle` 직접 접근 시 TypeScript 경고 또는 런타임 오류.

**원인**  
Next.js 14에서 `params`가 Promise로 변경됨.

**해결책**
```tsx
// 금지
export default function Page({ params }: { params: { handle: string } }) {
  const { handle } = params; // 오류 가능
}

// 허용
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
}
```

---

## [RESOLVED] searchParams 미사용 선언

**발생 Sprint:** Sprint 2  
**상태:** ✅ RESOLVED

**증상**  
`searchParams`를 props에 선언했지만 사용하지 않으면 빌드 경고 또는 타입 오류.

**해결책**  
사용하지 않는 searchParams는 props에서 아예 제거.

---

## [RESOLVED] Supabase 타입 불일치 — never 오류

**발생 Sprint:** Sprint 2  
**상태:** ✅ RESOLVED

**증상**
```
Type 'never' has no properties in common with type 'ArtistProfile'
```

**원인**  
`database.types.ts` Row 타입과 실제 쿼리 반환 타입 불일치.

**해결책**  
쿼리 결과에 명시적 타입 단언 대신, 중간 변환 함수(toTag, toSchedule) 사용. 타입을 변환 함수 안에서만 단언.

```ts
// 금지
const result = data as ArtistProfile[];

// 허용
function toTag(raw: { ... }): Tag { ... }
function toSchedule(raw: { ... }): GuestSchedule { ... }
```

---

## [RESOLVED] Next.js Image alt 필수

**발생 Sprint:** Sprint 2  
**상태:** ✅ RESOLVED

**증상**  
빌드 시 `alt` 없는 `<Image>` 사용으로 lint 오류.

**해결책**  
모든 `<img>`, `<Image>` 태그에 의미 있는 `alt` 필수.  
장식용 이미지는 `alt=""` 명시.

---

## [ACTIVE] Materialized View 수동 갱신 필요

**발생 Sprint:** Sprint 2  
**상태:** 🔄 ACTIVE (pg_cron 미설정 상태)

**증상**  
`city_pin_summary` 뷰가 실시간 반영 안 됨.

**원인**  
pg_cron이 아직 설정되지 않아 수동으로 REFRESH 필요.

**임시 해결책**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.city_pin_summary;
```

**영구 해결책 (Sprint 4)**  
Supabase 대시보드 → Database → Extensions → pg_cron 활성화 후 스케줄 등록.

---

## [ACTIVE] 포트폴리오 이미지 미표시

**발생 Sprint:** Sprint 1~2  
**상태:** 🔄 ACTIVE (Sprint 3에서 해결 예정)

**증상**  
아티스트 프로필의 대표 작품 3장이 비어 있음 (placeholder 표시).

**원인**  
Supabase Storage 미연동, 업로드 UI 미구현.

**해결 예정:** Sprint 3

---

## 이슈 템플릿

```md
## [상태] 이슈 제목

**발생 Sprint:**
**상태:** ✅ RESOLVED | 🔄 ACTIVE | ⏳ PENDING

**증상**

**원인**

**해결책 / 임시 해결책**

**해결 예정:**
```
