import { getSaleInfoQueue } from "@/lib/books-data";
import AdminSalesQueue from "@/components/admin/AdminSalesQueue";

export default async function AdminLibrosVentasPage() {
  const items = await getSaleInfoQueue();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Validación de ventas</h1>
      <p className="mt-1 text-sm text-white/50">
        Verifica identidad y titularidad de derechos por WhatsApp antes de aprobar la venta de una obra.
        Butakia no procesa pagos automáticamente todavía — las ventas confirmadas por un canal externo se
        registran aquí manualmente.
      </p>
      <div className="mt-6">
        <AdminSalesQueue items={items} />
      </div>
    </div>
  );
}
