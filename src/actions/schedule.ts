"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type GuestScheduleInsert =
  Database["public"]["Tables"]["guest_schedules"]["Insert"];
type GuestScheduleUpdate =
  Database["public"]["Tables"]["guest_schedules"]["Update"];
type ArtistProfileRow =
  Database["public"]["Tables"]["artist_profiles"]["Row"];
type GuestScheduleRow =
  Database["public"]["Tables"]["guest_schedules"]["Row"];
type CityRow = Database["public"]["Tables"]["cities"]["Row"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type CreateScheduleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export type UpdateScheduleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export type DeleteScheduleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

// ── 유효성 검사 헬퍼 ─────────────────────────────────────────

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

// ── 본인 소유 일정 확인 헬퍼 ─────────────────────────────────

async function verifyScheduleOwnership(
  scheduleId: string,
  userId: string
): Promise<
  | { ok: true; artistId: string; scheduleRow: GuestScheduleRow }
  | { ok: false; message: string }
> {
  const admin = getSupabaseAdminClient();

  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!myProfile) {
    return { ok: false, message: "아티스트 프로필이 없습니다." };
  }

  const artistId: ArtistProfileRow["id"] = myProfile.id;

  const { data: schedule } = await admin
    .from("guest_schedules")
    .select("*")
    .eq("id", scheduleId)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (!schedule) {
    return { ok: false, message: "일정을 찾을 수 없거나 수정 권한이 없습니다." };
  }

  return {
    ok: true,
    artistId,
    scheduleRow: schedule as GuestScheduleRow,
  };
}

// ── createGuestSchedule ───────────────────────────────────────

export async function createGuestSchedule(
  _prev: CreateScheduleState,
  formData: FormData
): Promise<CreateScheduleState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  const cityId      = (formData.get("cityId")      as string | null)?.trim() ?? "";
  const startDate   = (formData.get("startDate")   as string | null)?.trim() ?? "";
  const endDate     = (formData.get("endDate")     as string | null)?.trim() ?? "";
  const contactType = (formData.get("contactType") as string | null)?.trim() ?? "instagram";
  const contactValue = (formData.get("contactValue") as string | null)?.trim() ?? "";
  const note        = (formData.get("note")        as string | null)?.trim() ?? "";

  if (!cityId) return { status: "error", message: "도시를 선택해주세요." };
  if (!startDate || !isValidDate(startDate))
    return { status: "error", message: "시작 날짜를 선택해주세요." };
  if (!endDate || !isValidDate(endDate))
    return { status: "error", message: "종료 날짜를 선택해주세요." };
  if (new Date(endDate) < new Date(startDate))
    return { status: "error", message: "종료 날짜는 시작 날짜 이후여야 합니다." };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(startDate) < today)
    return { status: "error", message: "시작 날짜는 오늘 이후여야 합니다." };
  if (!contactValue)
    return { status: "error", message: "연락 방법을 입력해주세요." };
  if (contactType !== "instagram" && contactType !== "email" && contactType !== "website")
    return { status: "error", message: "올바른 연락 방법을 선택해주세요." };

  const admin = getSupabaseAdminClient();

  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) return { status: "error", message: "아티스트 프로필이 없습니다." };

  const artistId: ArtistProfileRow["id"] = myProfile.id;

  const { data: cityData } = await admin
    .from("cities")
    .select("id, name, country, lat, lng, region, is_approved")
    .eq("id", cityId)
    .single();

  if (!cityData || !cityData.is_approved)
    return { status: "error", message: "선택한 도시를 찾을 수 없습니다." };

  const city = cityData as CityRow;

  if (!city.lat || !city.lng)
    return { status: "error", message: "해당 도시의 위치 정보가 없습니다." };

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

  // 날짜 중복 재검증 (서버 사이드)
  const { data: overlapping } = await admin
    .from("guest_schedules")
    .select("id, start_date, end_date")
    .eq("artist_id", artistId)
    .eq("is_active", true)
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (overlapping && overlapping.length > 0) {
    const ov = overlapping[0] as { start_date: string; end_date: string };
    return {
      status: "error",
      message: `${ov.start_date} ~ ${ov.end_date} 기간과 겹치는 일정이 이미 있습니다.`,
    };
  }

  const { error } = await admin.from("guest_schedules").insert(scheduleInsert);

  if (error)
    return { status: "error", message: "일정 등록에 실패했습니다. 다시 시도해주세요." };

  revalidatePath("/studio");
  revalidatePath("/");
  redirect("/studio");
}

// ── updateGuestSchedule ───────────────────────────────────────

/**
 * Guest Work 일정 수정
 * - 날짜 / 연락방법 / 메모 수정 (도시 변경 불가)
 * - 본인 소유 확인 필수
 * - 과거 종료 일정은 수정 불가
 */
export async function updateGuestSchedule(
  _prev: UpdateScheduleState,
  formData: FormData
): Promise<UpdateScheduleState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  const scheduleId  = (formData.get("scheduleId")  as string | null)?.trim() ?? "";
  const startDate   = (formData.get("startDate")   as string | null)?.trim() ?? "";
  const endDate     = (formData.get("endDate")     as string | null)?.trim() ?? "";
  const contactType = (formData.get("contactType") as string | null)?.trim() ?? "instagram";
  const contactValue = (formData.get("contactValue") as string | null)?.trim() ?? "";
  const note        = (formData.get("note")        as string | null)?.trim() ?? "";

  if (!scheduleId) return { status: "error", message: "일정 정보를 찾을 수 없습니다." };
  if (!startDate || !isValidDate(startDate))
    return { status: "error", message: "시작 날짜를 선택해주세요." };
  if (!endDate || !isValidDate(endDate))
    return { status: "error", message: "종료 날짜를 선택해주세요." };
  if (new Date(endDate) < new Date(startDate))
    return { status: "error", message: "종료 날짜는 시작 날짜 이후여야 합니다." };
  if (!contactValue)
    return { status: "error", message: "연락처를 입력해주세요." };
  if (contactType !== "instagram" && contactType !== "email" && contactType !== "website")
    return { status: "error", message: "올바른 연락 방법을 선택해주세요." };

  // 소유권 확인
  const ownership = await verifyScheduleOwnership(scheduleId, user.id);
  if (!ownership.ok) return { status: "error", message: ownership.message };

  // 과거 종료 일정 수정 불가
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existingEndDate = new Date(ownership.scheduleRow.end_date);
  if (existingEndDate < today) {
    return {
      status: "error",
      message: "이미 종료된 일정은 수정할 수 없습니다.",
    };
  }

  const admin = getSupabaseAdminClient();

  const scheduleUpdate: GuestScheduleUpdate = {
    start_date:    startDate,
    end_date:      endDate,
    note:          note || null,
    contact_type:  contactType as "instagram" | "email" | "website",
    contact_value: contactValue,
  };

  const { error } = await admin
    .from("guest_schedules")
    .update(scheduleUpdate)
    .eq("id", scheduleId);

  if (error)
    return { status: "error", message: "일정 수정에 실패했습니다. 다시 시도해주세요." };

  revalidatePath("/studio");
  revalidatePath("/");
  redirect("/studio");
}

// ── deleteGuestSchedule ───────────────────────────────────────

/**
 * Guest Work 일정 삭제
 * - 본인 소유 확인 필수
 * - 소프트 삭제 없이 실제 삭제
 */
export async function deleteGuestSchedule(
  _prev: DeleteScheduleState,
  formData: FormData
): Promise<DeleteScheduleState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  const scheduleId = (formData.get("scheduleId") as string | null)?.trim() ?? "";

  if (!scheduleId) return { status: "error", message: "일정 정보를 찾을 수 없습니다." };

  // 소유권 확인
  const ownership = await verifyScheduleOwnership(scheduleId, user.id);
  if (!ownership.ok) return { status: "error", message: ownership.message };

  const admin = getSupabaseAdminClient();

  const { error } = await admin
    .from("guest_schedules")
    .delete()
    .eq("id", scheduleId);

  if (error)
    return { status: "error", message: "일정 삭제에 실패했습니다. 다시 시도해주세요." };

  revalidatePath("/studio");
  revalidatePath("/");
  redirect("/studio");
}
