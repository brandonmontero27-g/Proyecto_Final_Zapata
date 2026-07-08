import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Lock, User, X, Bike } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../api/client.js";

export default function AuthModal() {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const { open, mode } = authModal;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMode, setLocalMode] = useState(mode);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) setLocalMode(mode);
    wasOpen.current = open;
  }, [open, mode]);

  function resetForm() {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setError("");
    setSuccess("");
  }

  function handleClose() {
    resetForm();
    closeAuthModal();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (localMode === "login") {
        await login(email, password);
        handleClose();
      } else {
        await register({ email, password, name, role, phone });
        setSuccess("¡Cuenta creada! Ahora inicia sesión con tu email y contraseña.");
        setLocalMode("login");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-moto-black-soft rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-white/10 overflow-y-auto max-h-[92vh]"
          >
            <div className="text-center space-y-3 mb-6">
              <div className="relative h-16 w-16 mx-auto">
                <div className="h-16 w-16 rounded-full border-2 border-moto-red/30 bg-moto-red/10 shadow-md flex items-center justify-center">
                  <Bike className="h-7 w-7 text-moto-red-light" />
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-moto-white tracking-tight">
                {localMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h3>
              <p className="text-moto-gray text-xs">
                {localMode === "login"
                  ? "Ingresa para gestionar tus favoritos y hablar con Tico"
                  : "Regístrate en MotoMarket de forma totalmente gratuita"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-red-300 text-xs font-semibold rounded-r">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3 text-emerald-300 text-xs font-semibold rounded-r">
                  ✓ {success}
                </div>
              )}

              {localMode === "signup" && (
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-moto-gray h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-moto-gray h-4 w-4" />
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-moto-gray h-4 w-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
                    required
                  />
                </div>
              </div>

              {localMode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Tipo de Usuario</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs bg-white/5 font-bold text-moto-white cursor-pointer"
                    >
                      <option value="buyer">Comprador</option>
                      <option value="seller">Vendedor</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Teléfono Móvil</label>
                    <input
                      type="tel"
                      placeholder="Ej. 966123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-moto-red text-white py-3 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Procesando..." : localMode === "login" ? "Ingresar" : "Registrar Datos"}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center text-xs text-moto-gray mt-6">
              <span>{localMode === "login" ? "¿No tienes una cuenta aún?" : "¿Ya estás registrado en MotoMarket?"}</span>{" "}
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setLocalMode(localMode === "login" ? "signup" : "login");
                }}
                className="text-moto-red-light font-black underline hover:text-moto-red cursor-pointer ml-1"
              >
                {localMode === "login" ? "Crear cuenta ahora" : "Inicia sesión aquí"}
              </button>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-moto-gray hover:text-moto-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
