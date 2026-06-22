"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

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

  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id, instagram_handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return { status: "error", message: "아티스트 프로필이 없습니다." };
  }

  const artistId: ArtistProfileRow["id"] = myProfile.id;
  const handle: string | null = (myProfile as { id: string; instagram_handle: string | null }).instagram_handle;

  const { data: maxOrderData } = await admin
    .from("portfolio_items")
    .select("sort_order")
    .eq("artist_id", artistId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  if (handle) {
    revalidatePath(`/artists/${handle}/portfolio`);
    revalidatePath(`/artists/${handle}`);
  }
  revalidatePath("/");

  return { status: "success" };
}

// ── deletePortfolioItem ───────────────────────────────────────

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

  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id, instagram_handle")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myProfile) {
    return { status: "error", message: "아티스트 프로필이 없습니다." };
  }

  const artistId: ArtistProfileRow["id"] = myProfile.id;
  const handle: string | null = (myProfile as { id: string; instagram_handle: string | null }).instagram_handle;

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

  if (handle) {
    revalidatePath(`/artists/${handle}/portfolio`);
    revalidatePath(`/artists/${handle}`);
  }
  revalidatePath("/");

  return { status: "success" };
}
