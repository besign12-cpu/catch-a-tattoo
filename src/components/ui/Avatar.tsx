import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AVATAR_COLORS: Record<string, string> = {
  A: "bg-purple-100 text-purple-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-green-100 text-green-700",
  D: "bg-amber-100 text-amber-700",
  E: "bg-red-100 text-red-700",
  F: "bg-pink-100 text-pink-700",
  G: "bg-indigo-100 text-indigo-700",
  H: "bg-teal-100 text-teal-700",
  Y: "bg-purple-100 text-purple-700",
  M: "bg-orange-100 text-orange-700",
  S: "bg-emerald-100 text-emerald-700",
  D2: "bg-amber-100 text-amber-700",
};

function getInitials(name: string): string {
  return name
    .replace(/[^a-zA-Z가-힣\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || name.slice(0, 2).toUpperCase();
}

function getColor(name: string): string {
  const first = name[0]?.toUpperCase() ?? "A";
  return (
    AVATAR_COLORS[first] ??
    "bg-neutral-100 text-neutral-600"
  );
}

export function Avatar({ name, imageUrl, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
  };

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover border border-neutral-200",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-neutral-200 font-medium",
        sizeClasses[size],
        getColor(name),
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
