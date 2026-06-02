import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({ size = 14, className }: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      size={size}
      className={cn("text-blue-600 shrink-0", className)}
      aria-label="인증됨"
    />
  );
}
