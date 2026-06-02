export type TagGroup = "color" | "main" | "art";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  group: TagGroup;
}

export type ContactType = "instagram" | "email" | "website";

export interface GuestSchedule {
  id: string;
  city: string;
  country: string;
  cityLat: number;
  cityLng: number;
  region: "asia" | "europe" | "americas" | "other";
  startDate: string;
  endDate: string;
  note?: string;
  contactType: ContactType;
  contactValue: string;
  isActive: boolean;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export type ArtistRole = "customer" | "artist" | "admin";

export interface ArtistProfile {
  id: string;
  userId?: string;
  displayName: string;
  instagramHandle: string;
  bio?: string;
  baseCity: string;
  baseCountry: string;
  isClaimed: boolean;
  isVerified: boolean;
  contactType: ContactType;
  contactValue: string;
  tags: Tag[];
  portfolioItems: PortfolioItem[];
  upcomingSchedules: GuestSchedule[];
}

export interface FeedCard {
  artist: Pick<
    ArtistProfile,
    | "id"
    | "displayName"
    | "instagramHandle"
    | "isVerified"
    | "isClaimed"
    | "baseCity"
    | "tags"
  >;
  schedule: GuestSchedule;
  isFollowing: boolean;
}
