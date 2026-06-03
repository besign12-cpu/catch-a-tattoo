import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = { title: "팔로우" };

// Sprint 5에서 실제 팔로우 데이터로 교체 예정
// 현재: 로그인 유도 + 빈 상태 UI

export default function FollowingPage() {
  return (
    <PageContainer className="bg-white">
      <header className="border-b border-neutral-100 px-4 py-3">
        <p className="text-[17px] font-medium text-neutral-900">팔로우</p>
      </header>

      {/* 비로그인 빈 상태 */}
      <div className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
          <Heart size={24} className="text-neutral-400" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-neutral-800">
            팔로우한 아티스트가 없습니다
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            아티스트를 팔로우하면<br />
            새 일정 알림을 받을 수 있습니다
          </p>
        </div>
        <a
          href="/"
          className="mt-1 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white active:opacity-80"
        >
          아티스트 찾기
        </a>
      </div>
    </PageContainer>
  );
}
