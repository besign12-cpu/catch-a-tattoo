import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { getCityPins } from "@/lib/queries/artists";
import type { CityPin } from "@/lib/queries/artists";

export const metadata: Metadata = { title: "지역" };
export const revalidate = 3600;

const REGIONS: { key: CityPin["region"]; label: string; emoji: string }[] = [
  { key: "asia",     label: "Asia",     emoji: "🌏" },
  { key: "europe",   label: "Europe",   emoji: "🌍" },
  { key: "americas", label: "Americas", emoji: "🌎" },
];

function CityCard({ pin }: { pin: CityPin }) {
  const slug = `${pin.city.toLowerCase().replace(/\s+/g, "-")}-${pin.country.toLowerCase()}`;
  return (
    <Link
      href={`/city/${slug}`}
      className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-white p-3 active:bg-neutral-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-neutral-400" aria-hidden="true" />
          <span className="text-[13px] font-medium text-neutral-900">
            {pin.city}
          </span>
        </div>
        <span className="text-[11px] text-neutral-400">{pin.country}</span>
      </div>
      <p className="text-[11px] text-emerald-600 font-medium">
        {pin.upcomingCount}개 일정
      </p>
    </Link>
  );
}

async function RegionSection({
  region,
  label,
  emoji,
}: {
  region: CityPin["region"];
  label: string;
  emoji: string;
}) {
  const pins = await getCityPins(region).catch(() => []);

  if (pins.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2 px-4">
        <span className="text-lg" aria-hidden="true">{emoji}</span>
        <h2 className="text-[15px] font-medium text-neutral-900">{label}</h2>
        <span className="ml-auto text-[11px] text-neutral-400">
          {pins.length}개 도시
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4">
        {pins.map((pin) => (
          <CityCard key={`${pin.city}-${pin.country}`} pin={pin} />
        ))}
      </div>
    </section>
  );
}

function RegionSkeleton() {
  return (
    <div className="mb-6 px-4">
      <div className="mb-3 h-5 w-20 animate-pulse rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <PageContainer className="bg-neutral-50">
      <header className="border-b border-neutral-100 bg-white px-4 py-3">
        <p className="text-[17px] font-medium text-neutral-900">지역 탐색</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          게스트워크가 예정된 도시
        </p>
      </header>

      <div className="pt-5">
        {REGIONS.map(({ key, label, emoji }) => (
          <Suspense key={key} fallback={<RegionSkeleton />}>
            <RegionSection region={key} label={label} emoji={emoji} />
          </Suspense>
        ))}
      </div>
    </PageContainer>
  );
}
