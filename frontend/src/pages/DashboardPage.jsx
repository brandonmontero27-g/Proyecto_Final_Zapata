import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import BuyerDashboard from "./BuyerDashboard.jsx";
import SellerDashboard from "./SellerDashboard.jsx";

const ROLE_INTRO = {
  buyer: "Gestiona tus favoritos, simula tu financiamiento y chatea con vendedores.",
  seller: "Administra tus motos publicadas, monitorea el interés de compradores y revisa tus estadísticas."
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-moto-red animate-pulse" />
            <span className="text-[10px] font-black text-moto-red-light uppercase tracking-wider font-mono">
              Panel del {user.role === "seller" ? "Vendedor" : "Comprador"}
            </span>
          </div>
          <h2 className="text-2xl font-black text-moto-white tracking-tight mt-1 flex flex-wrap items-center gap-2">
            <span>¡Hola, {user.name}!</span>
            {user.is_verified && (
              <span className="bg-moto-navy-light/20 text-moto-navy-light text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-moto-navy-light/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verificado por Tico</span>
              </span>
            )}
          </h2>
          <p className="text-moto-gray text-xs mt-1">{ROLE_INTRO[user.role]}</p>
        </div>
      </div>

      {user.role === "seller" ? <SellerDashboard /> : <BuyerDashboard />}
    </div>
  );
}
