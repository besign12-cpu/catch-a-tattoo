import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// SERVICE ROLE KEY 사용 — RLS 완전 우회
// 사용 가능 위치: Server Actions, Route Handlers, Edge Functions
// 절대 클라이언트 컴포넌트에서 import 하지 않을 것
// 절대 NEXT_PUBLIC_ 환경 변수 사용하지 않을 것

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다."
    );
  }

  adminClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
