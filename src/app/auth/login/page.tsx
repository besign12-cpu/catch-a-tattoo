"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, type SignInState } from "@/actions/auth";

const initialState: SignInState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-xl bg-cat-purple py-3.5
        text-sm font-semibold text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:opacity-90 active:opacity-80
        transition-opacity mt-2
      "
    >
      {pending ? "로그인 중..." : "로그인"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, initialState);

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

      {/* 폼 */}
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-white mb-6">로그인</h2>

        <form action={formAction} className="flex flex-col gap-4">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs text-white/50">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="
                w-full rounded-xl bg-white/5 border border-white/10
                px-4 py-3 text-sm text-white placeholder-white/20
                focus:outline-none focus:border-cat-purple/60
                transition-colors
              "
            />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs text-white/50">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="
                w-full rounded-xl bg-white/5 border border-white/10
                px-4 py-3 text-sm text-white placeholder-white/20
                focus:outline-none focus:border-cat-purple/60
                transition-colors
              "
            />
          </div>

          {/* 에러 메시지 */}
          {state.status === "error" && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {state.message}
            </p>
          )}

          <SubmitButton />
        </form>

        {/* 하단 링크 */}
        <p className="mt-6 text-center text-xs text-white/30">
          계정이 없으신가요?{" "}
          <Link
            href="/auth/signup"
            className="text-white/60 underline underline-offset-2 hover:text-white transition-colors"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
