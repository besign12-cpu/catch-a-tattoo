"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type GuestScheduleInsert =
  Database["public"]["Tables"]["guest_schedules"]["Insert"];
type ArtistProfileRow =
  Database["public"]["Tables"]["artist_profiles"]["Row"];
type CityRow = Database["public"]["Tables"]["cities"]["Row"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type CreateScheduleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

// ── 유효성 검사 헬퍼 ─────────────────────────────────────────

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

// ── createGuestSchedule ───────────────────────────────────────

/**
 * Guest Work 일정 등록
 * - 세션 확인 → 본인 아티스트 프로필 확인
 * - cities 테이블에서 city 정보(lat, lng, region) 조회
 * - guest_schedules insert (admin 클라이언트 — RLS 우회)
 * - 성공 시 /studio redirect
 */
export async function createGuestSchedule(
  _prev: CreateScheduleState,
  formData: FormData
): Promise<CreateScheduleState> {
  // ── 세션 확인 ────────────────────────────────────────────
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  // ── 폼 데이터 파싱 ───────────────────────────────────────
  const cityId     = (formData.get("cityId")     as string | null)?.trim() ?? "";
  const startDate  = (formData.get("startDate")  as string | null)?.trim() ?? "";
  const endDate    = (formData.get("endDate")    as string | null)?.trim() ?? "";
  const contactType = (formData.get("contactType") as string | null)?.trim() ?? "instagram";
  const contactValue = (formData.get("contactValue") as string | null)?.trim() ?? "";
  const note       = (formData.get("note")       as string | null)?.trim() ?? "";

  // ── 유효성 검사 ──────────────────────────────────────────
  if (!cityId) {
    return { status: "error", message: "도시를 선택해주세요." };
  }
  if (!startDate || !isValidDate(startDate)) {
    return { status: "error", message: "시작 날짜를 선택해주세요." };
  }
  if (!endDate || !isValidDate(endDate)) {
    return { status: "error", message: "종료 날짜를 선택해주세요." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { status: "error", message: "종료 날짜는 시작 날짜 이후여야 합니다." };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(startDate) < today) {
    return { status: "error", message: "시작 날짜는 오늘 이후여야 합니다." };
  }
  if (!contactValue) {
    return { status: "error", message: "연락 방법을 입력해주세요." };
  }
  if (
    contactType !== "instagram" &&
    contactType !== "email" &&
    contactType !== "website"
  ) {
    return { status: "error", message: "올바른 연락 방법을 선택해주세요." };
  }

  const admin = getSupabaseAdminClient();

  // ── 본인 아티스트 프로필 확인 ────────────────────────────
  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return { status: "error", message: "아티스트 프로필이 없습니다." };
  }

  const artistId: ArtistProfileRow["id"] = myProfile.id;

  // ── cities 테이블에서 도시 정보 조회 ────────────────────
  const { data: cityData } = await admin
    .from("cities")
    .select("id, name, country, lat, lng, region, is_approved")
    .eq("id", cityId)
    .single();

  if (!cityData || !cityData.is_approved) {
    return { status: "error", message: "선택한 도시를 찾을 수 없습니다." };
  }

  const city = cityData as CityRow;

  if (!city.lat || !city.lng) {
    return { status: "error", message: "해당 도시의 위치 정보가 없습니다." };
  }

  // ── guest_schedules insert ───────────────────────────────
  const scheduleInsert: GuestScheduleInsert = {
    artist_id:     artistId,
    city:          city.name,
    country:       city.country,
    city_lat:      city.lat,
    city_lng:      city.lng,
    region:        city.region,
    start_date:    startDate,
    end_date:      endDate,
    note:          note || null,
    contact_type:  contactType as "instagram" | "email" | "website",
    contact_value: contactValue,
    is_active:     true,
  };

  const { error } = await admin
    .from("guest_schedules")
    .insert(scheduleInsert);

  if (error) {
    return {
      status: "error",
      message: "일정 등록에 실패했습니다. 다시 시도해주세요.",
    };
  }

  revalidatePath("/studio");
  revalidatePath("/");

  redirect("/studio");
}
