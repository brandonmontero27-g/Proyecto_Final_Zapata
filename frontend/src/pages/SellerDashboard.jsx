import { useEffect, useState } from "react";
import { ShieldCheck, MessageCircle, Send, Plus, Clock, Layers, Heart, Users, Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { listMyMotorcyclesRequest } from "../api/motorcycles.js";
import { listChatsRequest, getMessagesRequest, sendMessageRequest } from "../api/chat.js";
import { submitVerificationRequest } from "../api/verification.js";
import { getSellerStatsRequest } from "../api/stats.js";
import { getPlaceholderImage } from "../constants/placeholderImages.js";
import { fileToDataUrl } from "../utils/files.js";
import StatCard from "../components/StatCard.jsx";

const STATUS_LABEL = {
  approved: { label: "Activo", className: "bg-emerald-500/15 text-emerald-300" },
  pending: { label: "En revisión", className: "bg-amber-500/15 text-amber-300" },
  suspended: { label: "Suspendido", className: "bg-red-500/15 text-red-300" },
  flagged: { label: "Observado", className: "bg-red-500/15 text-red-300" }
};

export default function SellerDashboard() {
  const { token, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || "none");
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    listMyMotorcyclesRequest(token)
      .then(setListings)
      .catch(() => {})
      .finally(() => setLoading(false));

    listChatsRequest(token)
      .then((data) => {
        setChats(data);
        if (data.length > 0) setActiveChatId(data[0].id);
      })
      .catch(() => {});

    getSellerStatsRequest(token).then(setStats).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!activeChatId) return;
    getMessagesRequest(token, activeChatId).then(setMessages).catch(() => setMessages([]));
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

  const approvedListings = listings.filter((l) => l.status === "approved");
  const totalValue = approvedListings.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const isApproved = user?.is_verified || verificationStatus === "approved";
  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Bike}
          label="Mis Motos Activas"
          value={stats ? stats.motorcyclesByStatus.approved || 0 : approvedListings.length}
          hint={`${stats ? stats.motorcyclesByStatus.pending || 0 : listings.filter((l) => l.status === "pending").length} en cola de aprobación`}
        />
        <StatCard icon={Layers} label="Total de Publicaciones" value={stats ? stats.totalMotorcycles : listings.length} />
        <StatCard
          label="Valor Publicado"
          value={`S/. ${totalValue.toLocaleString("es-PE")}`}
          hint="Suma de motos activas"
          tone="red"
        />
        <StatCard icon={Heart} label="Favoritos Recibidos" value={stats?.favoritesReceived ?? "—"} tone="red" />
        <StatCard icon={Users} label="Contactos Recibidos" value={stats?.contactsReceived ?? "—"} tone="red" />

        <StatCard label="Verificación">
          {isApproved ? (
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" /> <span>Verificado</span>
            </span>
          ) : verificationStatus === "pending" ? (
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              <Clock className="h-4 w-4 animate-spin" /> <span>En revisión</span>
            </span>
          ) : (
            <label className="mt-1 flex items-center gap-1.5 text-[10px] font-black text-moto-red-light cursor-pointer underline">
              <span>{uploading ? "Subiendo..." : "Subir DNI/RUC"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadDoc} disabled={uploading} />
            </label>
          )}
        </StatCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-moto-black-soft p-6 rounded-3xl border border-white/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h4 className="text-xs font-black text-moto-white uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="h-4.5 w-4.5 text-moto-red-light" />
              <span>Mis Motos Publicadas</span>
            </h4>
            <Link
              to="/publicar"
              className="bg-moto-red text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-moto-red-dark transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Publicar Nueva</span>
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-moto-gray py-8 text-center">Cargando tus publicaciones...</p>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-moto-gray text-xs border border-dashed border-white/10 rounded-2xl space-y-3">
              <p>Aún no tienes motos publicadas.</p>
              <Link to="/publicar" className="bg-white/5 hover:bg-white/10 text-moto-white px-4 py-2 rounded-xl text-[10px] font-bold inline-block cursor-pointer">
                Publicar mi primera moto
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((moto) => {
                const status = STATUS_LABEL[moto.status] || STATUS_LABEL.pending;
                return (
                  <div key={moto.id} className="border border-white/10 rounded-2xl p-4 space-y-3 text-left bg-white/5">
                    <div className="h-28 rounded-xl overflow-hidden bg-black/40 relative">
                      <img
                        src={moto.images?.[0] || getPlaceholderImage(moto.category, moto.id)}
                        alt={moto.title}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <h5 className="text-xs font-extrabold text-moto-white truncate">{moto.brand} {moto.model} {moto.year}</h5>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-moto-gray">{moto.location}</span>
                      <span className="font-black text-moto-red-light font-mono">S/. {Number(moto.price).toLocaleString("es-PE")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          {activeChat ? (
            <div className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-md flex flex-col h-[420px] overflow-hidden">
              <div className="bg-black/40 text-white p-3.5 shrink-0 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h5 className="text-[11px] font-black truncate">{activeChat.motorcycles?.title || "Chat"}</h5>
              </div>
              {chats.length > 1 && (
                <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto shrink-0">
                  {chats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveChatId(c.id)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-lg shrink-0 cursor-pointer ${
                        c.id === activeChatId ? "bg-moto-red text-white" : "bg-white/5 text-moto-gray-light"
                      }`}
                    >
                      {c.motorcycles?.title?.slice(0, 18) || "Chat"}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-black/20">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] space-y-0.5 ${m.sender === "seller" ? "ml-auto" : "mr-auto"}`}>
                    <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      m.sender === "seller" ? "bg-moto-red text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-moto-white rounded-tl-none"
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
                  placeholder="Responde al comprador..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-moto-red font-medium text-moto-white"
                />
                <button type="submit" className="bg-moto-red text-white p-2 rounded-lg cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-moto-black-soft rounded-3xl border border-dashed border-white/10 p-8 text-center text-moto-gray text-xs h-[420px] flex items-center justify-center">
              Aún no tienes conversaciones con compradores interesados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
