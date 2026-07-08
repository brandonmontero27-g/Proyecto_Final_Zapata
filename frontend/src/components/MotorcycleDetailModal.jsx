import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, MapPin, Check, Phone, MessageCircle, CalendarClock, ShoppingCart, Gauge, Fuel, Cog } from "lucide-react";
import { CATEGORY_LABEL, CONDITION_LABEL } from "../constants/content.js";
import { useAuth } from "../context/AuthContext.jsx";
import { startChatRequest, sendMessageRequest } from "../api/chat.js";
import { getMotorcycleRequest } from "../api/motorcycles.js";
import { getPlaceholderImages } from "../constants/placeholderImages.js";

export default function MotorcycleDetailModal({ listing, onClose, onSelectRelated }) {
  const { isAuthenticated, user, token, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const [chatError, setChatError] = useState("");
  const [related, setRelated] = useState([]);
  const images =
    listing?.images?.length > 0 ? listing.images : getPlaceholderImages(listing?.category, listing?.id);

  useEffect(() => {
    if (!listing?.id) return;
    setGalleryIndex(0);
    getMotorcycleRequest(listing.id)
      .then((data) => setRelated(data.related || []))
      .catch(() => setRelated([]));
  }, [listing?.id]);

  if (!listing) return null;

  async function handleContact(intentMessage) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setChatError("");
    setStartingChat(true);
    try {
      const chat = await startChatRequest(token, listing.seller_id, listing.id);
      if (intentMessage) {
        await sendMessageRequest(token, chat.id, intentMessage);
      }
      onClose();
      navigate("/portal");
    } catch (err) {
      setChatError(err?.message || "No se pudo iniciar el chat.");
    } finally {
      setStartingChat(false);
    }
  }

  const waNumber = (listing.whatsapp_phone || listing.contact_phone || "").replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hola, vengo de MotoMarket y estoy interesado en tu ${listing.brand} ${listing.model} (${listing.year}). ¿Sigue disponible?`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-moto-black-soft rounded-3xl max-w-lg w-full p-6 shadow-2xl relative z-10 border border-white/10 overflow-y-auto max-h-[92vh]"
        >
          <div className="relative h-48 -mx-6 -mt-6 bg-black/40 overflow-hidden mb-4">
            <img
              src={images[galleryIndex] ?? images[0]}
              alt={`${listing.title} - foto ${galleryIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-1 rounded-full shadow-md text-white transition-colors cursor-pointer z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm p-1 rounded-full shadow-md text-white transition-colors cursor-pointer z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === galleryIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {listing.verified_by_tico && (
                <span className="bg-moto-navy-light text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider font-mono shadow">
                  Verificado Tico
                </span>
              )}
              <span className="bg-moto-red text-white text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                {CATEGORY_LABEL[listing.category] || listing.category}
              </span>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm p-1.5 rounded-xl shadow-md text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-bold text-moto-red-light">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.location}</span>
            </div>
            <h3 className="text-lg font-black text-moto-white tracking-tight leading-snug">
              {listing.brand} {listing.model} {listing.year}
            </h3>
          </div>

          {listing.description && <p className="text-moto-gray-light text-xs leading-relaxed mt-3">{listing.description}</p>}

          <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-center">
              <Gauge className="h-4 w-4 text-moto-red-light mx-auto mb-1" />
              <span className="text-[9px] text-moto-gray block font-bold uppercase tracking-wider">Kilometraje</span>
              <span className="text-xs font-extrabold text-moto-white">{listing.mileage_km?.toLocaleString("es-PE")} km</span>
            </div>
            <div className="text-center">
              <Fuel className="h-4 w-4 text-moto-red-light mx-auto mb-1" />
              <span className="text-[9px] text-moto-gray block font-bold uppercase tracking-wider">Combustible</span>
              <span className="text-xs font-extrabold text-moto-white capitalize">{listing.fuel_type}</span>
            </div>
            <div className="text-center">
              <Cog className="h-4 w-4 text-moto-red-light mx-auto mb-1" />
              <span className="text-[9px] text-moto-gray block font-bold uppercase tracking-wider">Transmisión</span>
              <span className="text-xs font-extrabold text-moto-white capitalize">{listing.transmission}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-moto-gray block font-bold uppercase tracking-wider">Estado / Cilindraje</span>
              <span className="text-xs font-extrabold text-moto-white block mt-0.5">
                {CONDITION_LABEL[listing.condition]} · {listing.displacement_cc}cc
              </span>
            </div>
            <div>
              <span className="text-[10px] text-moto-gray block font-bold uppercase tracking-wider">Precio</span>
              <span className="text-sm font-black text-moto-red-light font-mono">
                S/. {Number(listing.price).toLocaleString("es-PE")}
              </span>
            </div>
          </div>

          {listing.color && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="bg-white/5 border border-white/10 text-moto-gray-light text-[10px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Check className="h-3 w-3 text-moto-red-light" />
                <span>Color: {listing.color}</span>
              </span>
              <span className="bg-white/5 border border-white/10 text-moto-gray-light text-[10px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Check className="h-3 w-3 text-moto-red-light" />
                <span>Stock: {listing.stock}</span>
              </span>
            </div>
          )}

          <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${listing.contact_phone}`}
                className="bg-moto-red text-white py-2.5 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md flex items-center gap-1.5 cursor-pointer justify-center"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Llamar</span>
              </a>

              <a
                href={`https://wa.me/51${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5 cursor-pointer justify-center"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>

            {(!isAuthenticated || user?.role === "buyer") && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleContact(`Hola, quiero comprar tu ${listing.brand} ${listing.model}. ¿Cómo continuamos?`)}
                  disabled={startingChat}
                  className="bg-moto-navy-light text-white py-2.5 rounded-xl text-xs font-black hover:bg-moto-navy transition-all shadow-md flex items-center gap-1.5 cursor-pointer justify-center disabled:opacity-50"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Comprar</span>
                </button>
                <button
                  onClick={() => handleContact(`Hola, quisiera agendar una visita para ver tu ${listing.brand} ${listing.model} en persona.`)}
                  disabled={startingChat}
                  className="bg-white/10 text-moto-white py-2.5 rounded-xl text-xs font-black hover:bg-white/15 transition-all shadow-md flex items-center gap-1.5 cursor-pointer justify-center disabled:opacity-50"
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span>Agendar visita</span>
                </button>
              </div>
            )}
            {(!isAuthenticated || user?.role === "buyer") && (
              <button
                onClick={() => handleContact()}
                disabled={startingChat}
                className="w-full bg-transparent border border-white/15 text-moto-gray-light py-2 rounded-xl text-[11px] font-bold hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer justify-center disabled:opacity-50"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{startingChat ? "Iniciando chat..." : "Solo chatear"}</span>
              </button>
            )}
            {chatError && <p className="text-[10px] text-red-400 font-semibold text-center">{chatError}</p>}
          </div>

          {related.length > 0 && (
            <div className="mt-6 space-y-2">
              <span className="text-[10px] text-moto-gray block font-bold uppercase tracking-wider">Motos relacionadas</span>
              <div className="grid grid-cols-2 gap-2">
                {related.map((moto) => (
                  <button
                    key={moto.id}
                    onClick={() => onSelectRelated?.(moto)}
                    className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2.5 transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-moto-white block truncate">{moto.brand} {moto.model}</span>
                    <span className="text-[10px] text-moto-red-light font-mono">S/. {Number(moto.price).toLocaleString("es-PE")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
