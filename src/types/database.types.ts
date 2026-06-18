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
      // ── 기존 테이블 (Sprint 1~3) ─────────────────────────────

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
          // Sprint 4 — 007_users_base_city.sql
          base_city_changed_at: string | null;
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
          base_city_changed_at?: string | null;
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
          base_city_changed_at?: string | null;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };

      city_follows: {
        Row: {
          id: string;
          user_id: string;
          artist_id: string;
          city: string;
          country: string;
          created_at: string;
          // Sprint 4 — 005_bring_update.sql
          is_active: boolean;
          expired_reason: "base_city_changed" | "guest_work_completed" | null;
          expired_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          artist_id: string;
          city: string;
          country: string;
          created_at?: string;
          is_active?: boolean;
          expired_reason?: "base_city_changed" | "guest_work_completed" | null;
          expired_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          artist_id?: string;
          city?: string;
          country?: string;
          created_at?: string;
          is_active?: boolean;
          expired_reason?: "base_city_changed" | "guest_work_completed" | null;
          expired_at?: string | null;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };

      // ── Sprint 4 신규 테이블 ─────────────────────────────────

      // 004_cities.sql
      cities: {
        Row: {
          id: string;
          name: string;
          country: string;
          country_name: string;
          lat: number | null;
          lng: number | null;
          region: "asia" | "europe" | "americas" | "other";
          is_approved: boolean;
          created_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          country_name: string;
          lat?: number | null;
          lng?: number | null;
          region: "asia" | "europe" | "americas" | "other";
          is_approved?: boolean;
          created_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          country_name?: string;
          lat?: number | null;
          lng?: number | null;
          region?: "asia" | "europe" | "americas" | "other";
          is_approved?: boolean;
          created_at?: string;
          approved_at?: string | null;
        };
        Relationships: [];
      };

      // 004_cities.sql
      city_requests: {
        Row: {
          id: string;
          requested_by: string | null;
          city_name: string;
          country: string;
          reason: string | null;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          requested_by?: string | null;
          city_name: string;
          country: string;
          reason?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string | null;
          city_name?: string;
          country?: string;
          reason?: string | null;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };

      // 006_analytics.sql
      demand_events: {
        Row: {
          id: string;
          event_type:
            | "profile_view"
            | "schedule_view"
            | "instagram_click"
            | "city_click";
          user_id: string | null;
          artist_id: string | null;
          city_id: string | null;
          session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type:
            | "profile_view"
            | "schedule_view"
            | "instagram_click"
            | "city_click";
          user_id?: string | null;
          artist_id?: string | null;
          city_id?: string | null;
          session_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?:
            | "profile_view"
            | "schedule_view"
            | "instagram_click"
            | "city_click";
          user_id?: string | null;
          artist_id?: string | null;
          city_id?: string | null;
          session_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      // 006_analytics.sql
      search_logs: {
        Row: {
          id: string;
          query_type: "city" | "style" | "artist" | "combined";
          query_value: string | null;
          user_id: string | null;
          session_id: string;
          result_count: number;
          filters_used: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          query_type: "city" | "style" | "artist" | "combined";
          query_value?: string | null;
          user_id?: string | null;
          session_id: string;
          result_count?: number;
          filters_used?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          query_type?: "city" | "style" | "artist" | "combined";
          query_value?: string | null;
          user_id?: string | null;
          session_id?: string;
          result_count?: number;
          filters_used?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      // 006_analytics.sql
      analytics_snapshots: {
        Row: {
          id: string;
          snapshot_type:
            | "city_follows"
            | "style_search"
            | "guest_work_count"
            | "artist_profile_views"
            | "city_search";
          target_id: string | null;
          period: string;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          snapshot_type:
            | "city_follows"
            | "style_search"
            | "guest_work_count"
            | "artist_profile_views"
            | "city_search";
          target_id?: string | null;
          period: string;
          value?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          snapshot_type?:
            | "city_follows"
            | "style_search"
            | "guest_work_count"
            | "artist_profile_views"
            | "city_search";
          target_id?: string | null;
          period?: string;
          value?: number;
          created_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
      // Sprint 4 — 005_bring_update.sql
      expire_bring_by_base_city_change: {
        Args: { p_user_id: string };
        Returns: number;
      };
      expire_bring_by_schedule: {
        Args: { p_artist_id: string; p_city: string };
        Returns: number;
      };
      expire_bring_for_completed_schedules: {
        Args: Record<string, never>;
        Returns: void;
      };
      // Sprint 4 — 007_users_base_city.sql
      can_change_base_city: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      update_base_city: {
        Args: {
          p_user_id: string;
          p_base_city: string;
          p_base_country: string;
        };
        Returns: Json;
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
