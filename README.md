<div align="center">

# 🏍️ MotoMarket

### Compra y venta de motocicletas en Perú

<p>
<img src="https://img.shields.io/badge/version-4-blue?style=for-the-badge" alt="version" />
<img src="https://img.shields.io/badge/status-en%20desarrollo-yellow?style=for-the-badge" alt="status" />
<img src="https://img.shields.io/badge/tests-250%2F250%20passing-brightgreen?style=for-the-badge" alt="tests" />
<img src="https://img.shields.io/badge/coverage-98%25-brightgreen?style=for-the-badge" alt="coverage" />
</p>

</div>

---

## 📚 Sobre el proyecto

**MotoMarket** es un marketplace de compra y venta de motocicletas nuevas y usadas en Perú. Los compradores exploran un catálogo con filtros por marca, modelo, año, cilindraje, precio y estado; los vendedores publican sus motos con fotos, especificaciones técnicas y datos de contacto; un panel de administración modera las publicaciones y verifica usuarios. **Tico**, el asistente virtual con IA, ayuda a los compradores a encontrar la moto ideal y da consejos antes de comprar una moto usada.

El repositorio contiene dos aplicaciones:

- 🏍️ **La plataforma real** (`backend/` + `frontend/` + `supabase/`) — el marketplace en producción.
- 🗂️ **Un prototipo legado** (raíz del repo) hecho en Google AI Studio para la versión anterior del proyecto (portal de alojamiento estudiantil); se conserva como referencia histórica y no forma parte del dominio actual de MotoMarket.

---

## 🗂️ Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `backend/` | API REST (Node.js + Express), autenticación y datos vía Supabase |
| `frontend/` | Cliente web de la plataforma real (React + Vite) |
| `supabase/` | Esquema de base de datos y migraciones (Supabase CLI) |
| `src/`, `server.ts` | Prototipo legado (Vite + React + Gemini API) de la versión anterior del proyecto |

---

## ✅ Arquitectura y calidad del backend

El backend sigue una arquitectura por capas (`routes` → `controllers` → `services` → `repositories`), reforzada con varios puntos de seguridad y calidad:

- 🔑 **Gestión segura de credenciales** — claves de Supabase y proveedores de IA siempre vía variables de entorno, nunca hardcodeadas.
- 🛡️ **La API valida los datos antes de guardarlos** (Zod) — si algo llega incompleto o mal formado, se rechaza con un mensaje claro, antes de tocar la base de datos.
- 🚦 **Los errores se manejan de forma centralizada y consistente** — un solo sistema para "no encontrado", "no autorizado", "dato inválido", etc.
- 📝 **Cada petición queda registrada con un identificador único**, para poder rastrear qué pasó si algo falla.
- ⏱️ **Se limita cuántas peticiones puede hacer una misma persona en poco tiempo**, para evitar abusos.
- 🧩 **El arranque del servidor está separado de su configuración**, para poder testear la API sin levantar un puerto real.
- 🧪 **Los 250 tests automáticos del backend pasan**, con ~98% de cobertura de código (statements/branches/functions/lines).

---

## 🛠️ Tecnologías

<p align="left">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
<img src="https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
<img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
<img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
</p>

---

## 🏍️ Funcionalidades principales

- **Catálogo** con búsqueda y filtros por marca, modelo, año, cilindraje, precio y estado (nueva/usada), con paginación y orden.
- **Detalle de moto** con galería de imágenes, especificaciones técnicas, datos del vendedor, botón de WhatsApp y motos relacionadas.
- **Publicación de motos** (rol vendedor) con carga de imágenes y datos completos del vehículo.
- **Chat directo** entre comprador y vendedor, con acciones rápidas de "Comprar" y "Agendar visita".
- **Favoritos**, notificaciones y estadísticas por rol (comprador/vendedor).
- **Panel de administración**: moderación de publicaciones, gestión de usuarios y verificación de vendedores.
- **Tico**, el asistente de IA (Gemini/Groq), con acceso a herramientas para buscar motos reales publicadas en la plataforma.

---

## ⚙️ Cómo correrlo localmente

```bash
npm run local:install-all   # instala dependencias de raíz, backend y frontend
npm run local:dev           # levanta backend y frontend juntos
```

El backend necesita un archivo `.env` propio (copia `backend/.env.example` y complétalo con tus credenciales de Supabase). Lo mismo para `frontend/.env`.

```bash
cd backend && npm test      # corre la suite completa con cobertura
```

---

## 🎓 Contexto académico

- 🏫 **Universidad:** Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
- 🎓 **Escuela Profesional:** Ingeniería de Sistemas
- 📖 **Curso:** IS-489

---

<p align="center">
<i>🏍️ Desarrollado por <a href="https://github.com/Steve-Smith-CODE">@Steve-Smith-CODE</a> — Proyecto académico, UNSCH</i>
</p>
