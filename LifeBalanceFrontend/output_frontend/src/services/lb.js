/* ══════════════════════════════════
   LifeBalance — lb.js (CORREGIDO)
   Capa de datos: claves, helpers de
   localStorage, catálogo de sesiones
   y utilidades de negocio.
   
   ✅ Soporta ID = CÉDULA del usuario
   ✅ Soporta tipo_documento
   ✅ Fecha SIEMPRE se envía
══════════════════════════════════ */

// ─── Claves de localStorage ───────────────────────────────
export const KEYS = {
  session:     'lb_sesion',
  usuarios:    'lb_usuarios',
  emocional:   'lb_registros_emocionales',
  seguimiento: 'lb_seguimiento',
  habitos:     'lb_habitos',
  pausas:      'lb_pausas',
};

// ─── Storage helpers ──────────────────────────────────────
export function getItem(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

// ─── Auth helpers ─────────────────────────────────────────
export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(KEYS.session, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

// ─── Password hash (SHA-256) ──────────────────────────────
export async function hashPassword(password) {
  const buffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Usuarios ────────────────────────────────────────────
export function getUsuarios() {
  return getItem(KEYS.usuarios);
}

export function saveUsuarios(usuarios) {
  setItem(KEYS.usuarios, usuarios);
}

export async function registrarUsuario({ id, tipoDocumento, nombre, telefono, correo, contrasena, fechaNacimiento, sexo }) {
  const usuarios = getUsuarios();

  if (usuarios.find(u => u.correo === correo)) {
    throw new Error('Este correo ya está registrado');
  }

  if (usuarios.find(u => u.id === id)) {
    throw new Error('Este número de documento ya está registrado');
  }

  const contrasena_hash = await hashPassword(contrasena);
  const nuevoUsuario = {
    id,  // ← CÉDULA como ID
    tipoDocumento,  // ← NUEVO
    nombre,
    telefono,  // ← NUEVO
    correo: correo.toLowerCase(),
    contrasena_hash,
    fechaNacimiento,
    sexo,
    fechaCreacion: new Date().toISOString(),
    activo: true,
    rol: 'USUARIO',
  };

  usuarios.push(nuevoUsuario);
  saveUsuarios(usuarios);
  return nuevoUsuario;
}

export async function loginUsuario({ correo, contrasena }) {
  const usuarios = getUsuarios();
  const hash = await hashPassword(contrasena);
  const user = usuarios.find(
    u => u.correo === correo.toLowerCase() && u.contrasena_hash === hash
  );
  if (!user) throw new Error('Correo o contraseña incorrectos');
  return user;
}

// ─── Fechas ───────────────────────────────────────────────
export function today() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T12:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function greeting(nombre) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  return `${g}, ${nombre.split(' ')[0]} 👋`;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// ─── Mood info ────────────────────────────────────────────
export function moodInfo(n) {
  const map = [
    null,
    { emoji: '😔', label: 'Muy mal',  color: '#f06b6b' },
    { emoji: '😔', label: 'Mal',       color: '#f06b6b' },
    { emoji: '😐', label: 'Regular',   color: '#7fa882' },
    { emoji: '😐', label: 'Así así',   color: '#7fa882' },
    { emoji: '🙂', label: 'Bien',      color: '#4ecb71' },
    { emoji: '🙂', label: 'Bien',      color: '#4ecb71' },
    { emoji: '😊', label: 'Muy bien',  color: '#72e090' },
    { emoji: '😊', label: 'Muy bien',  color: '#72e090' },
    { emoji: '🤩', label: 'Excelente', color: '#f0b429' },
    { emoji: '🤩', label: 'Excelente', color: '#f0b429' },
  ];
  return map[Math.min(10, Math.max(1, n))];
}

// ─── Catálogo de sesiones ─────────────────────────────────
export const SESIONES = [
  {
    id: 1,
    nombre: 'Respiración 4-7-8',
    tipo: 'Respiración',
    emoji: '🌬️',
    minutos: 5,
    nivel: 'Principiante',
    desc: 'Técnica para reducir ansiedad y activar el sistema nervioso parasimpático.',
    beneficios: ['Reduce ansiedad', 'Mejora el sueño', 'Calma el sistema nervioso'],
  },
  {
    id: 2,
    nombre: 'Meditación guiada',
    tipo: 'Meditación',
    emoji: '🧘',
    minutos: 10,
    nivel: 'Principiante',
    desc: 'Sesión de mindfulness para atención plena y reducción del estrés.',
    beneficios: ['Foco mental', 'Reduce estrés', 'Claridad emocional'],
  },
  {
    id: 3,
    nombre: 'Estiramiento de escritorio',
    tipo: 'Estiramiento',
    emoji: '🤸',
    minutos: 7,
    nivel: 'Principiante',
    desc: 'Secuencia de estiramientos para aliviar tensión del trabajo sedentario.',
    beneficios: ['Alivia tensión', 'Mejora postura', 'Activa circulación'],
  },
  {
    id: 4,
    nombre: 'Body scan de relajación',
    tipo: 'Mindfulness',
    emoji: '🌊',
    minutos: 15,
    nivel: 'Intermedio',
    desc: 'Recorrido consciente por el cuerpo para liberar tensión y conectar.',
    beneficios: ['Relajación profunda', 'Mejora el sueño', 'Conciencia corporal'],
  },
  {
    id: 5,
    nombre: 'Respiración box',
    tipo: 'Respiración',
    emoji: '⬜',
    minutos: 5,
    nivel: 'Principiante',
    desc: 'Técnica 4-4-4-4 usada por atletas para control del estrés bajo presión.',
    beneficios: ['Control emocional', 'Foco instantáneo', 'Reduce cortisol'],
  },
  {
    id: 6,
    nombre: 'Caminata mindful',
    tipo: 'Movimiento',
    emoji: '🚶',
    minutos: 10,
    nivel: 'Principiante',
    desc: 'Caminata consciente con atención plena a cada paso y respiración.',
    beneficios: ['Activa el cuerpo', 'Mindfulness en movimiento', 'Reduce ruido mental'],
  },
  {
    id: 7,
    nombre: 'Relajación muscular progresiva',
    tipo: 'Relajación',
    emoji: '💆',
    minutos: 12,
    nivel: 'Intermedio',
    desc: 'Tensión y liberación muscular para eliminar el estrés físico acumulado.',
    beneficios: ['Libera tensión', 'Reduce insomnio', 'Calma la mente'],
  },
  {
    id: 8,
    nombre: 'Visualización positiva',
    tipo: 'Meditación',
    emoji: '✨',
    minutos: 8,
    nivel: 'Principiante',
    desc: 'Guía de visualización para autoconfianza e intenciones positivas.',
    beneficios: ['Motivación', 'Autoconfianza', 'Claridad de metas'],
  },
];

// ─── Stats del usuario ────────────────────────────────────
export function getUserStats(userId) {
  const seg = getItem(KEYS.seguimiento).filter(
    s => s.usuario_id === userId && s.completado
  );
  const em = getItem(KEYS.emocional).filter(e => e.usuario_id === userId);

  // Racha de días
  const fechas = [...new Set(seg.map(s => s.fecha))].sort().reverse();
  let racha = 0;
  let d = new Date();
  for (let i = 0; i < 60; i++) {
    const ds = d.toISOString().split('T')[0];
    if (fechas.includes(ds)) {
      racha++;
      d.setDate(d.getDate() - 1);
    } else break;
  }

  // Minutos totales
  const mins = seg.reduce((acc, s) => {
    const sesion = SESIONES.find(x => x.id === s.sesion_id);
    return acc + (sesion ? sesion.minutos : 5);
  }, 0);

  // Ánimo promedio (7 días)
  const last7 = getLast7Days();
  const emSemana = em.filter(e => last7.includes(e.fecha));
  const avgAnimo = emSemana.length
    ? (emSemana.reduce((a, e) => a + e.nivel_animo, 0) / emSemana.length).toFixed(1)
    : null;

  return {
    sesiones: seg.length,
    mins,
    racha,
    avgAnimo,
    diasActivos: fechas.length,
  };
}

// ─── Hábitos predefinidos ─────────────────────────────────
export const HABITOS_DEFAULT = [
  { emoji: '🌬️', nombre: 'Respiración matutina' },
  { emoji: '🧘', nombre: 'Meditación' },
  { emoji: '🚶', nombre: 'Caminata 10 min' },
  { emoji: '📴', nombre: 'Sin pantallas 1h antes' },
  { emoji: '📓', nombre: 'Diario de gratitud' },
];

// ─── Adaptadores Backend ↔ Frontend ──────────────────────────
/**
 * El backend usa camelCase (nivelAnimo, fechaNacimiento, etc.)
 * El frontend usa snake_case en localStorage (nivel_animo, fecha_nacimiento, etc.)
 * Estas funciones convierten entre los dos formatos.
 */

/** Convierte un registro emocional del backend al formato del frontend */
export function adaptarRegistroEmocional(r) {
  return {
    id:          r.id,
    usuario_id:  r.usuario?.id ?? r.usuarioId,
    nivel_animo: r.nivelAnimo,
    comentario:  r.comentario || '',
    fecha:       r.fecha,  // "YYYY-MM-DD" — CRÍTICO
  };
}

/** Convierte un seguimiento del backend al formato del frontend */
export function adaptarSeguimiento(s) {
  return {
    id:          s.id,
    usuario_id:  s.usuario?.id ?? s.usuarioId,
    sesion_id:   s.sesion?.id ?? s.sesionId,
    completado:  s.completado,
    fecha:       s.fecha,
  };
}

/** Convierte una sesión del backend al formato del frontend */
export function adaptarSesion(s) {
  const local = SESIONES.find(x => x.id === s.id || x.nombre === s.nombre);
  return {
    id:       s.id,
    nombre:   s.nombre,
    tipo:     s.tipo,
    minutos:  s.duracionMinutos,
    emoji:    local?.emoji    ?? '🧘',
    nivel:    local?.nivel    ?? 'Principiante',
    desc:     local?.desc     ?? '',
    beneficios: local?.beneficios ?? [],
  };
}

/** Construye el body para POST /api/registros-emocionales
 *  ✅ CRÍTICO: fecha SIEMPRE se incluye
 */
export function buildRegistroEmocionalBody(usuarioId, nivelAnimo, comentario, fecha) {
  return {
    nivelAnimo,
    comentario,
    fecha,  // "YYYY-MM-DD" — NO PUEDE SER NULL
    usuario: { id: usuarioId }
  };
}

/** Construye el body para POST /api/seguimientos */
export function buildSeguimientoBody(usuarioId, sesionId, fecha) {
  return {
    completado: true,
    fecha,
    usuario: { id: usuarioId },
    sesion:  { id: sesionId }
  };
}

/**
 * Construye el body para POST /api/usuarios (registro)
 * ✅ CAMBIOS:
 * - id = cédula (String, 5-10 dígitos)
 * - tipoDocumento = nuevo campo (CC, CE, NIT, etc.)
 * - telefono = nuevo campo (7-15 dígitos, REQUERIDO)
 * - contrasena = camelCase (no contraseña)
 * - fechaNacimiento = camelCase (no fecha_nacimiento)
 */
export function buildUsuarioBody({ 
  id,  // ← CÉDULA (5-10 dígitos)
  tipoDocumento,  // ← NUEVO (CC, CE, NIT, PASAPORTE, TI, PPT)
  nombre, 
  telefono,  // ← NUEVO (7-15 dígitos)
  correo, 
  contrasena_hash,  // ← desde frontend (SHA-256)
  fechaNacimiento, 
  sexo 
}) {
  return {
    id,  // Cédula como ID
    tipoDocumento,
    nombre,
    telefono,  // ← Teléfono
    correo,
    contrasena: contrasena_hash,  // ← camelCase para backend
    fechaNacimiento,  // ← camelCase para backend
    sexo,
    fechaCreacion: today(),
    activo: true
  };
}

/**
 * Adapta un usuario del backend al formato del frontend
 * Convierte los campos camelCase → snake_case para localStorage
 */
export function adaptarUsuario(u) {
  return {
    id: u.id,  // Cédula
    tipoDocumento: u.tipoDocumento,
    nombre: u.nombre,
    correo: u.correo,
    fecha_nacimiento: u.fechaNacimiento,  // ← snake_case para frontend
    sexo: u.sexo,
    fecha_creacion: u.fechaCreacion,
    activo: u.activo,
    rol: u.rol,
  };
}
