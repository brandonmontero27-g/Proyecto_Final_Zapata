import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, X, Bot } from "lucide-react";
import { sendTicoMessage } from "../api/tico.js";
import { ApiError } from "../api/client.js";

const WELCOME_MESSAGE = {
  sender: "tico",
  text: "¡Hola! Soy Tico, tu asistente de MotoMarket. ¿Qué tipo de moto estás buscando, o cuál es tu presupuesto?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
};

export default function TicoChat({ open, onClose }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || typing) return;

    const history = messages;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text, time }]);
    setInput("");
    setTyping(true);

    try {
      const res = await sendTicoMessage(text, history.slice(-6));
      setMessages((prev) => [
        ...prev,
        { sender: "tico", text: res.text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No pude responder en este momento, intenta de nuevo.";
      setMessages((prev) => [
        ...prev,
        { sender: "tico", text: `⚠️ ${message}`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-moto-black-soft h-full shadow-2xl flex flex-col justify-between border-l border-white/10"
          >
            <div className="bg-moto-red text-white px-5 py-4 flex items-center justify-between border-b-4 border-moto-red-dark shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/15 border-2 border-white/20 shrink-0 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                    <span>Tico</span>
                    <span className="bg-emerald-400 h-2 w-2 rounded-full inline-block animate-pulse" />
                  </h4>
                  <span className="text-[10px] text-white/70 block font-mono">Asistente de MotoMarket</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  {msg.sender === "tico" && (
                    <div className="h-8 w-8 rounded-full bg-moto-black border border-moto-red shrink-0 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-moto-red-light" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-moto-red text-white rounded-tr-none"
                          : "bg-moto-black-softer border border-white/10 text-moto-white rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-moto-gray block font-mono text-right px-1">{msg.time}</span>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="h-8 w-8 rounded-full bg-moto-black border border-moto-red shrink-0 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-moto-red-light" />
                  </div>
                  <div className="bg-moto-black-softer border border-white/10 p-3 rounded-2xl rounded-tl-none text-xs text-moto-gray-light shadow-sm flex items-center gap-1.5">
                    <span className="font-bold text-moto-red-light">Tico está pensando</span>
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 bg-moto-red rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-moto-red rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-moto-red rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-moto-black-soft border-t border-white/10 flex gap-2 items-center shrink-0"
            >
              <input
                type="text"
                placeholder="Escribe tu pregunta sobre motos..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-moto-black border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-moto-red font-medium text-moto-white placeholder:text-moto-gray"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="bg-moto-red text-white p-2.5 rounded-xl hover:bg-moto-red-dark transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
