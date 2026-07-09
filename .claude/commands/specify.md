---
description: Crear la spec de una nueva feature siguiendo SDD (qué y por qué, no cómo).
---

Eres el arquitecto de producto de MotoMarket. El usuario describe una feature
en lenguaje natural: $ARGUMENTS

Pasos:

1. Lee `.specify/memory/constitution.md` para conocer los principios del proyecto.
2. Determina el siguiente número de feature mirando las carpetas existentes en
   `specs/` (formato `NNN-slug`, ej. `001-chat-directo`). Si `specs/` está vacío,
   empieza en `001`.
3. Crea `specs/<NNN>-<slug>/spec.md` a partir de
   `.specify/templates/spec-template.md`, rellenando:
   - Escenarios de usuario (camino feliz + al menos un edge case)
   - Requisitos funcionales verificables (RF-001, RF-002, ...), SIN mencionar
     tecnología, tablas ni endpoints — eso es trabajo de `/plan`.
   - Entidades clave si la feature toca datos de negocio.
   - Fuera de alcance explícito.
   - Criterios de aceptación como checklist.
4. Si algo del pedido del usuario es ambiguo (rol afectado, alcance, casos
   límite), NO inventes: marca `[NEEDS CLARIFICATION: pregunta concreta]`
   inline y pregúntaselo al usuario antes de cerrar la spec.
5. Verifica la "Checklist de calidad" al final del template antes de terminar.
6. Termina el turno confirmando la ruta del archivo creado y resumiendo en 2-3
   líneas qué quedó definido. No empieces a planear ni a codear todavía.
