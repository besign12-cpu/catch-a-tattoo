/**
 * POST /api/follow
 * Following 탭 전용: useFormState 없이 fetch로 호출
 * → 서버 재렌더 없음 → Following 탭 카드 유지
 *
 * body: { artistId: string, artistHandle: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type FollowInsert = Database["public"]["Tables"]["follows"]["Insert"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json() as { artistId?: string; artistHandle?: string };
    const artistId     = body.artistId?.trim()     ?? "";
    const artistHandle = body.artistHandle?.trim() ?? "";

    if (!artistId) {
      return NextResponse.json({ error: "아티스트 정보가 없습니다." }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();

    // 본인 팔로우 방지
    const { data: myArtist } = await admin
      .from("artist_profiles")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", artistId)
      .maybeSingle();

    if (myArtist) {
      return NextResponse.json({ error: "본인 프로필은 팔로우할 수 없습니다." }, { status: 400 });
    }

    // 기존 팔로우 여부
    const { data: existing } = await admin
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("artist_id", artistId)
      .maybeSingle();

    if (existing) {
      // 언팔로우: DELETE
      const { error } = await admin.from("follows").delete().eq("id", existing.id);
      if (error) return NextResponse.json({ error: "언팔로우 실패" }, { status: 500 });

      // Unfollow 시 활성 Bring 자동 취소
      await admin
        .from("city_follows")
        .update({ is_active: false, expired_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("artist_id", artistId)
        .eq("is_active", true);

      // /artists/:handle 만 revalidate (Following 페이지는 하지 않음)
      if (artistHandle) {
        const { revalidatePath } = await import("next/cache");
        revalidatePath(`/artists/${artistHandle}`);
      }

      return NextResponse.json({ action: "unfollow" });
    }

    // 팔로우: INSERT
    const insertData: FollowInsert = { follower_id: user.id, artist_id: artistId };
    const { error } = await admin.from("follows").insert(insertData);

    if (error) {
      if (error.code === "23505") return NextResponse.json({ action: "follow" });
      return NextResponse.json({ error: "팔로우 실패" }, { status: 500 });
    }

    if (artistHandle) {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/artists/${artistHandle}`);
    }

    return NextResponse.json({ action: "follow" });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
