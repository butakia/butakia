import "server-only";
import { prisma } from "./prisma";
import { AdPlacement, AdSizePreset, AdSlot } from "./ads-types";

export type { AdPlacement, AdSlot } from "./ads-types";
export { AD_PLACEMENT_LABEL } from "./ads-types";

function toAdSlot(row: {
  id: string;
  name: string;
  iframeCode: string;
  placement: string;
  sizePreset: string;
  active: boolean;
  order: number;
}): AdSlot {
  return {
    id: row.id,
    name: row.name,
    iframeCode: row.iframeCode,
    placement: row.placement as AdPlacement,
    sizePreset: row.sizePreset as AdSizePreset,
    active: row.active,
    order: row.order,
  };
}

export async function getAllAdSlots(): Promise<AdSlot[]> {
  const rows = await prisma.adSlot.findMany({ orderBy: [{ placement: "asc" }, { order: "asc" }] });
  return rows.map(toAdSlot);
}

export async function getActiveAdsByPlacement(placement: AdPlacement): Promise<AdSlot[]> {
  const rows = await prisma.adSlot.findMany({
    where: { placement, active: true },
    orderBy: { order: "asc" },
  });
  return rows.map(toAdSlot);
}
