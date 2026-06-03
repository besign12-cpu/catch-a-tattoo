import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { getCityPins } from "@/lib/queries/artists";

export const metadata: Metadata = { title: "지도" };
export const revalidate = 3600; // 1시간 캐시 (Materialized View 갱신 주기)

const REGIONS = [
  { key: "asia",     label: "Asia" },
  { key: "europe",   label: "Europe" },
  { key: "americas", label: "Americas" },
] as const;

async function CityPinList({
  region,
}: {
  region: "asia" | "europe" | "americas";
}) {
  const pins = await getCityPins(region).catch(() => []);

  if (pins.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        이 지역에 등록된 일정이 없습니다
      </p>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {pins.map((pin) => (
        <Link
          key={`${pin.city}-${pin.country}`}
          href={`/city/${pin.city.toLowerCase().replace(/\s+/g, "-")}-${pin.country.toLowerCase()}`}
          className="flex items-center gap-3 bg-white px-4 py-3.5 active:bg-neutral-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
            <MapPin size={16} className="text-neutral-500" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-neutral-900">{pin.city}</p>
            <p className="text-[11px] text-neutral-400">{pin.country}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-medium text-neutral-900">
              {pin.upcomingCount}
            </p>
            <p className="text-[10px] text-neutral-400">upcoming</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function MapPage() {
  return (
    <PageContainer className="bg-white">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white px-4 py-3">
        <p className="text-[17px] font-medium text-neutral-900">지도</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Mapbox 지도는 Sprint 2 후반에 추가됩니다
        </p>
      </header>

      {/* 지역 탭 + 도시 목록 */}
      {REGIONS.map(({ key, label }) => (
        <section key={key}>
          <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2">
            <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
              {label}
            </p>
          </div>
          <Suspense
            fallback={
              <p className="py-6 text-center text-sm text-neutral-300">
                불러오는 중...
              </p>
            }
          >
            <CityPinList region={key} />
          </Suspense>
        </section>
      ))}
    </PageContainer>
  );
}
