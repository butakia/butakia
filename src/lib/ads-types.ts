export type AdPlacement =
  | "popup"
  | "square"
  | "libros_home"
  | "libro_detalle";

export const AD_PLACEMENT_LABEL: Record<AdPlacement, string> = {
  popup: "Ventana emergente",
  square: "Cuadrado (barra lateral / entre tarjetas)",
  libros_home: "Inicio de Butakia",
  libro_detalle: "Ficha de libro",
};

export type AdSizePreset = "responsive" | "300x250" | "728x90" | "160x600" | "320x50";

export const AD_SIZE_LABEL: Record<AdSizePreset, string> = {
  responsive: "Responsivo (ocupa el contenedor)",
  "300x250": "300×250 (rectángulo mediano)",
  "728x90": "728×90 (banner de escritorio)",
  "160x600": "160×600 (rascacielos)",
  "320x50": "320×50 (banner móvil)",
};

export interface AdSlot {
  id: string;
  name: string;
  iframeCode: string;
  placement: AdPlacement;
  sizePreset: AdSizePreset;
  active: boolean;
  order: number;
}
