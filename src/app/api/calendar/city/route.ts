/**
 * GET /api/calendar/city?city=Seoul
 *
 * Artist Calendar에서 도시 선택 변경 시 클라이언트에서 호출
 * → getCityCalendarData 결과 반환
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCityCalendarData } from "@/lib/queries/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city")?.trim();

    if (!city) {
      return NextResponse.json({ error: "city 파라미터가 필요합니다." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const data = await getCityCalendarData(city, user?.id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
