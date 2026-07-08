import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { listMotorcyclesRequest } from "../api/motorcycles.js";
import { listFavoritesRequest, addFavoriteRequest, removeFavoriteRequest } from "../api/favorites.js";
import { ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import MotorcycleCard from "../components/MotorcycleCard.jsx";
import MotorcycleDetailModal from "../components/MotorcycleDetailModal.jsx";
import { BRANDS, CATEGORY_OPTIONS, CONDITION_OPTIONS } from "../constants/content.js";

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { label: "Más recientes", value: "recent" },
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Año: más nuevo", value: "year_desc" }
];

export default function CatalogPage() {
  const { isAuthenticated, token, openAuthModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("recent");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [selectedListing, setSelectedListing] = useState(null);

  const marca = searchParams.get("marca") || "";
  const categoria = searchParams.get("categoria") || "";
  const estado = searchParams.get("estado") || "";
  const precioMax = searchParams.get("precio_max") || "";
  const searchQuery = searchParams.get("q") || "";

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  async function load(pageToLoad = 1) {
    setLoading(true);
    setError("");
    try {
      const data = await listMotorcyclesRequest({ marca, categoria, estado, precio_max: precioMax, page: pageToLoad, limit: PAGE_SIZE });
      setMotorcycles(data);
      setPage(pageToLoad);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las motos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marca, categoria, estado, precioMax]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    listFavoritesRequest(token)
      .then((data) => setFavoriteIds(new Set(data.map((m) => m.id))))
      .catch(() => {});
  }, [isAuthenticated, token]);

  const filteredSorted = useMemo(() => {
    let list = motorcycles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.model.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "year_desc") sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [motorcycles, searchQuery, sort]);

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

  function resetFilters() {
    setSearchParams({});
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
      <aside className="space-y-6 h-fit lg:sticky lg:top-24">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-moto-red-light" />
          <h3 className="text-sm font-black text-moto-white uppercase tracking-wider">Filtros</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Marca</label>
          <select
            value={marca}
            onChange={(e) => updateFilter("marca", e.target.value)}
            className="w-full px-3 py-2.5 bg-moto-black-soft border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-bold text-moto-white cursor-pointer"
          >
            <option value="">Todas</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => updateFilter("categoria", e.target.value)}
            className="w-full px-3 py-2.5 bg-moto-black-soft border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-bold text-moto-white cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Estado</label>
          <select
            value={estado}
            onChange={(e) => updateFilter("estado", e.target.value)}
            className="w-full px-3 py-2.5 bg-moto-black-soft border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-bold text-moto-white cursor-pointer"
          >
            {CONDITION_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Precio máximo (S/.)</label>
          <input
            type="number"
            min="0"
            placeholder="Sin límite"
            value={precioMax}
            onChange={(e) => updateFilter("precio_max", e.target.value)}
            className="w-full px-3 py-2.5 bg-moto-black-soft border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white placeholder:text-moto-gray"
          />
        </div>

        <button
          onClick={resetFilters}
          className="w-full bg-white/5 hover:bg-white/10 text-moto-gray-light text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer border border-white/10"
        >
          Limpiar filtros
        </button>
      </aside>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-moto-gray text-xs">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : loading ? (
              "Cargando motos..."
            ) : (
              <>Mostrando <span className="font-bold text-moto-red-light">{filteredSorted.length} motos</span></>
            )}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-moto-black-soft border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-bold text-moto-white cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {!loading && filteredSorted.length === 0 ? (
          <div className="bg-moto-black-soft rounded-3xl border border-dashed border-white/10 p-12 text-center space-y-4">
            <Compass className="h-12 w-12 text-moto-gray mx-auto stroke-1" />
            <h4 className="font-extrabold text-moto-white">No encontramos motos con esos filtros</h4>
            <button
              onClick={resetFilters}
              className="bg-moto-red text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-moto-red-dark transition-all cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSorted.map((moto) => (
              <MotorcycleCard
                key={moto.id}
                listing={moto}
                onOpen={setSelectedListing}
                isFavorite={favoriteIds.has(moto.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1 || loading}
            className="bg-moto-black-soft border border-white/10 text-moto-white p-2.5 rounded-xl hover:border-moto-red disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-moto-gray-light">Página {page}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={!hasMore || loading}
            className="bg-moto-black-soft border border-white/10 text-moto-white p-2.5 rounded-xl hover:border-moto-red disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {selectedListing && (
        <MotorcycleDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSelectRelated={setSelectedListing}
        />
      )}
    </main>
  );
}
