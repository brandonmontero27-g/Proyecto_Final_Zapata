# specs/

Cada subcarpeta `NNN-slug/` es la fuente de verdad de una feature bajo
Spec-Driven Development (SDD). El código en `backend/`, `frontend/` y
`supabase/` es la implementación de lo definido aquí — no al revés.

Ver `.specify/memory/constitution.md` para los principios no negociables del
proyecto y el flujo completo.

## Flujo

```
/specify <descripción de la feature en lenguaje de negocio>
    → specs/NNN-slug/spec.md

/plan [feature]
    → specs/NNN-slug/plan.md (+ data-model.md, contracts/, research.md si aplica)

/tasks [feature]
    → specs/NNN-slug/tasks.md

/implement [feature]
    → ejecuta tasks.md tarea por tarea, marcando progreso
```

## Estructura de cada feature

```
specs/NNN-slug/
├── spec.md          # qué y por qué (negocio, sin tecnología)
├── plan.md           # cómo (arquitectura, componentes, Constitution Check)
├── data-model.md      # opcional — solo si el modelo de datos es complejo
├── contracts/          # opcional — solo si hay varios endpoints no triviales
├── research.md          # opcional — decisiones técnicas que requirieron investigar
└── tasks.md              # tareas atómicas y verificables, en orden de ejecución
```

## Índice de features

| # | Feature | Estado |
|---|---|---|
| [001](001-reportar-publicacion/spec.md) | Reportar publicación sospechosa | Spec, feature nueva bajo SDD |
| [002](002-identidad-autenticacion/spec.md) | Identidad y autenticación de usuarios | Documentada (retroactiva) |
| [003](003-perfil-verificacion-vendedor/spec.md) | Perfil de usuario y verificación de vendedor | Documentada (retroactiva) |
| [004](004-publicacion-motocicletas/spec.md) | Publicación de motocicletas | Documentada (retroactiva) |
| [005](005-moderacion-publicaciones/spec.md) | Moderación de publicaciones | Documentada (retroactiva) |
| [006](006-catalogo-busqueda-mapa/spec.md) | Catálogo, búsqueda y mapa | Documentada (retroactiva) |
| [007](007-favoritos/spec.md) | Favoritos del comprador | Documentada (retroactiva) |
| [008](008-comunicacion-comprador-vendedor/spec.md) | Comunicación directa y notificaciones | Documentada (retroactiva) |
| [009](009-estadisticas-panel-usuario/spec.md) | Estadísticas y panel del usuario | Documentada (retroactiva) |
| [010](010-asistente-tico/spec.md) | Asistente virtual "Tico" | Documentada (retroactiva) |
| [011](011-administracion-usuarios-auditoria/spec.md) | Administración de usuarios y auditoría | Documentada (retroactiva) |

Las specs `002`–`011` documentan **retroactivamente** funcionalidad que ya
existía en el código antes de adoptar SDD en este repo (línea base). La `001`
es la primera feature construida spec-first con este flujo. Cualquier feature
nueva a partir de aquí sigue numerándose consecutivamente desde `012`.

> **Nota de reconciliación (2026-07-09):** la revisión de documentos de
> verificación de vendedor aparecía duplicada en `003` y `011` porque cada
> spec se redactó a partir de un actor distinto (vendedor / administrador)
> en vez del ciclo de vida completo de la capacidad. Se corrigió dejando esa
> responsabilidad únicamente en `003` (dueña del ciclo de vida
> envío→revisión); `011` quedó acotada a gestión de usuarios, panel
> administrativo y bitácora. Regla a futuro: una spec cubre un ciclo de
> negocio completo con todos sus actores, nunca se parte por "quién ejecuta
> la acción".
