import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TicoChat from "./components/TicoChat.jsx";
import AuthModal from "./components/AuthModal.jsx";
import IntroExperience from "./components/IntroExperience.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import PublishPage from "./pages/PublishPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AccountSettingsPage from "./pages/AccountSettingsPage.jsx";

const INTRO_STORAGE_KEY = "motomarket_intro_seen";

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_STORAGE_KEY));

  function closeIntro() {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
    setShowIntro(false);
  }

  return (
    <div className="min-h-screen bg-moto-black text-moto-white font-sans selection:bg-moto-red selection:text-white">
      <NavBar onOpenTico={() => setIsChatOpen(true)} onReplayIntro={() => setShowIntro(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/explorar" element={<Navigate to="/catalogo" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/publicar"
          element={
            <ProtectedRoute roles={["seller", "admin"]}>
              <PublishPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal"
          element={
            <ProtectedRoute roles={["buyer", "seller"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cuenta"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TicoChat open={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal />
      {showIntro && <IntroExperience onComplete={closeIntro} />}
    </div>
  );
}
