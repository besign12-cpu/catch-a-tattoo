# Sprint 5-4 — Follow / Unfollow 실동작 연결

## 변경 요약
Follow 버튼을 실제 DB(follows)와 연결. 기존 001_init.sql 정책 그대로 활용.

## Follow 테이블 구조
- 테이블: `follows`
- 컬럼: `follower_id`, `artist_id`, `created_at`
- UNIQUE(follower_id, artist_id) — DB 레벨 중복 방지
- 팔로우 = INSERT / 언팔로우 = DELETE (is_active 없음)
- Follow 수 = COUNT(*) WHERE artist_id = ?

## 신규 파일
| 파일 | 설명 |
|---|---|
| `src/actions/follow.ts` | toggleFollow / getFollowStatus Server Action |
| `src/components/artist/FollowButton.tsx` | Follow 버튼 Client Component (profile/feed 변형) |

## 수정 파일
| 파일 | 변경 내용 |
|---|---|
| `src/app/artists/[handle]/page.tsx` | FollowButton 연결, 팔로워 수 표시 |
| `src/components/artist/FeedCard.tsx` | FollowButton 연결 (feed 변형), isLoggedIn prop 추가 |
| `src/components/home/HomeFeedClient.tsx` | isLoggedIn prop 추가 → FeedCard 전달 |
| `src/app/page.tsx` | 팔로우 상태 실데이터 조회, isLoggedIn 전달 |

## 검증
- Artist Profile 팔로우 → DB INSERT 확인
- 재클릭 → DB DELETE 확인
- FeedCard 팔로우 버튼 동작
- 팔로워 수 프로필 헤더 표시
- 비로그인 클릭 → /auth/login?next=... 이동
