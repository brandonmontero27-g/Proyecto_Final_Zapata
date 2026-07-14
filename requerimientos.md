# Requerimientos de MotoMarket

Este documento consolida los requerimientos del proyecto a partir de las
specs de [Spec-Driven Development](specs/README.md) (`specs/001` a `specs/011`,
fuente de verdad de cada feature) y de la [constitución técnica](.specify/memory/constitution.md).

**MotoMarket** es un marketplace C2C de compra y venta de motocicletas nuevas
y usadas para el mercado peruano. Conecta compradores y vendedores mediante
un catálogo filtrable, publicación de anuncios, chat directo, verificación de
identidad, moderación administrativa y un asistente virtual con IA.

---

## 1. Requerimientos funcionales

### 1.1 Identidad y autenticación ([spec 002](specs/002-identidad-autenticacion/spec.md))

- RF-002-01: Permitir crear una cuenta con correo, contraseña, nombre, teléfono y rol (comprador o vendedor).
- RF-002-02: No permitir dos cuentas con el mismo correo.
- RF-002-03: Autenticar a un usuario registrado mediante correo y contraseña, entregando una sesión válida si las credenciales son correctas.
- RF-002-04: No autenticar con credenciales incorrectas, ni revelar si el correo existe o la contraseña es la que falló.
- RF-002-05: Verificar, en cada petición a una función protegida, que la sesión es válida y vigente.
- RF-002-06: Identificar el rol del usuario autenticado (comprador, vendedor, administrador) en cada petición protegida.
- RF-002-07: No permitir el acceso a una función reservada a un rol distinto del rol del usuario autenticado.

### 1.2 Perfil de usuario y verificación de vendedor ([spec 003](specs/003-perfil-verificacion-vendedor/spec.md))

- RF-003-01: Permitir a cualquier usuario actualizar su nombre y teléfono.
- RF-003-02: Permitir a un usuario cambiar su contraseña, exigiendo la contraseña actual como confirmación.
- RF-003-03: Permitir a un usuario subir o reemplazar una foto de perfil (avatar).
- RF-003-04: Permitir a un vendedor enviar un documento de identidad para solicitar verificación.
- RF-003-05: No permitir a un comprador enviar un documento de verificación de vendedor.
- RF-003-06: Permitir a un administrador aprobar o rechazar un documento de verificación enviado.
- RF-003-07: Reflejar el estado de verificación del vendedor (sin enviar / pendiente / verificado / rechazado) de forma visible para los compradores.
- RF-003-08: Permitir a un vendedor reenviar un documento tras un rechazo o para actualizar su verificación.

### 1.3 Publicación de motocicletas ([spec 004](specs/004-publicacion-motocicletas/spec.md))

- RF-004-01: Permitir a un vendedor crear una publicación con marca, modelo, año, categoría, cilindraje, precio, kilometraje, combustible, transmisión, color, condición (nueva/usada), stock, descripción, ubicación y datos de contacto.
- RF-004-02: No aceptar una publicación a la que le falte un dato obligatorio.
- RF-004-03: Permitir adjuntar hasta 8 imágenes por publicación.
- RF-004-04: No aceptar más de 8 imágenes por publicación, ni archivos que no sean imágenes válidas.
- RF-004-05: Ofrecer al vendedor un panel donde ve y administra centralizadamente todas sus motocicletas publicadas.
- RF-004-06: Permitir a un vendedor editar los datos de una publicación propia después de creada.
- RF-004-07: Permitir a un vendedor retirar (dar de baja) una publicación propia de la vista pública.
- RF-004-08: No permitir a un vendedor editar o retirar una publicación que no le pertenece.

### 1.4 Moderación de publicaciones ([spec 005](specs/005-moderacion-publicaciones/spec.md))

- RF-005-01: Crear toda publicación nueva en estado "pendiente".
- RF-005-02: No mostrar en el catálogo público ninguna publicación que no esté en estado "aprobada".
- RF-005-03: Permitir a un administrador aprobar una publicación pendiente.
- RF-005-04: Permitir a un administrador observar una publicación, indicando que requiere corrección.
- RF-005-05: Permitir a un administrador suspender una publicación.
- RF-005-06: Notificar al vendedor propietario cuando el estado de su publicación cambia por acción de un administrador.
- RF-005-07: No permitir que un usuario distinto de un administrador cambie el estado de moderación de una publicación.

### 1.5 Catálogo, búsqueda y mapa ([spec 006](specs/006-catalogo-busqueda-mapa/spec.md))

- RF-006-01: Mostrar en la página de inicio las publicaciones aprobadas más recientes.
- RF-006-02: Permitir ver el detalle completo de una publicación aprobada: ficha técnica, galería de imágenes, datos del vendedor y publicaciones relacionadas.
- RF-006-03: Permitir filtrar el catálogo por marca, categoría, año, precio máximo y condición (nueva/usada).
- RF-006-04: Paginar los resultados del catálogo.
- RF-006-05: Mostrar un mapa interactivo con la ubicación aproximada de las publicaciones aprobadas que tengan geolocalización, agrupándolas visualmente cuando están cerca entre sí.
- RF-006-06: No mostrar en catálogo, detalle o mapa ninguna publicación que no esté aprobada.

### 1.6 Favoritos del comprador ([spec 007](specs/007-favoritos/spec.md))

- RF-007-01: Permitir a un comprador autenticado marcar una publicación aprobada como favorita.
- RF-007-02: Permitir a un comprador quitar una publicación de sus favoritos.
- RF-007-03: Permitir a un comprador consultar la lista completa de sus publicaciones favoritas.
- RF-007-04: No permitir marcar como favorita una publicación que no está aprobada.
- RF-007-05: No permitir a un vendedor marcar como favorita su propia publicación.
- RF-007-06: No permitir marcar favoritos a un usuario sin sesión iniciada.

### 1.7 Comunicación comprador-vendedor y notificaciones ([spec 008](specs/008-comunicacion-comprador-vendedor/spec.md))

- RF-008-01: Permitir a un comprador iniciar una conversación asociada a una publicación específica con el vendedor correspondiente.
- RF-008-02: Permitir a ambas partes de una conversación intercambiar mensajes dentro de la plataforma.
- RF-008-03: No permitir a un vendedor iniciar o mantener una conversación consigo mismo sobre su propia publicación.
- RF-008-04: Ofrecer un botón de contacto directo por WhatsApp con el número del vendedor, cuando esté disponible.
- RF-008-05: Generar una notificación individual visible en la barra de navegación cuando ocurre un evento relevante (aprobación, observación o suspensión de una publicación propia).
- RF-008-06: No permitir iniciar conversaciones ni acceder al chat a un usuario sin sesión iniciada.

### 1.8 Estadísticas y panel del usuario ([spec 009](specs/009-estadisticas-panel-usuario/spec.md))

- RF-009-01: Mostrar a un comprador un resumen de sus publicaciones favoritas.
- RF-009-02: Mostrar a un comprador un resumen de sus conversaciones activas.
- RF-009-03: Mostrar a un vendedor sus publicaciones agrupadas por estado de moderación.
- RF-009-04: Mostrar a un vendedor cuántos favoritos ha recibido el conjunto de sus publicaciones.
- RF-009-05: Mostrar a un vendedor cuántos contactos (chats iniciados o clics a WhatsApp) ha recibido.
- RF-009-06: Mostrar un estado vacío comprensible cuando el usuario no tiene actividad todavía.

### 1.9 Asistente virtual "Tico" ([spec 010](specs/010-asistente-tico/spec.md))

- RF-010-01: Permitir a un comprador conversar en lenguaje natural con un asistente virtual sobre motocicletas.
- RF-010-02: Permitir al asistente buscar y recomendar publicaciones reales y actualmente aprobadas de la plataforma.
- RF-010-03: No permitir al asistente inventar o recomendar publicaciones que no existen en la plataforma.
- RF-010-04: Permitir al asistente dar consejos generales sobre qué revisar antes de comprar una moto usada.
- RF-010-05: Informar al comprador de forma comprensible cuando el asistente no puede responder por una falla del servicio.
- RF-010-06: La conversación con el asistente debe ser independiente de las conversaciones de chat directo comprador-vendedor.

### 1.10 Administración de usuarios y auditoría ([spec 011](specs/011-administracion-usuarios-auditoria/spec.md))

- RF-011-01: Permitir a un administrador listar todos los usuarios registrados.
- RF-011-02: Permitir a un administrador cambiar el rol de un usuario.
- RF-011-03: Permitir a un administrador bloquear temporalmente a un usuario.
- RF-011-04: No permitir a un administrador bloquearse a sí mismo.
- RF-011-05: No permitir a un usuario bloqueado realizar acciones que requieren sesión iniciada.
- RF-011-06: Mostrar a un administrador un panel con el total de motocicletas por estado y el total de usuarios registrados.
- RF-011-07: Registrar en una bitácora de auditoría toda acción administrativa relevante (cambio de rol, bloqueo de usuario, moderación, verificación), indicando quién la hizo y cuándo.

### 1.11 Reportar publicación sospechosa ([spec 001](specs/001-reportar-publicacion/spec.md))

> Única feature construida *spec-first*; a la fecha tiene `spec.md` aprobado,
> pendientes `/plan`, `/tasks` e `/implement`.

- RF-001-01: Permitir a un comprador autenticado reportar una publicación, eligiendo un motivo de una lista fija (estafa, datos falsos, publicación ya no disponible, contenido inapropiado, otro).
- RF-001-02: Si el motivo es "otro", exigir una descripción en texto libre antes de aceptar el reporte.
- RF-001-03: Impedir que un mismo comprador reporte la misma publicación más de una vez; mostrarle el estado de su reporte previo.
- RF-001-04: No permitir que el vendedor reporte su propia publicación.
- RF-001-05: No permitir reportar a usuarios sin sesión iniciada.
- RF-001-06: Registrar cada reporte con motivo, autor, publicación, fecha y estado (pendiente, revisado).
- RF-001-07: Dar visibilidad a los administradores de los reportes pendientes, asociados a la publicación.
- RF-001-08: Permitir a un administrador marcar un reporte como revisado: descartarlo (sin cambios) o tomar acción sobre la publicación (observar/suspender), reutilizando el mecanismo de moderación existente.
- RF-001-09: No ocultar ni alterar automáticamente una publicación por el solo hecho de recibir reportes.
- RF-001-10: No notificar al vendedor de que su publicación fue reportada (solo se entera si el admin actúa).
- RF-001-11: Reflejar en la bitácora de auditoría la resolución de un reporte por parte de un administrador.

---

## 2. Requerimientos no funcionales

Derivados de la [constitución técnica](.specify/memory/constitution.md) y del estado verificado del proyecto:

- **RNF-01 — Arquitectura por capas estricta:** el backend sigue `routes → controllers → services → repositories`; ninguna capa se salta (ni el controller accede a la BD directamente, ni el service conoce Express).
- **RNF-02 — Validación en el borde:** todo dato que entra por la API se valida con Zod antes de tocar un controller o service; datos inválidos se rechazan con mensaje claro antes de llegar a la base de datos.
- **RNF-03 — Manejo de errores centralizado:** los errores de dominio (no encontrado, no autorizado, dato inválido) se resuelven en un único middleware; no hay manejo de errores ad-hoc por controller.
- **RNF-04 — Gestión segura de credenciales:** ninguna clave (Supabase, Gemini, Groq, JWT) se hardcodea; siempre vía variables de entorno (`.env`/`.env.example`).
- **RNF-05 — Trazabilidad de peticiones:** cada petición queda registrada con un identificador único para poder rastrear fallos.
- **RNF-06 — Rate limiting:** se limita cuántas peticiones puede hacer una misma persona en poco tiempo, para evitar abusos.
- **RNF-07 — Autenticación robusta:** sesiones emitidas como JWT (ES256) verificadas vía JWKS (Supabase Auth).
- **RNF-08 — Seguridad a nivel de datos:** políticas de seguridad a nivel de fila (RLS) en PostgreSQL/Supabase para reforzar el control de acceso definido en el backend.
- **RNF-09 — Testing como parte de la Definition of Done:** toda feature de backend se entrega con tests unitarios (services/repositories/controllers con mocks) e integración (flujo HTTP real). Piso actual: 250/250 tests pasando, ~98% de cobertura (statements/branches/functions/lines) — no debe bajar sin justificación.
- **RNF-10 — Simplicidad y no sobre-ingeniería:** no se introducen abstracciones, capas o flags que la spec no pida.
- **RNF-11 — Consistencia de diseño frontend:** toda UI nueva sigue el sistema de diseño vigente (React + Vite, TailwindCSS, Framer Motion, jerarquía de motion, anti-genérico).
- **RNF-12 — Disponibilidad ante fallas externas:** si el asistente Tico no tiene proveedor de IA configurado (Gemini/Groq), el sistema recurre a un modo de respuesta simulada para no interrumpir la experiencia.
- **RNF-13 — Trazabilidad SDD:** cada feature nueva se documenta primero como spec de negocio (`specs/NNN-slug/spec.md`) antes de traducirse en plan técnico y tareas; el código es la implementación de la spec, no al revés.

---

## 3. Fuera de alcance del MVP

Delimitaciones explícitas del proyecto (ver también [Documento.md](Documento.md), sección 1.5.4):

- Pasarela de pagos integrada — el cierre de la transacción se delega a WhatsApp y al chat interno.
- Aplicación móvil nativa.
- Recuperación de contraseña olvidada, login social (Google/Facebook) y autenticación de dos factores.
- Verificación automática de documentos (sin revisión humana).
- Moderación automática de publicaciones (por palabras clave, IA, etc.) — la decisión siempre es humana.
- Búsqueda por texto libre/autocompletado y ordenamiento distinto a "más recientes" en el catálogo.
- Estadísticas históricas, gráficos de tendencia o exportación de datos/bitácora.
- Roles administrativos con distintos niveles de permiso entre sí.
- Ocultamiento automático de publicaciones por volumen de reportes (umbral automático).
- Memoria del asistente Tico entre sesiones distintas.
- Validación de usabilidad (instrumento SUS diseñado, pendiente de aplicación empírica con usuarios piloto).
- Validación en entorno de producción con tráfico real (las pruebas se ejecutaron contra un proyecto Supabase de test aislado).

---

## 4. Trazabilidad

| # | Feature | Spec |
|---|---|---|
| 001 | Reportar publicación sospechosa | [specs/001-reportar-publicacion](specs/001-reportar-publicacion/spec.md) |
| 002 | Identidad y autenticación | [specs/002-identidad-autenticacion](specs/002-identidad-autenticacion/spec.md) |
| 003 | Perfil y verificación de vendedor | [specs/003-perfil-verificacion-vendedor](specs/003-perfil-verificacion-vendedor/spec.md) |
| 004 | Publicación de motocicletas | [specs/004-publicacion-motocicletas](specs/004-publicacion-motocicletas/spec.md) |
| 005 | Moderación de publicaciones | [specs/005-moderacion-publicaciones](specs/005-moderacion-publicaciones/spec.md) |
| 006 | Catálogo, búsqueda y mapa | [specs/006-catalogo-busqueda-mapa](specs/006-catalogo-busqueda-mapa/spec.md) |
| 007 | Favoritos | [specs/007-favoritos](specs/007-favoritos/spec.md) |
| 008 | Comunicación y notificaciones | [specs/008-comunicacion-comprador-vendedor](specs/008-comunicacion-comprador-vendedor/spec.md) |
| 009 | Estadísticas y panel de usuario | [specs/009-estadisticas-panel-usuario](specs/009-estadisticas-panel-usuario/spec.md) |
| 010 | Asistente virtual "Tico" | [specs/010-asistente-tico](specs/010-asistente-tico/spec.md) |
| 011 | Administración y auditoría | [specs/011-administracion-usuarios-auditoria](specs/011-administracion-usuarios-auditoria/spec.md) |
