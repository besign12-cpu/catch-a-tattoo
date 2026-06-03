# SPRINT_HISTORY.md
# Catch A Tattoo — Sprint 이력

---

## Sprint 1 — 기반 구축

**목표:** 더미 데이터로 홈 화면과 아티스트 프로필이 동작하는 상태  
**상태:** ✅ 완료  
**배포:** Vercel 정상 확인

### 완료 항목

- [x] Next.js 14 App Router + Tailwind 프로젝트 초기화
- [x] 공통 레이아웃 (BottomNav 5탭, PageContainer, TopBar)
- [x] 홈 피드 화면 (더미 데이터, FeedCard)
- [x] 아티스트 프로필 화면 (더미 데이터)
- [x] 태그 UI (TagChip, TagList, 강조 표시)
- [x] 로딩 상태 (Skeleton 컴포넌트)
- [x] 에러 상태 (ErrorState + 재시도 버튼)
- [x] PWA manifest.json
- [x] 더미 데이터 4명 아티스트
- [x] 핵심 타입 정의 (Tag, ArtistProfile, GuestSchedule, FeedCard)

### 핵심 파일

```
src/app/layout.tsx
src/app/page.tsx
src/app/artists/[handle]/page.tsx
src/components/layout/BottomNav.tsx
src/components/artist/FeedCard.tsx
src/components/schedule/ScheduleBlock.tsx
src/components/ui/{TagChip, Avatar, Skeleton, ErrorState, VerifiedBadge}.tsx
src/data/dummy.ts
src/types/index.ts
src/lib/utils.ts
```

---

## Sprint 2 — Supabase 연결 및 검색

**목표:** 실제 DB 데이터로 교체, 검색·지도·도시 페이지 기초 구현  
**상태:** ✅ 완료  
**배포:** Vercel 빌드 통과 확인

### 완료 항목

- [x] Supabase 클라이언트 3종 (client / server / admin)
- [x] database.types.ts 수동 작성
- [x] 001_init.sql — 전체 DDL (11개 테이블 + RPC 함수 + Materialized View)
- [x] 002_rls.sql — Row Level Security 전체 적용
- [x] 003_seed.sql — 태그 32개 + 샘플 아티스트 4명
- [x] lib/queries/artists.ts — 피드·프로필·검색·지도·태그 쿼리
- [x] 홈 피드 Supabase 연동 (dummy fallback 유지)
- [x] 아티스트 프로필 Supabase 연동 (dummy fallback 유지)
- [x] 검색 페이지 (URL 기반, Filter 드로어)
- [x] 지도 페이지 (도시 핀 목록)
- [x] 도시 페이지 (Guest / Based 섹션)
- [x] SearchFilterBar (태그 필터 드로어)

### 해결한 이슈

- lucide-react Instagram 아이콘 미지원 → SVG 직접 사용
- Next.js 14 params async 처리
- Supabase never 타입 오류 → toTag(), toSchedule() 변환 함수 분리

### 핵심 파일

```
src/lib/supabase/{client, server, admin}.ts
src/lib/queries/artists.ts
src/types/database.types.ts
src/app/search/page.tsx
src/app/map/page.tsx
src/app/city/[citySlug]/page.tsx
src/components/search/SearchFilterBar.tsx
supabase/migrations/{001_init, 002_rls, 003_seed}.sql
```

---

## Sprint 3 — 아티스트 회원가입 · 프로필 관리 (예정)

**목표:** 아티스트가 가입하고 프로필을 만들고 수정할 수 있는 상태  
**상태:** 🔄 진행 예정

### 계획 항목

- [ ] Supabase Auth 회원가입 (이메일 + Google)
- [ ] 로그인 / 로그아웃
- [ ] 이메일 인증 대기 화면
- [ ] 신규 아티스트 프로필 생성
- [ ] 프로필 편집 (displayName, bio, baseCity, 태그)
- [ ] 대표 작품 3장 업로드 (Supabase Storage)
- [ ] 이미지 압축 / 리사이즈 클라이언트 처리
- [ ] middleware.ts 인증 라우트 보호
- [ ] useSession 훅
- [ ] 팔로우 버튼 실제 동작

---

## Sprint 4 — 게스트워크 일정 등록 (예정)

**목표:** 인증된 아티스트가 일정을 올리면 팔로워에게 알림이 가는 상태

### 계획 항목

- [ ] 일정 등록 4단계 스텝 폼
- [ ] 일정 수정 / 삭제
- [ ] 자동 비활성화 (pg_cron)
- [ ] Claim Profile 3단계 흐름
- [ ] FCM / APNs push 알림 연동
- [ ] 알림 센터 화면

---

## Sprint 5 — 팔로우 · 알림 · Analytics (예정)

**목표:** 팔로우가 실제로 작동하고 알림이 오는 완성된 상태

### 계획 항목

- [ ] 팔로우 Edge Function (Optimistic UI)
- [ ] Bring This Artist (도시 지정 팔로우)
- [ ] 알림 센터 실시간 (Supabase Realtime)
- [ ] 수요 임계값 알림
- [ ] 아티스트 Analytics (도시별·국가별 팔로워)

---

## Sprint 6 — 마무리 · 출시 (예정)

**목표:** QA 완료, 성능 최적화, 출시 준비

### 계획 항목

- [ ] Admin 대시보드 (Claim 처리, ID 검색)
- [ ] 설정 화면
- [ ] 모바일 반응형 QA 전체
- [ ] 에러 상태 QA 전체
- [ ] 성능 최적화 (이미지 lazy load, 리스트 가상화)
- [ ] 보안 검토 (RLS 재점검, 토큰 만료)
- [ ] PWA 정식 적용 (next-pwa)
