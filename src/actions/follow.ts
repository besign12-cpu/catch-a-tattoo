"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type FollowInsert = Database["public"]["Tables"]["follows"]["Insert"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type FollowState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; action: "follow" | "unfollow" };

// ── toggleFollow ──────────────────────────────────────────────
//
// 정책 (001_init.sql 기준):
//  - follows 테이블: UNIQUE(follower_id, artist_id)
//  - 팔로우 = INSERT / 언팔로우 = DELETE (is_active 없음)
//  - 비로그인 → 에러 반환 (클라이언트에서 로그인 유도)
//  - 본인 아티스트 팔로우 불가

export async function toggleFollow(
  _prev: FollowState,
  formData: FormData
): Promise<FollowState> {
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

  // 본인 아티스트 프로필인지 확인
  const { data: myArtist } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("id", artistId)
    .maybeSingle();

  if (myArtist) {
    return { status: "error", message: "본인 프로필은 팔로우할 수 없습니다." };
  }

  // 기존 팔로우 여부 확인
  const { data: existing } = await admin
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (existing) {
    // 언팔로우: DELETE
    const { error } = await admin
      .from("follows")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return { status: "error", message: "언팔로우에 실패했습니다." };
    }

    if (artistHandle) revalidatePath(`/artists/${artistHandle}`);
    revalidatePath("/following");
    revalidatePath("/");

    return { status: "success", action: "unfollow" };
  }

  // 팔로우: INSERT
  const insertData: FollowInsert = {
    follower_id: user.id,
    artist_id: artistId,
  };

  const { error } = await admin.from("follows").insert(insertData);

  if (error) {
    // UNIQUE 위반 (race condition) — 이미 팔로우 중
    if (error.code === "23505") {
      return { status: "success", action: "follow" };
    }
    return { status: "error", message: "팔로우에 실패했습니다." };
  }

  if (artistHandle) revalidatePath(`/artists/${artistHandle}`);
  revalidatePath("/following");
  revalidatePath("/");

  return { status: "success", action: "follow" };
}

// ── getFollowStatus ───────────────────────────────────────────
//
// Artist Profile 서버 컴포넌트에서 사용
// - 현재 사용자의 팔로우 여부
// - 아티스트 전체 팔로워 수

export async function getFollowStatus(artistId: string): Promise<{
  isFollowing: boolean;
  followerCount: number;
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = getSupabaseAdminClient();

  // 전체 팔로워 수
  const { count: followerCount } = await admin
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artistId);

  if (!user) {
    return { isFollowing: false, followerCount: followerCount ?? 0 };
  }

  // 현재 사용자 팔로우 여부
  const { data: existing } = await admin
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();

  return {
    isFollowing: !!existing,
    followerCount: followerCount ?? 0,
  };
}
