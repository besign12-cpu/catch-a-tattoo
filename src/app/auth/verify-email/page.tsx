import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-cat-black flex flex-col items-center justify-center px-6">
      {/* 로고 */}
      <div className="mb-10 text-center">
        <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-1">
          Catch A
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          TATTOO
        </h1>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm text-center">
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Mail size={28} className="text-cat-purple" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-3">
          이메일을 확인해주세요
        </h2>
        <p className="text-sm text-white/40 leading-relaxed mb-8">
          가입하신 이메일로 인증 링크를 보냈습니다.
          <br />
          링크를 클릭하면 로그인됩니다.
        </p>

        {/* 스팸 안내 */}
        <p className="text-xs text-white/25 mb-8">
          이메일이 보이지 않는다면 스팸함을 확인해주세요.
        </p>

        {/* 로그인으로 돌아가기 */}
        <Link
          href="/auth/login"
          className="
            inline-flex items-center justify-center
            w-full rounded-xl border border-white/10
            py-3.5 text-sm font-medium text-white/60
            hover:text-white hover:border-white/20
            transition-colors
          "
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
