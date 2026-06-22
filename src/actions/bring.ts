"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type CityFollowInsert =
  Database["public"]["Tables"]["city_follows"]["Insert"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type BringState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; action: "bring" | "cancel" };

// ── toggleBring ───────────────────────────────────────────────
//
// 정책 (005_bring_update.sql 기준):
//  - Bring 도시 = users.base_city (사용자가 선택 불가)
//  - is_active = true 인 기존 Bring이 있으면 → 취소 (is_active = false)
//  - 없으면 → 신규 Bring 생성
//  - 비로그인 → 에러 반환 (클라이언트에서 로그인 유도)
//  - base_city 없음 → 에러 반환

export async function toggleBring(
  _prev: BringState,
  formData: FormData
): Promise<BringState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  const artistId = (formData.get("artistId") as string | null)?.trim() ?? "";
  const artistHandle = (formData.get("artistHandle") as string | null)?.trim() ?? "";

  if (!artistId) {
    return { status: "error", message: "아티스트 정보를 찾을 수 없습니다." };
  }

  const admin = getSupabaseAdminClient();

  // users.base_city / base_country 조회 (Bring 도시 = Base City 고정)
  const { data: userData } = await admin
    .from("users")
    .select("base_city, base_country")
    .eq("id", user.id)
    .single();

  if (!userData?.base_city || !userData?.base_country) {
    return {
      status: "error",
      message: "Base City를 먼저 설정해주세요. (설정 > Base City)",
    };
  }

  const baseCity = userData.base_city;
  const baseCountry = userData.base_country;

  // 기존 활성 Bring 조회
  const { data: existing } = await admin
    .from("city_follows")
    .select("id, is_active")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .eq("city", baseCity)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    // 취소: is_active = false
    const { error } = await admin
      .from("city_follows")
      .update({
        is_active: false,
        expired_reason: null,
        expired_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { status: "error", message: "Bring 취소에 실패했습니다." };
    }

    if (artistHandle) revalidatePath(`/artists/${artistHandle}`);
    revalidatePath("/");

    return { status: "success", action: "cancel" };
  }

  // 신규 Bring 생성
  const insertData: CityFollowInsert = {
    user_id: user.id,
    artist_id: artistId,
    city: baseCity,
    country: baseCountry,
    is_active: true,
  };

  const { error } = await admin.from("city_follows").insert(insertData);

  if (error) {
    // unique 제약 위반: 이미 비활성 Bring이 있음 → 재활성화
    if (error.code === "23505") {
      const { error: updateError } = await admin
        .from("city_follows")
        .update({
          is_active: true,
          expired_reason: null,
          expired_at: null,
        })
        .eq("user_id", user.id)
        .eq("artist_id", artistId)
        .eq("city", baseCity);

      if (updateError) {
        return { status: "error", message: "Bring 등록에 실패했습니다." };
      }
    } else {
      return { status: "error", message: "Bring 등록에 실패했습니다." };
    }
  }

  if (artistHandle) revalidatePath(`/artists/${artistHandle}`);
  revalidatePath("/");

  return { status: "success", action: "bring" };
}

// ── getBringStatus ────────────────────────────────────────────
//
// 서버에서 현재 사용자의 Bring 여부와 Bring 수를 조회
// Artist Profile 페이지 서버 컴포넌트에서 사용

export async function getBringStatus(
  artistId: string,
  city: string
): Promise<{ isBringing: boolean; bringCount: number; baseCity: string | null }> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = getSupabaseAdminClient();

  // 전체 활성 Bring 수 (해당 아티스트 × 해당 도시)
  const { count: bringCount } = await admin
    .from("city_follows")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artistId)
    .eq("city", city)
    .eq("is_active", true);

  if (!user) {
    return { isBringing: false, bringCount: bringCount ?? 0, baseCity: null };
  }

  // 현재 사용자 Base City
  const { data: userData } = await admin
    .from("users")
    .select("base_city")
    .eq("id", user.id)
    .single();

  const baseCity = userData?.base_city ?? null;

  // 현재 사용자의 활성 Bring 여부 (Base City 기준)
  if (!baseCity) {
    return { isBringing: false, bringCount: bringCount ?? 0, baseCity: null };
  }

  const { data: myBring } = await admin
    .from("city_follows")
    .select("id")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .eq("city", baseCity)
    .eq("is_active", true)
    .maybeSingle();

  return {
    isBringing: !!myBring,
    bringCount: bringCount ?? 0,
    baseCity,
  };
}

// ── getCityBringCount ─────────────────────────────────────────
//
// City Page KPI용: 해당 도시 전체 활성 Bring 수

export async function getCityBringCount(city: string): Promise<number> {
  const admin = getSupabaseAdminClient();

  const { count } = await admin
    .from("city_follows")
    .select("id", { count: "exact", head: true })
    .eq("city", city)
    .eq("is_active", true);

  return count ?? 0;
}
