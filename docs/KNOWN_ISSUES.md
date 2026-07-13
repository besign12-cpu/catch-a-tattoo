# KNOWN_ISSUES.md
# Catch A Tattoo — 알려진 이슈 및 해결책

## 규칙
- 이슈 발생 시 즉시 이 파일에 기록
- 해결 후 상태를 RESOLVED로 변경
- 동일 이슈 재발 방지를 위해 해결책 상세 기록

---

## [RESOLVED] Instagram 아이콘 — lucide-react 미지원 (2회 발생)

**상태:** ✅ RESOLVED

```tsx
// ❌ 절대 금지
import { Instagram } from "lucide-react"

// ✅ SVG 직접 인라인
// src/components/ui/InstagramIcon.tsx 참조
```

---

## [RESOLVED] BottomNav hasNotif 타입 오류

**상태:** ✅ RESOLVED — hasNotif 속성 제거, 경로 기반 분기 처리

---

## [RESOLVED] Next.js 14 params async 처리

**상태:** ✅ RESOLVED

```tsx
// ✅ 필수 패턴
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
}
```

---

## [RESOLVED] database.types.ts Relationships 누락 (3회 발생)

**상태:** ✅ RESOLVED

```ts
// 모든 테이블에 필수
tableName: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← 없으면 insert/update 타입이 never[]
};
```

---

## [RESOLVED] getClientLocale SSR 문제 — 번역 항상 EN

**발생:** Sprint 5 Final
**상태:** ✅ RESOLVED

**원인:** `getClientLocale()`이 `document.cookie` 읽기 → SSR 시점 `typeof document === "undefined"` → 항상 "en" 반환

**해결:** `useT.ts`에서 `usePathname()` 기반으로 locale 판단으로 전환
```ts
function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}
```

---

## [RESOLVED] BottomNav locale 없는 버전으로 재교체 (2회 발생)

**발생:** Sprint 5 Final QA (반복)
**상태:** ✅ RESOLVED

**원인:** locale 없는 구버전 BottomNav가 locale-aware 버전 위에 덮어씌워짐.
KO에서 Me 탭 클릭 → /me (prefix 없음) → SettingsLink href="/me/settings" 생성

**해결:** BottomNav에 `withLocale()` 함수 + `localeFromPath()` 복원

**재발 방지:**
```
□ BottomNav 교체 시 locale-aware 여부 반드시 확인
□ withLocale() 함수 존재 여부 확인
□ /ko에서 Me 탭 클릭 → URL /ko/me 인지 즉시 검증
```

---

## [RESOLVED] me/page.tsx 하드코딩 Settings 링크 (2회 발생)

**발생:** Sprint 5 Final
**상태:** ✅ RESOLVED

**원인:** me/page.tsx에 `href="/me/settings"` 하드코딩 2곳이 MeLinks 적용 후에도 잔존하거나 재발

**해결:** me/page.tsx에서 `<SettingsLink />` / `<SettingsIconLink />` Client Component 사용
- `MeLinks.tsx`: usePathname() 기반 → 항상 정확

**재발 방지:**
```
□ me/page.tsx에 href="/me/settings" 문자열이 없어야 함
□ grep 'href.*settings' src/app/me/page.tsx → 결과 없어야 함
```

---

## [RESOLVED] CalendarClientProps 불일치 (3회 발생)

**발생:** Sprint 5 Phase 1 Patch 1~3
**상태:** ✅ RESOLVED

**최종 확정 CalendarClientProps:**
```ts
interface CalendarClientProps {
  role: "customer" | "artist" | "admin" | null;
  cities: CalendarCity[];
  artistHandle?: string | null;
  followingSchedules?: CalendarScheduleItem[];
  initialCitySchedules?: CalendarScheduleItem[];
  initialCustomerCity?: CalendarCity | null;
  initialArtistCity?: CalendarCity | null;
  initialCityData?: CityCalendarData | null;   // ← initialCityStats/Styles 아님
  initialYear?: number;
  initialMonth?: number;
}
```

**재발 방지:**
```
□ page.tsx에서 CalendarClient로 전달하는 props 목록과
  CalendarClientProps를 1:1로 비교 후 수정
□ 추측으로 prop 이름 넣지 말고 실제 page.tsx 확인
```

---

## [ACTIVE] Materialized View 수동 갱신 필요

**상태:** 🔄 ACTIVE (pg_cron 미설정)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.city_pin_summary;
```

**해결 계획:** Sprint 6에서 pg_cron 적용

---

## [ACTIVE] analytics_snapshots 없음 — Growth Analytics 불가

**상태:** 🔄 ACTIVE — Sprint 6에서 해결 예정

---

## 이슈 템플릿

```md
## [상태] 이슈 제목

**발생 Sprint:**
**상태:** ✅ RESOLVED | 🔄 ACTIVE | ⏳ PENDING
**재발 횟수:**

**증상**

**원인**

**해결책**

**재발 방지**
```
