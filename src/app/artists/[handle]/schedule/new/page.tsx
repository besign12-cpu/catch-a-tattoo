import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile } from "@/lib/queries/studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScheduleNewClient } from "./ScheduleNewClient";
import type { CityOption, BookedRange } from "./ScheduleNewClient";

export const metadata: Metadata = { title: "Guest Work 등록" };

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function ScheduleNewPage({ params }: Props) {
  const { handle } = await params;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/artists/${handle}/schedule/new`);
  }

  // 본인 프로필 확인
  const profile = await getMyArtistProfile(user.id);
  if (!profile) {
    redirect("/artists/new");
  }
  if (profile.instagramHandle !== handle) {
    notFound();
  }

  // cities 조회
  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, name, country, country_name, region, lat, lng")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  const cities: CityOption[] = (citiesData ?? []).map(
    (c: {
      id: string;
      name: string;
      country: string;
      country_name: string;
      region: "asia" | "europe" | "americas" | "other";
      lat: number | null;
      lng: number | null;
    }) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      countryName: c.country_name,
      region: c.region,
      lat: c.lat,
      lng: c.lng,
    })
  );

  // 기존 일정 조회 — 날짜 중복 방지용
  const { data: schedulesData } = await supabase
    .from("guest_schedules")
    .select("id, start_date, end_date")
    .eq("artist_id", profile.id)
    .eq("is_active", true);

  const bookedRanges: BookedRange[] = (schedulesData ?? []).map(
    (s: { id: string; start_date: string; end_date: string }) => ({
      id: s.id,
      startDate: s.start_date,
      endDate: s.end_date,
    })
  );

  return (
    <PageContainer className="bg-neutral-50">
      <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-neutral-100 bg-white px-4">
        <Link
          href={`/artists/${handle}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="프로필로 돌아가기"
        >
          <ChevronLeft size={20} />
        </Link>
        <span className="text-[13px] font-medium text-neutral-900">
          Guest Work 등록
        </span>
        <div className="w-9" aria-hidden="true" />
      </header>

      <div className="py-2">
        <ScheduleNewClient
          cities={cities}
          artistHandle={profile.instagramHandle}
          bookedRanges={bookedRanges}
        />
      </div>
    </PageContainer>
  );
}
