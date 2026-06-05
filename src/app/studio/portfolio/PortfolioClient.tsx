"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addPortfolioItem, deletePortfolioItem } from "@/actions/portfolio";
import type { AddPortfolioState, DeletePortfolioState } from "@/actions/portfolio";
import type { PortfolioItem } from "@/types";

// ── 추가 폼 Submit 버튼 ──────────────────────────────────────

function AddSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        shrink-0 rounded-xl bg-cat-black px-5 py-3
        text-sm font-semibold text-white
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:opacity-90 active:opacity-80
        transition-opacity
      "
    >
      {pending ? "추가 중..." : "추가"}
    </button>
  );
}

// ── 삭제 버튼 ────────────────────────────────────────────────

function DeleteButton({ itemId }: { itemId: string }) {
  const initialState: DeletePortfolioState = { status: "idle" };
  const [, formAction] = useFormState(deletePortfolioItem, initialState);
  const { pending } = useFormStatus();

  return (
    <form action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        disabled={pending}
        className="
          absolute top-2 right-2
          flex h-7 w-7 items-center justify-center
          rounded-full bg-black/60 text-white
          hover:bg-black/80 transition-colors
          disabled:opacity-40
        "
        aria-label="삭제"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </form>
  );
}

// ── 포트폴리오 추가 폼 ───────────────────────────────────────

const addInitialState: AddPortfolioState = { status: "idle" };

function AddPortfolioForm() {
  const [state, formAction] = useFormState(addPortfolioItem, addInitialState);

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-5">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        이미지 추가
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            className="
              flex-1 rounded-xl border border-neutral-200 bg-white
              px-4 py-3 text-sm text-neutral-900
              placeholder-neutral-300
              focus:border-cat-purple/50 focus:outline-none
              transition-colors
            "
          />
          <AddSubmitButton />
        </div>

        {state.status === "error" && (
          <p className="text-xs text-red-500">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-xs text-cat-green">이미지가 추가되었습니다.</p>
        )}

        <p className="text-[11px] text-neutral-400">
          이미지 URL을 입력하세요. (http:// 또는 https://로 시작)
        </p>
      </form>
    </div>
  );
}

// ── 이미지 그리드 ────────────────────────────────────────────

function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-10 text-center">
        <p className="text-sm text-neutral-400">
          등록된 포트폴리오 이미지가 없습니다.
        </p>
        <p className="mt-1 text-[11px] text-neutral-300">
          위에서 이미지 URL을 입력해 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-neutral-100 px-5 py-5">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
        포트폴리오 ({items.length}장)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt="포트폴리오 이미지"
              className="h-full w-full rounded-xl object-cover bg-neutral-100"
            />
            <DeleteButton itemId={item.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 메인 Client Component ─────────────────────────────────────

interface PortfolioClientProps {
  items: PortfolioItem[];
}

export function PortfolioClient({ items }: PortfolioClientProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4">
      <AddPortfolioForm />
      <PortfolioGrid items={items} />
    </div>
  );
}
