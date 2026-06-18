"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";
export type UserRole = "customer" | "artist" | "admin";

export interface UseSessionReturn {
  user: User | null;
  role: UserRole | null;
  status: SessionStatus;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function loadSession(authUser: User | null) {
      if (!authUser) {
        setUser(null);
        setRole(null);
        setStatus("unauthenticated");
        return;
      }

      setUser(authUser);
      setStatus("authenticated");

      // users.role 조회 (artist 여부 판단용)
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      setRole((data?.role as UserRole) ?? "customer");
    }

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data }) => {
      loadSession(data.user ?? null);
    });

    // 세션 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, status };
}
