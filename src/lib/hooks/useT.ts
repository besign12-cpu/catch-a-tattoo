"use client";

import { useMemo } from "react";
import { getClientLocale, buildT, type TFunction } from "@/i18n/translations";

type Namespace = Parameters<typeof buildT>[1];

export function useT(namespace: Namespace): TFunction {
  const locale = getClientLocale();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => buildT(locale, namespace), [locale, namespace]);
}
