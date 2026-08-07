"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./actions";
import type { AdPlacement } from "./ads-data";

export interface AdSlotInput {
  name: string;
  iframeCode: string;
  placement: AdPlacement;
  sizePreset: string;
  active: boolean;
  order: number;
}

function revalidateAdPaths() {
  revalidatePath("/");
  revalidatePath("/libros");
  revalidatePath("/explorar");
  revalidatePath("/titulo/[slug]", "page");
  revalidatePath("/libros/[slug]", "page");
  revalidatePath("/admin/anuncios");
}

export async function createAdSlotAction(input: AdSlotInput) {
  await requireAdmin();
  if (!input.name.trim() || !input.iframeCode.trim()) {
    return { error: "El nombre y el código del anuncio son obligatorios." };
  }
  await prisma.adSlot.create({
    data: {
      name: input.name.trim(),
      iframeCode: input.iframeCode,
      placement: input.placement,
      sizePreset: input.sizePreset,
      active: input.active,
      order: input.order,
    },
  });
  revalidateAdPaths();
  return { success: true };
}

export async function updateAdSlotAction(id: string, input: AdSlotInput) {
  await requireAdmin();
  if (!input.name.trim() || !input.iframeCode.trim()) {
    return { error: "El nombre y el código del anuncio son obligatorios." };
  }
  await prisma.adSlot.update({
    where: { id },
    data: {
      name: input.name.trim(),
      iframeCode: input.iframeCode,
      placement: input.placement,
      sizePreset: input.sizePreset,
      active: input.active,
      order: input.order,
    },
  });
  revalidateAdPaths();
  return { success: true };
}

export async function deleteAdSlotAction(id: string) {
  await requireAdmin();
  await prisma.adSlot.delete({ where: { id } });
  revalidateAdPaths();
}

export async function toggleAdSlotActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.adSlot.update({ where: { id }, data: { active } });
  revalidateAdPaths();
}
