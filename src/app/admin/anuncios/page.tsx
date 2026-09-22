import { getAllAdSlots } from "@/lib/ads-data";
import AdsManager from "@/components/admin/AdsManager";

export default async function AdminAnunciosPage() {
  const ads = await getAllAdSlots();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Anuncios</h1>
      <p className="mt-1 text-sm text-white/50">
        Pega el código &lt;iframe&gt; de tus anuncios y elige dónde se muestran: ventana emergente,
        cuadrado, en el inicio o en la ficha de un libro.
      </p>
      <div className="mt-6">
        <AdsManager ads={ads} />
      </div>
    </div>
  );
}
