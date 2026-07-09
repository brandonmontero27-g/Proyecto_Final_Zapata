# Spec: Perfil de usuario y verificación de identidad del vendedor

**Feature branch:** `003-perfil-verificacion-vendedor`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Nota de alcance:** esta spec posee el ciclo de vida completo de la
verificación de vendedor — envío del documento (RF-004) y resolución del
administrador (RF-006) — para no duplicar la parte administrativa en
[`011-administracion-usuarios-auditoria`](../011-administracion-usuarios-auditoria/spec.md).
**Input:** Los usuarios necesitan poder mantener su información personal
actualizada, y los vendedores necesitan una forma de demostrar que son
quienes dicen ser, para generar confianza en un mercado C2C donde antes no
existía ningún mecanismo de validación.

## Escenarios de usuario

### Escenario principal
Como usuario, quiero actualizar mi nombre, teléfono y foto de perfil, y como
vendedor quiero enviar un documento de identidad para que un administrador lo
revise y me marque como verificado, para que los compradores confíen más en
mis publicaciones.

### Escenarios alternativos / edge cases
- El usuario cambia su contraseña sin conocer la actual → el sistema lo
  rechaza.
- El vendedor sube un documento con un formato o tamaño no soportado → el
  sistema lo rechaza antes de enviarlo a revisión.
- El vendedor ya verificado intenta enviar un nuevo documento → el sistema le
  permite reemplazarlo, quedando pendiente de revisión otra vez.
- Un comprador intenta enviar un documento de verificación de vendedor → el
  sistema lo impide, ya que la verificación es una función exclusiva del rol
  vendedor.
- El administrador rechaza el documento enviado → el vendedor puede ver el
  motivo y volver a intentarlo.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a cualquier usuario actualizar su
  nombre y teléfono.
- **RF-002**: El sistema DEBE permitir a un usuario cambiar su contraseña,
  exigiendo la contraseña actual como confirmación.
- **RF-003**: El sistema DEBE permitir a un usuario subir o reemplazar una
  foto de perfil (avatar).
- **RF-004**: El sistema DEBE permitir a un vendedor enviar un documento de
  identidad para solicitar verificación.
- **RF-005**: El sistema NO DEBE permitir a un comprador enviar un documento
  de verificación de vendedor.
- **RF-006**: El sistema DEBE permitir a un administrador aprobar o rechazar
  un documento de verificación enviado.
- **RF-007**: El sistema DEBE reflejar el estado de verificación del
  vendedor (sin enviar / pendiente / verificado / rechazado) de forma visible
  para los compradores que consultan sus publicaciones.
- **RF-008**: El sistema DEBE permitir a un vendedor reenviar un documento
  tras un rechazo o para actualizar su verificación.

## Entidades clave

- **Perfil**: datos personales editables de un usuario (nombre, teléfono, avatar).
- **Solicitud de verificación**: representa el documento enviado por un
  vendedor y su resultado. Atributos de negocio: quién la envió, estado
  (pendiente/aprobada/rechazada), quién la resolvió y cuándo.

## Fuera de alcance

- Verificación automática (sin revisión humana) de documentos.
- Verificación de identidad para compradores.
- Historial público de qué documento específico se envió (solo el estado es visible).

## Criterios de aceptación

- [ ] Un usuario puede actualizar nombre, teléfono y avatar.
- [ ] Cambiar contraseña sin la actual correcta es rechazado.
- [ ] Un vendedor puede enviar un documento de verificación.
- [ ] Un comprador no puede enviar un documento de verificación.
- [ ] Un administrador puede aprobar o rechazar la solicitud.
- [ ] El estado de verificación del vendedor es visible para los compradores.
- [ ] Un vendedor rechazado puede reenviar un nuevo documento.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
