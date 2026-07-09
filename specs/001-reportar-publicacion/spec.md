# Spec: Reportar publicación sospechosa

**Feature branch:** `001-reportar-publicacion`
**Estado:** Borrador
**Creado:** 2026-07-09
**Input:** Los compradores necesitan poder reportar una publicación de motocicleta
que parece sospechosa (posible estafa, datos falsos, moto que ya no está
disponible, contenido inapropiado). El reporte debe llegar a los
administradores para que puedan revisarlo y tomar acción sobre la publicación
(igual que ya hacen con la moderación de nuevas publicaciones y los
documentos de verificación de vendedores).

## Escenarios de usuario

### Escenario principal
Como comprador, quiero reportar una publicación que me parece sospechosa
(posible estafa, datos falsos, moto ya vendida o contenido inapropiado), para
que un administrador la revise y actúe si corresponde, protegiendo así al
resto de compradores del ecosistema.

### Escenarios alternativos / edge cases
- El comprador intenta reportar una publicación que ya reportó antes → el
  sistema no crea un segundo reporte; le muestra el estado de su reporte
  existente en su lugar.
- El comprador elige el motivo "Otro" → debe describir el motivo en texto
  libre; sin texto, el reporte no se puede enviar.
- Un usuario sin sesión iniciada intenta reportar → se le pide iniciar sesión
  primero; no puede reportar como anónimo.
- Un vendedor intenta reportar su propia publicación → se le impide; solo
  aplica a compradores reportando publicaciones ajenas.
- El administrador revisa un reporte y decide que la publicación está bien →
  descarta el reporte sin afectar la publicación ni notificar al vendedor.
- El administrador revisa un reporte y decide suspender/observar la
  publicación → se dispara el mismo mecanismo de notificación al vendedor que
  ya existe para moderación de publicaciones.
- Una misma publicación acumula reportes de varios compradores distintos →
  cada uno es un reporte independiente; la publicación permanece visible en
  el catálogo hasta que un administrador decida lo contrario.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un comprador autenticado reportar una
  publicación específica, eligiendo un motivo de una lista fija (estafa,
  datos falsos, publicación ya no disponible, contenido inapropiado, otro).
- **RF-002**: Si el motivo elegido es "otro", el sistema DEBE exigir una
  descripción en texto libre antes de aceptar el reporte.
- **RF-003**: El sistema DEBE impedir que un mismo comprador reporte la misma
  publicación más de una vez; en su lugar, DEBE mostrarle el estado de su
  reporte previo.
- **RF-004**: El sistema NO DEBE permitir que el vendedor reporte su propia
  publicación.
- **RF-005**: El sistema NO DEBE permitir reportar a usuarios sin sesión
  iniciada.
- **RF-006**: El sistema DEBE registrar cada reporte con su motivo, quién lo
  hizo, sobre qué publicación, cuándo, y un estado (pendiente, revisado).
- **RF-007**: El sistema DEBE dar visibilidad a los administradores de los
  reportes pendientes, asociados a la publicación y sus datos relevantes,
  como parte del mismo flujo de moderación ya existente.
- **RF-008**: El sistema DEBE permitir a un administrador marcar un reporte
  como revisado, con dos desenlaces posibles: descartarlo (la publicación no
  cambia) o tomar acción sobre la publicación (observarla o suspenderla),
  reutilizando el mecanismo de moderación existente.
- **RF-009**: El sistema NO DEBE ocultar ni alterar automáticamente la
  publicación por el solo hecho de recibir uno o más reportes; solo la acción
  explícita de un administrador cambia el estado de la publicación.
- **RF-010**: El sistema NO DEBE notificar al vendedor de que su publicación
  fue reportada; el vendedor solo se entera si el administrador toma acción
  sobre la publicación (vía la notificación de moderación ya existente).
- **RF-011**: El sistema DEBE quedar reflejado en la bitácora de auditoría
  administrativa cuando un administrador resuelve un reporte, igual que otras
  acciones administrativas relevantes.

> Cada requisito es verificable por un test de integración (flujo HTTP real
> de reporte → revisión admin) o manual.

## Entidades clave

- **Reporte de publicación**: representa la denuncia de un comprador sobre
  una publicación puntual. Atributos de negocio: quién reporta, qué
  publicación, motivo (de la lista fija u "otro" con descripción), estado
  (pendiente / revisado), quién y cuándo lo resolvió, y qué acción tomó el
  administrador (si tomó alguna).

## Fuera de alcance

- Ocultar o suspender automáticamente una publicación por volumen de
  reportes (umbral automático) — queda para una iteración futura si se
  decide necesaria.
- Notificar al vendedor de que fue reportado antes de que un admin actúe.
- Reportar a un usuario (comprador o vendedor) directamente — esta spec
  cubre solo el reporte de publicaciones.
- Reportar mensajes del chat directo.
- Editar o retirar un reporte ya enviado por el comprador.

## Criterios de aceptación

- [ ] Un comprador autenticado puede reportar una publicación ajena eligiendo
      un motivo de la lista fija.
- [ ] Elegir "otro" sin texto libre bloquea el envío del reporte.
- [ ] Un comprador no puede crear un segundo reporte sobre la misma
      publicación; ve el estado del que ya envió.
- [ ] Un vendedor no puede reportar su propia publicación.
- [ ] Un usuario no autenticado no puede reportar.
- [ ] Un administrador ve los reportes pendientes junto con los datos de la
      publicación reportada.
- [ ] Un administrador puede descartar un reporte sin afectar la publicación.
- [ ] Un administrador puede resolver un reporte tomando acción sobre la
      publicación, y esa acción dispara la notificación de moderación
      existente al vendedor.
- [ ] La publicación permanece visible en el catálogo público mientras el
      reporte está pendiente.
- [ ] La resolución de un reporte queda en la bitácora de auditoría.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y varios edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
