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

// ── updateBaseCity ────────────────────────────────────────────

/**
 * Base City 변경
 * 1. update_base_city RPC 호출 (30일 제한 체크 + users 업데이트)
 * 2. 성공 시 expire_bring_by_base_city_change RPC 호출 (기존 Bring 종료)
 * 3. revalidatePath
 */
export async function updateBaseCity(
  _prev: UpdateBaseCityState,
  formData: FormData
): Promise<UpdateBaseCityState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  const cityId  = (formData.get("cityId")  as string | null)?.trim() ?? "";
  const cityName = (formData.get("cityName") as string | null)?.trim() ?? "";
  const country = (formData.get("country") as string | null)?.trim().toUpperCase() ?? "";

  if (!cityId || !cityName) {
    return { status: "error", message: "도시를 선택해주세요." };
  }
  if (!country || country.length !== 2) {
    return { status: "error", message: "국가 정보가 올바르지 않습니다." };
  }

  const admin = getSupabaseAdminClient();

  // update_base_city RPC — 30일 제한 체크 + users 업데이트
  const { data: rpcResult, error: rpcError } = await admin.rpc(
    "update_base_city",
    {
      p_user_id:     user.id,
      p_base_city:   cityName,
      p_base_country: country,
    }
  );

  if (rpcError) {
    return {
      status: "error",
      message: "Base City 변경 중 오류가 발생했습니다.",
    };
  }

  // RPC 반환값 파싱: { success: boolean, error?: string, days_left?: number }
  const result = rpcResult as { success: boolean; error?: string; days_left?: number };

  if (!result.success) {
    if (result.error === "rate_limited") {
      return {
        status: "error",
        message: `Base City는 30일에 한 번만 변경할 수 있습니다. ${result.days_left ?? 0}일 후 변경 가능합니다.`,
        daysLeft: result.days_left,
      };
    }
    return {
      status: "error",
      message: "Base City 변경에 실패했습니다.",
    };
  }

  // 기존 Bring 종료 — expire_bring_by_base_city_change RPC
  // 실패해도 Base City 변경은 이미 완료됐으므로 에러로 처리하지 않음
  await admin.rpc("expire_bring_by_base_city_change", {
    p_user_id: user.id,
  });

  revalidatePath("/me/settings");
  revalidatePath("/me");
  revalidatePath("/");

  return { status: "success", city: cityName, country };
}

// ── updateInterestTags ────────────────────────────────────────

/**
 * 관심 장르 태그 저장
 * - users 테이블에 직접 저장 컬럼 없음 → Sprint 5에서 user_interests 테이블 추가 예정
 * - 현재: UI 구조만 구현, 실저장은 placeholder
 */
export async function updateInterestTags(
  _prev: UpdateInterestsState,
  formData: FormData
): Promise<UpdateInterestsState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  // Sprint 5: user_interests 테이블 생성 후 실저장 구현 예정
  // 현재: tagIds만 파싱 후 성공 반환 (UI 흐름 확인용)
  const tagIds = formData.getAll("tagIds") as string[];

  if (tagIds.length > 6) {
    return { status: "error", message: "관심 장르는 최대 6개까지 선택할 수 있습니다." };
  }

  // TODO Sprint 5: user_interests insert/upsert

  revalidatePath("/me/settings");
  return { status: "success" };
}
