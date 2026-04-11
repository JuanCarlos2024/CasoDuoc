# Instrucción final para Claude Code (lista para copiar/pegar)

## 0) Hallazgo clave antes de tocar código
El entorno actual **no contiene** el backend de `sistema-jurados` (no existen `backend/src/app.js`, rutas `/api/admin`, ni middleware `soloAdmin`).

Por eso, para resolver el bug real en Render debes ejecutar esta instrucción en el repo correcto (`JuanCarlos2024/sistema-jurados`).

---

## Prompt exacto para Claude Code

"""
Necesito que apliques un fix REAL (no documentación) al bug: en admin/disponibilidad no carga en Render.

Objetivo: identificar exactamente dónde se corta la request y dejar el flujo estable.

Haz estos cambios en código:

1) Logger global API (antes de auth)
- Archivo: backend/src/app.js (o entry Express equivalente)
- Agrega middleware para TODA ruta /api que loggee:
  [API] IN  <method> <originalUrl> auth:<true|false>
  [API] OUT <method> <originalUrl> status:<code> ms:<elapsed>
- Debe correr antes de soloAdmin/auth.

2) Logs explícitos en middleware de admin
- Archivo: backend/src/middlewares/soloAdmin.js (o equivalente)
- Cuando rechace, loggear causa exacta:
  [AUTH] 401 missing_authorization
  [AUTH] 401 invalid_bearer_format
  [AUTH] 401 token_expired
  [AUTH] 401 invalid_signature
  [AUTH] 403 role_not_admin
- No romper comportamiento actual; solo agregar observabilidad.

3) Endpoint disponibilidad con trazas por etapa
- Archivo: ruta GET /api/admin/disponibilidad/por-fecha
- Log obligatorio:
  [DISP] GET /por-fecha params: {...}
  [DISP] Step 1 OK: <N> registros disponibilidad_usuarios
  [DISP] Step 2: buscando <M> usuario(s)
  [DISP] Step 2 OK: <K> usuario(s) encontrado(s)
  [DISP] Step 3 OK: <P> filas con usuario válido
  [DISP] responde <F> fecha(s)
- Si error, incluir mensaje y stack resumido.

4) Frontend: asegurar envío de token y URL correcta
- Archivo: pantalla admin disponibilidad (js/ts)
- Antes del fetch loggear:
  [FE-DISP] url:<url_final> desde:<fecha_desde> hasta:<fecha_hasta> token:<present|missing>
- Enviar SIEMPRE header:
  Authorization: Bearer <token>
- Si status != 2xx, loggear body de error.
- Mostrar mensaje al usuario si 401: “Sesión expirada, vuelve a iniciar sesión”.

5) Unificar key de token en toda la app
- Usa una única key de localStorage (ej: auth_token) en login + consumo API.
- Prohibido mezclar token/jwt/access_token en distintos módulos.

6) Timeouts Render free-tier
- Mantener timeout >= 90s para esta consulta, con aviso visual a los 10s:
  “Servidor despertando (Render), espera unos segundos...”.

7) Validación local y commit
- Corre tests/lint disponibles.
- Commit con mensaje claro del fix.
- Entrega diff y lista exacta de archivos cambiados.

Criterio de éxito:
- En Render aparecen [API] IN/OUT y [DISP] al presionar Buscar.
- Endpoint responde 200 con datos.
- Frontend deja de mostrar vacío/loop y renderiza disponibilidad.
"""

---

## Checklist manual en Render (después del deploy)
1. Confirmar env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`.
2. Cerrar sesión e iniciar sesión admin de nuevo (token fresco).
3. Ir a Disponibilidad y buscar.
4. Verificar logs en este orden:
   - `[API] IN ...`
   - `[AUTH] ...` (solo si falla)
   - `[DISP] Step ...`
   - `[API] OUT ... status:200`
5. Si aparece `auth:false`, el frontend no está enviando token.
6. Si hay `[API] IN` pero no `[DISP]`, bloquea middleware de auth.
7. Si hay `[DISP] Step 1 OK: 0`, Render apunta a DB/proyecto incorrecto.
