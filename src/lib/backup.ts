import "server-only";
import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { prisma } from "./prisma";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Orden de restauración: los modelos padres van antes que los que dependen de ellos (claves foráneas).
const MODEL_ORDER = [
  "user",
  "siteSettings",
  "franchise",
  "title",
  "contributor",
  "profile",
  "season",
  "episode",
  "playlist",
  "follow",
  "favorite",
  "vote",
  "watchHistory",
  "comment",
  "notification",
  "editSuggestion",
  "report",
  "pendingSubmission",
  "premiumRequest",
  "homeSection",
  "forumThread",
  "forumReply",
  "adSlot",
  // --- Butakia Libros ---
  "literaryAuthor",
  "book",
  "bookChapter",
  "rightsDeclaration",
  "bookFavorite",
  "bookComment",
  "readingProgress",
  "bookReport",
  "pendingBookSubmission",
  "readerPreference",
  "bookCollection",
  "bookSaleInfo",
  "bookOrder",
  "bookEntitlement",
  "bookHighlight",
] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function reviveDates(value: unknown): unknown {
  if (typeof value === "string" && ISO_DATE_RE.test(value)) return new Date(value);
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveDates(v);
    return out;
  }
  return value;
}

export const BACKUP_FORMAT_VERSION = 1;

export async function exportBackup(): Promise<Buffer> {
  const zip = new JSZip();
  const data: Record<string, unknown[]> = {};

  for (const model of MODEL_ORDER) {
    // @ts-expect-error - dynamic Prisma model access, validated by MODEL_ORDER
    data[model] = await prisma[model].findMany();
  }

  zip.file(
    "export.json",
    JSON.stringify({ version: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString(), data })
  );

  let uploadFiles: string[] = [];
  try {
    uploadFiles = await readdir(UPLOADS_DIR);
  } catch {
    uploadFiles = [];
  }
  const uploadsFolder = zip.folder("uploads")!;
  for (const filename of uploadFiles) {
    const content = await readFile(path.join(UPLOADS_DIR, filename));
    uploadsFolder.file(filename, content);
  }

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

export interface ImportResult {
  tablesRestored: number;
  rowsRestored: number;
  filesRestored: number;
}

export async function importBackup(buffer: Buffer): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(buffer);

  const exportFile = zip.file("export.json");
  if (!exportFile) throw new Error("El archivo no parece un respaldo válido de Butakia (falta export.json).");

  const raw = await exportFile.async("string");
  const parsed = JSON.parse(raw) as { version: number; data: Record<string, unknown[]> };

  let rowsRestored = 0;
  let tablesRestored = 0;

  for (const model of MODEL_ORDER) {
    const rows = parsed.data[model];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    tablesRestored++;
    for (const rawRow of rows) {
      const row = reviveDates(rawRow) as { id: string };
      // @ts-expect-error - dynamic Prisma model access, validated by MODEL_ORDER
      await prisma[model].upsert({ where: { id: row.id }, create: row, update: row });
      rowsRestored++;
    }
  }

  let filesRestored = 0;
  const uploadsFolder = zip.folder("uploads");
  if (uploadsFolder) {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const entries = Object.values(zip.files).filter(
      (f) => f.name.startsWith("uploads/") && !f.dir
    );
    for (const entry of entries) {
      const filename = entry.name.replace("uploads/", "");
      if (!filename) continue;
      const content = await entry.async("nodebuffer");
      await writeFile(path.join(UPLOADS_DIR, filename), content);
      filesRestored++;
    }
  }

  return { tablesRestored, rowsRestored, filesRestored };
}
