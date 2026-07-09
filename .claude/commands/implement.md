---
description: Ejecutar tasks.md de la feature activa, tarea por tarea, con verificación.
---

Argumento opcional (feature explícita si hay varias en curso): $ARGUMENTS

Pasos:

1. Si `$ARGUMENTS` no especifica una feature, encuentra el `tasks.md` más
   reciente en `specs/*/tasks.md` con tareas pendientes, o pregunta si hay
   ambigüedad.
2. Lee `spec.md`, `plan.md` y `tasks.md` completos de esa feature antes de
   tocar código.
3. Usa TodoWrite para reflejar las tareas de `tasks.md` como todos de la sesión.
4. Ejecuta las tareas respetando el orden y las dependencias declaradas en
   `tasks.md`. Tras cada tarea:
   - Marca la casilla `[ ]` → `[x]` en `tasks.md`.
   - Si la tarea es de test, corre esa suite antes de seguir.
5. Al terminar todas las tareas de backend, corre `cd backend && npm test` y
   confirma que la suite completa pasa y la cobertura no bajó respecto al
   piso actual (ver README).
6. Si algo del plan resulta imposible o inconsistente con el código real
   encontrado durante la implementación, detente y repórtalo — no improvises
   una solución que viole la constitución (`.specify/memory/constitution.md`).
7. Al final, resume qué se implementó y qué quedó pendiente (si algo quedó
   pendiente, explica por qué).
