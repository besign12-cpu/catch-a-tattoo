"use client";

/**
 * FollowButton
 *
 * 정책:
 * - 비로그인 → 클릭 시 /auth/login 이동
 * - 본인 프로필 → 표시 안 함 (부모에서 isOwner 체크)
 * - isFollowing=true  → "팔로잉" (활성) 상태
 * - isFollowing=false → "팔로우" (비활성) 상태
 * - pending 중 중복 클릭 방지
 *
 * 사용처:
 * - Artist Profile 헤더 CTA 행 (flex-1 확장)
 * - FeedCard (compact 모드, 별도 스타일)
 */

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, type FollowState } from "@/actions/follow";
import { cn } from "@/lib/utils";

// ── Submit 버튼 ───────────────────────────────────────────────

function FollowSubmitButton({
  isFollowing,
  label,
  variant,
}: {
  isFollowing: boolean;
  label: string;
  variant: "profile" | "feed";
}) {
  const { pending } = useFormStatus();

  if (variant === "feed") {
    return (
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isFollowing
            ? "border-neutral-200 bg-neutral-100 text-neutral-500"
            : "border-neutral-300 bg-white text-neutral-800"
        )}
        aria-label={label}
        aria-pressed={isFollowing}
      >
        {pending ? "···" : isFollowing ? "팔로잉" : "팔로우"}
      </button>
    );
  }

  // profile variant: flex-1 확장형
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors active:opacity-80",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isFollowing
          ? "border border-neutral-200 bg-white text-neutral-600"
          : "bg-neutral-900 text-white"
      )}
      aria-label={label}
      aria-pressed={isFollowing}
    >
      {pending ? "···" : isFollowing ? "팔로잉" : "팔로우"}
    </button>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

interface FollowButtonProps {
  artistId: string;
  artistHandle: string;
  artistDisplayName: string;
  isFollowing: boolean;
  isLoggedIn: boolean;
  /** "profile": Artist Profile 헤더용 (flex-1) / "feed": FeedCard용 (compact) */
  variant?: "profile" | "feed";
}

const initialState: FollowState = { status: "idle" };

export function FollowButton({
  artistId,
  artistHandle,
  artistDisplayName,
  isFollowing: initialIsFollowing,
  isLoggedIn,
  variant = "profile",
}: FollowButtonProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(toggleFollow, initialState);
  const prevStatus = useRef(state.status);

  // 성공 시 서버 revalidate 반영
  useEffect(() => {
    if (state.status === "success" && prevStatus.current !== "success") {
      router.refresh();
    }
    prevStatus.current = state.status;
  }, [state.status, router]);

  // 비로그인 → 로그인 유도
  if (!isLoggedIn) {
    if (variant === "feed") {
      return (
        <button
          onClick={() =>
            router.push(`/auth/login?next=/artists/${artistHandle}`)
          }
          className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium leading-none text-neutral-800 transition-colors active:scale-95"
          aria-label={`${artistDisplayName} 팔로우 (로그인 필요)`}
        >
          팔로우
        </button>
      );
    }
    return (
      <button
        onClick={() =>
          router.push(`/auth/login?next=/artists/${artistHandle}`)
        }
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white active:opacity-80"
        aria-label={`${artistDisplayName} 팔로우 (로그인 필요)`}
      >
        팔로우
      </button>
    );
  }

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="artistId" value={artistId} />
        <input type="hidden" name="artistHandle" value={artistHandle} />

        <FollowSubmitButton
          isFollowing={initialIsFollowing}
          label={
            initialIsFollowing
              ? `${artistDisplayName} 언팔로우`
              : `${artistDisplayName} 팔로우`
          }
          variant={variant}
        />
      </form>

      {/* 에러 메시지 (profile 변형만) */}
      {variant === "profile" && state.status === "error" && (
        <p className="mt-1 text-center text-[11px] text-red-500">
          {state.message}
        </p>
      )}
    </>
  );
}
