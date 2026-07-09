# Spec: Comunicación directa comprador-vendedor y notificaciones

**Feature branch:** `008-comunicacion-comprador-vendedor`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Una vez que un comprador encuentra una moto que le interesa,
necesita una forma de contactar al vendedor dentro de la plataforma o por
WhatsApp, y ambas partes necesitan enterarse de eventos relevantes sin tener
que estar revisando la plataforma constantemente.

## Escenarios de usuario

### Escenario principal
Como comprador, quiero iniciar una conversación con el vendedor de una
publicación específica e intercambiar mensajes dentro de la plataforma, o
contactarlo directamente por WhatsApp, para negociar la compra.

### Escenarios alternativos / edge cases
- El comprador intenta chatear sobre su propia publicación (es también
  vendedor de esa moto) → el sistema lo impide.
- El vendedor no tiene número de WhatsApp registrado en la publicación → el
  botón de contacto por WhatsApp no está disponible.
- Un usuario sin sesión iniciada intenta iniciar un chat → se le pide
  iniciar sesión primero.
- Una publicación es suspendida mientras hay una conversación activa sobre
  ella → la conversación existente sigue siendo consultable, pero no se
  pueden iniciar conversaciones nuevas sobre esa publicación.
- Al usuario le suspenden o aprueban una publicación → recibe una
  notificación visible en la campanita de la barra de navegación.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un comprador iniciar una
  conversación asociada a una publicación específica con el vendedor
  correspondiente.
- **RF-002**: El sistema DEBE permitir a ambas partes de una conversación
  intercambiar mensajes dentro de la plataforma.
- **RF-003**: El sistema NO DEBE permitir a un vendedor iniciar o mantener
  una conversación consigo mismo sobre su propia publicación.
- **RF-004**: El sistema DEBE ofrecer un botón de contacto directo por
  WhatsApp con el número del vendedor, cuando esté disponible.
- **RF-005**: El sistema DEBE generar una notificación individual visible en
  la barra de navegación cuando ocurre un evento relevante para el usuario
  (aprobación, observación o suspensión de una publicación propia).
- **RF-006**: El sistema NO DEBE permitir iniciar conversaciones ni acceder
  al chat a un usuario sin sesión iniciada.

## Entidades clave

- **Conversación**: intercambio de mensajes entre un comprador y un vendedor
  asociado a una publicación concreta.
- **Mensaje**: unidad de comunicación dentro de una conversación, con autor,
  contenido y momento de envío.
- **Notificación**: aviso individual dirigido a un usuario sobre un evento
  relevante, con estado leído/no leído.

## Fuera de alcance

- Llamadas de voz o video dentro de la plataforma.
- Traducción automática de mensajes.
- Notificaciones push fuera del navegador (email, SMS).
- Reportar mensajes del chat (cubierto potencialmente por una spec de
  moderación de chat futura, no esta).

## Criterios de aceptación

- [ ] Un comprador puede iniciar una conversación sobre una publicación con
      su vendedor.
- [ ] Ambas partes pueden enviar y ver mensajes en esa conversación.
- [ ] Un vendedor no puede chatear consigo mismo sobre su propia publicación.
- [ ] El botón de WhatsApp aparece solo si el vendedor tiene número registrado.
- [ ] El usuario recibe una notificación cuando su publicación cambia de estado.
- [ ] Un usuario sin sesión no puede iniciar ni acceder a un chat.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
