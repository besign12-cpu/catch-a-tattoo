import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "캘린더",
};

// ── 메인 페이지 ────────────────────────────────────────────
// 비로그인: role=null → CustomerCalendar 표시 (팔로우 일정 영역만 로그인 유도)
// Customer:  role="customer" → CustomerCalendar
// Artist:    role="artist"|"admin" → ArtistCalendar

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: role=null 전달 → 달력은 보이고, 팔로우 일정 영역만 로그인 유도
  if (!user) {
    return (
      <PageContainer>
        <TopBar title="캘린더" />
        <CalendarClient role={null} cities={[]} />
      </PageContainer>
    );
  }

  // 로그인: users.role 조회 → Customer / Artist View 분기
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (userRow?.role ?? "customer") as
    | "customer"
    | "artist"
    | "admin";

  // Artist View 전용: 도시 드롭다운용 cities 조회
  let cities: {
    id: string;
    name: string;
    country: string;
    countryName: string;
  }[] = [];

  if (role === "artist" || role === "admin") {
    const { data: citiesData } = await supabase
      .from("cities")
      .select("id, name, country, country_name")
      .eq("is_approved", true)
      .order("name", { ascending: true });

    cities = (citiesData ?? []).map(
      (c: {
        id: string;
        name: string;
        country: string;
        country_name: string;
      }) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        countryName: c.country_name,
      })
    );
  }

  return (
    <PageContainer>
      <TopBar title="캘린더" />
      <CalendarClient role={role} cities={cities} />
    </PageContainer>
  );
}
