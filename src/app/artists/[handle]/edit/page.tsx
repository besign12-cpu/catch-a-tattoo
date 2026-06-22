import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile } from "@/lib/queries/studio";
import { getAllTags } from "@/lib/queries/artists";
import { PageContainer } from "@/components/layout/PageContainer";
import { EditProfileForm } from "./EditProfileForm";
import type { CityDropdownOption } from "@/components/artist/CityDropdown";

export const metadata: Metadata = {
  title: "프로필 수정",
};

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function EditProfilePage({ params }: Props) {
  const { handle } = await params;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/artists/${handle}/edit`);
  }

  // 본인 프로필 확인
  const profile = await getMyArtistProfile(user.id);

  // 프로필 없거나 핸들 불일치 → notFound
  if (!profile) {
    redirect("/artists/new");
  }
  if (profile.instagramHandle !== handle) {
    notFound();
  }

  const allTags = await getAllTags();
  const initialTagIds = profile.tags.map((t) => t.id);

  // cities 조회
  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, name, country, country_name, region")
    .eq("is_approved", true)
    .order("name", { ascending: true });

  const cities: CityDropdownOption[] = (citiesData ?? []).map(
    (c: {
      id: string;
      name: string;
      country: string;
      country_name: string;
      region: "asia" | "europe" | "americas" | "other";
    }) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      countryName: c.country_name,
      region: c.region,
    })
  );

  return (
    <PageContainer>
      <header className="sticky top-0 z-40 flex h-[52px] items-center border-b border-neutral-100 bg-white px-4">
        <Link
          href={`/artists/${handle}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 text-center text-[13px] font-medium text-neutral-900">
          프로필 수정
        </h1>
        <div className="w-9" />
      </header>

      <EditProfileForm
        artistId={profile.id}
        originalHandle={profile.instagramHandle ?? ""}
        initialDisplayName={profile.displayName}
        initialHandle={profile.instagramHandle ?? ""}
        initialBio={profile.bio ?? ""}
        initialBaseCity={profile.baseCity ?? ""}
        initialBaseCountry={profile.baseCountry ?? ""}
        initialTagIds={initialTagIds}
        allTags={allTags}
        cities={cities}
      />
    </PageContainer>
  );
}
