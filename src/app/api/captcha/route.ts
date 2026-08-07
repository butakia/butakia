import { NextResponse } from "next/server";
import { generateCaptcha } from "@/lib/captcha";

export async function GET() {
  const { imageDataUri, token } = generateCaptcha();
  return NextResponse.json({ imageDataUri, token });
}
