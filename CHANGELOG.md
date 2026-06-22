# Sprint 5-2 — next-intl 구조 도입

## 변경 요약
next-intl 설치 및 기본 구조 준비. 전체 번역은 Sprint 5-9에서 진행.

## 신규 파일
| 파일 | 설명 |
|---|---|
| `messages/en.json` | 영어 메시지 (기본 언어) |
| `messages/ko.json` | 한국어 메시지 |
| `src/i18n/config.ts` | locale 설정 (en/ko, 번역 제외 개념어 명시) |
| `src/i18n/request.ts` | next-intl 서버 설정 (쿠키 → Accept-Language → 기본값) |
| `src/components/layout/LanguageSwitcher.tsx` | Language 전환 컴포넌트 (topbar / settings 변형) |

## 수정 파일
| 파일 | 변경 내용 |
|---|---|
| `middleware.ts` | /ko prefix 경로 인식 추가 (stripLocalePrefix) |
| `next.config.mjs` | next-intl 플러그인 등록 |
| `package.json` | next-intl ^3.26.0 의존성 추가 |
| `src/components/home/HomeFeedClient.tsx` | Language 버튼 (Discover 우상단) 추가 |

## Locale 전환 방식
- **쿠키 기반** (`CAT_LOCALE`): URL prefix 방식 미사용
- `/` = English (기본), `/ko` = Korean 구조는 Sprint 5-9에서 URL prefix 방식으로 전환 검토
- Language 버튼 → 쿠키 저장 → 페이지 새로고침 → 서버에서 locale 적용

## 번역 제외 고유 개념어
`Guest Work` / `Bring` / `Bring This Artist` / `Follow` / `Based City` /
`Artist Profile` / `Discovery` / `Demand Signal` / `CAT`

## 적용 명령
```bash
npm install          # next-intl 설치
npm run build        # 빌드 확인
```
