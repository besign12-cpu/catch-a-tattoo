export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          role: "customer" | "artist" | "admin";
          base_city: string | null;
          base_country: string | null;
          push_token: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "artist" | "admin";
          base_city?: string | null;
          base_country?: string | null;
          push_token?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "artist" | "admin";
          base_city?: string | null;
          base_country?: string | null;
          push_token?: string | null;
          created_at?: string;
        };
      };
      artist_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          display_name: string;
          instagram_handle: string | null;
          bio: string | null;
          base_city: string | null;
          base_country: string | null;
          city_lat: number | null;
          city_lng: number | null;
          is_claimed: boolean;
          is_verified: boolean;
          contact_type: "instagram" | "email" | "website";
          contact_value: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          display_name: string;
          instagram_handle?: string | null;
          bio?: string | null;
          base_city?: string | null;
          base_country?: string | null;
          city_lat?: number | null;
          city_lng?: number | null;
          is_claimed?: boolean;
          is_verified?: boolean;
          contact_type?: "instagram" | "email" | "website";
          contact_value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          display_name?: string;
          instagram_handle?: string | null;
          bio?: string | null;
          base_city?: string | null;
          base_country?: string | null;
          city_lat?: number | null;
          city_lng?: number | null;
          is_claimed?: boolean;
          is_verified?: boolean;
          contact_type?: "instagram" | "email" | "website";
          contact_value?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          group_type: "color" | "main" | "art";
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          group_type: "color" | "main" | "art";
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          group_type?: "color" | "main" | "art";
        };
      };
      artist_tags: {
        Row: {
          artist_id: string;
          tag_id: string;
          other_description: string | null;
        };
        Insert: {
          artist_id: string;
          tag_id: string;
          other_description?: string | null;
        };
        Update: {
          artist_id?: string;
          tag_id?: string;
          other_description?: string | null;
        };
      };
      portfolio_items: {
        Row: {
          id: string;
          artist_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          image_url?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      guest_schedules: {
        Row: {
          id: string;
          artist_id: string;
          city: string;
          country: string;
          city_lat: number;
          city_lng: number;
          region: "asia" | "europe" | "americas" | "other";
          start_date: string;
          end_date: string;
          note: string | null;
          contact_type: "instagram" | "email" | "website";
          contact_value: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          city: string;
          country: string;
          city_lat: number;
          city_lng: number;
          region: "asia" | "europe" | "americas" | "other";
          start_date: string;
          end_date: string;
          note?: string | null;
          contact_type?: "instagram" | "email" | "website";
          contact_value?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          city?: string;
          country?: string;
          city_lat?: number;
          city_lng?: number;
          region?: "asia" | "europe" | "americas" | "other";
          start_date?: string;
          end_date?: string;
          note?: string | null;
          contact_type?: "instagram" | "email" | "website";
          contact_value?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          artist_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          artist_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          artist_id?: string;
          created_at?: string;
        };
      };
      city_follows: {
        Row: {
          id: string;
          user_id: string;
          artist_id: string;
          city: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artist_id: string;
          city: string;
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artist_id?: string;
          city?: string;
          country?: string;
          created_at?: string;
        };
      };
      city_demand_cache: {
        Row: {
          artist_id: string;
          city: string;
          country: string;
          follower_count: number;
          updated_at: string;
        };
        Insert: {
          artist_id: string;
          city: string;
          country: string;
          follower_count?: number;
          updated_at?: string;
        };
        Update: {
          artist_id?: string;
          city?: string;
          country?: string;
          follower_count?: number;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          artist_id: string | null;
          schedule_id: string | null;
          type:
            | "new_schedule"
            | "city_schedule"
            | "demand_milestone"
            | "claim_approved"
            | "claim_rejected";
          payload: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artist_id?: string | null;
          schedule_id?: string | null;
          type:
            | "new_schedule"
            | "city_schedule"
            | "demand_milestone"
            | "claim_approved"
            | "claim_rejected";
          payload?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artist_id?: string | null;
          schedule_id?: string | null;
          type?:
            | "new_schedule"
            | "city_schedule"
            | "demand_milestone"
            | "claim_approved"
            | "claim_rejected";
          payload?: Json;
          is_read?: boolean;
          created_at?: string;
        };
      };
      demand_notifications: {
        Row: {
          id: string;
          artist_id: string;
          city: string;
          threshold: number;
          sent_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          city: string;
          threshold: number;
          sent_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          city?: string;
          threshold?: number;
          sent_at?: string;
        };
      };
      claim_requests: {
        Row: {
          id: string;
          artist_id: string;
          requested_by: string;
          dm_token: string;
          status: "pending" | "approved" | "rejected";
          rejection_reason: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          artist_id: string;
          requested_by: string;
          dm_token: string;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          artist_id?: string;
          requested_by?: string;
          dm_token?: string;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
    };
    Views: {
      city_pin_summary: {
        Row: {
          city: string;
          country: string;
          city_lat: number;
          city_lng: number;
          region: "asia" | "europe" | "americas" | "other";
          upcoming_count: number;
        };
      };
    };
    Functions: {
      search_artists: {
        Args: {
          p_tag_slugs?: string[];
          p_city?: string;
          p_start_date?: string;
          p_end_date?: string;
          p_type?: "all" | "guest" | "based";
        };
        Returns: {
          artist_id: string;
          display_name: string;
          instagram_handle: string | null;
          is_verified: boolean;
          is_claimed: boolean;
          base_city: string | null;
          base_country: string | null;
          contact_type: string;
          contact_value: string | null;
          matched_tags: number;
          total_tags: number;
          priority: number;
          next_schedule: Json | null;
          tags: Json;
        }[];
      };
      increment_city_demand: {
        Args: { p_artist_id: string; p_city: string; p_country: string };
        Returns: void;
      };
      decrement_city_demand: {
        Args: { p_artist_id: string; p_city: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: "customer" | "artist" | "admin";
      contact_type: "instagram" | "email" | "website";
      schedule_region: "asia" | "europe" | "americas" | "other";
      tag_group: "color" | "main" | "art";
      notification_type:
        | "new_schedule"
        | "city_schedule"
        | "demand_milestone"
        | "claim_approved"
        | "claim_rejected";
      claim_status: "pending" | "approved" | "rejected";
    };
  };
};
