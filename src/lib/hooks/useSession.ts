"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface UseSessionReturn {
  user: User | null;
  status: SessionStatus;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setStatus(data.user ? "authenticated" : "unauthenticated");
    });

    // 세션 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "authenticated" : "unauthenticated");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, status };
}
