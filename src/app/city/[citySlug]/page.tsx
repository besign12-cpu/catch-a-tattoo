import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Plus, TrendingUp } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { ErrorState } from "@/components/ui/ErrorState";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { DUMMY_ARTISTS } from "@/data/dummy";
import { getLocaleServer } from "@/lib/locale.server";
import { fromCitySlug } from "@/lib/mock-preferences";
import { formatDateRange, calcDDay } from "@/lib/utils";
import type { GuestSchedule, Tag } from "@/types";

export const metadata: Metadata = { title: "도시" };

type TabType = "guest" | "based";

interface CityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

// ── 국가 코드 → 국가명 ──────────────────────────────────────

function countryName(code: string): string {
  const map: Record<string, string> = {
    KR: "South Korea", JP: "Japan", US: "United States",
    GB: "United Kingdom", FR: "France", DE: "Germany",
    AU: "Australia", TH: "Thailand", SG: "Singapore",
    HK: "Hong Kong", TW: "Taiwan", CN: "China",
    IT: "Italy", ES: "Spain", NL: "Netherlands",
    CA: "Canada", BR: "Brazil", MX: "Mexico",
    ID: "Indonesia", VN: "Vietnam", PH: "Philippines",
    IN: "India", TR: "Turkey", PL: "Poland",
  };
  return map[code.toUpperCase()] ?? code;
}

// ── Dummy → SearchResult 변환 ────────────────────────────────

function dummyToSearchResult(
  artist: (typeof DUMMY_ARTISTS)[number],
  type: "guest" | "based"
): SearchResult {
  const nextSchedule: GuestSchedule | null =
    type === "guest" && artist.upcomingSchedules.length > 0
      ? artist.upcomingSchedules[0]
      : null;
  return {
    artistId: artist.id,
    displayName: artist.displayName,
    instagramHandle: artist.instagramHandle,
    isVerified: artist.isVerified,
    isClaimed: artist.isClaimed,
    baseCity: artist.baseCity,
    baseCountry: artist.baseCountry,
    contactType: artist.contactType,
    contactValue: artist.contactValue,
    matchedTags: artist.tags.length,
    totalTags: artist.tags.length,
    priority: 0,
    nextSchedule,
    tags: artist.tags,
  };
}

// ── 인기 스타일 계산 ─────────────────────────────────────────
// Sprint 5에서 search_logs + artist_tags 기반 실데이터로 교체 예정

interface StyleCount {
  tag: Tag;
  count: number;
}

function calcPopularStyles(artists: SearchResult[]): StyleCount[] {
  const countMap = new Map<string, { tag: Tag; count: number }>();
  for (const artist of artists) {
    for (const tag of artist.tags) {
      if (tag.group === "color") continue; // color 그룹 제외
      const existing = countMap.get(tag.slug);
      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(tag.slug, { tag, count: 1 });
      }
    }
  }
  return Array.from(countMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

// ── KPI 카드 ─────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-neutral-100 bg-white px-3 py-3">
      <span className="text-[20px] font-bold leading-tight text-neutral-900">
        {value}
      </span>
      <span className="text-[10px] font-medium text-neutral-500 leading-tight">
        {label}
      </span>
      {sub && (
        <span className="text-[9px] text-neutral-300 leading-tight">{sub}</span>
      )}
    </div>
  );
}

// ── 아티스트 카드 ─────────────────────────────────────────────

function ArtistCard({ result }: { result: SearchResult }) {
  const href = `/artists/${result.instagramHandle ?? result.artistId}`;
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 active:bg-neutral-50 border border-neutral-100"
    >
      <Avatar name={result.displayName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-neutral-900">
            {result.displayName}
          </span>
          {result.isVerified && <VerifiedBadge size={12} />}
        </div>
        {result.nextSchedule && (
          <div className="mb-1 flex items-center gap-1 text-[11px] text-emerald-600">
            <span>
              {result.nextSchedule.city} ·{" "}
              {formatDateRange(
                result.nextSchedule.startDate,
                result.nextSchedule.endDate
              )}
            </span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px]">
              {calcDDay(
                result.nextSchedule.startDate,
                result.nextSchedule.endDate
              )}
            </span>
          </div>
        )}
        <TagList tags={result.tags} size="sm" max={4} />
      </div>
    </Link>
  );
}

// ── 인기 스타일 섹션 ─────────────────────────────────────────

function PopularStylesSection({
  styles,
  city,
}: {
  styles: StyleCount[];
  city: string;
}) {
  if (styles.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
      <div className="mb-3 flex items-center gap-1.5">
        <TrendingUp size={13} className="text-neutral-400" aria-hidden="true" />
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          {city} 인기 스타일
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {styles.map(({ tag, count }) => (
          <div
            key={tag.slug}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5"
          >
            <span className="text-[12px] font-medium text-neutral-700">
              {tag.name}
            </span>
            <span className="text-[11px] font-semibold text-neutral-400">
              {count}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-neutral-300">
        * 스프린트 5에서 실검색 데이터 기반으로 업데이트됩니다
      </p>
    </div>
  );
}

// ── Artist View 인사이트 배너 ────────────────────────────────

function ArtistInsightBanner({
  city,
  guestCount,
  bringCount,
}: {
  city: string;
  guestCount: number;
  bringCount: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
      {/* 헤더 */}
      <p className="mb-1 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        Artist Insight
      </p>
      <p className="text-[15px] font-bold text-white">{city}</p>

      {/* 수요 지표 */}
      <div className="mt-3 flex gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[22px] font-bold leading-tight text-white">
            {bringCount}
          </span>
          <span className="text-[11px] text-neutral-400">
            Bring This Artist
          </span>
          <span className="text-[10px] text-neutral-500">
            현재 활성 수요
          </span>
        </div>
        <div className="w-px self-stretch bg-neutral-700" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[22px] font-bold leading-tight text-white">
            {guestCount}
          </span>
          <span className="text-[11px] text-neutral-400">Guest Artists</span>
          <span className="text-[10px] text-neutral-500">현재 / 예정</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/studio/schedule/new`}
        className="
          mt-4 flex items-center justify-center gap-2
          w-full rounded-xl bg-white
          py-3 text-sm font-semibold text-neutral-900
          hover:bg-neutral-100 active:opacity-80 transition-colors
        "
      >
        <Plus size={14} aria-hidden="true" />
        {city} 일정 등록하기
      </Link>

      {/* 캘린더 링크 */}
      <Link
        href="/calendar"
        className="mt-2 flex items-center justify-center gap-1 text-[12px] text-neutral-400 hover:text-neutral-300 transition-colors py-1"
      >
        날짜별 수요 확인 →
      </Link>

      <p className="mt-2 text-center text-[10px] text-neutral-600">
        * Bring 실수요는 Sprint 5에서 연결됩니다
      </p>
    </div>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps) {
  const { citySlug } = await params;
  const sp = await searchParams;
  const { href: locHref } = await getLocaleServer();

  const activeTab: TabType = sp.tab === "based" ? "based" : "guest";
  const { city, country } = fromCitySlug(citySlug);

  // 로그인 여부 + role 확인 (Artist View 분기용)
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isArtist = false;
  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isArtist =
      userRow?.role === "artist" || userRow?.role === "admin";
  }

  // 아티스트 데이터 조회
  let guests: SearchResult[] = [];
  let based: SearchResult[] = [];

  try {
    const result = await getCityArtists(city);
    guests = result.guests;
    based = result.based;

    if (guests.length === 0 && based.length === 0) {
      guests = DUMMY_ARTISTS.filter(
        (a) => a.upcomingSchedules.length > 0
      ).map((a) => dummyToSearchResult(a, "guest"));
      based = DUMMY_ARTISTS.filter(
        (a) => a.baseCity.toLowerCase() === city.toLowerCase()
      ).map((a) => dummyToSearchResult(a, "based"));
    }
  } catch {
    guests = DUMMY_ARTISTS.filter(
      (a) => a.upcomingSchedules.length > 0
    ).map((a) => dummyToSearchResult(a, "guest"));
    based = DUMMY_ARTISTS.filter(
      (a) => a.baseCity.toLowerCase() === city.toLowerCase()
    ).map((a) => dummyToSearchResult(a, "based"));
  }

  const activeItems = activeTab === "guest" ? guests : based;

  // 인기 스타일: guest + based 전체 태그 빈도 계산
  const allArtists = [...guests, ...based];
  const popularStyles = calcPopularStyles(allArtists);

  // Sprint 5: city_follows (is_active=true) WHERE city = city 쿼리로 교체
  const bringCount = 0;

  return (
    <PageContainer className="bg-neutral-50">
      {/* ── 상단 헤더 + KPI ───────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white">
        {/* 도시명 행 */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <Link
            href={locHref("/")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-bold leading-tight text-neutral-900">
              {city}
            </h1>
            <p className="text-[11px] text-neutral-400">
              {countryName(country)}
            </p>
          </div>
        </div>

        {/* KPI 카드 행 */}
        <div className="flex gap-2 px-4 pb-3">
          <KpiCard label="Guest" value={guests.length} sub="현재·예정" />
          <KpiCard label="Based" value={based.length} sub="베이스 아티스트" />
          <KpiCard
            label="Bring"
            value={bringCount}
            sub="활성 수요"
          />
        </div>

        {/* 탭 바 */}
        <div className="flex border-t border-neutral-100 px-4">
          <Link
            href={`/city/${citySlug}?tab=guest`}
            className={`mr-5 pb-2.5 pt-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "guest"
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            Guest Artists
            <span className="ml-1.5 text-[11px]">{guests.length}</span>
          </Link>
          <Link
            href={`/city/${citySlug}?tab=based`}
            className={`pb-2.5 pt-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "based"
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            Based Artists
            <span className="ml-1.5 text-[11px]">{based.length}</span>
          </Link>
        </div>
      </div>

      {/* ── 콘텐츠 영역 ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 py-4">

        {/* Artist View 인사이트 배너 */}
        {isArtist && (
          <ArtistInsightBanner
            city={city}
            guestCount={guests.length}
            bringCount={bringCount}
          />
        )}

        {/* 아티스트 목록 */}
        {activeItems.length === 0 ? (
          <div className="pt-2">
            <ErrorState
              type="generic"
              message={
                activeTab === "guest"
                  ? `${city}에 예정된 게스트 아티스트가 없습니다`
                  : `${city}에 기반한 아티스트가 없습니다`
              }
              compact
            />
          </div>
        ) : (
          activeItems.map((r) => (
            <ArtistCard key={r.artistId} result={r} />
          ))
        )}

        {/* 인기 스타일 섹션 */}
        <PopularStylesSection styles={popularStyles} city={city} />
      </div>
    </PageContainer>
  );
}
