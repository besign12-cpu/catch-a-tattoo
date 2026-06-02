"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CITY_FILTERS } from "@/data/dummy";

export function CityFilterBar() {
  const [active, setActive] = useState("전체");

  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none"
      role="group"
      aria-label="도시 필터"
    >
      {CITY_FILTERS.map((city) => (
        <button
          key={city}
          onClick={() => setActive(city)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium leading-none transition-colors active:scale-95",
            active === city
              ? "border-cat-black bg-cat-black text-white"
              : "border-neutral-200 bg-white text-neutral-500"
          )}
          aria-pressed={active === city}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
