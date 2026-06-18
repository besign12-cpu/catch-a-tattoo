import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { CalendarClient } from "./CalendarClient";

export const metadata: Metadata = {
  title: "캘린더",
};

// ── 비로그인 Empty State ────────────────────────────────────

function UnauthenticatedState() {
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[15px] font-semibold text-neutral-900">
          로그인이 필요합니다
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          로그인하면 팔로우한 아티스트의<br />
          일정을 달력에서 확인할 수 있습니다
        </p>
      </div>
      <a
        href="/auth/login?next=/calendar"
        className="
          mt-1 inline-flex items-center justify-center
          w-full max-w-[240px] rounded-2xl bg-neutral-900
          py-4 text-sm font-semibold text-white
          hover:opacity-90 active:opacity-80 transition-opacity
        "
      >
        로그인
      </a>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: Empty State (redirect 없이 — 비로그인도 UI 접근 허용)
  if (!user) {
    return (
      <PageContainer>
        <TopBar title="캘린더" />
        <UnauthenticatedState />
      </PageContainer>
    );
  }

  // users.role 조회 → Customer / Artist View 분기
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (userRow?.role ?? "customer") as "customer" | "artist" | "admin";

  // Artist View: 도시 드롭다운용 cities 조회
  let cities: { id: string; name: string; country: string; countryName: string }[] = [];

  if (role === "artist" || role === "admin") {
    const { data: citiesData } = await supabase
      .from("cities")
      .select("id, name, country, country_name")
      .eq("is_approved", true)
      .order("name", { ascending: true });

    cities = (citiesData ?? []).map(
      (c: { id: string; name: string; country: string; country_name: string }) => ({
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
