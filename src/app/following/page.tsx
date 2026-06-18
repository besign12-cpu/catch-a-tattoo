import type { Metadata } from "next";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { FollowingClient } from "./FollowingClient";
import type {
  FollowingScheduleItem,
  FollowingArtistItem,
} from "./FollowingClient";

export const metadata: Metadata = { title: "팔로우" };

export default async function FollowingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인: 빈 데이터 + isLoggedIn=false → FollowingClient에서 Empty State 처리
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

  // Sprint 5에서 실데이터 쿼리로 교체 예정
  // 현재: 빈 배열 전달 (탭 구조 + Empty State UI 확인용)
  const schedules: FollowingScheduleItem[] = [];
  const artists: FollowingArtistItem[] = [];

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
