# Constitución de MotoMarket

**Versión:** 1.0.0 · **Ratificada:** 2026-07-09 · **Última modificación:** 2026-07-09

Este documento define las reglas no negociables del proyecto. Toda spec, plan o
tarea generada bajo la metodología Spec-Driven Development (SDD) debe respetarlas.
Si un plan viola un principio, el plan se corrige — no la constitución.

## Principios

### I. Arquitectura por capas estricta
El backend sigue `routes → controllers → services → repositories`. Los
controllers no acceden a la base de datos directamente; los services no
conocen Express (`req`/`res`); los repositories son el único punto de acceso
a Supabase/PostgreSQL. Ninguna feature nueva puede saltarse una capa.
**Por qué:** es el patrón ya establecido en `backend/src/` y lo que hace
testeable cada capa de forma aislada (ver `backend/tests/unit` vs `integration`).

### II. Validación en el borde, con Zod
Todo dato que entra por la API se valida con Zod en `backend/src/validators/`
antes de tocar un controller o service. Si el dato es inválido, se rechaza
con un mensaje claro antes de llegar a la base de datos. No se valida "por si
acaso" en capas internas que ya reciben datos confiables.

### III. Errores centralizados
Los errores de dominio (no encontrado, no autorizado, dato inválido, etc.) se
lanzan como clases de `backend/src/errors/` y se resuelven en un único
middleware de manejo de errores. Ningún controller hace `res.status(...).json(...)`
manual para casos de error ya cubiertos por ese sistema.

### IV. Credenciales solo por entorno
Ninguna clave (Supabase, Gemini, Groq, JWT secrets) se hardcodea. Siempre vía
`.env` / `.env.example`, nunca en código ni en specs/plans versionados.

### V. Tests como parte de la Definition of Done
Toda feature de backend se entrega con tests unitarios (services/repositories/
controllers aislados con mocks) e integración (flujo HTTP real contra la capa
de datos) en `backend/tests/`. El estado actual del proyecto (250/250 tests,
~98% cobertura) es el piso a mantener, no un techo — una feature que baja la
cobertura de forma injustificada no está terminada.
**Cómo aplicarlo:** todo `tasks.md` de una feature de backend debe incluir
tareas explícitas de test, no solo de implementación.

### VI. Simplicidad y no sobre-ingeniería
No se introducen abstracciones, capas o flags nuevos que la spec no pida. Una
feature pequeña no necesita un patrón nuevo si el existente alcanza. Esto
aplica tanto al backend por capas como al frontend (React + Vite).

### VII. Frontend con el sistema de diseño ya vigente
Cualquier UI nueva sigue el stack y reglas ya activas para este usuario
(Framer Motion, Tailwind, jerarquía de motion, anti-genérico) definidas
globalmente — un plan de frontend no re-explica esas reglas, solo las aplica.

## Flujo de trabajo SDD en este repo

1. `/specify` — describe la feature en lenguaje de negocio (qué y por qué,
   nunca cómo). Genera `specs/<NNN>-<slug>/spec.md`.
2. `/plan` — traduce la spec a un plan técnico concreto para
   `backend/`, `frontend/` y/o `supabase/migrations/`, validado contra esta
   constitución. Genera `specs/<NNN>-<slug>/plan.md` (+ `research.md`,
   `data-model.md`, `contracts/` si aplica).
3. `/tasks` — descompone el plan en tareas ordenadas y verificables. Genera
   `specs/<NNN>-<slug>/tasks.md`.
4. `/implement` — ejecuta las tareas en orden, marcando cada una como hecha.

Cada carpeta `specs/<NNN>-<slug>/` es la fuente de verdad de esa feature;
el código es la implementación de esa fuente, no al revés.

## Gobernanza

- Esta constitución prevalece sobre preferencias individuales de estilo.
- Cambiarla requiere una razón explícita registrada en este archivo (qué
  cambió, por qué) y actualizar el número de versión (semver: MAJOR si se
  elimina/redefine un principio, MINOR si se añade uno, PATCH si es redacción).
- Cualquier plan que se desvíe de un principio debe justificarlo en la
  sección "Constitution Check" de su `plan.md`, o el plan se rechaza.
