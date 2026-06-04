import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { TopBar } from "@/components/layout/TopBar";
import { signOut } from "@/actions/auth";

export default async function MePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware가 처리하지만, 서버에서도 이중 보호
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PageContainer>
      <TopBar title="내 정보" />
      <div className="flex flex-col gap-4 px-4 pt-6 pb-32">
        {/* 로그인 계정 정보 */}
        <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-5 flex flex-col gap-1.5 shadow-sm">
          <p className="text-xs text-neutral-400">로그인된 계정</p>
          <p className="text-sm text-neutral-900 font-medium">{user.email}</p>
        </div>

        {/* 로그아웃 */}
        <form action={signOut}>
          <button
            type="submit"
            className="
              w-full rounded-2xl border border-neutral-200
              py-4 text-sm text-neutral-500
              hover:text-neutral-900 hover:border-neutral-300
              transition-colors bg-white
            "
          >
            로그아웃
          </button>
        </form>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-neutral-300 mt-2">
          프로필 편집은 다음 업데이트에서 제공됩니다.
        </p>
      </div>
    </PageContainer>
  );
}
