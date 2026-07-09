# Tasks: [NOMBRE DE LA FEATURE]

**Plan:** `specs/[NNN-slug]/plan.md`
**Convención:** cada tarea es atómica, verificable y referencia archivos concretos.
Marcar `[P]` si puede ejecutarse en paralelo con otras tareas `[P]` (no comparten archivo).

## Fase 1 — Datos
- [ ] T001 [P] Migración Supabase: [qué tabla/columna] en `supabase/migrations/<timestamp>_<slug>.sql`
- [ ] T002 Actualizar `backend/database/schema.sql` si aplica

## Fase 2 — Backend: validación y acceso a datos
- [ ] T003 [P] Esquema Zod en `backend/src/validators/<recurso>.validator.js`
- [ ] T004 [P] Repository en `backend/src/repositories/<recurso>.repository.js`
- [ ] T005 Test unitario del repository en `backend/tests/unit/repositories/`

## Fase 3 — Backend: lógica de negocio
- [ ] T006 Service en `backend/src/services/<recurso>.service.js`
- [ ] T007 Test unitario del service (mockeando repository) en `backend/tests/unit/services/`

## Fase 4 — Backend: exposición HTTP
- [ ] T008 Controller en `backend/src/controllers/<recurso>.controller.js`
- [ ] T009 Ruta en `backend/src/routes/<recurso>.routes.js`
- [ ] T010 Registrar dependencias en `backend/src/container.js` si aplica
- [ ] T011 Test de integración end-to-end en `backend/tests/integration/<recurso>.integration.test.js`

## Fase 5 — Frontend (si aplica)
- [ ] T012 [P] Cliente API en `frontend/src/api/<recurso>.js`
- [ ] T013 Componente(s)/página(s) en `frontend/src/`
- [ ] T014 Estados de carga/error/vacío y microinteracciones (Framer Motion) según sistema de diseño vigente

## Fase 6 — Cierre
- [ ] T015 Correr suite completa (`cd backend && npm test`) y confirmar que cobertura no baja
- [ ] T016 Actualizar `README.md` / `Documento.md` si la feature cambia funcionalidades listadas
- [ ] T017 Revisar Constitution Check del plan — todo marcado como cumplido

## Dependencias
[Ej.: T006 depende de T004; T008 depende de T006 y T009; T011 depende de T008.]
