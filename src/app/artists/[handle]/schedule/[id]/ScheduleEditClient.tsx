"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronLeft, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { updateGuestSchedule, deleteGuestSchedule } from "@/actions/schedule";
import type { UpdateScheduleState, DeleteScheduleState } from "@/actions/schedule";

// ── 타입 ────────────────────────────────────────────────────

export interface ScheduleEditData {
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  contactType: "instagram" | "email" | "website";
  contactValue: string | null;
  note: string | null;
  isActive: boolean;
  isPast: boolean;
}

interface ScheduleEditClientProps {
  schedule: ScheduleEditData;
}

// ── 달력 유틸 ────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
function formatYearMonth(year: number, month: number): string {
  const names = ["Jan","Feb","Mar","Apr","May","Jun",
                 "Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[month]} ${year}`;
}
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

// ── Submit / Delete 버튼 (useFormStatus) ─────────────────────

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 transition-opacity"
    >
      {pending ? "처리 중..." : label}
    </button>
  );
}

function DeleteConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-red-600 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:opacity-80 transition-opacity"
    >
      {pending ? "삭제 중..." : "삭제 확인"}
    </button>
  );
}

// ── 날짜 선택 달력 ───────────────────────────────────────────

function DateRangePicker({
  startDate,
  endDate,
  onChange,
  disabled,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  disabled: boolean;
}) {
  const initDate = startDate ? new Date(startDate + "T00:00:00") : new Date();
  const [year, setYear] = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth());
  const [picking, setPicking] = useState<"start" | "end">("start");

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(day: number) {
    if (disabled || isPastDate(year, month, day)) return;
    const dateStr = toDateStr(year, month, day);
    if (picking === "start") {
      onChange(dateStr, "");
      setPicking("end");
    } else {
      if (startDate && dateStr < startDate) {
        onChange(dateStr, "");
        setPicking("end");
      } else {
        onChange(startDate, dateStr);
        setPicking("start");
      }
    }
  }

  function isInRange(day: number): boolean {
    if (!startDate || !endDate) return false;
    const d = toDateStr(year, month, day);
    return d > startDate && d < endDate;
  }
  function isStart(day: number): boolean {
    return toDateStr(year, month, day) === startDate;
  }
  function isEnd(day: number): boolean {
    return toDateStr(year, month, day) === endDate;
  }

  return (
    <div className={disabled ? "opacity-40 pointer-events-none select-none" : ""}>
      {/* 선택 상태 표시 */}
      <div className="mb-3 flex gap-2">
        <div className={["flex flex-1 flex-col rounded-xl border px-3 py-2 transition-colors",
          !disabled && picking === "start" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white"
        ].join(" ")}>
          <span className="text-[10px] font-semibold text-neutral-400">시작일</span>
          <span className="text-[13px] font-semibold text-neutral-900">
            {startDate ? formatDisplayDate(startDate) : "—"}
          </span>
        </div>
        <div className={["flex flex-1 flex-col rounded-xl border px-3 py-2 transition-colors",
          !disabled && picking === "end" ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white"
        ].join(" ")}>
          <span className="text-[10px] font-semibold text-neutral-400">종료일</span>
          <span className="text-[13px] font-semibold text-neutral-900">
            {endDate ? formatDisplayDate(endDate) : "—"}
          </span>
        </div>
      </div>

      {/* 월 이동 */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="이전 달"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="text-[14px] font-semibold text-neutral-900">
          {formatYearMonth(year, month)}
        </span>
        <button
          type="button"
          onClick={() => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
          aria-label="다음 달"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-neutral-400">{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const past   = isPastDate(year, month, day);
          const start  = isStart(day);
          const end    = isEnd(day);
          const inRange = isInRange(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={past}
              className={["flex flex-col items-center py-0.5", past ? "opacity-25" : "cursor-pointer"].join(" ")}
            >
              <span className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
                start || end
                  ? "bg-neutral-900 text-white"
                  : inRange
                  ? "bg-neutral-200 text-neutral-700"
                  : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}>
                {day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ───────────────────────────────────────────

function DeleteModal({
  scheduleId,
  city,
  onCancel,
}: {
  scheduleId: string;
  city: string;
  onCancel: () => void;
}) {
  const initialState: DeleteScheduleState = { status: "idle" };
  const [state, formAction] = useFormState(deleteGuestSchedule, initialState);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="w-full max-w-[430px] rounded-3xl bg-white p-6">
        {/* 경고 아이콘 */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle size={22} className="text-red-500" aria-hidden="true" />
          </div>
        </div>

        <h3 className="mb-2 text-center text-[16px] font-bold text-neutral-900">
          일정을 삭제하시겠어요?
        </h3>
        <p className="mb-1 text-center text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{city}</span> 일정이
          영구적으로 삭제됩니다.
        </p>
        <p className="mb-5 text-center text-[12px] text-neutral-400">
          이 작업은 되돌릴 수 없습니다.
        </p>

        {state.status === "error" && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="scheduleId" value={scheduleId} />
          <DeleteConfirmButton />
        </form>

        <button
          onClick={onCancel}
          className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-700 active:bg-neutral-50"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ── 메인 Export ─────────────────────────────────────────────

export function ScheduleEditClient({ schedule }: ScheduleEditClientProps) {
  const [startDate, setStartDate] = useState(schedule.startDate);
  const [endDate, setEndDate]     = useState(schedule.endDate);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initialUpdateState: UpdateScheduleState = { status: "idle" };
  const [updateState, updateFormAction] = useFormState(
    updateGuestSchedule,
    initialUpdateState
  );

  return (
    <>
      {/* 삭제 모달 */}
      {showDeleteModal && (
        <DeleteModal
          scheduleId={schedule.id}
          city={schedule.city}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div className="flex flex-col gap-4 px-4 py-4 pb-10">

        {/* 도시 정보 (읽기 전용) */}
        <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
          <p className="mb-1 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
            도시 (변경 불가)
          </p>
          <p className="text-[15px] font-bold text-neutral-900">{schedule.city}</p>
          <p className="text-[12px] text-neutral-400">{schedule.country}</p>
        </div>

        {/* 과거 일정 안내 */}
        {schedule.isPast && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-amber-800">종료된 일정</p>
            <p className="mt-0.5 text-[11px] text-amber-600 leading-relaxed">
              이미 종료된 일정은 날짜를 수정할 수 없습니다. 삭제만 가능합니다.
            </p>
          </div>
        )}

        {/* 수정 폼 */}
        <form action={updateFormAction} className="flex flex-col gap-4">
          <input type="hidden" name="scheduleId" value={schedule.id} />
          <input type="hidden" name="startDate" value={startDate} />
          <input type="hidden" name="endDate" value={endDate} />

          {/* 날짜 선택 */}
          <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
              날짜
            </p>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
              disabled={schedule.isPast}
            />
          </div>

          {/* 연락 방법 */}
          <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
              연락 방법
            </p>
            <div className="flex flex-col gap-3">
              <select
                name="contactType"
                defaultValue={schedule.contactType}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              >
                <option value="instagram">Instagram DM</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
              </select>
              <input
                type="text"
                name="contactValue"
                defaultValue={schedule.contactValue ?? ""}
                placeholder="@instagram_handle 또는 email@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 메모 */}
          <div className="rounded-2xl border border-neutral-100 bg-white px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
              메모 <span className="font-normal normal-case text-neutral-300">(선택)</span>
            </p>
            <textarea
              name="note"
              defaultValue={schedule.note ?? ""}
              placeholder="예약 가능 자리 수, 스튜디오 위치 등"
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
          </div>

          {/* 에러 메시지 */}
          {updateState.status === "error" && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{updateState.message}</p>
            </div>
          )}

          {/* 저장 버튼 */}
          {!schedule.isPast && (
            <div className="flex gap-2">
              <SubmitButton label="일정 수정 저장" />
            </div>
          )}
        </form>

        {/* 삭제 버튼 */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-medium text-red-600 active:bg-red-100 transition-colors"
        >
          <Trash2 size={15} aria-hidden="true" />
          일정 삭제
        </button>
      </div>
    </>
  );
}
