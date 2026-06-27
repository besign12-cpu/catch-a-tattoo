/**
 * translations.server.ts — Server-only
 *
 * next/headers 사용. Client Component에서 절대 import 금지.
 * Server Component / Server Action / Route Handler 전용.
 */

import { cookies } from "next/headers";
import type { Locale } from "./config";
import { buildT, type TFunction } from "./translations";

type Namespace = Parameters<typeof buildT>[1];

export async function getT(ns: Namespace): Promise<TFunction> {
  const cookieStore = await cookies();
  const val = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = val === "ko" ? "ko" : "en";
  return buildT(locale, ns);
}
