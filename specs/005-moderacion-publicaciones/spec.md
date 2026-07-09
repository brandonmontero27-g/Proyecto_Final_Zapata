# Spec: Moderación de publicaciones

**Feature branch:** `005-moderacion-publicaciones`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Ninguna publicación debería llegar al catálogo público sin
revisión, para evitar contenido falso o inapropiado desde el primer momento
— es el mecanismo de control de calidad central del marketplace.

## Escenarios de usuario

### Escenario principal
Como administrador, quiero revisar las publicaciones nuevas antes de que
sean visibles al público, para aprobar las que cumplen las reglas y
observar o suspender las que no.

### Escenarios alternativos / edge cases
- Un vendedor crea una publicación → queda oculta del catálogo público hasta
  que un administrador la apruebe.
- El administrador observa una publicación (no la suspende del todo, pide
  correcciones) → el vendedor es notificado y puede corregir.
- El administrador suspende una publicación → deja de ser visible en el
  catálogo público y el vendedor es notificado.
- El administrador aprueba una publicación → pasa a ser visible en el
  catálogo público inmediatamente.
- Un comprador intenta acceder directamente a una publicación pendiente o
  suspendida → el sistema no la muestra como si no existiera en el catálogo.

## Requisitos funcionales

- **RF-001**: El sistema DEBE crear toda publicación nueva en estado
  "pendiente".
- **RF-002**: El sistema NO DEBE mostrar en el catálogo público ninguna
  publicación que no esté en estado "aprobada".
- **RF-003**: El sistema DEBE permitir a un administrador aprobar una
  publicación pendiente, haciéndola visible en el catálogo público.
- **RF-004**: El sistema DEBE permitir a un administrador observar una
  publicación, indicando que requiere corrección antes de ser aprobada.
- **RF-005**: El sistema DEBE permitir a un administrador suspender una
  publicación, retirándola o impidiéndole llegar al catálogo público.
- **RF-006**: El sistema DEBE notificar al vendedor propietario cuando el
  estado de su publicación cambia por acción de un administrador.
- **RF-007**: El sistema NO DEBE permitir que un usuario distinto de un
  administrador cambie el estado de moderación de una publicación.

## Entidades clave

- **Estado de moderación**: atributo de la publicación con valores
  pendiente / aprobada / observada / suspendida, junto con quién lo cambió y
  cuándo.

## Fuera de alcance

- Reglas automáticas de moderación (por palabras clave, IA, etc.) — la
  decisión es siempre humana.
- Apelación formal del vendedor ante una suspensión.
- Historial público de moderación visible para el comprador.

## Criterios de aceptación

- [ ] Toda publicación nueva nace en estado pendiente y no aparece en el
      catálogo público.
- [ ] Un administrador puede aprobar, observar o suspender una publicación.
- [ ] Solo las publicaciones aprobadas aparecen en el catálogo público.
- [ ] El vendedor recibe una notificación cuando cambia el estado de su publicación.
- [ ] Un usuario no administrador no puede cambiar el estado de moderación.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
