import { NextRequest, NextResponse } from "next/server";
import { searchTitles } from "@/lib/data";
import { getActiveProfile } from "@/lib/dal";
import { filterForKids } from "@/lib/kidsMode";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const [results, profile] = await Promise.all([searchTitles(q), getActiveProfile()]);
  return NextResponse.json({ results: filterForKids(results, Boolean(profile?.isKids)) });
}
