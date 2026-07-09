# Plan técnico: [NOMBRE DE LA FEATURE]

**Spec:** `specs/[NNN-slug]/spec.md`
**Rama:** `[NNN-slug]`

## Resumen técnico
[2-3 frases: qué se construye y el enfoque técnico principal, extraído de la spec.]

## Constitution Check
*Debe pasar antes de generar tasks.md. Ver `.specify/memory/constitution.md`.*

| Principio | Cumple | Nota |
|---|---|---|
| I. Arquitectura por capas | [ ] | |
| II. Validación con Zod en el borde | [ ] | |
| III. Errores centralizados | [ ] | |
| IV. Credenciales solo por entorno | [ ] | |
| V. Tests como parte de la DoD | [ ] | |
| VI. Simplicidad / no sobre-ingeniería | [ ] | |
| VII. Frontend con el sistema de diseño vigente | [ ] (si aplica) | |

Si algún principio no se cumple, justificar aquí explícitamente o rediseñar el plan.

## Componentes afectados

- **Backend** (`backend/src/`):
  - `routes/` — [nuevo endpoint o modificación]
  - `controllers/` — [responsabilidad]
  - `services/` — [lógica de negocio]
  - `repositories/` — [acceso a datos, tabla(s) Supabase]
  - `validators/` — [esquema Zod]
- **Base de datos** (`supabase/migrations/`): [nueva migración sí/no, qué cambia]
- **Frontend** (`frontend/src/`): [páginas/componentes/api client afectados]
- **Tico / IA** (`backend/src/services/tico/`): [si la feature toca el asistente]

## Modelo de datos
[Entidades/tablas nuevas o modificadas, relaciones, constraints relevantes.
Detallar en `data-model.md` si es complejo.]

## Contratos de API
[Endpoints nuevos o modificados: método, ruta, request/response shape.
Detallar en `contracts/` si son varios.]

## Decisiones técnicas y alternativas
[Solo si hubo una decisión no obvia. Documentar en `research.md` si requirió
investigación (librería nueva, patrón no usado antes en el repo, etc.)]

## Plan de pruebas
- Unit: [qué services/repositories/controllers se testean en aislamiento]
- Integration: [qué flujos HTTP end-to-end se cubren en `backend/tests/integration/`]
- Frontend: [si aplica]

## Fuera de alcance / riesgos conocidos
[Heredado y refinado desde la spec.]
