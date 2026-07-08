import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck, ThumbsUp, Flag, Ban, FileClock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  listNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest
} from "../api/notifications.js";

const POLL_INTERVAL_MS = 45000;

const TYPE_META = {
  motorcycle_approved: { icon: ThumbsUp, className: "text-emerald-400 bg-emerald-500/15" },
  motorcycle_flagged: { icon: Flag, className: "text-amber-400 bg-amber-500/15" },
  motorcycle_suspended: { icon: Ban, className: "text-red-400 bg-red-500/15" },
  motorcycle_pending_review: { icon: FileClock, className: "text-sky-400 bg-sky-500/15" }
};

function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export default function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  async function load() {
    try {
      const data = await listNotificationsRequest(token);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationReadRequest(token, id);
    } catch {
      // no-op
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await markAllNotificationsReadRequest(token);
    } catch {
      // no-op
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative bg-white/5 hover:bg-white/10 text-moto-white p-2.5 rounded-xl transition-all cursor-pointer"
        title="Notificaciones"
      >
        <Bell className="h-4 w-4 text-moto-red-light" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-moto-red text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full font-black flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute right-0 mt-2 w-80 max-h-[420px] bg-moto-black-soft rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <h4 className="text-xs font-black text-moto-white uppercase tracking-wider">Notificaciones</h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-moto-red-light hover:text-moto-red cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Marcar todas</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/10">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-moto-gray py-10">No tienes notificaciones.</p>
              ) : (
                notifications.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.motorcycle_pending_review;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex gap-2.5 items-start transition-colors cursor-pointer hover:bg-white/5 ${
                        !n.read_at ? "bg-moto-red/10" : ""
                      }`}
                    >
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${meta.className}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-moto-white block truncate">{n.title}</span>
                        {n.body && <span className="text-[10px] text-moto-gray block truncate">{n.body}</span>}
                        <span className="text-[9px] text-moto-gray block mt-0.5">{timeAgo(n.created_at)}</span>
                      </span>
                      {!n.read_at && <span className="h-2 w-2 rounded-full bg-moto-red shrink-0 mt-1" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
