import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile } from "@/lib/queries/studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScheduleEditClient } from "./ScheduleEditClient";
import type { ScheduleEditData } from "./ScheduleEditClient";

export const metadata: Metadata = { title: "일정 수정" };

interface Props {
  params: Promise<{ handle: string; id: string }>;
}

export default async function ScheduleEditPage({ params }: Props) {
  const { handle, id } = await params;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/artists/${handle}/schedule/${id}`);
  }

  // 본인 프로필 확인
  const profile = await getMyArtistProfile(user.id);
  if (!profile) {
    redirect("/artists/new");
  }
  if (profile.instagramHandle !== handle) {
    notFound();
  }

  // 일정 조회 — 본인 artist_id 일치 확인
  const { data: scheduleData } = await supabase
    .from("guest_schedules")
    .select(
      "id, artist_id, city, country, start_date, end_date, contact_type, contact_value, note, is_active"
    )
    .eq("id", id)
    .eq("artist_id", profile.id)
    .maybeSingle();

  if (!scheduleData) {
    notFound();
  }

  // 과거 일정 여부
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = new Date(scheduleData.end_date) < today;

  const schedule: ScheduleEditData = {
    id:           scheduleData.id,
    city:         scheduleData.city,
    country:      scheduleData.country,
    startDate:    scheduleData.start_date,
    endDate:      scheduleData.end_date,
    contactType:  scheduleData.contact_type as "instagram" | "email" | "website",
    contactValue: scheduleData.contact_value,
    note:         scheduleData.note,
    isActive:     scheduleData.is_active,
    isPast,
  };

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
          일정 수정
        </span>
        <div className="w-9" aria-hidden="true" />
      </header>

      <ScheduleEditClient schedule={schedule} />
    </PageContainer>
  );
}
