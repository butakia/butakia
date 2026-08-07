import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/books-data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchBooks(q);
  return NextResponse.json({ results });
}
