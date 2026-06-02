import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotFound() {
  return (
    <PageContainer>
      <div className="flex h-[calc(100vh-104px)] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl font-medium text-neutral-200">404</p>
        <p className="font-medium text-neutral-700">페이지를 찾을 수 없습니다</p>
        <p className="text-sm text-neutral-400">
          주소가 올바른지 확인해주세요.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 active:scale-95"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </PageContainer>
  );
}
