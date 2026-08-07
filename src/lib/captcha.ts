import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "butakia-dev-secret-change-in-production";

// Excludes visually ambiguous characters (0/O, 1/I/l) to keep it readable for humans.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

const FONTS = ["Georgia, serif", "Verdana, sans-serif", "'Trebuchet MS', sans-serif"];
const INK_COLORS = ["#2a2a3a", "#3a2a4a", "#2a3a4a", "#4a2a3a"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sign(code: string): string {
  return createHmac("sha256", SECRET).update(`captcha:${code}`).digest("hex");
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(0, ALPHABET.length - 1)];
  }
  return code;
}

function renderDistortedSvg(code: string): string {
  const width = 170;
  const height = 60;
  const charWidth = width / code.length;

  const noiseLines = Array.from({ length: 4 }, () => {
    const y1 = randomInt(5, height - 5);
    const y2 = randomInt(5, height - 5);
    return `<path d="M0,${y1} Q${width / 2},${randomInt(0, height)} ${width},${y2}" stroke="#00000022" stroke-width="1.5" fill="none" />`;
  }).join("");

  const noiseDots = Array.from({ length: 18 }, () => {
    const cx = randomInt(0, width);
    const cy = randomInt(0, height);
    return `<circle cx="${cx}" cy="${cy}" r="1.2" fill="#00000022" />`;
  }).join("");

  const letters = code
    .split("")
    .map((ch, i) => {
      const x = charWidth * i + charWidth / 2 + randomInt(-4, 4);
      const y = height / 2 + randomInt(-6, 6);
      const rotation = randomInt(-25, 25);
      const font = FONTS[randomInt(0, FONTS.length - 1)];
      const color = INK_COLORS[randomInt(0, INK_COLORS.length - 1)];
      const fontSize = randomInt(26, 32);
      return `<text x="${x}" y="${y}" font-family="${font}" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotation} ${x} ${y})">${ch}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#e8e5df" />${noiseLines}${noiseDots}${letters}</svg>`;
}

export function generateCaptcha(): { imageDataUri: string; token: string } {
  const code = generateCode();
  const svg = renderDistortedSvg(code);
  const imageDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const token = `${Buffer.from(code).toString("base64")}.${sign(code)}`;
  return { imageDataUri, token };
}

export function verifyCaptcha(token: string, answer: string): boolean {
  const [codeB64, signature] = (token || "").split(".");
  if (!codeB64 || !signature) return false;

  let code: string;
  try {
    code = Buffer.from(codeB64, "base64").toString("utf8");
  } catch {
    return false;
  }

  const expected = sign(code);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  const validSignature = sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);

  return validSignature && answer.trim().toUpperCase() === code.toUpperCase();
}
