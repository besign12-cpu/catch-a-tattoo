/**
 * GET /api/calendar/following?year=2026&month=5
 * Customer Calendar 월 변경 시 팔로우 아티스트 일정 조회
 * month: 0-indexed (JS 기준)
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getFollowingCalendar } from "@/lib/queries/calendar";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const year  = parseInt(searchParams.get("year")  ?? "0", 10);
    const month = parseInt(searchParams.get("month") ?? "0", 10);

    if (!year || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: "year/month 파라미터 필요" }, { status: 400 });
    }

    const schedules = await getFollowingCalendar(user.id, year, month);
    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
