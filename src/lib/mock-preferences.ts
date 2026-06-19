/**
 * mock-preferences.ts
 * Sprint 4: MOCK_BASE_CITY / MOCK_BASE_COUNTRY 상수 제거 완료.
 * 유틸 함수(toCitySlug / fromCitySlug)는 city URL 처리에 계속 사용.
 *
 * 홈 피드 Base City는 서버에서 users.base_city 직접 조회.
 * 비로그인 시 DEFAULT_BASE_CITY fallback 사용.
 */

/** 비로그인 또는 Base City 미설정 시 홈 피드 기본 도시 */
export const DEFAULT_BASE_CITY    = "Seoul";
export const DEFAULT_BASE_COUNTRY = "KR";

/**
 * 도시명 + 국가코드 → citySlug 변환
 * 예: "Seoul", "KR" → "seoul-kr"
 * 예: "New York", "US" → "new-york-us"
 */
export function toCitySlug(city: string, country: string): string {
  return `${city.toLowerCase().replace(/\s+/g, "-")}-${country.toLowerCase()}`;
}

/**
 * citySlug → { city, country } 역변환
 * 예: "seoul-kr" → { city: "Seoul", country: "KR" }
 * 예: "new-york-us" → { city: "New York", country: "US" }
 * (2자리 국가코드 기준)
 */
export function fromCitySlug(slug: string): { city: string; country: string } {
  const parts = slug.split("-");
  const country = parts[parts.length - 1].toUpperCase();
  const city = parts
    .slice(0, parts.length - 1)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return { city, country };
}
