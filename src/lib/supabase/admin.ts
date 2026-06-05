import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// SERVICE ROLE KEY 사용 — RLS 완전 우회
// 사용 가능 위치: Server Actions, Route Handlers, Edge Functions
// 절대 클라이언트 컴포넌트에서 import 하지 않을 것
// 절대 NEXT_PUBLIC_ 환경 변수 사용하지 않을 것

// SupabaseClient<Database>를 명시적으로 선언
// → TypeScript가 .from().insert() 등 DB 타입 체인을 올바르게 추론
let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
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
