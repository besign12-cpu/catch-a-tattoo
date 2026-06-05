"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

// ── DB 타입 직접 추출 ─────────────────────────────────────────
// admin.ts에서 SupabaseClient<Database> 반환 타입이 명시되어
// .from().insert()/.update() 타입 추론이 정상 작동함

type ArtistProfileInsert =
  Database["public"]["Tables"]["artist_profiles"]["Insert"];
type ArtistProfileRow =
  Database["public"]["Tables"]["artist_profiles"]["Row"];
type ArtistProfileUpdate =
  Database["public"]["Tables"]["artist_profiles"]["Update"];
type ArtistTagInsert =
  Database["public"]["Tables"]["artist_tags"]["Insert"];
type UsersUpdate =
  Database["public"]["Tables"]["users"]["Update"];

// ── 상태 타입 ─────────────────────────────────────────────────

export type CreateArtistState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export type UpdateArtistState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; handle: string };

// ── 유효성 검사 헬퍼 ─────────────────────────────────────────

/** instagram handle 허용 문자: 영문 소문자, 숫자, ., _ (1~30자) */
function isValidHandle(handle: string): boolean {
  return /^[a-z0-9._]{1,30}$/.test(handle);
}

// ── createArtistProfile ───────────────────────────────────────

/**
 * Artist Profile 생성
 * - artist_profiles 테이블 insert (admin 클라이언트 — RLS 우회)
 * - artist_tags 테이블 insert
 * - users 테이블 role → "artist" 업데이트
 * - 성공 시 /artists/:handle 로 redirect
 */
export async function createArtistProfile(
  _prev: CreateArtistState,
  formData: FormData
): Promise<CreateArtistState> {
  // ── 세션 확인 ────────────────────────────────────────────
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  // ── 폼 데이터 파싱 ───────────────────────────────────────
  const displayName =
    (formData.get("displayName") as string | null)?.trim() ?? "";
  const handle =
    (formData.get("handle") as string | null)
      ?.trim()
      .toLowerCase()
      .replace(/^@/, "") ?? "";
  const bio = (formData.get("bio") as string | null)?.trim() ?? "";
  const baseCity =
    (formData.get("baseCity") as string | null)?.trim() ?? "";
  const baseCountry =
    (formData.get("baseCountry") as string | null)
      ?.trim()
      .toUpperCase() ?? "";
  const tagIds = formData.getAll("tagIds") as string[];

  // ── 유효성 검사 ──────────────────────────────────────────
  if (!displayName) {
    return { status: "error", message: "이름을 입력해주세요." };
  }
  if (displayName.length > 50) {
    return { status: "error", message: "이름은 50자 이하로 입력해주세요." };
  }
  if (!handle) {
    return { status: "error", message: "Instagram 핸들을 입력해주세요." };
  }
  if (!isValidHandle(handle)) {
    return {
      status: "error",
      message: "핸들은 영문 소문자, 숫자, ., _ 만 사용 가능합니다. (최대 30자)",
    };
  }
  if (!baseCity) {
    return { status: "error", message: "활동 도시를 입력해주세요." };
  }
  if (!baseCountry) {
    return { status: "error", message: "국가 코드를 입력해주세요." };
  }
  if (baseCountry.length !== 2) {
    return {
      status: "error",
      message: "국가 코드는 2자리 영문 (예: KR, JP) 입니다.",
    };
  }
  if (tagIds.length < 2) {
    return { status: "error", message: "태그를 최소 2개 선택해주세요." };
  }
  if (tagIds.length > 6) {
    return {
      status: "error",
      message: "태그는 최대 6개까지 선택 가능합니다.",
    };
  }

  const admin = getSupabaseAdminClient();

  // ── 중복 핸들 확인 ───────────────────────────────────────
  const { data: existing } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("instagram_handle", handle)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "이미 사용 중인 Instagram 핸들입니다.",
    };
  }

  // ── 이미 아티스트 프로필 있는지 확인 ────────────────────
  const { data: myProfile } = await admin
    .from("artist_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (myProfile) {
    return {
      status: "error",
      message: "이미 아티스트 프로필이 있습니다.",
    };
  }

  // ── artist_profiles insert ───────────────────────────────
  const profileInsert: ArtistProfileInsert = {
    user_id: user.id,
    display_name: displayName,
    instagram_handle: handle,
    bio: bio || null,
    base_city: baseCity,
    base_country: baseCountry,
    is_claimed: true,
    is_verified: false,
    contact_type: "instagram",
    contact_value: `@${handle}`,
  };

  const { data: newArtist, error: insertError } = await admin
    .from("artist_profiles")
    .insert(profileInsert)
    .select("id")
    .single();

  if (insertError || !newArtist) {
    return {
      status: "error",
      message: "프로필 생성에 실패했습니다. 다시 시도해주세요.",
    };
  }

  const artistId = (newArtist as Pick<ArtistProfileRow, "id">).id;

  // ── artist_tags insert ───────────────────────────────────
  const tagRows: ArtistTagInsert[] = tagIds.map((tagId) => ({
    artist_id: artistId,
    tag_id: tagId,
  }));

  const { error: tagError } = await admin
    .from("artist_tags")
    .insert(tagRows);

  if (tagError) {
    await admin.from("artist_profiles").delete().eq("id", artistId);
    return { status: "error", message: "태그 저장 중 오류가 발생했습니다." };
  }

  // ── users role → "artist" 업데이트 ──────────────────────
  const userUpdate: UsersUpdate = { role: "artist" };
  await admin.from("users").update(userUpdate).eq("id", user.id);

  redirect(`/artists/${handle}`);
}

// ── updateArtistProfile ───────────────────────────────────────

/**
 * Artist Profile 수정
 * - artist_profiles 테이블 update (admin 클라이언트 — RLS 우회)
 * - artist_tags 기존 전체 삭제 후 재삽입
 * - 핸들 변경 시 중복 확인
 * - 성공 시 { status: "success", handle: newHandle } 반환
 *   (redirect는 Client Component에서 처리)
 */
export async function updateArtistProfile(
  _prev: UpdateArtistState,
  formData: FormData
): Promise<UpdateArtistState> {
  // ── 세션 확인 ────────────────────────────────────────────
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "로그인이 필요합니다." };
  }

  // ── 폼 데이터 파싱 ───────────────────────────────────────
  const artistId =
    (formData.get("artistId") as string | null)?.trim() ?? "";
  const originalHandle =
    (formData.get("originalHandle") as string | null)?.trim() ?? "";
  const displayName =
    (formData.get("displayName") as string | null)?.trim() ?? "";
  const handle =
    (formData.get("handle") as string | null)
      ?.trim()
      .toLowerCase()
      .replace(/^@/, "") ?? "";
  const bio = (formData.get("bio") as string | null)?.trim() ?? "";
  const baseCity =
    (formData.get("baseCity") as string | null)?.trim() ?? "";
  const baseCountry =
    (formData.get("baseCountry") as string | null)
      ?.trim()
      .toUpperCase() ?? "";
  const tagIds = formData.getAll("tagIds") as string[];

  // ── 유효성 검사 ──────────────────────────────────────────
  if (!artistId) {
    return { status: "error", message: "프로필 정보를 찾을 수 없습니다." };
  }
  if (!displayName) {
    return { status: "error", message: "이름을 입력해주세요." };
  }
  if (displayName.length > 50) {
    return { status: "error", message: "이름은 50자 이하로 입력해주세요." };
  }
  if (!handle) {
    return { status: "error", message: "Instagram 핸들을 입력해주세요." };
  }
  if (!isValidHandle(handle)) {
    return {
      status: "error",
      message: "핸들은 영문 소문자, 숫자, ., _ 만 사용 가능합니다. (최대 30자)",
    };
  }
  if (!baseCity) {
    return { status: "error", message: "활동 도시를 입력해주세요." };
  }
  if (!baseCountry) {
    return { status: "error", message: "국가 코드를 입력해주세요." };
  }
  if (baseCountry.length !== 2) {
    return {
      status: "error",
      message: "국가 코드는 2자리 영문 (예: KR, JP) 입니다.",
    };
  }
  if (tagIds.length < 2) {
    return { status: "error", message: "태그를 최소 2개 선택해주세요." };
  }
  if (tagIds.length > 6) {
    return {
      status: "error",
      message: "태그는 최대 6개까지 선택 가능합니다.",
    };
  }

  const admin = getSupabaseAdminClient();

  // ── 핸들 변경 시 중복 확인 ───────────────────────────────
  if (handle !== originalHandle) {
    const { data: existing } = await admin
      .from("artist_profiles")
      .select("id")
      .eq("instagram_handle", handle)
      .maybeSingle();

    if (existing) {
      return {
        status: "error",
        message: "이미 사용 중인 Instagram 핸들입니다.",
      };
    }
  }

  // ── artist_profiles update ───────────────────────────────
  const profileUpdate: ArtistProfileUpdate = {
    display_name: displayName,
    instagram_handle: handle,
    bio: bio || null,
    base_city: baseCity,
    base_country: baseCountry,
    contact_value: `@${handle}`,
  };

  const { error: updateError } = await admin
    .from("artist_profiles")
    .update(profileUpdate)
    .eq("id", artistId);

  if (updateError) {
    return {
      status: "error",
      message: "프로필 수정에 실패했습니다. 다시 시도해주세요.",
    };
  }

  // ── artist_tags 전체 삭제 후 재삽입 ─────────────────────
  const { error: deleteError } = await admin
    .from("artist_tags")
    .delete()
    .eq("artist_id", artistId);

  if (deleteError) {
    return { status: "error", message: "태그 업데이트 중 오류가 발생했습니다." };
  }

  const tagRows: ArtistTagInsert[] = tagIds.map((tagId) => ({
    artist_id: artistId,
    tag_id: tagId,
  }));

  const { error: tagError } = await admin
    .from("artist_tags")
    .insert(tagRows);

  if (tagError) {
    return { status: "error", message: "태그 저장 중 오류가 발생했습니다." };
  }

  return { status: "success", handle };
}
