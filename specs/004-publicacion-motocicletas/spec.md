# Spec: Publicación de motocicletas

**Feature branch:** `004-publicacion-motocicletas`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Los vendedores necesitan publicar sus motocicletas con toda la
información técnica y visual necesaria para que un comprador pueda decidir,
y necesitan un lugar para gestionar centralizadamente lo que han publicado.

## Escenarios de usuario

### Escenario principal
Como vendedor, quiero publicar una motocicleta completando sus datos técnicos
y adjuntando fotos, para que los compradores puedan encontrarla y contactarme.

### Escenarios alternativos / edge cases
- El vendedor deja un campo obligatorio vacío (ej. precio) → el sistema
  rechaza la publicación y señala qué falta.
- El vendedor intenta adjuntar más de 8 imágenes → el sistema rechaza el
  exceso o le impide continuar hasta que reduzca la cantidad.
- El vendedor adjunta un archivo que no es una imagen válida → el sistema lo
  rechaza antes de guardarlo.
- El vendedor edita una publicación ya aprobada → el sistema guarda los
  cambios en su publicación.
- El vendedor quiere dejar de vender una moto ya publicada → puede retirarla
  de la vista pública sin eliminar su historial.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir a un vendedor crear una publicación
  con marca, modelo, año, categoría, cilindraje, precio, kilometraje,
  combustible, transmisión, color, condición (nueva/usada), stock,
  descripción, ubicación y datos de contacto.
- **RF-002**: El sistema NO DEBE aceptar una publicación a la que le falte
  un dato obligatorio de los anteriores.
- **RF-003**: El sistema DEBE permitir adjuntar hasta 8 imágenes por
  publicación.
- **RF-004**: El sistema NO DEBE aceptar más de 8 imágenes por publicación,
  ni archivos que no sean imágenes válidas.
- **RF-005**: El sistema DEBE ofrecer al vendedor un panel donde ve y
  administra centralizadamente todas las motocicletas que ha publicado.
- **RF-006**: El sistema DEBE permitir a un vendedor editar los datos de una
  publicación propia después de creada.
- **RF-007**: El sistema DEBE permitir a un vendedor retirar (dar de baja)
  una publicación propia de la vista pública.
- **RF-008**: El sistema NO DEBE permitir a un vendedor editar o retirar una
  publicación que no le pertenece.

## Entidades clave

- **Publicación de motocicleta**: representa un anuncio de venta. Atributos
  de negocio: datos técnicos del vehículo, precio, condición, ubicación,
  contacto, vendedor propietario, estado (gestionado por moderación — ver
  spec de moderación), galería de imágenes asociada.

## Fuera de alcance

- Moderación/aprobación de la publicación (cubierto en la spec de moderación
  de publicaciones).
- Destacar o promocionar una publicación con pago.
- Publicaciones múltiples en lote (bulk upload).

## Criterios de aceptación

- [ ] Un vendedor puede crear una publicación con todos los datos requeridos.
- [ ] Falta un dato obligatorio → la publicación no se crea.
- [ ] Se pueden adjuntar hasta 8 imágenes; más de 8 es rechazado.
- [ ] Un archivo no-imagen es rechazado como adjunto.
- [ ] El vendedor ve todas sus publicaciones en un panel propio.
- [ ] El vendedor puede editar y retirar una publicación propia.
- [ ] El vendedor no puede editar ni retirar una publicación ajena.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
