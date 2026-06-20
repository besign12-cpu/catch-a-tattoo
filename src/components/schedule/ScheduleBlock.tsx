import { MapPin, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateRange, calcDDay, isScheduleActive } from "@/lib/utils";
import type { GuestSchedule } from "@/types";

interface ScheduleBlockProps {
  schedule: GuestSchedule;
  variant?: "card" | "inline";
  className?: string;
  /** 예약 가능 상태 — 카드 내부 예약 문의 아래 표시 */
  availStatus?: "available" | "fully_booked" | null;
}

export function ScheduleBlock({
  schedule,
  variant = "card",
  className,
  availStatus,
}: ScheduleBlockProps) {
  const status = isScheduleActive(schedule.startDate, schedule.endDate);
  const dday = calcDDay(schedule.startDate, schedule.endDate);
  const dateRange = formatDateRange(schedule.startDate, schedule.endDate);

  const isActive = status === "active";
  const isEnded = status === "ended";

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs",
          isActive ? "text-emerald-600" : "text-neutral-400",
          className
        )}
      >
        <Calendar size={11} aria-hidden="true" />
        <span>
          {schedule.city} · {dateRange}
        </span>
        {!isEnded && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-neutral-100 text-neutral-500"
            )}
          >
            {dday}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border",
        isActive
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-neutral-100 bg-neutral-50",
        isEnded && "opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          isActive && "border-b border-emerald-100"
        )}
      >
        <div className="flex items-center gap-1.5">
          <MapPin
            size={13}
            className={isActive ? "text-emerald-600" : "text-neutral-400"}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-sm font-medium",
              isActive ? "text-emerald-700" : "text-neutral-700"
            )}
          >
            {schedule.city}, {schedule.country}
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            isActive
              ? "bg-white text-emerald-700"
              : "bg-white text-neutral-500"
          )}
        >
          {isActive ? "진행 중" : "예정"}
        </span>
      </div>

      <div className="flex items-stretch px-3 py-2.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[10px] text-neutral-400">
            <Calendar
              size={10}
              className="mr-0.5 inline"
              aria-hidden="true"
            />
            언제
          </span>
          <span className="text-sm font-medium text-neutral-900">
            {dateRange}
          </span>
          <span
            className={cn(
              "text-[11px]",
              isActive ? "text-emerald-600" : "text-neutral-400"
            )}
          >
            {dday}
          </span>
        </div>

        <div className="mx-3 w-px self-stretch bg-neutral-200" />

        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-[10px] text-neutral-400">예약 문의</span>
          <span className="text-sm font-medium text-neutral-900">
            {schedule.contactValue}
          </span>
          {schedule.note && (
            <span className="text-[11px] text-neutral-400 line-clamp-1">
              {schedule.note}
            </span>
          )}
          {availStatus && (
            <span
              className={cn(
                "text-[11px] font-medium mt-0.5",
                availStatus === "available"
                  ? "text-emerald-600"
                  : "text-neutral-400"
              )}
            >
              {availStatus === "available" ? "Available" : "Fully booked"}
            </span>
          )}
        </div>

        <ChevronRight
          size={16}
          className="ml-1 self-center text-neutral-300"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
