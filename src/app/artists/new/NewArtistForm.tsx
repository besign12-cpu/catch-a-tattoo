"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createArtistProfile, type CreateArtistState } from "@/actions/artist";
import { TagSelector } from "@/components/artist/TagSelector";
import type { Tag } from "@/types";

// ── Submit 버튼 ──────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-2xl bg-cat-black py-4
        text-sm font-semibold text-white
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:opacity-90 active:opacity-80
        transition-opacity
      "
    >
      {pending ? "프로필 생성 중..." : "아티스트 프로필 만들기"}
    </button>
  );
}

// ── 입력 필드 ────────────────────────────────────────────────

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  hint?: string;
  type?: string;
}

function Field({
  id,
  name,
  label,
  placeholder,
  required,
  maxLength,
  hint,
  type = "text",
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="ml-0.5 text-cat-purple">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className="
          w-full rounded-xl border border-neutral-200 bg-white
          px-4 py-3 text-sm text-neutral-900
          placeholder-neutral-300
          focus:border-cat-purple/50 focus:outline-none
          transition-colors
        "
      />
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

// ── 메인 폼 ──────────────────────────────────────────────────

interface NewArtistFormProps {
  tags: Tag[];
}

const initialState: CreateArtistState = { status: "idle" };

export function NewArtistForm({ tags }: NewArtistFormProps) {
  const [state, formAction] = useFormState(createArtistProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6 px-4 pb-10 pt-4">
      {/* 에러 메시지 */}
      {state.status === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs text-red-600">{state.message}</p>
        </div>
      )}

      {/* 기본 정보 섹션 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          기본 정보
        </p>

        <Field
          id="displayName"
          name="displayName"
          label="표시 이름"
          placeholder="예: yuki.ink"
          required
          maxLength={50}
          hint="피드와 프로필에 표시되는 이름입니다."
        />

        <Field
          id="handle"
          name="handle"
          label="Instagram 핸들"
          placeholder="예: yuki.ink (@ 제외)"
          required
          maxLength={30}
          hint="영문 소문자, 숫자, ., _ 만 사용 가능합니다."
        />

        <Field
          id="bio"
          name="bio"
          label="소개"
          placeholder="간단한 소개를 입력해주세요."
          maxLength={200}
        />
      </section>

      {/* 활동 지역 섹션 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          활동 지역
        </p>

        <Field
          id="baseCity"
          name="baseCity"
          label="Base City"
          placeholder="예: Seoul"
          required
          hint="주로 활동하는 도시명 (영문)"
        />

        <Field
          id="baseCountry"
          name="baseCountry"
          label="Country Code"
          placeholder="예: KR"
          required
          maxLength={2}
          hint="2자리 국가 코드 (KR, JP, US, FR 등)"
        />
      </section>

      {/* 태그 섹션 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            스타일 태그
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Color 1개 + Main Style 1개 필수 / 전체 최소 2개, 최대 6개
          </p>
        </div>
        {/* TagSelector 내부 hidden input이 form submit에 자동 포함됨 */}
        <TagSelector tags={tags} />
      </section>

      <SubmitButton />
    </form>
  );
}
