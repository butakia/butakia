import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { uploadPublicFile } from "@/lib/storage";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se permiten archivos PDF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El PDF supera 50MB." }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.pdf`;
  const bytes = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    url = await uploadPublicFile(bytes, filename, { resourceType: "raw" });
  } catch (err) {
    console.error("PDF upload failed:", err);
    return NextResponse.json(
      { error: "No se pudo subir el PDF. Verifica la configuración de almacenamiento del servidor." },
      { status: 500 },
    );
  }

  let pageCount: number | undefined;
  try {
    // pdf-lib (not pdfjs-dist) here: pdfjs-dist tries to spawn its worker even in the
    // "legacy" Node build, which fails under Turbopack's server bundling (no matching
    // chunk path for the worker module). pdf-lib is worker-free and only needs the
    // page count, not rendering, so it's the right tool for this server-side step.
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    pageCount = doc.getPageCount();
  } catch (e) {
    console.error("PDF page-count extraction failed:", e);
    pageCount = undefined;
  }

  return NextResponse.json({ url, pageCount });
}
