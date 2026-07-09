---
description: Descomponer el plan técnico activo en tareas ordenadas y verificables.
---

Argumento opcional (feature explícita si hay varias en curso): $ARGUMENTS

Pasos:

1. Si `$ARGUMENTS` no especifica una feature, encuentra el plan más reciente en
   `specs/*/plan.md` sin `tasks.md` asociado, o pregunta si hay ambigüedad.
2. Lee `plan.md` (y `data-model.md`/`contracts/`/`research.md` si existen) más
   `.specify/memory/constitution.md`.
3. Genera `specs/<NNN-slug>/tasks.md` desde `.specify/templates/tasks-template.md`:
   - Cada tarea referencia un archivo concreto del repo (crear o modificar).
   - Sigue el orden de capas: datos → validators/repositories → services →
     controllers/routes → frontend → cierre/tests.
   - Marca `[P]` solo las tareas que tocan archivos distintos y pueden hacerse
     en paralelo sin pisarse.
   - Incluye explícitamente tareas de test (unitario e integración) por cada
     pieza de lógica de negocio nueva — no es opcional (Principio V).
   - Añade la sección "Dependencias" al final con el orden real de ejecución.
4. No implementes nada todavía. Termina confirmando el archivo generado y el
   número total de tareas.
