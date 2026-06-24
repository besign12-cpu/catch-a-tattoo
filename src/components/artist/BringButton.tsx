"use client";

/**
 * BringButton
 *
 * 정책:
 * - 비로그인 → 클릭 시 /auth/login 이동
 * - Base City 없음 → 설정 페이지 안내
 * - 본인 프로필 → 표시 안 함 (부모에서 처리)
 * - isBringing=true  → "Bringing" (활성) 상태
 * - isBringing=false → "Bring" (비활성) 상태
 * - pending 중 중복 클릭 방지
 */

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toggleBring, type BringState } from "@/actions/bring";

// ── Submit 버튼 (pending 처리) ───────────────────────────────

function BringSubmitButton({
  isBringing,
  label,
}: {
  isBringing: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={[
        "flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isBringing
          ? "border border-neutral-900 bg-neutral-900 text-white active:opacity-80"
          : "border border-neutral-200 bg-white text-neutral-500 active:bg-neutral-50",
      ].join(" ")}
      aria-label={label}
      aria-pressed={isBringing}
    >
      {pending ? (
        <span className="flex items-center gap-1">
          <svg
            className="animate-spin h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
        </span>
      ) : isBringing ? (
        "Bringing"
      ) : (
        "Bring"
      )}
    </button>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

interface BringButtonProps {
  artistId: string;
  artistHandle: string;
  artistDisplayName: string;
  isBringing: boolean;
  baseCity: string | null;
  isLoggedIn: boolean;
  /** Follow 여부 — Follow 안 한 상태에서 Bring 비활성 */
  isFollowing: boolean;
}

const initialState: BringState = { status: "idle" };

export function BringButton({
  artistId,
  artistHandle,
  artistDisplayName,
  isBringing: initialIsBringing,
  baseCity,
  isLoggedIn,
  isFollowing,
}: BringButtonProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(toggleBring, initialState);
  const prevStatus = useRef(state.status);

  useEffect(() => {
    if (state.status === "success" && prevStatus.current !== "success") {
      router.refresh();
    }
    prevStatus.current = state.status;
  }, [state.status, router]);

  // 비로그인 → 로그인 유도
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push(`/auth/login?next=/artists/${artistHandle}`)}
        className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-500 active:bg-neutral-50 transition-colors"
        aria-label={`${artistDisplayName} Bring This Artist (로그인 필요)`}
      >
        Bring
      </button>
    );
  }

  // Follow 안 한 상태 → Bring 비활성 (툴팁으로 Follow 유도)
  if (!isFollowing) {
    return (
      <button
        disabled
        className="flex items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-sm font-medium text-neutral-300 cursor-not-allowed select-none"
        aria-label="팔로우 후 Bring 가능"
        title="먼저 팔로우해주세요"
      >
        Bring
      </button>
    );
  }

  // Base City 없음 → 설정 안내
  if (!baseCity) {
    return (
      <button
        onClick={() => router.push("/me/settings")}
        className="flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-600 active:opacity-80 transition-colors"
        aria-label="Base City 설정 후 Bring 가능"
        title="Base City를 먼저 설정해주세요"
      >
        Bring
      </button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="artistId" value={artistId} />
      <input type="hidden" name="artistHandle" value={artistHandle} />

      <BringSubmitButton
        isBringing={initialIsBringing}
        label={
          initialIsBringing
            ? `${artistDisplayName} Bringing 취소`
            : `${artistDisplayName} Bring This Artist`
        }
      />

      {/* 에러 토스트 */}
      {state.status === "error" && (
        <p className="mt-1 text-[11px] text-red-500 text-center">
          {state.message}
        </p>
      )}
    </form>
  );
}
