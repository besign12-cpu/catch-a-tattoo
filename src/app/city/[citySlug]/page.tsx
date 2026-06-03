import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { FeedSkeleton } from "@/components/ui/Skeleton";

import { getCityArtists } from "@/lib/queries/artists";
import { formatDateRange, calcDDay } from "@/lib/utils";
import type { SearchResult } from "@/lib/queries/artists";

interface Props {
  params: Promise<{ citySlug: string }>;
}

// citySlug: "seoul-kr" → city="Seoul", country="KR"
function parseCitySlug(slug: string) {
  const parts = slug.split("-");
  const country = parts.pop()?.toUpperCase() ?? "";
  const city = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return { city, country };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const { city } = parseCitySlug(citySlug);
  return { title: city };
}

function ArtistRow({
  result,
  highlightedSlugs = [],
}: {
  result: SearchResult;
  highlightedSlugs?: string[];
}) {
  return (
    <Link
      href={`/artists/${result.instagramHandle ?? result.artistId}`}
      className="flex items-center gap-3 bg-white px-4 py-3 active:bg-neutral-50"
    >
      <Avatar name={result.displayName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[13px] font-medium text-neutral-900">
            {result.displayName}
          </span>
          {result.isVerified && <VerifiedBadge size={12} />}
        </div>
        {result.nextSchedule && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[11px] text-emerald-600">
              {formatDateRange(
                result.nextSchedule.startDate,
                result.nextSchedule.endDate
              )}
            </span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
              {calcDDay(
                result.nextSchedule.startDate,
                result.nextSchedule.endDate
              )}
            </span>
          </div>
        )}
        <TagList
          tags={result.tags}
          highlightedSlugs={highlightedSlugs}
          size="sm"
          max={4}
        />
      </div>
      <ChevronRight size={16} className="shrink-0 text-neutral-300" />
    </Link>
  );
}

async function CityContent({ city }: { city: string }) {
  const { guests, based } = await getCityArtists(city).catch(() => ({
    guests: [],
    based: [],
  }));

  return (
    <>
      {/* 요약 */}
      <div className="flex gap-6 border-b border-neutral-100 bg-white px-5 py-3">
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-900">{guests.length}</p>
          <p className="text-[10px] text-neutral-400">게스트워크</p>
        </div>
        <div className="w-px self-stretch bg-neutral-100" />
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-900">{based.length}</p>
          <p className="text-[10px] text-neutral-400">거주 아티스트</p>
        </div>
      </div>

      {/* 게스트 아티스트 섹션 */}
      {guests.length > 0 && (
        <section className="mt-2">
          <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
              Guest Artists Coming to {city}
            </p>
          </div>
          <div className="divide-y divide-neutral-100">
            {guests.map((r) => (
              <ArtistRow key={r.artistId} result={r} />
            ))}
          </div>
        </section>
      )}

      {/* 거주 아티스트 섹션 */}
      {based.length > 0 && (
        <section className="mt-2">
          <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">
              Based in {city}
            </p>
          </div>
          <div className="divide-y divide-neutral-100">
            {based.map((r) => (
              <ArtistRow key={r.artistId} result={r} />
            ))}
          </div>
        </section>
      )}

      {guests.length === 0 && based.length === 0 && (
        <p className="py-12 text-center text-sm text-neutral-400">
          이 도시에 등록된 아티스트가 없습니다
        </p>
      )}
    </>
  );
}

export default async function CityPage({ params }: Props) {
  const { citySlug } = await params;
  const { city, country } = parseCitySlug(citySlug);

  return (
    <PageContainer className="bg-neutral-50">
      <header className="sticky top-0 z-40 flex h-[52px] items-center gap-3 border-b border-neutral-100 bg-white px-4">
        <Link
          href="/map"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-1.5">
          <h1 className="text-[13px] font-medium text-neutral-900">{city}</h1>
          <span className="text-[12px] text-neutral-400">{country}</span>
        </div>
      </header>

      <Suspense fallback={<FeedSkeleton />}>
        <CityContent city={city} />
      </Suspense>
    </PageContainer>
  );
}
