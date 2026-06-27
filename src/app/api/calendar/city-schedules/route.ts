/**
 * GET /api/calendar/city-schedules?city=Seoul&year=2026&month=5
 * Customer Calendar 도시 탐색용: 도시별 Guest Work 일정 조회
 * month: 0-indexed (JS 기준)
 */
import { NextRequest, NextResponse } from "next/server";
import { getCitySchedules } from "@/lib/queries/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city  = searchParams.get("city")?.trim();
    const year  = parseInt(searchParams.get("year")  ?? "0", 10);
    const month = parseInt(searchParams.get("month") ?? "0", 10);

    if (!city || !year || isNaN(month)) {
      return NextResponse.json({ error: "city/year/month 파라미터 필요" }, { status: 400 });
    }

    const schedules = await getCitySchedules(city, year, month);
    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
