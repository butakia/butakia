import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { exportBackup, importBackup } from "@/lib/backup";

async function requireFullAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  if (user.adminLevel && user.adminLevel !== "full") return null;
  return user;
}

export async function GET() {
  const user = await requireFullAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const zipBuffer = await exportBackup();
  const filename = `butakia-respaldo-${new Date().toISOString().slice(0, 10)}.zip`;

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await requireFullAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }
  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "El archivo debe ser un .zip de respaldo de Butakia." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importBackup(buffer);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo restaurar el respaldo." },
      { status: 400 }
    );
  }
}
