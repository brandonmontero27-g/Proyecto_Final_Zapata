import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, MessageCircle, Wallet, Bike, ChevronRight, Sparkles } from "lucide-react";
import { listMotorcyclesRequest } from "../api/motorcycles.js";
import { listFavoritesRequest, addFavoriteRequest, removeFavoriteRequest } from "../api/favorites.js";
import { useAuth } from "../context/AuthContext.jsx";
import MotorcycleCard from "../components/MotorcycleCard.jsx";
import MotorcycleDetailModal from "../components/MotorcycleDetailModal.jsx";
import { BRANDS, CATEGORY_OPTIONS, CATEGORY_LABEL, BUYER_TESTIMONIALS } from "../constants/content.js";

const BENEFITS = [
  { Icon: Wallet, title: "Cero comisiones ocultas", body: "Publica y contacta vendedores sin cargos escondidos." },
  { Icon: ShieldCheck, title: "Vendedores verificados", body: "Las motos con insignia Tico pasaron una revisión de identidad." },
  { Icon: MessageCircle, title: "Contacto directo", body: "Chatea o escribe por WhatsApp sin intermediarios." },
  { Icon: Bike, title: "Catálogo real", body: "Filtra por marca, cilindraje, año y precio en segundos." }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, token, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    listMotorcyclesRequest({ limit: 12 })
      .then(setMotorcycles)
      .catch(() => setMotorcycles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    listFavoritesRequest(token)
      .then((data) => setFavoriteIds(new Set(data.map((m) => m.id))))
      .catch(() => {});
  }, [isAuthenticated, token]);

  async function handleToggleFavorite(motorcycle) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    const isFav = favoriteIds.has(motorcycle.id);
    try {
      if (isFav) {
        await removeFavoriteRequest(token, motorcycle.id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(motorcycle.id);
          return next;
        });
      } else {
        await addFavoriteRequest(token, motorcycle.id);
        setFavoriteIds((prev) => new Set(prev).add(motorcycle.id));
      }
    } catch {
      // silencioso: el corazon simplemente no cambia si falla
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(`/catalogo${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  }

  const featured = motorcycles.slice(0, 4);
  const latest = motorcycles.slice(4, 10);

  return (
    <>
      <section className="relative min-h-[460px] flex items-center justify-center py-16 px-4 bg-gradient-to-br from-moto-black via-[#1a0505] to-moto-black overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-moto-red blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-moto-navy-light blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8 w-full">
          <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-black text-moto-red-light uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            Compra y venta de motocicletas en Perú
          </span>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
            Encuentra tu <span className="text-moto-red-light">próxima moto</span> hoy
          </h2>
          <p className="text-moto-gray-light text-sm md:text-base max-w-xl mx-auto">
            Miles de motos nuevas y usadas, verificadas y listas para contactar directo con el vendedor.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="bg-moto-black-soft text-white p-3 rounded-2xl shadow-2xl border border-white/10 max-w-xl mx-auto flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-moto-gray h-4 w-4" />
              <input
                type="text"
                placeholder="Busca por marca, modelo o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-sm text-moto-white placeholder:text-moto-gray"
              />
            </div>
            <button
              type="submit"
              className="bg-moto-red text-white px-5 py-3 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        <section className="space-y-5">
          <h3 className="text-xl font-black text-moto-white tracking-tight">Categorías</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORY_OPTIONS.filter((c) => c.value).map((cat) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/catalogo?categoria=${cat.value}`)}
                className="bg-moto-black-soft border border-white/10 hover:border-moto-red rounded-2xl p-4 text-center transition-all cursor-pointer group"
              >
                <Bike className="h-6 w-6 text-moto-red-light mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-moto-white">{CATEGORY_LABEL[cat.value]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h3 className="text-xl font-black text-moto-white tracking-tight">Marcas populares</h3>
          <div className="flex flex-wrap gap-3">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => navigate(`/catalogo?marca=${brand}`)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-moto-red px-5 py-2.5 rounded-xl text-sm font-bold text-moto-white transition-all cursor-pointer"
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-moto-white tracking-tight">Motos destacadas</h3>
            <button
              onClick={() => navigate("/catalogo")}
              className="text-xs font-bold text-moto-red-light hover:text-moto-red flex items-center gap-1 cursor-pointer"
            >
              Ver catálogo <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
            {!loading && featured.length === 0 ? (
              <p className="text-moto-gray text-sm">Aún no hay motos publicadas.</p>
            ) : (
              featured.map((m) => (
                <MotorcycleCard
                  key={m.id}
                  listing={m}
                  onOpen={setSelectedListing}
                  isFavorite={favoriteIds.has(m.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </div>
        </section>

        {latest.length > 0 && (
          <section className="space-y-5">
            <h3 className="text-xl font-black text-moto-white tracking-tight">Últimas publicaciones</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
              {latest.map((m) => (
                <MotorcycleCard
                  key={m.id}
                  listing={m}
                  onOpen={setSelectedListing}
                  isFavorite={favoriteIds.has(m.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map(({ Icon, title, body }) => (
            <div key={title} className="bg-moto-black-soft border border-white/10 rounded-2xl p-5 space-y-2">
              <Icon className="h-6 w-6 text-moto-red-light" />
              <h4 className="text-sm font-extrabold text-moto-white">{title}</h4>
              <p className="text-moto-gray text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        <section className="bg-moto-black-soft border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-black tracking-widest text-moto-red-light uppercase block">Testimonios</span>
            <h3 className="text-xl sm:text-2xl font-black text-moto-white tracking-tight">¿Qué opinan nuestros usuarios?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {BUYER_TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <span key={i} className="text-moto-red-light text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-moto-gray-light text-xs leading-relaxed italic">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <div className="bg-moto-red/15 h-8 w-8 rounded-full flex items-center justify-center font-bold text-moto-red-light text-xs shrink-0 font-mono">
                    {t.buyerName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-moto-white">{t.buyerName}</h5>
                    <span className="text-[10px] text-moto-gray font-medium block">{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-moto-black-soft text-white py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-12 gap-8 items-center pb-8 border-b border-white/10">
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-moto-red flex items-center justify-center shrink-0">
                  <Bike className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-black tracking-tight text-white">MotoMarket</h4>
              </div>
              <p className="text-moto-gray text-xs max-w-xl leading-relaxed">
                Plataforma peruana de compra y venta de motocicletas, conectando directamente a compradores y vendedores.
              </p>
            </div>
            <div className="md:col-span-5 md:text-right space-y-2">
              <span className="text-[9px] font-mono bg-white/5 text-moto-red-light px-3 py-1.5 rounded-lg inline-block uppercase font-black tracking-widest">
                Hecho en Perú
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-moto-gray font-medium">
            <p>© 2026 MotoMarket. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <span>Asistente: Tico</span>
            </div>
          </div>
        </div>
      </footer>

      {selectedListing && (
        <MotorcycleDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSelectRelated={setSelectedListing}
        />
      )}
    </>
  );
}
