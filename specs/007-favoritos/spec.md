# Spec: Favoritos del comprador

**Feature branch:** `007-favoritos`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Los compradores necesitan guardar publicaciones de su interés
para volver a consultarlas después, sin tener que recordarlas o
rebuscarlas en el catálogo.

## Escenarios de usuario

### Escenario principal
Como comprador, quiero marcar una publicación como favorita y consultar
después mi lista de favoritos, para no perder de vista las motos que me
interesan.

### Escenarios alternativos / edge cases
- El comprador marca como favorita una publicación que luego es suspendida
  → sigue en su lista pero identificada como ya no disponible.
- El comprador intenta marcar como favorita una publicación que no existe o
  no está aprobada → el sistema lo impide.
- Un vendedor intenta marcar como favorita su propia publicación → el
  sistema lo impide.
- El comprador quita una publicación de sus favoritos → deja de aparecer en
  su lista inmediatamente.
- Un usuario sin sesión iniciada intenta marcar un favorito → se le pide
  iniciar sesión primero.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un comprador autenticado marcar una
  publicación aprobada como favorita.
- **RF-002**: El sistema DEBE permitir a un comprador quitar una publicación
  de sus favoritos.
- **RF-003**: El sistema DEBE permitir a un comprador consultar la lista
  completa de sus publicaciones favoritas.
- **RF-004**: El sistema NO DEBE permitir marcar como favorita una
  publicación que no está aprobada.
- **RF-005**: El sistema NO DEBE permitir a un vendedor marcar como
  favorita su propia publicación.
- **RF-006**: El sistema NO DEBE permitir marcar favoritos a un usuario sin
  sesión iniciada.

## Entidades clave

- **Favorito**: relación entre un comprador y una publicación que indica
  interés guardado. Atributos de negocio: quién lo marcó, sobre qué
  publicación, cuándo.

## Fuera de alcance

- Notificar al comprador si el precio de un favorito cambia.
- Compartir la lista de favoritos con otras personas.
- Categorizar u ordenar favoritos manualmente.

## Criterios de aceptación

- [ ] Un comprador autenticado puede marcar y quitar favoritos.
- [ ] Un comprador puede ver su lista completa de favoritos.
- [ ] No se puede marcar como favorita una publicación no aprobada.
- [ ] Un vendedor no puede marcar como favorita su propia publicación.
- [ ] Un usuario sin sesión no puede marcar favoritos.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
