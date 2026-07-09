# Spec: Estadísticas y panel del usuario

**Feature branch:** `009-estadisticas-panel-usuario`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Compradores y vendedores necesitan un resumen de su propia
actividad en la plataforma (qué guardaron, qué publicaron, qué interés
recibieron), sin tener que reconstruirlo navegando manualmente.

## Escenarios de usuario

### Escenario principal
Como comprador, quiero ver un resumen de mis favoritos y mis chats activos;
como vendedor, quiero ver mis publicaciones agrupadas por estado y cuánto
interés (favoritos y contactos) han recibido, para entender mi actividad de
un vistazo.

### Escenarios alternativos / edge cases
- Un usuario nuevo sin actividad todavía → el panel muestra un estado vacío
  claro, no un error.
- Un usuario cambia de rol (de comprador a vendedor) → su panel muestra las
  métricas correspondientes a su rol actual.
- Un vendedor con publicaciones en distintos estados (pendiente, aprobada,
  suspendida) → las ve agrupadas por estado, no mezcladas.

## Requisitos funcionales

- **RF-001**: El sistema DEBE mostrar a un comprador un resumen de sus
  publicaciones favoritas.
- **RF-002**: El sistema DEBE mostrar a un comprador un resumen de sus
  conversaciones activas.
- **RF-003**: El sistema DEBE mostrar a un vendedor sus publicaciones
  agrupadas por estado de moderación.
- **RF-004**: El sistema DEBE mostrar a un vendedor cuántos favoritos ha
  recibido el conjunto de sus publicaciones.
- **RF-005**: El sistema DEBE mostrar a un vendedor cuántos contactos
  (chats iniciados o clics a WhatsApp) ha recibido el conjunto de sus
  publicaciones.
- **RF-006**: El sistema DEBE mostrar un estado vacío comprensible cuando el
  usuario no tiene actividad todavía en alguna de estas métricas.

## Entidades clave

- **Resumen de actividad**: vista agregada, por usuario y rol, de sus
  favoritos, chats, publicaciones por estado, y el interés recibido — no es
  una entidad almacenada, sino una composición de datos ya existentes de
  otras features (favoritos, chat, publicaciones).

## Fuera de alcance

- Estadísticas históricas o gráficos de tendencia en el tiempo.
- Exportar el resumen a un archivo.
- Comparativas entre vendedores.

## Criterios de aceptación

- [ ] Un comprador ve sus favoritos y chats activos en su panel.
- [ ] Un vendedor ve sus publicaciones agrupadas por estado.
- [ ] Un vendedor ve el total de favoritos y contactos recibidos.
- [ ] Un usuario sin actividad ve un estado vacío, no un error.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
