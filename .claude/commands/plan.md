---
description: Traducir la spec activa de SDD a un plan técnico concreto para MotoMarket.
---

Argumento opcional (feature explícita si hay varias en curso): $ARGUMENTS

Pasos:

1. Si `$ARGUMENTS` no especifica una feature, encuentra la spec más reciente en
   `specs/*/spec.md` sin `plan.md` asociado, o pregunta al usuario cuál usar
   si hay ambigüedad real.
2. Lee esa `spec.md` completa y `.specify/memory/constitution.md`.
3. Explora el código real relevante antes de planear (no asumas nombres de
   archivo): busca en `backend/src/{routes,controllers,services,repositories,
   validators}/` y `frontend/src/` los módulos análogos existentes para seguir
   sus convenciones.
4. Genera `specs/<NNN-slug>/plan.md` desde `.specify/templates/plan-template.md`:
   - Completa el "Constitution Check" honestamente. Si un principio no se
     cumple, o rediseña el plan o justifica la excepción explícitamente — no
     dejes casillas sin marcar.
   - Detalla componentes afectados con rutas de archivo reales del repo.
   - Si el modelo de datos es complejo, sepáralo en
     `specs/<NNN-slug>/data-model.md`.
   - Si los endpoints son varios o no triviales, sepáralos en
     `specs/<NNN-slug>/contracts/`.
   - Si hubo que investigar una librería o patrón nuevo para el repo, regístralo
     en `specs/<NNN-slug>/research.md` con la decisión tomada y por qué.
5. No escribas código todavía. Termina confirmando el archivo generado y
   señalando explícitamente cualquier ítem del Constitution Check que haya
   requerido una justificación.
