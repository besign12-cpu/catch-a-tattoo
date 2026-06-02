"use client";

import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorType = "network" | "server" | "not-found" | "generic";

interface ErrorStateProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ERROR_CONFIG: Record<
  ErrorType,
  { icon: React.ElementType; title: string; description: string }
> = {
  network: {
    icon: WifiOff,
    title: "연결을 확인해주세요",
    description: "네트워크 연결이 불안정합니다.",
  },
  server: {
    icon: AlertCircle,
    title: "일시적인 오류가 발생했습니다",
    description: "잠시 후 다시 시도해주세요.",
  },
  "not-found": {
    icon: AlertCircle,
    title: "찾을 수 없습니다",
    description: "요청하신 페이지가 존재하지 않습니다.",
  },
  generic: {
    icon: AlertCircle,
    title: "오류가 발생했습니다",
    description: "문제가 지속되면 고객센터로 문의해주세요.",
  },
};

export function ErrorState({
  type = "generic",
  message,
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-neutral-100 bg-white p-3",
          className
        )}
        role="alert"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
          <Icon size={15} className="text-red-500" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-800">
            {message ?? config.title}
          </p>
          <p className="text-[10px] text-neutral-400">{config.description}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 active:scale-95"
            aria-label="다시 시도"
          >
            <RefreshCw size={11} aria-hidden="true" />
            재시도
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Icon size={24} className="text-neutral-400" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-neutral-800">
          {message ?? config.title}
        </p>
        <p className="text-sm text-neutral-400">{config.description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-1.5 rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 active:scale-95"
          aria-label="다시 시도"
        >
          <RefreshCw size={14} aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}
