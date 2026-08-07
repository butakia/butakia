import { NextRequest, NextResponse } from "next/server";
import { uploadPublicFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no permitido." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera 8MB." }, { status: 400 });
  }

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadPublicFile(bytes, filename, { resourceType: "image" });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Image upload failed:", err);
    return NextResponse.json(
      { error: "No se pudo subir la imagen. Verifica la configuración de almacenamiento del servidor." },
      { status: 500 },
    );
  }
}
