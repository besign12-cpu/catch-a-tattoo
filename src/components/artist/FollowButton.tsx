"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, type FollowState } from "@/actions/follow";
import { cn } from "@/lib/utils";

// ── 공통 클래스 ───────────────────────────────────────────────
// profile variant는 로그인 여부와 무관하게 동일한 크기/레이아웃

const profileBase =
  "flex flex-1 items-center justify-center rounded-xl py-2.5 text-sm font-medium transition-colors active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed";

const profileActive   = "border border-neutral-200 bg-white text-neutral-600";
const profileInactive = "bg-neutral-900 text-white";

const feedBase =
  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const feedActive   = "border-neutral-200 bg-neutral-100 text-neutral-500";
const feedInactive = "border-neutral-300 bg-white text-neutral-800";

// ── Submit 버튼 (form 안에서 pending 처리) ────────────────────

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
        className={cn(feedBase, isFollowing ? feedActive : feedInactive)}
        aria-label={label}
        aria-pressed={isFollowing}
      >
        {pending ? "···" : isFollowing ? "팔로잉" : "팔로우"}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(profileBase, isFollowing ? profileActive : profileInactive)}
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

  useEffect(() => {
    if (state.status === "success" && prevStatus.current !== "success") {
      router.refresh();
    }
    prevStatus.current = state.status;
  }, [state.status, router]);

  // ── 비로그인: 로그인 유도 버튼
  // profile/feed 모두 동일한 클래스 체계 사용 → 크기 일관성 보장
  if (!isLoggedIn) {
    if (variant === "feed") {
      return (
        <button
          type="button"
          onClick={() => router.push(`/auth/login?next=/artists/${artistHandle}`)}
          className={cn(feedBase, feedInactive)}
          aria-label={`${artistDisplayName} 팔로우 (로그인 필요)`}
        >
          팔로우
        </button>
      );
    }
    // profile: form 없이도 profileBase + profileInactive 그대로 적용 → 동일 크기
    return (
      <button
        type="button"
        onClick={() => router.push(`/auth/login?next=/artists/${artistHandle}`)}
        className={cn(profileBase, profileInactive)}
        aria-label={`${artistDisplayName} 팔로우 (로그인 필요)`}
      >
        팔로우
      </button>
    );
  }

  // ── 로그인: form + FollowSubmitButton
  // profile variant: form에 flex-1을 부여해 버튼 너비를 비로그인과 동일하게 유지
  if (variant === "feed") {
    return (
      <>
        <form action={formAction}>
          <input type="hidden" name="artistId" value={artistId} />
          <input type="hidden" name="artistHandle" value={artistHandle} />
          <FollowSubmitButton
            isFollowing={initialIsFollowing}
            label={initialIsFollowing
              ? `${artistDisplayName} 언팔로우`
              : `${artistDisplayName} 팔로우`}
            variant="feed"
          />
        </form>
        {state.status === "error" && (
          <p className="mt-1 text-center text-[11px] text-red-500">
            {state.message}
          </p>
        )}
      </>
    );
  }

  // profile: form 자체에 flex-1 부여 → 비로그인 <button flex-1>과 동일 너비
  return (
    <>
      <form action={formAction} className="flex flex-1">
        <input type="hidden" name="artistId" value={artistId} />
        <input type="hidden" name="artistHandle" value={artistHandle} />
        <FollowSubmitButton
          isFollowing={initialIsFollowing}
          label={initialIsFollowing
            ? `${artistDisplayName} 언팔로우`
            : `${artistDisplayName} 팔로우`}
          variant="profile"
        />
      </form>
      {state.status === "error" && (
        <p className="mt-1 text-center text-[11px] text-red-500">
          {state.message}
        </p>
      )}
    </>
  );
}
