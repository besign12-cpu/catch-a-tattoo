import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/PageContainer";
import { SettingsClient } from "./SettingsClient";
import type { SettingsCityOption } from "./SettingsClient";
import type { Tag } from "@/types";

export const metadata: Metadata = { title: "설정" };

export default async function SettingsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/me/settings");

  const admin = getSupabaseAdminClient();

  // users 테이블: Base City + 알림 설정
  const { data: userData } = await admin
    .from("users")
    .select("base_city, base_country, base_city_changed_at, notif_schedule, notif_bring")
    .eq("id", user.id)
    .single();

  // 30일 제한 계산
  let daysUntilChange: number | null = null;
  if (userData?.base_city_changed_at) {
    const changedAt      = new Date(userData.base_city_changed_at);
    const nextAvailable  = new Date(changedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const today          = new Date();
    if (nextAvailable > today) {
      daysUntilChange = Math.ceil(
        (nextAvailable.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  // cities 조회
  const { data: citiesData } = await admin
    .from("cities")
    .select("id, name, country, country_name, region")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  const cities: SettingsCityOption[] = (citiesData ?? []).map(
    (c: {
      id: string;
      name: string;
      country: string;
      country_name: string;
      region: "asia" | "europe" | "americas" | "other";
    }) => ({
      id:          c.id,
      name:        c.name,
      country:     c.country,
      countryName: c.country_name,
      region:      c.region,
    })
  );

  // tags 조회
  const { data: tagsData } = await admin
    .from("tags")
    .select("id, name, slug, group_type")
    .order("group_type", { ascending: true })
    .order("name",       { ascending: true });

  const tags: Tag[] = (tagsData ?? []).map(
    (t: { id: string; name: string; slug: string; group_type: string }) => ({
      id:    t.id,
      name:  t.name,
      slug:  t.slug,
      group: t.group_type as Tag["group"],
    })
  );

  // 저장된 관심 장르 불러오기
  const { data: interestRows } = await admin
    .from("user_interests")
    .select("tag_id")
    .eq("user_id", user.id);

  const savedTagIds: string[] = (interestRows ?? []).map(
    (r: { tag_id: string }) => r.tag_id
  );

  return (
    <PageContainer className="bg-neutral-50">
      <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-neutral-100 bg-white px-4">
        <Link
          href="/me"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="내 정보로 돌아가기"
        >
          <ChevronLeft size={20} />
        </Link>
        <span className="text-[13px] font-medium text-neutral-900">설정</span>
        <div className="w-9" aria-hidden="true" />
      </header>

      <SettingsClient
        currentBaseCity={userData?.base_city ?? null}
        currentBaseCountry={userData?.base_country ?? null}
        baseCityChangedAt={userData?.base_city_changed_at ?? null}
        daysUntilChange={daysUntilChange}
        cities={cities}
        tags={tags}
        savedTagIds={savedTagIds}
        savedNotifSchedule={userData?.notif_schedule ?? true}
        savedNotifBring={userData?.notif_bring ?? false}
      />
    </PageContainer>
  );
}
