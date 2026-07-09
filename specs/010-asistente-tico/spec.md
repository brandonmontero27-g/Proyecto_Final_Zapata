# Spec: Asistente virtual "Tico"

**Feature branch:** `010-asistente-tico`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Los compradores, especialmente los menos familiarizados con
motocicletas, necesitan orientación conversacional para encontrar la moto
adecuada y evitar errores comunes al comprar una moto usada.

## Escenarios de usuario

### Escenario principal
Como comprador, quiero conversar con un asistente virtual que entienda lo
que busco (tipo de moto, presupuesto, uso) y me recomiende publicaciones
reales de la plataforma que encajen, además de darme consejos antes de
comprar una moto usada.

### Escenarios alternativos / edge cases
- El comprador pide algo que no existe en el catálogo actual → el asistente
  lo indica claramente en vez de inventar una publicación inexistente.
- El comprador hace una pregunta fuera del dominio de motocicletas → el
  asistente redirige la conversación a su propósito.
- El proveedor de inteligencia artificial no responde o falla → el
  comprador recibe un mensaje de error comprensible, no una respuesta vacía
  o inconsistente.
- El comprador pide consejos generales sin buscar una moto específica → el
  asistente puede responder sin necesidad de buscar publicaciones.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un comprador conversar en lenguaje
  natural con un asistente virtual sobre motocicletas.
- **RF-002**: El sistema DEBE permitir al asistente buscar y recomendar
  publicaciones reales y actualmente aprobadas de la plataforma que
  coincidan con lo que el comprador describe.
- **RF-003**: El sistema NO DEBE permitir al asistente inventar o recomendar
  publicaciones que no existen en la plataforma.
- **RF-004**: El sistema DEBE permitir al asistente dar consejos generales
  sobre qué revisar antes de comprar una moto usada.
- **RF-005**: El sistema DEBE informar al comprador de forma comprensible
  cuando el asistente no puede responder por una falla del servicio.
- **RF-006**: La conversación con el asistente DEBE ser independiente de las
  conversaciones de chat directo entre comprador y vendedor.

## Entidades clave

- **Conversación con el asistente**: intercambio entre un comprador y el
  asistente virtual, no asociado a ningún vendedor.
- **Recomendación**: publicación real de la plataforma que el asistente
  sugiere en respuesta a una consulta del comprador.

## Fuera de alcance

- El asistente respondiendo en nombre del vendedor o negociando precio.
- El asistente disponible para vendedores o administradores.
- Memoria del asistente entre sesiones distintas del mismo comprador.

## Criterios de aceptación

- [ ] Un comprador puede conversar con el asistente y recibir respuestas
      relevantes al dominio de motocicletas.
- [ ] Las publicaciones que recomienda el asistente existen realmente y
      están aprobadas.
- [ ] El asistente puede dar consejos generales sin necesidad de una
      búsqueda de publicaciones.
- [ ] Una falla del servicio de IA se comunica de forma clara al comprador.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
