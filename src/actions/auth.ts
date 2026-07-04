"use server";
import { getLocaleServer } from "@/lib/locale.server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// ─── 회원가입 ────────────────────────────────────────────────────────────────

export type SignUpState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function signUp(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { status: "error", message: "입력값이 올바르지 않습니다." };
  }

  const emailTrimmed = email.trim().toLowerCase();

  if (!emailTrimmed) {
    return { status: "error", message: "이메일을 입력해주세요." };
  }
  if (!password) {
    return { status: "error", message: "비밀번호를 입력해주세요." };
  }
  if (password.length < 8) {
    return { status: "error", message: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== confirmPassword) {
    return { status: "error", message: "비밀번호가 일치하지 않습니다." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: emailTrimmed,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { status: "error", message: "이미 가입된 이메일입니다." };
    }
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message: "가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.",
  };
}

// ─── 로그인 ────────────────────────────────────────────────────────────────

export type SignInState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get("email");
  const password = formData.get("password");
  // next: 로그인 후 돌아갈 경로 (예: /ko/me, /me)
  const next = (formData.get("next") as string | null)?.trim() || "/";

  if (typeof email !== "string" || typeof password !== "string") {
    return { status: "error", message: "입력값이 올바르지 않습니다." };
  }

  const emailTrimmed = email.trim().toLowerCase();

  if (!emailTrimmed) {
    return { status: "error", message: "이메일을 입력해주세요." };
  }
  if (!password) {
    return { status: "error", message: "비밀번호를 입력해주세요." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailTrimmed,
    password,
  });

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return {
        status: "error",
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        status: "error",
        message: "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.",
      };
    }
    return { status: "error", message: error.message };
  }

  // next 파라미터가 있으면 해당 경로로, 없으면 홈으로
  redirect(next);
}

// ─── 로그아웃 ────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  const { lp } = await getLocaleServer();
  redirect(lp || "/");
}
