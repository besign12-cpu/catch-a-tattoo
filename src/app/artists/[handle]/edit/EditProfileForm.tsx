"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateArtistProfile, type UpdateArtistState } from "@/actions/artist";
import { TagSelector } from "@/components/artist/TagSelector";
import { CityDropdown } from "@/components/artist/CityDropdown";
import type { CityDropdownOption } from "@/components/artist/CityDropdown";
import type { Tag } from "@/types";

// ── Submit 버튼 ──────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-2xl bg-neutral-900 py-4
        text-sm font-semibold text-white
        disabled:opacity-40 disabled:cursor-not-allowed
        hover:opacity-90 active:opacity-80
        transition-opacity
      "
    >
      {pending ? "저장 중..." : "저장하기"}
    </button>
  );
}

// ── 입력 필드 ────────────────────────────────────────────────

interface FieldProps {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  hint?: string;
  type?: string;
  isTextarea?: boolean;
}

function Field({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  required,
  maxLength,
  hint,
  type = "text",
  isTextarea = false,
}: FieldProps) {
  const sharedClass = `
    w-full rounded-xl border border-neutral-200 bg-white
    px-4 py-3 text-sm text-neutral-900
    placeholder-neutral-300
    focus:border-neutral-400 focus:outline-none
    transition-colors
  `;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`${sharedClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={maxLength}
          className={sharedClass}
        />
      )}
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

// ── 메인 폼 ──────────────────────────────────────────────────

interface EditProfileFormProps {
  artistId: string;
  originalHandle: string;
  initialDisplayName: string;
  initialHandle: string;
  initialBio: string;
  initialBaseCity: string;
  initialBaseCountry: string;
  initialTagIds: string[];
  allTags: Tag[];
  cities: CityDropdownOption[];
}

const initialState: UpdateArtistState = { status: "idle" };

export function EditProfileForm({
  artistId,
  originalHandle,
  initialDisplayName,
  initialHandle,
  initialBio,
  initialBaseCity,
  initialBaseCountry,
  initialTagIds,
  allTags,
  cities,
}: EditProfileFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateArtistProfile, initialState);

  // 성공 시 본인 프로필 페이지로 이동
  useEffect(() => {
    if (state.status === "success") {
      router.push(`/artists/${state.handle}`);
      router.refresh();
    }
  }, [state.status, state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-6 px-4 pb-10 pt-4">
      {/* hidden: artistId, originalHandle */}
      <input type="hidden" name="artistId" value={artistId} />
      <input type="hidden" name="originalHandle" value={originalHandle} />

      {/* 에러 메시지 */}
      {state.status === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs text-red-600">{state.message}</p>
        </div>
      )}

      {/* 기본 정보 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          기본 정보
        </p>

        <Field
          id="displayName"
          name="displayName"
          label="표시 이름"
          defaultValue={initialDisplayName}
          placeholder="예: yuki.ink"
          required
          maxLength={50}
          hint="피드와 프로필에 표시되는 이름입니다."
        />

        <Field
          id="handle"
          name="handle"
          label="Instagram 핸들"
          defaultValue={initialHandle}
          placeholder="예: yuki.ink (@ 제외)"
          required
          maxLength={30}
          hint="영문 소문자, 숫자, ., _ 만 사용 가능합니다."
        />

        <Field
          id="bio"
          name="bio"
          label="소개"
          defaultValue={initialBio}
          placeholder="간단한 소개를 입력해주세요."
          maxLength={200}
          isTextarea
        />
      </section>

      {/* 활동 지역 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          활동 지역
        </p>
        <CityDropdown
          cities={cities}
          initialCityName={initialBaseCity}
          initialCountry={initialBaseCountry}
          required
          label="Base City"
          hint="주로 활동하는 도시를 선택해주세요."
        />
      </section>

      {/* 스타일 태그 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-white border border-neutral-100 px-5 py-5">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
            스타일 태그
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Color 1개 + Main Style 1개 필수 / 전체 최소 2개, 최대 6개
          </p>
        </div>
        <TagSelector tags={allTags} initialIds={initialTagIds} />
      </section>

      <SubmitButton />
    </form>
  );
}
