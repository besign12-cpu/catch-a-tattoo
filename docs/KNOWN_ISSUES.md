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

**해결책 — SVG 직접 인라인**
```tsx
function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  );
}
```

---

## [RESOLVED] BottomNav hasNotif 타입 오류 (2회 발생)

**발생 Sprint:** Sprint 2, Sprint 3 (재발)
**상태:** ✅ RESOLVED

**해결책:** `hasNotif` 속성 제거, 알림 점은 경로 분기로 처리.

---

## [RESOLVED] Next.js 14 params async 처리

**발생 Sprint:** Sprint 2
**상태:** ✅ RESOLVED

```tsx
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
}
```

---

## [RESOLVED] Supabase .insert() never[] — database.types.ts Relationships 누락

**발생 Sprint:** Sprint 3-3 (3회 반복)
**상태:** ✅ RESOLVED

```ts
tableName: {
  Row: { ... };
  Insert: { ... };
  Update: { ... };
  Relationships: [];  // ← 필수
};
```

---

## [RESOLVED] Import/Export 추측으로 인한 Build 실패

**발생 Sprint:** Sprint 3-1
**상태:** ✅ RESOLVED

```ts
// ❌ 금지
import TopBar from "..." // named export임
import { useActionState } from "react" // React 18 미지원

// ✅ 올바른 방식
import { TopBar } from "..."
import { useFormState, useFormStatus } from "react-dom"
```

---

## [RESOLVED] zip 제출 시 의존 파일 누락으로 타입 오류

**발생 Sprint:** Sprint 3-5
**상태:** ✅ RESOLVED

수정된 파일에 의존하는 새 코드 작성 시 해당 파일도 zip에 포함.

---

## [RESOLVED] Server Component에서 onClick 이벤트 핸들러

**발생 Sprint:** Sprint 4-7
**상태:** ✅ RESOLVED

**증상:** `Event handlers cannot be passed to Client Component props.`

**해결책:**
```tsx
// ❌ Server Component에서 금지
<button onClick={() => {}}>Bring</button>

// ✅ 비활성 UI로 처리 (Sprint 5에서 Client Component 분리)
<div role="button" aria-disabled="true" className="cursor-default">
  Bring
</div>
```

---

## [RESOLVED] isScheduleActive 반환값 오타

**발생 Sprint:** Sprint 4 QA
**상태:** ✅ RESOLVED

**증상:** `status === "past"` — 빌드 에러

**올바른 반환 타입:**
```ts
"active" | "upcoming" | "ended"  // "past" 아님
```

---

## [RESOLVED] CityDropdown 중복 렌더 (ArtistCalendar)

**발생 Sprint:** Sprint 4 QA
**상태:** ✅ RESOLVED

**증상:** Artist Calendar에 도시 선택 UI 2개 표시

**원인:** CustomerCalendar용 CityDropdown 삽입 코드가 ArtistCalendar 내부에도 잘못 삽입됨

**해결책:** 컴포넌트별 `<CityDropdown` 개수 확인
```bash
awk 'NR>=시작 && NR<=끝' CalendarClient.tsx | grep -c "<CityDropdown"
# 각 컴포넌트별 1개여야 함
```

---

## [RESOLVED] mock-preferences.ts — MOCK_BASE_CITY 하드코딩

**발생 시점:** Sprint 3 Pre-Home
**상태:** ✅ RESOLVED — Sprint 4-10에서 해결

**해결:**
- `MOCK_BASE_CITY` / `MOCK_BASE_COUNTRY` 제거
- `DEFAULT_BASE_CITY = "Seoul"` / `DEFAULT_BASE_COUNTRY = "KR"` 로 교체 (비로그인 fallback용)
- `page.tsx` (홈): 로그인 유저 `users.base_city` 직접 조회

---

## [RESOLVED] BottomNav 5탭 → 4탭 변경

**발생 시점:** UX/IA 최종 확정
**상태:** ✅ RESOLVED — Sprint 4-2에서 해결

---

## [RESOLVED] Following 페이지 탭형 구조

**발생 시점:** UX/IA 최종 확정
**상태:** ✅ RESOLVED — Sprint 4-4에서 구조 구현 (실데이터는 Sprint 5)

---

## [RESOLVED] Artist Profile — Bring 구조 개선

**발생 시점:** UX/IA 확정
**상태:** ✅ RESOLVED — Sprint 4-7 + QA에서 해결

**최종 구현:**
- Bring 버튼: 일정 카드 제거 → 프로필 헤더 CTA 행 ([팔로우] [Bring] [Instagram])
- 일정 카드: 예약 상태 표시 (Available / Fully booked) — ScheduleBlock 내부 오른쪽 예약 문의 하단
- 도시별 Bring 수: Sprint 5 실데이터 연결 예정

---

## [RESOLVED] Studio Dashboard CTA + 추천 도시 구조

**발생 시점:** UX/IA 확정
**상태:** ✅ RESOLVED — Sprint 4-5에서 해결

---

## [RESOLVED] City System 미구현 — 자유 텍스트 도시 저장

**발생 시점:** Sprint 4 전 진입 전
**상태:** ✅ RESOLVED — Sprint 4에서 해결

**구현 완료:**
- cities 테이블 생성 (004_cities.sql, 60개 도시 seed)
- 아티스트 프로필 Base City → CityDropdown 전환
- 일정 등록 Step 1 → CityDropdown 전환
- 자유 텍스트 입력 완전 제거

---

## [ACTIVE] Materialized View 수동 갱신 필요

**발생 Sprint:** Sprint 2
**상태:** 🔄 ACTIVE (pg_cron 미설정)

**임시 해결책:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.city_pin_summary;
```

**영구 해결책 (Sprint 5 또는 6)**
pg_cron 활성화 후 hourly 스케줄 등록.

---

## [ACTIVE] 포트폴리오 이미지 미표시

**발생 Sprint:** Sprint 1~4
**상태:** 🔄 ACTIVE

Supabase Storage 미연동. placeholder(회색 박스) 표시 중.
Sprint 5에서 실제 업로드 연결 예정.

---

## [PENDING] Studio 제거 — Sprint 5 첫 작업

**발생 시점:** Sprint 4 완료 후 IA 확정
**상태:** ⏳ PENDING — Sprint 5 첫 작업

**변경 내용:**
```
❌ /studio                   → redirect /artists/:handle
❌ /studio/profile/edit      → /artists/:handle/edit
❌ /studio/schedule/new      → /artists/:handle/schedule/new
❌ /studio/schedule/:id      → /artists/:handle/schedule/:id
❌ /studio/portfolio         → /artists/:handle/portfolio
```

**/artists/:handle 탭 구조:**
- [프로필] 탭 — 공개 뷰 + 본인: [수정] 버튼
- [일정] 탭 — Guest Work 목록 + 본인: [+ 등록] [수정/삭제]
- [인사이트] 탭 — Sprint 6, 본인만 표시

**영향 파일:**
- `src/app/studio/**` (전체 이동/제거)
- `src/app/artists/[handle]/page.tsx` (탭 구조 + 관리 UI)
- `src/app/me/page.tsx` (Studio CTA → 아티스트 프로필 카드)
- `src/actions/artist.ts`, `src/actions/schedule.ts` (redirect 경로)
- `middleware.ts` (보호 경로 업데이트)

---

## [PENDING] next-intl 도입 — Sprint 5 초반

**발생 시점:** Sprint 4 완료 후 i18n 구조 확정
**상태:** ⏳ PENDING — Sprint 5 초반

**확정 구조:**
```
/ = English (기본)
/ko = Korean
라이브러리: next-intl
```

**번역 제외 고유 개념어:**
CAT, Guest Work, Bring, Bring This Artist, Follow, Based City, Artist Profile, Discovery, Demand Signal

**적용 순서:**
1. next-intl 설정 (middleware, layout, i18n.ts, messages/)
2. Discover, Artist Profile, City Page (1순위)
3. Following, Calendar, Me (2순위)
4. Auth, Settings (3순위)
5. Admin → 한국어만 유지

**Language 버튼 위치:**
- Discover TopBar 우상단 (비로그인 접근 가능)
- /me/settings Language 섹션

---

## [PENDING] Following 실데이터 연결

**발생 시점:** Sprint 4-4 (구조만 구현)
**상태:** ⏳ PENDING — Sprint 5

현재 빈 배열 전달. Sprint 5에서 follows/guest_schedules 쿼리 연결.

---

## [PENDING] Bring This Artist 실동작

**발생 시점:** Sprint 4-7 (비활성 UI)
**상태:** ⏳ PENDING — Sprint 5

현재 `<div aria-disabled="true">` 비활성 UI. Sprint 5에서 useBring 훅 + city_follows insert.

---

## [PENDING] Analytics 수집 시작

**발생 시점:** Sprint 4 (테이블만 생성)
**상태:** ⏳ PENDING — Sprint 5

demand_events, search_logs 테이블은 생성됨. 실제 수집 로직 미구현.
Sprint 5에서 `lib/analytics/collect.ts` 신규 + Profile View, Instagram Click 수집.

---

## [PENDING] analytics_snapshots — Growth Analytics

**발생 시점:** Sprint 4 (테이블만 생성)
**상태:** ⏳ PENDING — Sprint 6

테이블 구조만 생성됨. pg_cron 월별 집계는 Sprint 6.

---

## [PENDING] 관심장르 실저장

**발생 시점:** Sprint 4-10 (UI만 구현)
**상태:** ⏳ PENDING — Sprint 5

현재 updateInterestTags는 UI 흐름만. user_interests 테이블 생성 후 실저장 구현.

---

## [PENDING] 알림 설정 실연결

**발생 시점:** Sprint 4-10 (토글 UI만)
**상태:** ⏳ PENDING — Sprint 5

현재 일정 알림 / Bring 알림 토글은 UI만. 실저장/푸시 알림은 Sprint 5.

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
