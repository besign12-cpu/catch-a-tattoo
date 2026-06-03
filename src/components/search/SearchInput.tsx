"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "아티스트 이름, 도시 검색",
  className,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(() => {
      // 도시명인지 아티스트명인지 구분 없이 /search 로 전달
      // 검색 페이지에서 양쪽 모두 시도
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    });
  }

  function handleClear() {
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 focus-within:border-neutral-400 focus-within:bg-white transition-colors">
        <Search
          size={15}
          className="shrink-0 text-neutral-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none"
          aria-label="검색어 입력"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-white"
            aria-label="검색어 지우기"
          >
            <X size={10} aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
