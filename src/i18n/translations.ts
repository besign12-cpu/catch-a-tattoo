/**
 * translations.ts — Client-safe
 *
 * 이 파일은 Client Component에서 import 가능해야 합니다.
 * next/headers, next/cookies 등 서버 전용 API 절대 금지.
 *
 * - 번역 데이터
 * - buildT(): 순수 함수 (외부 의존 없음)
 * - getClientLocale(): document.cookie 읽기 (브라우저 전용)
 */

import type { Locale } from "./config";

// ── 번역 데이터 ───────────────────────────────────────────────

const translations = {
  en: {
    nav: {
      discover:  "Discover",
      following: "Following",
      calendar:  "Calendar",
      me:        "Me",
    },
    language: { label: "Language", en: "English", ko: "한국어" },
    common: {
      save: "Save", saving: "Saving...", cancel: "Cancel",
      logout: "Logout", settings: "Settings", login: "Login",
      findArtist: "Find Artists",
      back: "Back",
      manage: "Manage",
      moreView: "See more",
      cityView: "See city",
      loading: "Loading...",
      followToBring: "Follow to Bring",
      followFirst: "Follow first",
      setBaseCityToBring: "Set Base City to Bring",
      selectCity: "Select city",
      searchCityOrCountry: "Search city or country",
      currentLabel: "Current / Upcoming",
      demandHigh: "Low (1–4)",
      demandMid: "Medium (5–8)",
      demandLow: "Busy (9+)",
    },
    discover: {
      searchPlaceholder: "Search artists, styles...",
      all: "All", thisWeek: "This Week", filter: "Filter",
      guestArtists: "Upcoming Guest Artists",
      basedArtists: "Based Artists",
      noGuests: "No guest artists matching your search.",
      seeAll: "See all",
      noBased:  "No based artists matching your search.",
    },
    following: {
      title: "Following", scheduleTab: "Schedule", followTab: "Following",
      noSchedule: "No upcoming schedules",
      noScheduleDesc: "Follow artists to see their Guest Work schedules here",
      noFollowing: "Not following anyone yet",
      noFollowingDesc: "Follow artists to see them here",
    },
    calendar: {
      cityExplore: "City Explore", followingSchedule: "Following",
      thisMonthSchedule: "This Month", followingArtistSchedule: "Following Artists",
      noCitySchedule: "No Guest Work in {city} this month",
      noCityScheduleDesc: "Try another city or check next month",
      noFollowSchedule: "No following artist schedules",
      noFollowScheduleDesc: "Follow artists to see their schedules here",
      loginToView: "Login to see schedules",
      loginDesc: "Follow artists and see their Guest Work schedules here",
      addScheduleForDate: "Add schedule for this date",
      noInsight: "No demand data for this city yet",
      noInsightDesc: "Register Guest Work to see demand data",
      demandHigh: "Low (1–4)",
      demandMid: "Medium (5–8)",
      demandLow: "Busy (9+)",
      dateInsight: "{month}/{day} Insight",
      guestCountLabel: "Guest {label}",
    },
    me: {
      myInfo: "My Info", email: "Email", username: "Username",
      myArtistProfile: "@{handle} Profile",
      artistProfileDesc: "Guest Work · Edit Profile",
      role: { customer: "Member", artist: "Artist", admin: "Admin" },
    },
    settings: {
      title: "Settings",
      baseCityNotSet: "Not Set", baseCityCurrent: "Current",
      baseCityLocked: "Change Restricted",
      baseCityLockedDesc: "Base City can only be changed once every 30 days. Available in {days} days.",
      baseCityBringWarning: "Changing Base City will end all your active Bring demands.",
      baseCitySuccess: "Base City changed to {city}.",
      baseCityChange: "Change City", baseCitySave: "Change to {city}",
      searchCity: "Search city", noCity: "No results found",
      interestGenres: "Interest Genres", interestSaved: "Saved.",
      interestSave: "Save Interests", interestCount: "{count}/6",
      notifications: "Notifications",
      notifSchedule: "Schedule Alerts",
      notifScheduleDesc: "When followed artists add or update schedules",
      notifBring: "Bring Alerts",
      notifBringDesc: "When your Bring demand reaches a threshold",
      notifComingSoon: "Push notifications coming soon. Settings will be saved.",
      notifSave: "Save Notification Settings", notifSaved: "Notification settings saved.",
      language: "Language", color: "Color", mainStyle: "Main Style", subStyle: "Sub Style",
    },
    city: {
      guests: "Guest Artists",
      based: "Based Artists",
      popularStyles: "Popular Styles",
      bringDemand: "Bring Demand",
      activeDemand: "Active Demand",
      currentAndUpcoming: "Current / Upcoming",
      basedArtists: "Based Artists",
      noGuests: "No guest artists currently",
      noBased: "No based artists",
      insightBanner: "Artist Insight in {city}",
      bringCount: "Bring {count}",
      addSchedule: "+ Add Schedule",
    },
    artist: {
      following: "Following", follow: "Follow", bringing: "Bringing", bring: "Bring",
      followers: "Followers",
      noSchedule: "No Guest Work schedule", addFirstSchedule: "Add first Guest Work",
      editProfile: "Edit Profile", schedule: "Schedule", insights: "Insights", profile: "Profile",
      insightComingSoon: "Insights Coming Soon",
      insightDesc: "City Bring counts, Profile Views and more will be available in the next update.",
      backToProfile: "Back to profile",
      unverifiedProfile: "Is this your profile?",
      unverifiedDesc: "Verify with Instagram DM",
      available: "Available",
      fullyBooked: "Fully Booked",
      verifyProfile: "Verify Profile",
      manage: "Manage",
      moreView: "See more",
      addGuestWork: "+ Guest Work",
    },
  },

  ko: {
    nav: {
      discover:  "Discover",
      following: "팔로우",
      calendar:  "캘린더",
      me:        "나",
    },
    language: { label: "언어", en: "English", ko: "한국어" },
    common: {
      save: "저장", saving: "저장 중...", cancel: "취소",
      logout: "로그아웃", settings: "설정", login: "로그인",
      findArtist: "아티스트 찾기",
      back: "뒤로",
      manage: "관리",
      moreView: "더 보기",
      cityView: "도시 보기",
      loading: "로딩 중...",
      followToBring: "팔로우 후 Bring 가능",
      followFirst: "먼저 팔로우해주세요",
      setBaseCityToBring: "Base City 설정 후 Bring 가능",
      selectCity: "도시 선택",
      searchCityOrCountry: "도시 또는 국가 검색",
      currentLabel: "현재·예정",
      demandHigh: "여유 (1–4)",
      demandMid: "보통 (5–8)",
      demandLow: "혼잡 (9+)",
    },
    discover: {
      searchPlaceholder: "아티스트, 스타일 검색...",
      all: "전체", thisWeek: "이번 주", filter: "필터",
      guestArtists: "게스트 아티스트",
      basedArtists: "Based 아티스트",
      noGuests: "검색 조건에 맞는 게스트 아티스트가 없습니다.",
      seeAll: "더보기",
      noBased:  "검색 조건에 맞는 아티스트가 없습니다.",
    },
    following: {
      title: "팔로우", scheduleTab: "일정", followTab: "팔로우",
      noSchedule: "예정된 일정이 없습니다",
      noScheduleDesc: "아티스트를 팔로우하면 Guest Work 일정을 여기서 확인할 수 있습니다",
      noFollowing: "팔로우한 아티스트가 없습니다",
      noFollowingDesc: "아티스트를 팔로우하면 여기에 표시됩니다",
    },
    calendar: {
      cityExplore: "도시 탐색", followingSchedule: "팔로우 일정",
      thisMonthSchedule: "이번 달 일정", followingArtistSchedule: "팔로우 아티스트 일정",
      noCitySchedule: "{city}에 이번 달 Guest Work가 없습니다",
      noCityScheduleDesc: "다른 도시를 선택하거나 다음 달을 확인해보세요",
      noFollowSchedule: "팔로우한 아티스트 일정이 없습니다",
      noFollowScheduleDesc: "아티스트를 팔로우하면 여기서 일정을 확인할 수 있습니다",
      loginToView: "로그인하면 일정을 볼 수 있습니다",
      loginDesc: "팔로우한 아티스트의 게스트워크 일정을 달력에서 확인해보세요",
      addScheduleForDate: "이 날짜로 일정 등록",
      noInsight: "이 도시의 수요 데이터가 아직 없습니다",
      noInsightDesc: "Guest Work를 등록하면 수요를 확인할 수 있습니다",
      demandHigh: "여유 (1–4)",
      demandMid: "보통 (5–8)",
      demandLow: "혼잡 (9+)",
      dateInsight: "{month}월 {day}일 인사이트",
      guestCountLabel: "Guest {label}명",
    },
    me: {
      myInfo: "내 정보", email: "이메일", username: "사용자명",
      myArtistProfile: "@{handle} 프로필",
      artistProfileDesc: "Guest Work 관리 · 프로필 수정",
      role: { customer: "일반 회원", artist: "아티스트", admin: "관리자" },
    },
    settings: {
      title: "설정",
      baseCityNotSet: "미설정", baseCityCurrent: "현재",
      baseCityLocked: "변경 제한 중",
      baseCityLockedDesc: "Base City는 30일에 한 번만 변경할 수 있습니다. {days}일 후 변경 가능합니다.",
      baseCityBringWarning: "Base City를 변경하면 기존 Bring This Artist 수요가 모두 종료됩니다.",
      baseCitySuccess: "Base City가 {city}으로 변경되었습니다.",
      baseCityChange: "도시 변경", baseCitySave: "{city}으로 변경",
      searchCity: "도시 검색", noCity: "검색 결과가 없습니다",
      interestGenres: "관심 장르", interestSaved: "저장되었습니다.",
      interestSave: "관심 장르 저장", interestCount: "{count}/6",
      notifications: "알림 설정",
      notifSchedule: "일정 알림",
      notifScheduleDesc: "팔로우 아티스트 일정 등록/수정",
      notifBring: "Bring 알림",
      notifBringDesc: "내 Bring 수요 임계값 도달",
      notifComingSoon: "알림 발송은 추후 지원 예정입니다. 설정만 저장됩니다.",
      notifSave: "알림 설정 저장", notifSaved: "알림 설정이 저장되었습니다.",
      language: "언어", color: "Color", mainStyle: "메인 스타일", subStyle: "세부 스타일",
    },
    city: {
      guests: "게스트 아티스트",
      based: "Based 아티스트",
      popularStyles: "인기 스타일",
      bringDemand: "Bring 수요",
      activeDemand: "활성 수요",
      currentAndUpcoming: "현재·예정",
      basedArtists: "베이스 아티스트",
      noGuests: "현재 게스트 아티스트가 없습니다",
      noBased: "Based 아티스트가 없습니다",
      insightBanner: "{city} 아티스트 인사이트",
      bringCount: "Bring {count}건",
      addSchedule: "+ 일정 등록",
    },
    artist: {
      following: "팔로잉", follow: "팔로우", bringing: "Bringing", bring: "Bring",
      followers: "팔로워",
      noSchedule: "등록된 Guest Work 일정이 없습니다", addFirstSchedule: "첫 Guest Work 등록하기",
      editProfile: "프로필 수정", schedule: "일정", insights: "인사이트", profile: "프로필",
      insightComingSoon: "인사이트 준비 중",
      insightDesc: "도시별 Bring 수, Profile View 등 아티스트 인사이트는 다음 업데이트에서 제공됩니다.",
      backToProfile: "프로필로 돌아가기",
      unverifiedProfile: "이 프로필은 나인가요?",
      unverifiedDesc: "Instagram DM 인증으로 본인 프로필을 확인하세요.",
      available: "예약 가능",
      fullyBooked: "마감",
      verifyProfile: "Verify Profile",
      manage: "관리",
      moreView: "더 보기",
      addGuestWork: "+ Guest Work 등록",
    },
  },
} as const;

// ── 타입 ──────────────────────────────────────────────────────

type Translations = typeof translations.en;
type Namespace = keyof Translations;

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

// ── buildT — 순수 함수 (Client/Server 모두 사용 가능) ─────────

export function buildT(locale: Locale, ns: Namespace): TFunction {
  const dict = (translations[locale] ?? translations.en)[ns] as Record<string, unknown>;

  return function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split(".");
    let val: unknown = dict;
    for (const part of parts) {
      val = val && typeof val === "object"
        ? (val as Record<string, unknown>)[part]
        : undefined;
    }
    let str = typeof val === "string" ? val : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  };
}

// ── getClientLocale — 브라우저 전용 (SSR에서는 "en" 반환) ─────

export function getClientLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  const v = m?.[1];
  return v === "ko" ? "ko" : "en";
}
