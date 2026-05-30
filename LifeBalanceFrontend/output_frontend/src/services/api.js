/**
 * LifeBalance — services/api.js
 * Todas las llamadas HTTP al backend Spring Boot (localhost:8080).
 */

const BASE_URL = 'http://localhost:8080/api';

async function http(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();
      msg = data.error || data.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)        => http('GET',    path);
const post = (path, body)  => http('POST',   path, body);
const put  = (path, body)  => http('PUT',    path, body);
const del  = (path)        => http('DELETE', path);

// ── Usuarios ──────────────────────────────────────────────────
export const apiRegistrarUsuario  = (body)     => {
  console.log('📤 POST /api/usuarios:', body);
  return post('/usuarios', body);
};

export const apiLogin             = (body)     => {
  console.log('📤 POST /api/usuarios/login:', body);
  return post('/usuarios/login', body);
};

export const apiGetUsuario        = (id)       => get(`/usuarios/${id}`);

export const apiActualizarUsuario = (id, body) => {
  // ✅ CORREGIDO: Asegurar que body se envía correctamente
  console.log('📤 PUT /api/usuarios/' + id + ':', body);
  return put(`/usuarios/${id}`, body);
};

export const apiEliminarUsuario   = (id)       => {
  console.log('🗑️ DELETE /api/usuarios/' + id);
  return del(`/usuarios/${id}`);
};

export const apiCambiarRol        = (id, rol)  => {
  console.log('🔄 PATCH /api/usuarios/' + id + '/rol:', { rol });
  return http('PATCH', `/usuarios/${id}/rol`, { rol });
};

// ── Admin ──────────────────────────────────────────────────────
export const apiAdminResumenUsuarios = ()       => {
  console.log('👥 GET /api/usuarios/admin/resumen');
  return get('/usuarios/admin/resumen');
};

export const apiAdminGetTodosSeguimientos = (uid) => {
  console.log('📊 GET /api/seguimientos/usuario/' + uid);
  return get(`/seguimientos/usuario/${uid}`);
};

export const apiAdminGetTodasRecomendaciones = (uid) => {
  console.log('✦ GET /api/recomendaciones/usuario/' + uid);
  return get(`/recomendaciones/usuario/${uid}`);
};

// ── Sesiones ──────────────────────────────────────────────────
export const apiGetSesiones           = ()     => {
  console.log('🎬 GET /api/sesiones');
  return get('/sesiones');
};

export const apiGetSesionesPorTipo    = (tipo) => {
  console.log('🎬 GET /api/sesiones/tipo/' + tipo);
  return get(`/sesiones/tipo/${encodeURIComponent(tipo)}`);
};

export const apiGetSesion             = (id)   => get(`/sesiones/${id}`);

/**
 * POST /api/sesiones
 * ✅ CORREGIDO: Ahora puede incluir usuario_id en el body
 * Si la sesión ya existe por nombre, devuelve la existente.
 * Si no existe, la crea. Así nunca hay duplicados.
 */
export const apiGuardarOObtenerSesion = (body) => {
  console.log('🎬 POST /api/sesiones:', body);
  return post('/sesiones', body);
};

// ── Registro emocional ────────────────────────────────────────
export const apiGetRegistrosEmocionales       = (uid)          => {
  console.log('😊 GET /api/registros-emocionales/usuario/' + uid);
  return get(`/registros-emocionales/usuario/${uid}`);
};

export const apiGetRegistrosEmocionesPorRango = (uid, i, f)    => {
  console.log('😊 GET /api/registros-emocionales/usuario/' + uid + '/rango');
  return get(`/registros-emocionales/usuario/${uid}/rango?inicio=${i}&fin=${f}`);
};

export const apiGuardarRegistroEmocional      = (body)         => {
  console.log('😊 POST /api/registros-emocionales:', body);
  return post('/registros-emocionales', body);
};

export const apiActualizarRegistroEmocional   = (id, body)     => {
  console.log('😊 PUT /api/registros-emocionales/' + id + ':', body);
  return put(`/registros-emocionales/${id}`, body);
};

export const apiEliminarRegistroEmocional     = (id)           => {
  console.log('🗑️ DELETE /api/registros-emocionales/' + id);
  return del(`/registros-emocionales/${id}`);
};

// ── Seguimiento ───────────────────────────────────────────────
export const apiGetSeguimiento             = (uid)          => {
  console.log('📈 GET /api/seguimientos/usuario/' + uid);
  return get(`/seguimientos/usuario/${uid}`);
};

export const apiGetSeguimientoPorRango     = (uid, i, f)    => {
  console.log('📈 GET /api/seguimientos/usuario/' + uid + '/rango');
  return get(`/seguimientos/usuario/${uid}/rango?inicio=${i}&fin=${f}`);
};

export const apiContarCompletadas          = (uid)          => {
  console.log('📈 GET /api/seguimientos/usuario/' + uid + '/completados/count');
  return get(`/seguimientos/usuario/${uid}/completados/count`);
};

export const apiGuardarSeguimiento         = (body)         => {
  console.log('📈 POST /api/seguimientos:', body);
  return post('/seguimientos', body);
};

// ── Recomendaciones ───────────────────────────────────────────
export const apiGetRecomendaciones         = (uid)          => {
  console.log('✦ GET /api/recomendaciones/usuario/' + uid);
  return get(`/recomendaciones/usuario/${uid}`);
};

export const apiGuardarRecomendacion       = (body)         => {
  console.log('✦ POST /api/recomendaciones:', body);
  return post('/recomendaciones', body);
};

export const apiGuardarRecomendacionAdmin  = (body)         => {
  console.log('✦ POST /api/recomendaciones/admin:', body);
  return post('/recomendaciones/admin', body);
};
