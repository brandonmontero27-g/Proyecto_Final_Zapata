# Spec: Catálogo, búsqueda y mapa de publicaciones

**Feature branch:** `006-catalogo-busqueda-mapa`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada
en el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Los compradores necesitan explorar el catálogo de motocicletas
aprobadas, filtrarlo según lo que buscan, ver el detalle completo de una
publicación, y ubicarlas geográficamente.

## Escenarios de usuario

### Escenario principal
Como comprador, quiero explorar las motocicletas disponibles, filtrarlas por
lo que me interesa (marca, categoría, año, precio, condición) y ver el
detalle completo de la que me llame la atención, para decidir si contactar
al vendedor.

### Escenarios alternativos / edge cases
- Ningún resultado cumple los filtros aplicados → el sistema muestra
  claramente que no hay resultados, no un catálogo vacío sin explicación.
- El comprador navega a la página de inicio → ve las publicaciones aprobadas
  más recientes primero.
- El comprador abre el detalle de una publicación que ya no está aprobada
  (fue suspendida después de que la vio en una lista cacheada) → el sistema
  no muestra el detalle como disponible.
- Una publicación no tiene ubicación geográfica cargada → no se muestra en el
  mapa, pero sí en el catálogo y su detalle.
- Varias publicaciones comparten una ubicación muy cercana → el mapa las
  agrupa visualmente en vez de superponerlas.

## Requisitos funcionales

- **RF-001**: El sistema DEBE mostrar en la página de inicio las
  publicaciones aprobadas más recientes.
- **RF-002**: El sistema DEBE permitir ver el detalle completo de una
  publicación aprobada: ficha técnica, galería de imágenes, datos del
  vendedor y publicaciones relacionadas (misma marca o categoría).
- **RF-003**: El sistema DEBE permitir filtrar el catálogo por marca,
  categoría, año, precio máximo y condición (nueva/usada).
- **RF-004**: El sistema DEBE paginar los resultados del catálogo.
- **RF-005**: El sistema DEBE mostrar un mapa interactivo con la ubicación
  aproximada de las publicaciones aprobadas que tengan geolocalización,
  agrupándolas visualmente cuando están cerca entre sí.
- **RF-006**: El sistema NO DEBE mostrar en catálogo, detalle o mapa
  ninguna publicación que no esté aprobada.

## Entidades clave

- **Filtro de búsqueda**: combinación de marca, categoría, año, precio
  máximo y condición aplicada por el comprador sobre el catálogo.
- **Ubicación de publicación**: coordenada aproximada asociada a una
  publicación, usada solo para el mapa.

## Fuera de alcance

- Búsqueda por texto libre / autocompletado.
- Ordenar resultados por criterios distintos a "más recientes".
- Guardar filtros favoritos del comprador.
- Ubicación exacta (por privacidad, solo aproximada).

## Criterios de aceptación

- [ ] La página de inicio muestra publicaciones aprobadas recientes.
- [ ] El detalle de una publicación aprobada muestra ficha técnica, galería,
      vendedor y relacionadas.
- [ ] Los filtros por marca, categoría, año, precio máximo y condición
      acotan correctamente los resultados.
- [ ] Los resultados están paginados.
- [ ] El mapa muestra solo publicaciones aprobadas con ubicación, agrupadas
      cuando están cerca.
- [ ] Ninguna publicación no aprobada aparece en catálogo, detalle o mapa.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
