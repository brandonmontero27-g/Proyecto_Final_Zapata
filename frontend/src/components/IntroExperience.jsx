import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft } from "lucide-react";
import unschEntranceImg from "../assets/images/unsch_entrance_1782935837751.webp";
import makiMascot from "../assets/images/maki_hawk_guindo_plomo_1782934231251.jpg";
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

function MapIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8">
      <path d="M24 5C16.3 5 10 11.3 10 19c0 10.5 14 24 14 24s14-13.5 14-24c0-7.7-6.3-14-14-14z" fill="#FFD700" />
      <circle cx="24" cy="19" r="6.5" fill="#581212" />
      <circle cx="24" cy="19" r="2.4" fill="#FFD700" />
    </svg>
  );
}

function BudgetIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8">
      <ellipse cx="24" cy="35" rx="14" ry="4.5" fill="#581212" />
      <ellipse cx="24" cy="29" rx="14" ry="4.5" fill="#7a1c1c" />
      <ellipse cx="24" cy="23" rx="14" ry="4.5" fill="#9b2d2d" />
      <ellipse cx="24" cy="17" rx="14" ry="4.5" fill="#FFD700" />
      <text x="24" y="20" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#581212" fontFamily="'JetBrains Mono', monospace">
        S/.
      </text>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8">
      <rect x="6" y="9" width="36" height="23" rx="8" fill="#FFD700" />
      <path d="M15 32v7l9-7z" fill="#FFD700" />
      <circle cx="24" cy="20.5" r="8.5" fill="#581212" />
      <path d="M19.5 20.5l3 3 6-6.2" stroke="#FFD700" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    eyebrow: "Ubicación",
    title: "Busca en el mapa real de Ayacucho",
    body: "Filtra por barrio y mira a cuántos minutos caminando queda cada cuarto de tu facultad. Los precios aparecen directo sobre el mapa.",
    Icon: MapIcon
  },
  {
    eyebrow: "Presupuesto",
    title: "Cuadra tus soles del mes",
    body: "La calculadora reparte alquiler, comida, pasaje y materiales para que sepas si un cuarto realmente te alcanza antes de comprometerte.",
    Icon: BudgetIcon
  },
  {
    eyebrow: "Contacto seguro",
    title: "Habla directo con el dueño, sin intermediarios",
    body: "Chatea o llama por WhatsApp desde la publicación. Los perfiles verificados por Maki llevan una insignia dorada.",
    Icon: ChatIcon
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#140404]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a0d0d] via-[#280909] to-[#140404]" />
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: doorsOpen ? 0 : 0.9 }}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#3a0d0d]/60 via-transparent to-[#140404]/90" />
        <div className="absolute inset-0 bg-guindo/20 mix-blend-multiply" />
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute bottom-0 w-full h-1/2 opacity-40">
          <polygon points="0,200 0,120 60,60 130,110 200,40 270,100 330,70 400,130 400,200" fill="#581212" opacity="0.55" />
          <polygon points="0,200 0,160 90,100 180,150 260,90 340,140 400,110 400,200" fill="#300a0a" opacity="0.8" />
        </svg>
      </div>

      <button
        onClick={onComplete}
        className="absolute top-5 right-5 z-[110] flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm"
      >
        <span>Omitir Intro</span>
        <X className="h-3.5 w-3.5" />
      </button>

      <div
        className="relative w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border-2 border-dorado/40"
        style={{ background: "linear-gradient(160deg, #581212 0%, #3a0d0d 60%, #240808 100%)" }}
      >
        <div className="absolute inset-0 z-30 pointer-events-none" style={{ perspective: 1400 }} aria-hidden={doorsOpen}>
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2"
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #7a1c1c 0%, #581212 100%)",
              borderRight: "2px solid rgba(255,215,0,.35)"
            }}
            animate={{ rotateY: doorsOpen ? -100 : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-3 border border-dorado/25 rounded-lg" />
          </motion.div>
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2"
            style={{
              transformOrigin: "right center",
              backfaceVisibility: "hidden",
              background: "linear-gradient(225deg, #7a1c1c 0%, #581212 100%)",
              borderLeft: "2px solid rgba(255,215,0,.35)"
            }}
            animate={{ rotateY: doorsOpen ? 100 : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-3 border border-dorado/25 rounded-lg" />
          </motion.div>

          <motion.svg
            viewBox="0 0 40 40"
            className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: doorsOpen ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <circle cx="20" cy="20" r="10" fill="#FFD700" />
            {[...Array(8)].map((_, i) => (
              <rect key={i} x="19" y="2" width="2" height="7" fill="#FFD700" transform={`rotate(${i * 45} 20 20)`} />
            ))}
          </motion.svg>
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
                  <div className="relative h-56 overflow-hidden">
                    <img src={unschEntranceImg} alt="Pórtico de ingreso de la UNSCH" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-guindo/25 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a0d0d] via-[#3a0d0d]/25 to-transparent" />
                    <img
                      src={makiMascot}
                      alt="Maki, el halcón consejero"
                      className="absolute bottom-0 right-6 translate-y-1/3 h-24 w-24 rounded-full border-4 border-dorado shadow-2xl object-cover"
                    />
                  </div>
                  <div className="px-7 pt-14 pb-2 text-center space-y-2.5">
                    <span className="text-[9px] font-black tracking-widest text-dorado uppercase font-mono block">
                      Portal Universitario · Ayacucho 1677
                    </span>
                    <h2 className="text-xl font-black text-white tracking-tight leading-snug" style={{ textWrap: "balance" }}>
                      Allillanchu, futuro vecino de Huamanga
                    </h2>
                    <p className="text-slate-200 text-xs leading-relaxed max-w-xs mx-auto">
                      Maki, tu halcón consejero, te muestra cómo encontrar cuarto cerca a la UNSCH en 3 pasos.
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
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 border border-dorado/30 flex items-center justify-center shadow-inner">
                    <current.Icon />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-dorado uppercase font-mono block">
                    Paso {step} · {current.eyebrow}
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug" style={{ textWrap: "balance" }}>
                    {current.title}
                  </h3>
                  <p className="text-slate-200 text-xs leading-relaxed max-w-xs mx-auto">{current.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-7 pb-6 pt-4 space-y-4 shrink-0">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-dorado rounded-full"
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
                    step === i + 1 ? "w-6 bg-dorado" : "w-2 bg-white/25 hover:bg-white/40"
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
                className="flex-1 max-w-[220px] bg-dorado text-[#3a0d0d] py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                {step === 0 ? "Comenzar" : step === STEPS.length ? "Explorar Habitaciones →" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
