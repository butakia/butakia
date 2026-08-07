export type AdPlacement =
  | "popup"
  | "square"
  | "under_row"
  | "player"
  | "libros_home"
  | "titulo_detalle"
  | "libro_detalle"
  | "explorar";

export const AD_PLACEMENT_LABEL: Record<AdPlacement, string> = {
  popup: "Ventana emergente",
  square: "Cuadrado (barra lateral / entre tarjetas)",
  under_row: "Debajo de las filas de películas",
  player: "Página del reproductor",
  libros_home: "Inicio de Butakia Libros",
  titulo_detalle: "Ficha de película/serie",
  libro_detalle: "Ficha de libro",
  explorar: "Página Explorar",
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
