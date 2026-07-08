import { useState } from "react";
import { Plus, ImagePlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { createMotorcycleRequest, uploadMotorcycleImagesRequest } from "../api/motorcycles.js";
import { ApiError } from "../api/client.js";
import { LOCATIONS, CATEGORY_OPTIONS, FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS, CONDITION_OPTIONS } from "../constants/content.js";
import { fileToDataUrl } from "../utils/files.js";

const MAX_PHOTOS = 8;

const initialForm = {
  title: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "naked",
  displacementCc: 150,
  price: 8000,
  mileageKm: 0,
  fuelType: "gasolina",
  transmission: "manual",
  color: "",
  condition: "used",
  stock: 1,
  location: LOCATIONS[0],
  address: "",
  description: "",
  contactPhone: "",
  whatsappPhone: ""
};

export default function PublishPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoSelect(fileList) {
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) return;

    const newPhotos = Array.from(fileList)
      .slice(0, remainingSlots)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));

    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function startAnother() {
    setSuccess(null);
    setForm(initialForm);
    setPhotos([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      let motorcycle = await createMotorcycleRequest(token, form);

      if (photos.length > 0) {
        setUploadingPhotos(true);
        const dataUrls = await Promise.all(photos.map((p) => fileToDataUrl(p.file)));
        motorcycle = await uploadMotorcycleImagesRequest(token, motorcycle.id, dataUrls);
      }

      setSuccess(motorcycle);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo publicar la moto.");
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-moto-black-soft border border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="text-center space-y-1 mb-5">
          <h3 className="text-lg font-black text-moto-white tracking-tight flex items-center justify-center gap-1.5">
            <Plus className="h-5 w-5 text-moto-red-light" />
            <span>Publicar Moto en MotoMarket</span>
          </h3>
          <p className="text-moto-gray text-xs">
            Tu publicación queda en estado <b>pendiente</b> hasta que un administrador la apruebe.
          </p>
        </div>

        {error && <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-12 w-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-moto-white">¡Tu moto ha sido registrada con éxito!</h4>
            <p className="text-moto-gray text-xs max-w-xs mx-auto">
              Publicado con id <code className="font-mono">{success.id}</code>, estado <b>{success.status}</b>. Un
              administrador debe aprobarla para que aparezca en el catálogo.
            </p>
            <button
              onClick={startAnother}
              className="bg-moto-red text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all cursor-pointer"
            >
              Publicar otra moto
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Título del Anuncio</label>
              <input
                required
                placeholder="Ej. Honda CB190R 2023"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Marca</label>
                <input
                  required
                  placeholder="Ej. Honda"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Modelo</label>
                <input
                  required
                  placeholder="Ej. CB190R"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Año</label>
                <input
                  type="number"
                  min="1980"
                  required
                  value={form.year}
                  onChange={(e) => set("year", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Cilindraje (cc)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.displacementCc}
                  onChange={(e) => set("displacementCc", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Kilometraje</label>
                <input
                  type="number"
                  min="0"
                  value={form.mileageKm}
                  onChange={(e) => set("mileageKm", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                >
                  {CATEGORY_OPTIONS.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Estado</label>
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                >
                  {CONDITION_OPTIONS.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Combustible</label>
                <select
                  value={form.fuelType}
                  onChange={(e) => set("fuelType", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                >
                  {FUEL_TYPE_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Transmisión</label>
                <select
                  value={form.transmission}
                  onChange={(e) => set("transmission", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                >
                  {TRANSMISSION_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Precio (S/. PEN)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Color</label>
                <input
                  placeholder="Ej. Rojo"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Ciudad</label>
                <select
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Stock</label>
                <input
                  type="number"
                  min="1"
                  value={form.stock}
                  onChange={(e) => set("stock", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Dirección Exacta (opcional)</label>
              <input
                placeholder="Ej. Av. Principal 450"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Teléfono de Contacto</label>
                <input
                  required
                  placeholder="Ej. 987654321"
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">WhatsApp (opcional)</label>
                <input
                  placeholder="Ej. 987654321"
                  value={form.whatsappPhone}
                  onChange={(e) => set("whatsappPhone", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Descripción</label>
              <textarea
                rows={2}
                placeholder="Comenta sobre el mantenimiento, papeles, motivo de venta..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs text-moto-white"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">
                Fotos de la Moto ({photos.length}/{MAX_PHOTOS})
              </label>
              <p className="text-[10px] text-moto-gray -mt-0.5">
                Se suben de verdad a Supabase Storage al publicar (recomendamos más de 3).
              </p>

              <label
                htmlFor="publish-photo-input"
                className={`flex items-center justify-center gap-1.5 border-2 border-dashed rounded-xl py-3 text-xs font-bold transition-all ${
                  photos.length >= MAX_PHOTOS
                    ? "border-white/10 text-moto-gray cursor-not-allowed"
                    : "border-moto-red/30 text-moto-red-light hover:bg-moto-red/5 cursor-pointer"
                }`}
              >
                <ImagePlus className="h-4 w-4" />
                <span>Subir fotos</span>
              </label>
              <input
                id="publish-photo-input"
                type="file"
                accept="image/*"
                multiple
                disabled={photos.length >= MAX_PHOTOS}
                onChange={(e) => {
                  handlePhotoSelect(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      <img src={p.previewUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] leading-none font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moto-red text-white py-3 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>{loading ? (uploadingPhotos ? "Subiendo fotos..." : "Publicando...") : "Publicar Ahora"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
