"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputBaseProps {
  className?: string;
  placeholder?: string;
}

/** Controlled 모드 — 홈에서 사용 */
interface ControlledProps extends SearchInputBaseProps {
  value: string;
  onChange: (value: string) => void;
}

/** Uncontrolled 모드 — /search 페이지에서 사용 (기존 방식) */
interface UncontrolledProps extends SearchInputBaseProps {
  value?: undefined;
  onChange?: undefined;
}

type SearchInputProps = ControlledProps | UncontrolledProps;

export function SearchInput({
  value,
  onChange,
  className,
  placeholder = "아티스트 이름 또는 도시 검색",
}: SearchInputProps) {
  const isControlled = value !== undefined && onChange !== undefined;

  /* Uncontrolled 전용 내부 state */
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentValue = isControlled ? value : internalValue;

  function handleChange(next: string) {
    if (isControlled) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isControlled && e.key === "Enter") {
      const q = internalValue.trim();
      if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  function handleClear() {
    handleChange("");
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
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-8 pr-8 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {currentValue.length > 0 && (
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
