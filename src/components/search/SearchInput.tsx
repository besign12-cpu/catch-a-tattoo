"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  className,
  placeholder = "아티스트 이름 또는 도시 검색",
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute left-3 text-neutral-400"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-8 pr-8 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {value.length > 0 && (
        <button
          onClick={handleClear}
          className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-300 text-white active:scale-95"
          aria-label="검색어 지우기"
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
