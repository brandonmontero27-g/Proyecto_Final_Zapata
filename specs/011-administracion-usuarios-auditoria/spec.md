# Spec: Administración de usuarios y auditoría

**Feature branch:** `011-administracion-usuarios-auditoria`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Revisado:** 2026-07-09 — se retiró la revisión de documentos de
verificación, que pertenece al ciclo de vida completo de esa capacidad
(envío del vendedor + resolución del administrador) y ya está cubierta en
[`003-perfil-verificacion-vendedor`](../003-perfil-verificacion-vendedor/spec.md)
RF-006. Mantenerla también aquí duplicaba el mismo requisito en dos specs.
**Input:** Los administradores necesitan herramientas para gestionar la base
de usuarios (listar, cambiar rol, bloquear), ver el estado general de la
plataforma, y que quede un registro de qué acciones administrativas se
tomaron y por quién.

## Escenarios de usuario

### Escenario principal
Como administrador, quiero listar los usuarios de la plataforma, cambiar su
rol o bloquearlos si es necesario, y consultar un panel con el estado
general de la plataforma, con la garantía de que mis acciones quedan
registradas.

### Escenarios alternativos / edge cases
- El administrador intenta bloquearse a sí mismo → el sistema lo impide.
- El administrador cambia el rol de un usuario que tiene publicaciones o
  conversaciones activas → esas relaciones existentes se mantienen
  consistentes con el nuevo rol.
- Un usuario bloqueado intenta usar la plataforma → se le impide realizar
  acciones que requieran sesión.
- El administrador bloquea a otro administrador → el sistema lo permite (el
  único caso restringido es auto-bloqueo).

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un administrador listar todos los
  usuarios registrados.
- **RF-002**: El sistema DEBE permitir a un administrador cambiar el rol de
  un usuario.
- **RF-003**: El sistema DEBE permitir a un administrador bloquear
  temporalmente a un usuario.
- **RF-004**: El sistema NO DEBE permitir a un administrador bloquearse a sí
  mismo.
- **RF-005**: El sistema NO DEBE permitir a un usuario bloqueado realizar
  acciones que requieren sesión iniciada.
- **RF-006**: El sistema DEBE mostrar a un administrador un panel con el
  total de motocicletas por estado y el total de usuarios registrados.
- **RF-007**: El sistema DEBE registrar en una bitácora de auditoría toda
  acción administrativa relevante de este alcance (cambio de rol, bloqueo de
  usuario), indicando quién la hizo y cuándo.

> Las acciones administrativas de otros dominios (revisión de verificación,
> moderación de publicaciones) registran su propia entrada en la misma
> bitácora, según sus propias specs — este documento no redefine ese
> comportamiento, solo lo consume para el panel y no lo duplica como requisito.

## Entidades clave

- **Bitácora de auditoría**: registro histórico de acciones administrativas,
  compartido por todos los dominios que las generan (este, verificación,
  moderación). Atributos de negocio: qué acción, sobre qué (usuario o
  publicación), quién la ejecutó, cuándo.
- **Panel de estadísticas administrativas**: vista agregada del estado
  general de la plataforma (conteos de motocicletas por estado, usuarios
  totales) — no es una entidad almacenada, sino una composición de datos ya
  existentes.

## Fuera de alcance

- Revisión de documentos de verificación de vendedores — ver
  [`003-perfil-verificacion-vendedor`](../003-perfil-verificacion-vendedor/spec.md).
- Moderación de publicaciones — ver
  [`005-moderacion-publicaciones`](../005-moderacion-publicaciones/spec.md).
- Eliminar permanentemente una cuenta de usuario.
- Roles administrativos con distintos niveles de permiso entre sí.
- Exportar la bitácora de auditoría a un archivo externo.

## Criterios de aceptación

- [ ] Un administrador puede listar usuarios y cambiar su rol.
- [ ] Un administrador puede bloquear a un usuario, pero no a sí mismo.
- [ ] Un usuario bloqueado no puede realizar acciones que requieren sesión.
- [ ] El panel administrativo muestra totales de motocicletas por estado y
      usuarios registrados.
- [ ] Cada acción administrativa de este alcance (rol, bloqueo) queda
      registrada en la bitácora con quién y cuándo.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
- [x] Sin requisitos duplicados con otra spec (verificado contra 003 y 005)
