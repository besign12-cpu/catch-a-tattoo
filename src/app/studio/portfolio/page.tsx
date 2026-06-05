import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMyArtistProfile, getMyPortfolio } from "@/lib/queries/studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { PortfolioClient } from "./PortfolioClient";

export const metadata: Metadata = {
  title: "포트폴리오 관리",
};

export default async function StudioPortfolioPage() {
  // ── 인증 확인 ────────────────────────────────────────────
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/studio/portfolio");
  }

  // ── 아티스트 프로필 확인 ─────────────────────────────────
  const profile = await getMyArtistProfile(user.id);

  if (!profile) {
    redirect("/artists/new");
  }

  // ── 포트폴리오 조회 ──────────────────────────────────────
  const items = await getMyPortfolio(profile.id);

  return (
    <PageContainer>
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 flex h-[52px] items-center border-b border-neutral-100 bg-white px-4">
        <Link
          href="/studio"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 text-center text-[13px] font-medium text-neutral-900">
          포트폴리오 관리
        </h1>
        <div className="w-9" />
      </header>

      <PortfolioClient items={items} />
    </PageContainer>
  );
}
