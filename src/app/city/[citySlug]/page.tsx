import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { ErrorState } from "@/components/ui/ErrorState";

import { getCityArtists, type SearchResult } from "@/lib/queries/artists";
import { DUMMY_ARTISTS } from "@/data/dummy";
import { fromCitySlug } from "@/lib/mock-preferences";
import { formatDateRange, calcDDay } from "@/lib/utils";
import type { GuestSchedule } from "@/types";

export const metadata: Metadata = { title: "도시" };

type TabType = "guest" | "based";

interface CityPageProps {
  params: Promise<{ citySlug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

// ── Dummy ArtistProfile → SearchResult 변환 ─────────────────

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

// ── 아티스트 카드 ────────────────────────────────────────────

function ArtistCard({ result }: { result: SearchResult }) {
  const href = `/artists/${result.instagramHandle ?? result.artistId}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 active:bg-neutral-50"
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

// ── 페이지 ──────────────────────────────────────────────────

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps) {
  const { citySlug } = await params;
  const sp = await searchParams;

  const activeTab: TabType = sp.tab === "based" ? "based" : "guest";
  const { city } = fromCitySlug(citySlug);

  let guests: SearchResult[] = [];
  let based: SearchResult[] = [];

  try {
    const result = await getCityArtists(city);
    guests = result.guests;
    based = result.based;

    if (guests.length === 0 && based.length === 0) {
      guests = DUMMY_ARTISTS.filter((a) => a.upcomingSchedules.length > 0).map(
        (a) => dummyToSearchResult(a, "guest")
      );
      based = DUMMY_ARTISTS.filter(
        (a) => a.baseCity.toLowerCase() === city.toLowerCase()
      ).map((a) => dummyToSearchResult(a, "based"));
    }
  } catch {
    guests = DUMMY_ARTISTS.filter((a) => a.upcomingSchedules.length > 0).map(
      (a) => dummyToSearchResult(a, "guest")
    );
    based = DUMMY_ARTISTS.filter(
      (a) => a.baseCity.toLowerCase() === city.toLowerCase()
    ).map((a) => dummyToSearchResult(a, "based"));
  }

  const activeItems = activeTab === "guest" ? guests : based;

  return (
    <PageContainer className="bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="px-4 pt-5 pb-0">
          <h1 className="text-[18px] font-bold text-neutral-900">{city}</h1>
        </div>
        <div className="flex px-4 pt-3">
          <Link
            href={`/city/${citySlug}?tab=guest`}
            className={`mr-5 pb-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "guest"
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            Guest
            <span className="ml-1.5 text-[11px]">{guests.length}</span>
          </Link>
          <Link
            href={`/city/${citySlug}?tab=based`}
            className={`pb-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "based"
                ? "border-b-2 border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            Based
            <span className="ml-1.5 text-[11px]">{based.length}</span>
          </Link>
        </div>
      </header>

      <div className="space-y-2 px-3 py-3">
        {activeItems.length === 0 ? (
          <div className="pt-4">
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
          activeItems.map((r) => <ArtistCard key={r.artistId} result={r} />)
        )}
      </div>
    </PageContainer>
  );
}
