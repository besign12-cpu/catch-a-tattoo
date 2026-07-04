"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/hooks/useT";

export function BackButton() {
  const router = useRouter();
  const t = useT("artist");

  return (
    <button
      onClick={() => router.back()}
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
      aria-label={t("backToProfile")}
    >
      <ArrowLeft size={20} />
    </button>
  );
}
