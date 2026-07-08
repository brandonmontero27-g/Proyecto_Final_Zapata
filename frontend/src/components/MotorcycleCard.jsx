import { Heart, MapPin, Gauge, Phone } from "lucide-react";
import { CATEGORY_LABEL, CONDITION_LABEL } from "../constants/content.js";
import { getPlaceholderImage } from "../constants/placeholderImages.js";

export default function MotorcycleCard({ listing, onOpen, isFavorite, onToggleFavorite }) {
  const image = listing.images?.[0] || getPlaceholderImage(listing.category, listing.id);
  const waNumber = (listing.whatsapp_phone || listing.contact_phone || "").replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hola, vengo de MotoMarket y estoy interesado en tu ${listing.brand} ${listing.model} (${listing.year}). ¿Sigue disponible?`
  );

  return (
    <div
      onClick={() => onOpen(listing)}
      className="w-[290px] sm:w-[340px] shrink-0 bg-moto-black-soft rounded-2xl border border-white/10 hover:border-moto-red shadow-lg hover:shadow-moto-red/10 transition-all cursor-pointer snap-start overflow-hidden group flex flex-col justify-between"
    >
      <div className="relative h-44 bg-black/40 overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {listing.verified_by_tico && (
            <span className="bg-moto-navy-light text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider font-mono shadow-sm">
              Verificado Tico
            </span>
          )}
          <span className="bg-moto-red text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide w-fit">
            {CATEGORY_LABEL[listing.category] || listing.category}
          </span>
        </div>

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing);
            }}
            className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm p-2 rounded-xl shadow hover:scale-110 active:scale-90 transition-all z-10"
          >
            <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-moto-red text-moto-red" : "text-moto-gray-light hover:text-moto-red"}`} />
          </button>
        )}

        <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
          <MapPin className="h-3 w-3 text-moto-red-light" />
          <span>{listing.location}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="text-sm font-extrabold text-moto-white line-clamp-1 group-hover:text-moto-red-light transition-colors">
            {listing.brand} {listing.model} {listing.year}
          </h4>
          <p className="text-moto-gray text-[11px] mt-1">
            {CONDITION_LABEL[listing.condition] || listing.condition} · {listing.displacement_cc}cc
          </p>
        </div>

        <div className="flex items-center gap-1 text-moto-gray text-[10px] font-medium">
          <Gauge className="h-3 w-3 text-moto-red-light" />
          <span>{listing.mileage_km?.toLocaleString("es-PE")} km</span>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-[10px] text-moto-gray block font-medium">Precio</span>
          <span className="text-sm font-black text-moto-red-light font-mono">
            S/. {Number(listing.price).toLocaleString("es-PE")}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
          <a
            href={`tel:${listing.contact_phone}`}
            className="flex-1 bg-moto-red hover:bg-moto-red-dark text-white text-[11px] font-black py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer text-center"
          >
            <Phone className="h-3 w-3 shrink-0" />
            <span>Llamar</span>
          </a>
          <a
            href={`https://wa.me/51${waNumber}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer text-center"
          >
            <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
