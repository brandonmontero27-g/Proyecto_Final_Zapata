import { useState } from "react";
import { Camera, User, Lock, ShieldCheck, Save, Bike } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfileRequest, updatePasswordRequest, uploadAvatarRequest } from "../api/profile.js";
import { ApiError } from "../api/client.js";
import { fileToDataUrl } from "../utils/files.js";

const ROLE_LABEL = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador" };

export default function AccountSettingsPage() {
  const { user, token, updateUser } = useAuth();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const { profile } = await uploadAvatarRequest(token, dataUrl);
      updateUser({ avatar_url: profile.avatar_url });
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "No se pudo actualizar la foto.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      const { profile } = await updateProfileRequest(token, { name, phone });
      updateUser(profile);
      setProfileSuccess("Datos actualizados correctamente.");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePasswordRequest(token, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Contraseña actualizada correctamente.");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moto-red animate-pulse" />
          <span className="text-[10px] font-black text-moto-red-light uppercase tracking-wider font-mono">Mi Cuenta</span>
        </div>
        <h2 className="text-2xl font-black text-moto-white tracking-tight mt-1">Configurar Cuenta</h2>
        <p className="text-moto-gray text-xs mt-1">Actualiza tu foto, tus datos personales y tu contraseña.</p>
      </div>

      <div className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
        <div className="relative h-24 w-24 shrink-0">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-moto-red/30 bg-white/5 shadow-md flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <Bike className="h-8 w-8 text-moto-red-light" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-moto-red text-white flex items-center justify-center border-2 border-moto-black-soft shadow-md cursor-pointer hover:bg-moto-red-dark transition-all active:scale-90">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
          </label>
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-sm font-black text-moto-white">{user.name}</h4>
          <span className="text-[10px] font-black text-moto-red-light uppercase tracking-wider bg-moto-red/10 px-2 py-0.5 rounded-full inline-block">
            {ROLE_LABEL[user.role] || user.role}
          </span>
          {user.is_verified && (
            <span className="ml-1.5 text-[10px] font-black text-amber-300 uppercase tracking-wider bg-amber-500/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Verificado
            </span>
          )}
          <p className="text-[11px] text-moto-gray">{uploadingAvatar ? "Subiendo foto..." : "Haz clic en la cámara para cambiar tu foto"}</p>
          {avatarError && <p className="text-[11px] text-red-400 font-semibold">{avatarError}</p>}
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-sm p-6 space-y-4 animate-fade-in">
        <h4 className="text-xs font-black text-moto-white uppercase tracking-wider flex items-center gap-1.5">
          <User className="h-4 w-4 text-moto-red-light" />
          <span>Datos Personales</span>
        </h4>

        {profileError && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-red-300 text-xs font-semibold rounded-r">{profileError}</div>
        )}
        {profileSuccess && (
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3 text-emerald-300 text-xs font-semibold rounded-r">{profileSuccess}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
              required
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Teléfono Móvil</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="bg-moto-red text-white py-2.5 px-5 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{savingProfile ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="bg-moto-black-soft rounded-3xl border border-white/10 shadow-sm p-6 space-y-4 animate-fade-in">
        <h4 className="text-xs font-black text-moto-white uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-moto-red-light" />
          <span>Cambiar Contraseña</span>
        </h4>

        {passwordError && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-3 text-red-300 text-xs font-semibold rounded-r">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3 text-emerald-300 text-xs font-semibold rounded-r">{passwordSuccess}</div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
              required
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black tracking-wider text-moto-gray uppercase block">Confirmar Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-moto-red text-xs font-medium text-moto-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPassword}
          className="bg-moto-red text-white py-2.5 px-5 rounded-xl text-xs font-black hover:bg-moto-red-dark transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{savingPassword ? "Actualizando..." : "Actualizar Contraseña"}</span>
        </button>
      </form>
    </div>
  );
}
