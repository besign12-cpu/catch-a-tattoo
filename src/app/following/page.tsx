import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { FollowingClient } from "./FollowingClient";
import { getFollowingData } from "@/lib/queries/following";

export const metadata: Metadata = { title: "팔로우" };

export default async function FollowingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 → 빈 데이터 + isLoggedIn=false
  if (!user) {
    return (
      <PageContainer>
        <FollowingClient
          schedules={[]}
          artists={[]}
          isLoggedIn={false}
        />
      </PageContainer>
    );
  }

  // 팔로우 아티스트 + 일정 실데이터 조회
  const { schedules, artists } = await getFollowingData(user.id);

  return (
    <PageContainer>
      <FollowingClient
        schedules={schedules}
        artists={artists}
        isLoggedIn={true}
      />
    </PageContainer>
  );
}
