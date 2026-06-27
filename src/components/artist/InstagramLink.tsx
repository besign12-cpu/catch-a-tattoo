"use client";

/**
 * InstagramLink
 * Instagram 링크 클릭 시 analytics 이벤트 수집 (fire-and-forget)
 * 기존 <a> 태그와 동일한 UI 유지
 */

import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface InstagramLinkProps {
  artistId: string;
  instagramUrl: string;
  displayName: string;
  className?: string;
  children: React.ReactNode;
}

export function InstagramLink({
  artistId,
  instagramUrl,
  displayName,
  className,
  children,
}: InstagramLinkProps) {
  const { trackInstagramClick } = useAnalytics();

  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${displayName} Instagram`}
      onClick={() => trackInstagramClick(artistId)}
    >
      {children}
    </a>
  );
}
