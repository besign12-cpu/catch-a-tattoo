# Sprint 5-3 — Bring 실동작 연결

## 변경 요약
Bring 버튼을 실제 DB(city_follows)와 연결. 기존 005_bring_update.sql 정책 그대로 활용.

## 신규 파일
| 파일 | 설명 |
|---|---|
| `src/actions/bring.ts` | toggleBring / getBringStatus / getCityBringCount Server Action |
| `src/components/artist/BringButton.tsx` | Bring 버튼 Client Component (실동작) |

## 수정 파일
| 파일 | 변경 내용 |
|---|---|
| `src/app/artists/[handle]/page.tsx` | BringButton 연결, Bring 수 표시, isLoggedIn 전달 |
| `src/app/city/[citySlug]/page.tsx` | bringCount 실데이터 연결, artistHandle 조회, 경로 수정 |

## Bring 정책 (변경 없음, 기존 DB 정책 활용)
- Bring 도시 = `users.base_city` 자동 적용 (사용자 선택 불가)
- `is_active=true` 기존 Bring 있으면 → 취소 (is_active=false)
- 없으면 → 신규 insert
- 비활성 상태로 재Bring → update (is_active=true)
- 비로그인 → 로그인 페이지 이동
- Base City 없음 → /me/settings 안내
- expire 함수(expire_bring_by_base_city_change 등)와 충돌 없음

## 검증
- Bring 버튼 클릭 → city_follows INSERT
- 재클릭 → is_active=false UPDATE
- Bring 수 Artist Profile 헤더에 표시
- City Page KPI Bring 수 실데이터
- 비로그인 클릭 → /auth/login?next=...
