"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

// ── DB 타입 직접 추출 ─────────────────────────────────────────
// database.types.ts에 Relationships: [] 추가 이후
// SupabaseClient<Database>에서 .select().maybeSingle() 타입 추론 정상 작동

type ArtistProfileRow =
  Database["public"]["Tables"]["artist_profiles"]["Row"];
type PortfolioItemInsert =
  Database["public"]["Tables"]["portfolio_items"]["Insert"];
type PortfolioItemRow =
  Database["public"]["Tables"]["portfolio_items"]["Row"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type AddPortfolioState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export type DeletePortfolioState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

// ── URL 검증 헬퍼 ─────────────────────────────────────────────

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// ── addPortfolioItem ──────────────────────────────────────────

/**
 * 포트폴리오 이미지 추가
 * - 본인 artist_profiles id 확인 후 portfolio_items insert
 * - sort_order는 기존 최대값 + 1
 */
export async function addPortfolioItem(
  _prev: AddPortfolioState,
  formData: FormData
): Promise<AddPortfolioState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() ?? "";

  if (!imageUrl) {
    return { status: "error", message: "이미지 URL을 입력해주세요." };
  }
  if (!isValidImageUrl(imageUrl)) {
    return {
      status: "error",
      message: "올바른 이미지 URL을 입력해주세요. (http:// 또는 https://로 시작)",
    };
  }

  const admin = getSupabaseAdminClient();

  // 본인 아티스트 프로필 확인
  // SupabaseClient<Database> + Relationships: [] 추가로 타입 추론 정상
  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return { status: "error", message: "아티스트 프로필이 없습니다." };
  }

  // DB Row 타입에서 직접 id 타입 추출 (as any 없이)
  const artistId: ArtistProfileRow["id"] = myProfile.id;

  // 현재 최대 sort_order 조회
  const { data: maxOrderData } = await admin
    .from("portfolio_items")
    .select("sort_order")
    .eq("artist_id", artistId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  // DB Row 타입에서 직접 sort_order 타입 추출 (as any 없이)
  const maxSortOrder: PortfolioItemRow["sort_order"] | null =
    maxOrderData?.sort_order ?? null;
  const nextSortOrder: number = maxSortOrder !== null ? maxSortOrder + 1 : 0;

  const insertData: PortfolioItemInsert = {
    artist_id: artistId,
    image_url: imageUrl,
    sort_order: nextSortOrder,
  };

  const { error } = await admin.from("portfolio_items").insert(insertData);

  if (error) {
    return {
      status: "error",
      message: "이미지 추가에 실패했습니다. 다시 시도해주세요.",
    };
  }

  revalidatePath("/studio/portfolio");
  revalidatePath("/studio");

  return { status: "success" };
}

// ── deletePortfolioItem ───────────────────────────────────────

/**
 * 포트폴리오 이미지 삭제
 * - 본인 소유 확인 후 삭제
 */
export async function deletePortfolioItem(
  _prev: DeletePortfolioState,
  formData: FormData
): Promise<DeletePortfolioState> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  const itemId = (formData.get("itemId") as string | null)?.trim() ?? "";

  if (!itemId) {
    return { status: "error", message: "삭제할 항목을 찾을 수 없습니다." };
  }

  const admin = getSupabaseAdminClient();

  // 본인 아티스트 프로필 확인
  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return { status: "error", message: "아티스트 프로필이 없습니다." };
  }

  // DB Row 타입에서 직접 id 타입 추출 (as any 없이)
  const artistId: ArtistProfileRow["id"] = myProfile.id;

  // 본인 소유 확인 후 삭제
  const { error } = await admin
    .from("portfolio_items")
    .delete()
    .eq("id", itemId)
    .eq("artist_id", artistId);

  if (error) {
    return {
      status: "error",
      message: "삭제에 실패했습니다. 다시 시도해주세요.",
    };
  }

  revalidatePath("/studio/portfolio");
  revalidatePath("/studio");

  return { status: "success" };
}
