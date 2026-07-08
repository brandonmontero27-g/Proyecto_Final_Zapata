import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, MessageCircle, Plus, Search, Award, HelpCircle, Bike, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

const ROLE_LABEL = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador" };

export default function NavBar({ onOpenTico, onReplayIntro }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const dashboardPath = user?.role === "admin" ? "/admin" : "/portal";
  const onDashboard = location.pathname === "/portal" || location.pathname === "/admin";

  return (
    <>
      <header className="border-b border-white/10 bg-moto-black-soft sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-moto-red flex items-center justify-center shrink-0 shadow-md">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-moto-red-light uppercase">Perú</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-moto-white tracking-tight">
                Moto<span className="text-moto-red-light font-extrabold">Market</span>
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <NotificationBell />
                <Link to="/cuenta" className="flex items-center gap-2.5 group" title="Configurar cuenta">
                  <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-moto-red/40 bg-white/5 shrink-0 shadow-sm group-hover:border-moto-red transition-colors flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Usuario" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-moto-red-light">{user.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-moto-white leading-tight group-hover:text-moto-red-light transition-colors">{user.name}</span>
                    <span className="text-[9px] text-moto-gray capitalize font-mono leading-tight">
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-white/10 text-moto-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4 text-moto-red-light" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-2 border border-white/10 text-moto-white px-3.5 py-1.5 rounded-xl text-xs font-black hover:border-moto-red hover:text-moto-red-light transition-all cursor-pointer bg-white/5 shadow-sm"
              >
                <span>Ingresar / Registrarse</span>
              </button>
            )}

            <button
              onClick={onOpenTico}
              className="flex items-center gap-2 bg-moto-red text-white px-4 py-2 rounded-xl font-bold hover:bg-moto-red-dark transition-all shadow-md cursor-pointer text-xs sm:text-sm"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Asistente: Tico</span>
              <span className="inline sm:hidden">Tico</span>
            </button>

            {isAuthenticated && (user.role === "seller" || user.role === "admin") && (
              <Link
                to="/publicar"
                className="hidden sm:flex items-center gap-1.5 border-2 border-dashed px-3.5 py-2 rounded-xl font-bold transition-all text-sm cursor-pointer border-moto-red text-moto-red-light hover:bg-moto-red/10 bg-white/5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Publicar Moto</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="bg-moto-black-soft border-b border-white/10 sticky top-[68px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-12">
          <div className="flex gap-1">
            <Link
              to="/catalogo"
              className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                location.pathname === "/catalogo"
                  ? "border-moto-red text-moto-red-light"
                  : "border-transparent text-moto-gray hover:text-moto-white"
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Catálogo</span>
            </Link>
            {isAuthenticated && (
              <Link
                to={dashboardPath}
                className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  onDashboard ? "border-moto-red text-moto-red-light" : "border-transparent text-moto-gray hover:text-moto-white"
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Mi Panel</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReplayIntro}
              title="Volver a la intro"
              className="flex items-center gap-1.5 bg-moto-red/10 hover:bg-moto-red/15 border border-moto-red/20 text-moto-red-light text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Volver a la intro</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
