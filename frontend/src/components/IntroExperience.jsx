import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, Bike, Wallet, MessageCircle } from "lucide-react";
import embersVideo from "../assets/videos/intro-embers-bg.mp4";

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DOOR_SPRING = prefersReducedMotion
  ? { duration: 0 }
  : { type: "spring", damping: 22, stiffness: 140 };

const STEP_SPRING = prefersReducedMotion
  ? { duration: 0.15 }
  : { duration: 0.32, ease: [0.16, 1, 0.3, 1] };

// El video de brasas solo acompaña el estallido de abrir la puerta: se
// desvanece apenas se abre para no competir con el contenido de los pasos.
const VIDEO_FADE_SECONDS = 1.4;

const STEPS = [
  {
    eyebrow: "Catálogo real",
    title: "Filtra por marca, cilindraje y precio",
    body: "Explora motos nuevas y usadas de verdad, con filtros por marca, modelo, año, cilindraje, precio y estado. Los precios aparecen directo sobre el mapa.",
    Icon: Bike
  },
  {
    eyebrow: "Presupuesto",
    title: "Compara precios reales del mercado",
    body: "Revisa el rango de precios por categoría antes de negociar, para saber si una oferta realmente conviene.",
    Icon: Wallet
  },
  {
    eyebrow: "Contacto directo",
    title: "Habla directo con el vendedor",
    body: "Chatea o contacta por WhatsApp desde la publicación. Las motos verificadas por Tico llevan una insignia especial.",
    Icon: MessageCircle
  }
];

export default function IntroExperience({ onComplete }) {
  const [doorsOpen, setDoorsOpen] = useState(prefersReducedMotion);
  const [step, setStep] = useState(0); // 0 = bienvenida, 1-3 = pasos
  const [direction, setDirection] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    videoRef.current?.play().catch(() => {});
    const timer = setTimeout(() => setDoorsOpen(true), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!doorsOpen || !videoRef.current) return;
    const timer = setTimeout(() => videoRef.current?.pause(), VIDEO_FADE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [doorsOpen]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function goTo(next) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleNext() {
    if (step === STEPS.length) {
      onComplete();
    } else {
      goTo(step + 1);
    }
  }

  const progress = (step / STEPS.length) * 100;
  const current = step > 0 ? STEPS[step - 1] : null;
  const slideOffset = prefersReducedMotion ? 0 : 28;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-moto-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a0606] via-[#160303] to-moto-black" />
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: doorsOpen ? 0 : 0.85 }}
            transition={{ duration: VIDEO_FADE_SECONDS, ease: "easeOut" }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src={embersVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a0606]/60 via-transparent to-moto-black/90" />
        <div className="absolute inset-0 bg-moto-red/15 mix-blend-multiply" />
      </div>

      <button
        onClick={onComplete}
        className="absolute top-5 right-5 z-[110] flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm"
      >
        <span>Omitir Intro</span>
        <X className="h-3.5 w-3.5" />
      </button>

      <div
        className="relative w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border-2 border-moto-red/40"
        style={{ background: "linear-gradient(160deg, #1a0505 0%, #120303 60%, #0a0a0a 100%)" }}
      >
        <div className="absolute inset-0 z-30 pointer-events-none" style={{ perspective: 1400 }} aria-hidden={doorsOpen}>
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
              borderRight: "2px solid rgba(255,255,255,.15)"
            }}
            animate={{ rotateY: doorsOpen ? -100 : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-3 border border-white/15 rounded-lg" />
          </motion.div>
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{
              transformOrigin: "right center",
              backfaceVisibility: "hidden",
              background: "linear-gradient(225deg, #dc2626 0%, #7f1d1d 100%)",
              borderLeft: "2px solid rgba(255,255,255,.15)"
            }}
            animate={{ rotateY: doorsOpen ? 100 : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-3 border border-white/15 rounded-lg" />
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-moto-red flex items-center justify-center shadow-lg"
            animate={{ opacity: doorsOpen ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <Bike className="h-7 w-7 text-white" />
          </motion.div>
        </div>

        <div className="min-h-[420px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence initial={false} custom={direction}>
              {step === 0 ? (
                <motion.div
                  key="welcome"
                  custom={direction}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideOffset }}
                  transition={STEP_SPRING}
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-moto-red-dark via-[#1a0505] to-moto-black flex items-center justify-center">
                    <Bike className="h-20 w-20 text-white/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0505] via-transparent to-transparent" />
                  </div>
                  <div className="px-7 pt-8 pb-2 text-center space-y-2.5">
                    <span className="text-[9px] font-black tracking-widest text-moto-red-light uppercase font-mono block">
                      MotoMarket · Compra y venta de motos
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight leading-snug" style={{ textWrap: "balance" }}>
                      Bienvenido a MotoMarket
                    </h2>
                    <p className="text-moto-gray-light text-xs leading-relaxed max-w-xs mx-auto">
                      Tico, tu asistente virtual, te muestra cómo encontrar tu próxima moto en 3 pasos.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`step-${step}`}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? slideOffset : -slideOffset }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -slideOffset : slideOffset }}
                  transition={STEP_SPRING}
                  className="px-7 pt-12 pb-2 text-center space-y-3 min-h-[340px] flex flex-col items-center justify-center"
                >
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 border border-moto-red/30 flex items-center justify-center shadow-inner">
                    <current.Icon className="h-8 w-8 text-moto-red-light" />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-moto-red-light uppercase font-mono block">
                    Paso {step} · {current.eyebrow}
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug" style={{ textWrap: "balance" }}>
                    {current.title}
                  </h3>
                  <p className="text-moto-gray-light text-xs leading-relaxed max-w-xs mx-auto">{current.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-7 pb-6 pt-4 space-y-4 shrink-0">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-moto-red rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i + 1)}
                  aria-label={`Ir al paso ${i + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    step === i + 1 ? "w-6 bg-moto-red" : "w-2 bg-white/25 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className="flex items-center gap-1 text-[11px] font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-0 disabled:pointer-events-none px-2 py-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Atrás</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 max-w-[220px] bg-moto-red text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-moto-red-dark active:scale-95 transition-all cursor-pointer"
              >
                {step === 0 ? "Comenzar" : step === STEPS.length ? "Ver catálogo →" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
