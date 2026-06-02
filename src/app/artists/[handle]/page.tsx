import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Share2, MoreVertical, Instagram, Image } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { TagList } from "@/components/ui/TagChip";
import { ScheduleBlock } from "@/components/schedule/ScheduleBlock";
import { getArtistByHandle } from "@/data/dummy";

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = getArtistByHandle(params.handle);
  if (!artist) return { title: "아티스트를 찾을 수 없습니다" };
  return {
    title: artist.displayName,
    description: artist.bio ?? `${artist.displayName}의 게스트워크 일정`,
  };
}

export default function ArtistProfilePage({ params }: Props) {
  const artist = getArtistByHandle(params.handle);

  if (!artist) notFound();

  const activeSchedules = artist.upcomingSchedules.filter((s) => s.isActive);
  const isFollowing = false; // Sprint 3에서 실제 상태로 교체

  return (
    <PageContainer className="bg-neutral-50">
      {/* 상단 네비 */}
      <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between bg-white px-4 border-b border-neutral-100">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-[13px] font-medium text-neutral-900">
          프로필
        </span>
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
            aria-label="공유"
          >
            <Share2 size={18} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
            aria-label="더보기"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* 프로필 헤더 */}
      <section className="bg-white px-4 pt-4 pb-0">
        <div className="flex items-start gap-3 mb-3">
          <Avatar name={artist.displayName} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="text-[17px] font-medium text-neutral-900 leading-tight">
                {artist.displayName}
              </h2>
              {artist.isVerified && <VerifiedBadge size={16} />}
            </div>
            <p className="text-xs text-neutral-500 mb-2">
              Based in {artist.baseCity}, {artist.baseCountry}
            </p>
            <TagList tags={artist.tags} size="sm" />
          </div>
        </div>

        {artist.bio && (
          <p className="text-sm text-neutral-500 leading-relaxed mb-4">
            {artist.bio}
          </p>
        )}

        {/* 팔로우 + Instagram 버튼 */}
        <div className="flex gap-2 pb-4">
          <button
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white active:scale-98 transition-transform"
            aria-label={
              isFollowing
                ? `${artist.displayName} 팔로잉 중`
                : `${artist.displayName} 팔로우`
            }
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
          <a
            href={`https://www.instagram.com/${artist.instagramHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-800 active:bg-neutral-50"
          >
            <Instagram size={15} aria-hidden="true" />
            Instagram
          </a>
        </div>
      </section>

      {/* 다음 게스트워크 */}
      <section className="mt-2 bg-white px-4 py-4">
        <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
          다음 게스트워크
        </h3>
        {activeSchedules.length > 0 ? (
          <div className="space-y-2">
            {activeSchedules.map((schedule) => (
              <ScheduleBlock key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-neutral-50 py-5 text-center text-sm text-neutral-400">
            등록된 일정이 없습니다
          </p>
        )}
      </section>

      {/* 대표 작품 (3장) */}
      <section className="mt-2 bg-white px-4 pb-4 pt-4">
        <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
          대표 작품
        </h3>
        <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
          {[0, 1, 2].map((i) => {
            const item = artist.portfolioItems[i];
            return (
              <div
                key={i}
                className="aspect-square bg-neutral-100 flex items-center justify-center"
                aria-label={`작품 ${i + 1}`}
              >
                {item?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={`${artist.displayName} 작품 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    size={24}
                    className="text-neutral-300"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 text-center text-[11px] text-neutral-400">
          더 많은 작품은{" "}
          <a
            href={`https://www.instagram.com/${artist.instagramHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 underline underline-offset-2"
          >
            Instagram
          </a>
          에서 확인
        </p>
      </section>

      {/* 미인증 프로필 클레임 배너 */}
      {!artist.isVerified && (
        <section className="mt-2 mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800 mb-0.5">
            이 프로필은 나인가요?
          </p>
          <p className="text-[11px] text-amber-600 mb-2">
            Instagram DM 인증을 통해 프로필 소유권을 확인하세요.
          </p>
          <Link
            href={`/artists/${artist.instagramHandle}/claim`}
            className="inline-flex items-center rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white active:scale-95"
          >
            Claim Profile →
          </Link>
        </section>
      )}
    </PageContainer>
  );
}
