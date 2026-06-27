/**
 * useAnalytics
 *
 * Client Component에서 analytics 이벤트를 fire-and-forget으로 전송.
 * POST /api/analytics → 서버 재렌더 없음, UX 영향 없음.
 */

function track(body: Record<string, unknown>): void {
  // fire-and-forget
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {/* 수집 실패 무시 */});
}

export function useAnalytics() {
  return {
    /** Instagram 링크 클릭 */
    trackInstagramClick(artistId: string) {
      track({ type: "demand", eventType: "instagram_click", artistId });
    },

    /** Guest Work 일정 클릭 */
    trackScheduleView(artistId: string, cityName?: string) {
      track({ type: "demand", eventType: "schedule_view", artistId, cityName });
    },

    /** Calendar 도시 변경 */
    trackCityClick(cityName: string) {
      track({ type: "demand", eventType: "city_click", cityName });
    },

    /** 아티스트/텍스트 검색 */
    trackArtistSearch(query: string, resultCount: number) {
      track({ type: "search", queryType: "artist", query, resultCount });
    },

    /** 스타일 필터 적용 */
    trackStyleSearch(tags: string[], resultCount: number) {
      track({ type: "search", queryType: "style", tags, resultCount });
    },

    /** 도시 검색 (CityDropdown 입력) */
    trackCitySearch(query: string, resultCount: number) {
      track({ type: "search", queryType: "city", query, resultCount });
    },

    /** 복합 검색 (텍스트 + 태그 동시) */
    trackCombinedSearch(query: string, tags: string[], resultCount: number) {
      track({ type: "search", queryType: "combined", query, tags, resultCount });
    },
  };
}
