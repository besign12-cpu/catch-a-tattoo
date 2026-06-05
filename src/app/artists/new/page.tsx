import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile } from "@/lib/queries/studio";
import { getAllTags } from "@/lib/queries/artists";
import { PageContainer } from "@/components/layout/PageContainer";
import { NewArtistForm } from "./NewArtistForm";

export const metadata: Metadata = {
  title: "아티스트 프로필 만들기",
};

export default async function NewArtistPage() {
  // ── 인증 확인 ──────────────────────────────────────────
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/artists/new");
  }

  // ── 이미 프로필 있으면 해당 페이지로 ──────────────────
  const existing = await getMyArtistProfile(user.id);
  if (existing?.instagramHandle) {
    redirect(`/artists/${existing.instagramHandle}`);
  }

  // ── 태그 조회 ──────────────────────────────────────────
  const tags = await getAllTags();

  return (
    <PageContainer>
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex h-[52px] items-center border-b border-neutral-100 bg-white px-4">
        <Link
          href="/me"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 text-center text-[13px] font-medium text-neutral-900">
          아티스트 프로필 만들기
        </h1>
        {/* 오른쪽 여백 균형 */}
        <div className="w-9" />
      </header>

      {/* 안내 배너 */}
      <div className="mx-4 mt-4 rounded-xl bg-cat-purple/5 border border-cat-purple/10 px-4 py-3">
        <p className="text-xs font-medium text-cat-purple">아티스트로 시작하기</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          프로필 생성 후 게스트워크 일정을 등록할 수 있습니다.
          관리자 승인 후 Verified 뱃지가 부여됩니다.
        </p>
      </div>

      {/* 폼 */}
      <NewArtistForm tags={tags} />
    </PageContainer>
  );
}
