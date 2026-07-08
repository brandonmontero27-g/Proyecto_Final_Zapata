import { useEffect, useState } from "react";
import { MessageCircle, ShieldCheck, Clock, Lock, Heart, Calculator, Plus, Send, Bike } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { listChatsRequest, getMessagesRequest, sendMessageRequest } from "../api/chat.js";
import { listFavoritesRequest } from "../api/favorites.js";
import { submitVerificationRequest } from "../api/verification.js";
import { getBuyerStatsRequest } from "../api/stats.js";
import { getPlaceholderImage } from "../constants/placeholderImages.js";
import { fileToDataUrl } from "../utils/files.js";
import StatCard from "../components/StatCard.jsx";

export default function BuyerDashboard() {
  const { token, user } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatsLoading, setChatsLoading] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);

  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || "none");
  const [uploading, setUploading] = useState(false);

  const [motoPrice, setMotoPrice] = useState(9000);
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [months, setMonths] = useState(24);
  const financedAmount = motoPrice * (1 - downPaymentPct / 100);
  const monthlyInstallment = Math.round((financedAmount * 1.15) / months);
  const downPaymentAmount = Math.round(motoPrice * (downPaymentPct / 100));

  useEffect(() => {
    listChatsRequest(token)
      .then((data) => {
        setChats(data);
        if (data.length > 0) setActiveChatId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setChatsLoading(false));

    listFavoritesRequest(token)
      .then(setFavorites)
      .catch(() => {});

    getBuyerStatsRequest(token).then(setStats).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!activeChatId) return;
    getMessagesRequest(token, activeChatId)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [activeChatId, token]);

  async function handleSendChatMessage() {
    if (!messageInput.trim() || !activeChatId) return;
    try {
      const msg = await sendMessageRequest(token, activeChatId, messageInput.trim());
      setMessages((prev) => [...prev, msg]);
      setMessageInput("");
    } catch {
      // no-op
    }
  }

  async function handleUploadDoc(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await submitVerificationRequest(token, dataUrl);
      setVerificationStatus("pending");
    } catch {
      // no-op
    } finally {
      setUploading(false);
    }
  }

  const activeChat = chats.find((c) => c.id === activeChatId);
  const isApproved = user?.is_verified || verificationStatus === "approved";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Heart} label="Favoritos Guardados" value={stats?.savedFavorites ?? favorites.length} tone="red" />
        <StatCard icon={MessageCircle} label="Chats Activos" value={stats?.activeChats ?? chats.length} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-moto-red-dark via-[#3a0d0d] to-moto-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border-2 border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black tracking-widest text-moto-red-light uppercase block font-mono">Verificación de identidad</span>
                <span className="text-[10px] text-white/60 font-bold block mt-0.5">MotoMarket</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <Bike className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="flex gap-4 items-center mt-6 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-white/10 border-2 border-white/20 shrink-0 shadow flex items-center justify-center">
                <span className="text-lg font-black text-white">{user?.name?.charAt(0)}</span>
              </div>
              <div className="space-y-1 overflow-hidden">
                <h4 className="text-sm font-black tracking-tight truncate">{user?.name}</h4>
                <p className="text-[10px] text-white/60 font-bold truncate">Comprador MotoMarket</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs relative z-10">
              <div>
                <span className="text-[9px] text-white/50 block font-bold font-mono">ESTADO DE IDENTIDAD</span>
                {isApproved ? (
                  <span className="text-emerald-300 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-4 w-4" /> <span>Verificado</span>
                  </span>
                ) : verificationStatus === "pending" ? (
                  <span className="text-sky-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 animate-spin" /> <span>Revisión en cola</span>
                  </span>
                ) : (
                  <span className="text-white/60 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Lock className="h-3.5 w-3.5" /> <span>Sin Verificar</span>
                  </span>
                )}
              </div>
            </div>

            {!isApproved && verificationStatus !== "pending" && (
              <label className="mt-4 relative z-10 flex items-center justify-center gap-1.5 border-2 border-dashed border-white/30 text-white/90 py-2.5 rounded-xl text-[10px] font-black cursor-pointer hover:bg-white/5 transition-all">
                <Plus className="h-3.5 w-3.5" />
                <span>{uploading ? "Subiendo..." : "Subir DNI"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadDoc} disabled={uploading} />
              </label>
            )}
          </div>

          <div className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-sm overflow-hidden flex flex-col h-[340px]">
            <div className="bg-white/5 border-b border-white/10 p-4 shrink-0">
              <h4 className="text-xs font-black text-moto-white uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-moto-red-light" />
                <span>Mensajes con Vendedores</span>
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/10">
              {chatsLoading ? (
                <div className="p-8 text-center text-moto-gray text-xs">Cargando chats...</div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center text-moto-gray text-xs">
                  Aún no tienes chats activos. Escríbele a un vendedor desde una publicación en el catálogo.
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                      activeChatId === chat.id ? "bg-moto-red/10 border-l-4 border-moto-red" : "hover:bg-white/5"
                    }`}
                  >
                    <h5 className="text-xs font-extrabold text-moto-white truncate">{chat.motorcycles?.title || "Moto"}</h5>
                    <p className="text-[10px] text-moto-gray truncate italic">"{chat.last_message || "Sin mensajes aún"}"</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-moto-black-soft rounded-3xl p-6 border border-white/10 shadow-sm space-y-5">
            <h3 className="text-md font-extrabold text-moto-white tracking-tight flex items-center gap-1.5">
              <Calculator className="h-5 w-5 text-moto-red-light" />
              <span>Simulador de Financiamiento</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-5 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="space-y-1 flex-1 text-center sm:text-left">
                <span className="text-[10px] text-moto-gray font-bold block">CUOTA MENSUAL ESTIMADA</span>
                <p className="text-xl font-black text-moto-white font-mono">
                  S/. {monthlyInstallment} <span className="text-xs font-bold text-moto-gray">/ {months} meses</span>
                </p>
                <span className="text-[10px] text-moto-gray block">Inicial: S/. {downPaymentAmount}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-moto-gray-light">Precio de la moto:</span>
                  <span className="font-black text-moto-white font-mono">S/. {motoPrice}</span>
                </div>
                <input
                  type="range" min={2000} max={40000} step="500"
                  value={motoPrice}
                  onChange={(e) => setMotoPrice(Number(e.target.value))}
                  className="w-full accent-moto-red cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-moto-gray-light">Inicial (%):</span>
                  <span className="font-black text-moto-white font-mono">{downPaymentPct}%</span>
                </div>
                <input
                  type="range" min={10} max={70} step="5"
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                  className="w-full accent-moto-red cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-moto-gray-light">Plazo (meses):</span>
                  <span className="font-black text-moto-white font-mono">{months}</span>
                </div>
                <input
                  type="range" min={6} max={48} step="6"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full accent-moto-red cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-moto-black-soft rounded-3xl p-6 border border-white/10 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-moto-white uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5 text-moto-red fill-moto-red" />
              <span>Mis Motos Favoritas ({favorites.length})</span>
            </h4>

            {favorites.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center text-moto-gray text-xs">
                Aún no has guardado ninguna moto. Marca con ❤️ tus opciones preferidas en el catálogo.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {favorites.map((moto) => (
                  <div key={moto.id} className="border border-white/10 rounded-2xl p-3 flex gap-3 items-center bg-white/5">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-black/40 shrink-0">
                      <img
                        src={moto.images?.[0] || getPlaceholderImage(moto.category, moto.id)}
                        alt={moto.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden text-left space-y-0.5">
                      <h5 className="text-xs font-extrabold text-moto-white truncate">{moto.brand} {moto.model}</h5>
                      <span className="text-[11px] font-black text-moto-red-light font-mono">S/. {Number(moto.price).toLocaleString("es-PE")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeChat && (
            <div className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-md flex flex-col h-[340px] overflow-hidden">
              <div className="bg-black/40 text-white p-3.5 shrink-0">
                <h5 className="text-[11px] font-black truncate">{activeChat.motorcycles?.title || "Chat"}</h5>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-black/20">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] space-y-0.5 ${m.sender === "buyer" ? "ml-auto" : "mr-auto"}`}>
                    <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      m.sender === "buyer" ? "bg-moto-red text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-moto-white rounded-tl-none"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
                className="p-2 border-t border-white/10 bg-moto-black-soft flex gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Escribe tu respuesta..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-moto-red font-medium text-moto-white"
                />
                <button type="submit" className="bg-moto-red text-white p-2 rounded-lg cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
