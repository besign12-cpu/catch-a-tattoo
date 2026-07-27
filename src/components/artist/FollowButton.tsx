"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow, type FollowState } from "@/actions/follow";
import { useT } from "@/lib/hooks/useT";
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
  const t = useT("artist");

  if (variant === "feed") {
    return (
      <button
        type="submit"
        disabled={pending}
        className={cn(feedBase, isFollowing ? feedActive : feedInactive)}
        aria-label={label}
        aria-pressed={isFollowing}
      >
        {pending ? "···" : isFollowing ? t("following") : t("follow")}
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
      {pending ? "···" : isFollowing ? t("following") : t("follow")}
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
  /** 제공 시: 성공 직후 로컬 상태 갱신에 사용. router.refresh() 생략. */
  onSuccess?: (nowFollowing: boolean) => void;
}

const initialState: FollowState = { status: "idle" };

export function FollowButton({
  artistId,
  artistHandle,
  artistDisplayName,
  isFollowing: initialIsFollowing,
  isLoggedIn,
  variant = "profile",
  onSuccess,
}: FollowButtonProps) {
  const router = useRouter();
  const tf = useT("artist");
  const [state, formAction] = useFormState(toggleFollow, initialState);

  // 버튼 표시에 사용하는 로컬 state
  // - onSuccess 있는 경우: 성공 시 즉시 토글
  // - onSuccess 없는 경우: router.refresh() 후 prop 변경으로 동기화
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  // prop이 외부에서 변경될 때 동기화 (router.refresh() 후 profile variant)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // state 객체 참조를 보관 — 문자열이 아닌 객체 자체로 비교
  // success → success처럼 같은 status 문자열이 연속될 때도 새 제출을 감지
  const prevStateRef = useRef<FollowState>(state);

  useEffect(() => {
    // 이전과 동일한 객체면 재렌더링 — 처리하지 않음
    if (prevStateRef.current === state) return;

    // 새 객체 도착: 반드시 ref 갱신 먼저
    prevStateRef.current = state;

    if (state.status === "success") {
      if (onSuccess) {
        const nowFollowing = state.action === "follow";
        setIsFollowing(nowFollowing);
        onSuccess(nowFollowing);
      } else {
        router.refresh();
      }
    }
  // state 객체 참조가 바뀔 때만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── 비로그인: 로그인 유도 버튼
  // profile/feed 모두 동일한 클래스 체계 사용 → 크기 일관성 보장
  if (!isLoggedIn) {
    if (variant === "feed") {
      return (
        <button
          type="button"
          onClick={() => router.push(`/auth/login?next=/artists/${artistHandle}`)}
          className={cn(feedBase, feedInactive)}
          aria-label={`${artistDisplayName} ${tf("follow")}`}
        >
          {tf("follow")}
        </button>
      );
    }
    // profile: form 없이도 profileBase + profileInactive 그대로 적용 → 동일 크기
    return (
      <button
        type="button"
        onClick={() => router.push(`/auth/login?next=/artists/${artistHandle}`)}
        className={cn(profileBase, profileInactive)}
        aria-label={`${artistDisplayName} ${tf("follow")}`}
      >
        {tf("follow")}
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
            isFollowing={isFollowing}
            label={isFollowing
              ? `${artistDisplayName} ${tf("following")}`
              : `${artistDisplayName} ${tf("follow")}`}
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
          isFollowing={isFollowing}
          label={isFollowing
            ? `${artistDisplayName} ${tf("following")}`
            : `${artistDisplayName} ${tf("follow")}`}
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
