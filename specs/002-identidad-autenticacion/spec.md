# Spec: Identidad y autenticación de usuarios

**Feature branch:** `002-identidad-autenticacion`
**Estado:** Documentada (retroactiva)
**Creado:** 2026-07-09 (retroactivo — documenta funcionalidad ya implementada en
el código, redactada como línea base para adoptar SDD sobre el proyecto existente)
**Input:** Base para que cualquier persona pueda registrarse, iniciar sesión y
que el sistema sepa en todo momento quién hace cada petición y con qué rol,
antes de construir cualquier otra funcionalidad que dependa de "quién es el
usuario".

## Escenarios de usuario

### Escenario principal
Como visitante, quiero crear una cuenta eligiendo si soy comprador o
vendedor, e iniciar sesión con mi correo y contraseña, para acceder a las
funciones de la plataforma que corresponden a mi rol.

### Escenarios alternativos / edge cases
- El visitante intenta registrarse con un correo ya usado → el sistema
  rechaza el registro y explica el motivo.
- El usuario ingresa una contraseña que no cumple los requisitos mínimos → el
  sistema rechaza el registro antes de crear la cuenta.
- Un usuario autenticado hace una petición con una sesión expirada o
  inválida → el sistema la rechaza como si no tuviera sesión.
- Alguien intenta acceder a una función reservada a un rol distinto al suyo
  (ej. comprador intentando una acción de administrador) → el sistema deniega
  el acceso.

## Requisitos funcionales

- **RF-001**: El sistema DEBE permitir crear una cuenta con correo,
  contraseña, nombre, teléfono y rol (comprador o vendedor).
- **RF-002**: El sistema NO DEBE permitir dos cuentas con el mismo correo.
- **RF-003**: El sistema DEBE autenticar a un usuario registrado mediante
  correo y contraseña, entregándole una sesión válida si las credenciales son
  correctas.
- **RF-004**: El sistema NO DEBE autenticar con credenciales incorrectas, ni
  revelar si el correo existe o la contraseña es la que falló.
- **RF-005**: El sistema DEBE verificar, en cada petición a una función
  protegida, que la sesión es válida y vigente antes de procesar la petición.
- **RF-006**: El sistema DEBE identificar el rol del usuario autenticado
  (comprador, vendedor, administrador) en cada petición protegida.
- **RF-007**: El sistema NO DEBE permitir el acceso a una función reservada a
  un rol distinto del rol del usuario autenticado.

## Entidades clave

- **Usuario**: persona registrada en la plataforma. Atributos de negocio:
  correo, nombre, teléfono, rol (comprador/vendedor/administrador), estado de
  la cuenta.
- **Sesión**: representa que un usuario está autenticado durante un periodo
  de tiempo; permite identificarlo en peticiones sucesivas.

## Fuera de alcance

- Recuperación de contraseña olvidada.
- Inicio de sesión con proveedores externos (Google, Facebook, etc.).
- Autenticación de dos factores.
- Cambio de correo electrónico de una cuenta existente.

## Criterios de aceptación

- [ ] Un visitante puede registrarse con datos válidos y queda con el rol elegido.
- [ ] No se puede registrar dos veces el mismo correo.
- [ ] Un usuario registrado puede iniciar sesión con sus credenciales correctas.
- [ ] Credenciales incorrectas no otorgan sesión.
- [ ] Una petición a una función protegida sin sesión válida es rechazada.
- [ ] Una petición a una función reservada a otro rol es rechazada aunque la
      sesión sea válida.

---
### Checklist de calidad (antes de pasar a /plan)
- [x] Sin detalles de implementación (sin nombrar frameworks, tablas, endpoints)
- [x] Todo requisito es verificable/testeable
- [x] Escenarios de usuario cubren el camino feliz y edge cases
- [x] Alcance y fuera-de-alcance explícitos
- [x] Sin `[NEEDS CLARIFICATION]` pendientes
