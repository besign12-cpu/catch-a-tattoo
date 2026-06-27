"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// ── 상태 타입 ─────────────────────────────────────────────────

export type UpdateBaseCityState =
  | { status: "idle" }
  | { status: "error"; message: string; daysLeft?: number }
  | { status: "success"; city: string; country: string };

export type UpdateInterestsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export type UpdateNotifState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

// ── updateBaseCity ────────────────────────────────────────────

export async function updateBaseCity(
  _prev: UpdateBaseCityState,
  formData: FormData
): Promise<UpdateBaseCityState> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  const cityId   = (formData.get("cityId")   as string | null)?.trim() ?? "";
  const cityName = (formData.get("cityName") as string | null)?.trim() ?? "";
  const country  = (formData.get("country")  as string | null)?.trim().toUpperCase() ?? "";

  if (!cityId || !cityName) return { status: "error", message: "도시를 선택해주세요." };
  if (!country || country.length !== 2) return { status: "error", message: "국가 정보가 올바르지 않습니다." };

  const admin = getSupabaseAdminClient();

  const { data: rpcResult, error: rpcError } = await admin.rpc("update_base_city", {
    p_user_id:      user.id,
    p_base_city:    cityName,
    p_base_country: country,
  });

  if (rpcError) return { status: "error", message: "Base City 변경 중 오류가 발생했습니다." };

  const result = rpcResult as { success: boolean; error?: string; days_left?: number };

  if (!result.success) {
    if (result.error === "rate_limited") {
      return {
        status: "error",
        message: `Base City는 30일에 한 번만 변경할 수 있습니다. ${result.days_left ?? 0}일 후 변경 가능합니다.`,
        daysLeft: result.days_left,
      };
    }
    return { status: "error", message: "Base City 변경에 실패했습니다." };
  }

  await admin.rpc("expire_bring_by_base_city_change", { p_user_id: user.id });

  revalidatePath("/me/settings");
  revalidatePath("/me");
  revalidatePath("/");

  return { status: "success", city: cityName, country };
}

// ── updateInterestTags ────────────────────────────────────────
//
// user_interests 테이블에 REPLACE (DELETE + INSERT) 방식으로 저장
// 최대 6개 제한

export async function updateInterestTags(
  _prev: UpdateInterestsState,
  formData: FormData
): Promise<UpdateInterestsState> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  const tagIds = formData.getAll("tagIds") as string[];

  if (tagIds.length > 6) {
    return { status: "error", message: "관심 장르는 최대 6개까지 선택할 수 있습니다." };
  }

  const admin = getSupabaseAdminClient();

  // 기존 관심 장르 전체 삭제
  const { error: deleteError } = await admin
    .from("user_interests")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return { status: "error", message: "저장에 실패했습니다. 다시 시도해주세요." };
  }

  // 새 관심 장르 삽입 (선택 항목 없으면 삽입 생략)
  if (tagIds.length > 0) {
    const rows = tagIds.map((tagId) => ({ user_id: user.id, tag_id: tagId }));
    const { error: insertError } = await admin.from("user_interests").insert(rows);

    if (insertError) {
      return { status: "error", message: "저장에 실패했습니다. 다시 시도해주세요." };
    }
  }

  revalidatePath("/me/settings");
  return { status: "success" };
}

// ── updateNotifications ───────────────────────────────────────
//
// users.notif_schedule / users.notif_bring 컬럼 업데이트

export async function updateNotifications(
  _prev: UpdateNotifState,
  formData: FormData
): Promise<UpdateNotifState> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  // checkbox: "on" / null
  const notifSchedule = formData.get("notifSchedule") === "on";
  const notifBring    = formData.get("notifBring")    === "on";

  const admin = getSupabaseAdminClient();

  const { error } = await admin
    .from("users")
    .update({
      notif_schedule: notifSchedule,
      notif_bring:    notifBring,
    })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: "알림 설정 저장에 실패했습니다." };
  }

  revalidatePath("/me/settings");
  return { status: "success" };
}
