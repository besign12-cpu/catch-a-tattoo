/**
 * MOCK USER PREFERENCES
 * Sprint 3 Auth 구현 전 임시 상수.
 * 실제 users 테이블 연결 후 이 파일은 제거하고
 * src/lib/hooks/useSession.ts 또는 서버에서 세션 기반으로 교체할 것.
 */

export const MOCK_BASE_CITY = "Seoul";
export const MOCK_BASE_COUNTRY = "KR";

/**
 * 도시명 + 국가코드 → citySlug 변환
 * 예: "Seoul", "KR" → "seoul-kr"
 */
export function toCitySlug(city: string, country: string): string {
  return `${city.toLowerCase().replace(/\s+/g, "-")}-${country.toLowerCase()}`;
}

/**
 * citySlug → { city, country } 역변환
 * 예: "seoul-kr" → { city: "Seoul", country: "KR" }
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
