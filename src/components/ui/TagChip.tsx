import { cn } from "@/lib/utils";
import type { Tag } from "@/types";

interface TagChipProps {
  tag: Tag;
  highlighted?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function TagChip({
  tag,
  highlighted = false,
  size = "sm",
  className,
}: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        highlighted
          ? "border-cat-black bg-cat-black text-white"
          : "border-neutral-200 bg-neutral-100 text-neutral-500",
        className
      )}
    >
      {tag.name}
    </span>
  );
}

interface TagListProps {
  tags: Tag[];
  highlightedSlugs?: string[];
  size?: "sm" | "md";
  max?: number;
  className?: string;
}

export function TagList({
  tags,
  highlightedSlugs = [],
  size = "sm",
  max,
  className,
}: TagListProps) {
  const displayed = max ? tags.slice(0, max) : tags;
  const remaining = max && tags.length > max ? tags.length - max : 0;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayed.map((tag) => (
        <TagChip
          key={tag.id}
          tag={tag}
          highlighted={highlightedSlugs.includes(tag.slug)}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400",
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
