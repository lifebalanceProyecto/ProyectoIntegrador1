import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { today } from '../services/lb';
import {
  apiAdminResumenUsuarios,
  apiActualizarUsuario,
  apiEliminarUsuario,
  apiCambiarRol,
  apiRegistrarUsuario,
  apiGetSeguimiento,
  apiGetRecomendaciones,
  apiGuardarRecomendacionAdmin,
} from '../services/api';
import './Admin.css';

const TIPOS_DOCUMENTO = ['CC', 'CE', 'NIT', 'PASAPORTE', 'TI', 'PPT'];

function RolBadge({ rol }) {
  return (
    <span className={`rol-badge ${rol === 'ADMIN' ? 'admin' : 'usuario'}`}>
      {rol === 'ADMIN' ? 'Admin' : 'Usuario'}
    </span>
  );
}

function TabUsuarios({ showToast }) {
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({});
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiAdminResumenUsuarios();
      const usuariosArray = Array.isArray(data) ? data : (data?.usuarios || []);
      console.log('✅ Usuarios cargados:', usuariosArray.length);
      setUsuarios(usuariosArray);
    } catch (e) {
      console.error('❌ Error al cargar usuarios:', e.message);
      showToast('Error al cargar usuarios: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.correo?.toLowerCase().includes(search.toLowerCase())
  );

  const abrirCrear = () => {
    setErrors({});
    setForm({
      id: '',
      tipoDocumento: 'CC',
      nombre: '',
      telefono: '',
      correo: '',
      contrasena: '',
      fechaNacimiento: '',
      sexo: 'M',
      rol: 'USUARIO',
      activo: true,
    });
    setModal('crear');
  };

  const abrirEditar = (u) => {
    setErrors({});
    setSelected(u);
    setForm({
      id: u.id || '',
      tipoDocumento: u.tipoDocumento || 'CC',
      nombre: u.nombre || '',
      telefono: u.telefono || '',
      correo: u.correo || '',
      contrasena: '',
      fechaNacimiento: u.fechaNacimiento || '',
      sexo: u.sexo || 'M',
      rol: u.rol || 'USUARIO',
      activo: u.activo !== undefined ? u.activo : true,
    });
    setModal('editar');
  };

  const validarForm = () => {
    const errs = {};

    if (modal === 'crear') {
      if (!form.id || form.id.trim().length === 0) {
        errs.id = 'El número de documento es obligatorio';
      } else if (!/^\d{5,10}$/.test(form.id.trim())) {
        errs.id = 'El documento debe tener entre 5 y 10 dígitos';
      }

      if (!form.tipoDocumento) {
        errs.tipoDocumento = 'Selecciona un tipo de documento';
      }

      if (!form.contrasena || form.contrasena.length < 8) {
        errs.contrasena = 'La contraseña debe tener al menos 8 caracteres';
      }
    } else {
      if (form.contrasena && form.contrasena.length < 8) {
        errs.contrasena = 'La contraseña debe tener al menos 8 caracteres (o dejar vacía)';
      }
    }

    if (!form.nombre || form.nombre.trim().length < 2) {
      errs.nombre = 'Mínimo 2 caracteres';
    }

    if (!form.telefono || !/^\d{7,15}$/.test(form.telefono.trim())) {
      errs.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
    }

    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      errs.correo = 'Correo inválido';
    }

    if (!form.fechaNacimiento) {
      errs.fechaNacimiento = 'Selecciona una fecha';
    }

    if (!form.sexo) {
      errs.sexo = 'Selecciona un género';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEliminar = async (u) => {
    if (!window.confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await apiEliminarUsuario(u.id);
      showToast(`Usuario ${u.nombre} eliminado`, 'success');
      cargar();
    } catch (e) {
      showToast('Error al eliminar: ' + e.message, 'error');
    }
  };

  const handleGuardar = async () => {
    if (!validarForm()) return;

    setSaving(true);
    try {
      if (modal === 'crear') {
        const body = {
          id: form.id.trim(),
          tipoDocumento: form.tipoDocumento,
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          correo: form.correo.trim(),
          contrasena: form.contrasena,
          fechaNacimiento: form.fechaNacimiento,
          sexo: form.sexo,
          fechaCreacion: today(),
          activo: true,
        };
        console.log('📤 POST /api/usuarios:', body);
        await apiRegistrarUsuario(body);
        showToast('Usuario creado exitosamente', 'success');
      } else {
        // ✅ CORREGIDO: Incluir id en el body para edición
        const body = {
          id: form.id,
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim(),
          correo: form.correo.trim(),
          tipoDocumento: form.tipoDocumento,
          fechaNacimiento: form.fechaNacimiento,
          sexo: form.sexo,
          activo: form.activo,
        };
        
        if (form.contrasena && form.contrasena.length > 0) {
          body.contrasena = form.contrasena;
        }

        console.log('📤 PUT /api/usuarios/' + selected.id + ':', body);
        await apiActualizarUsuario(selected.id, body);
        
        if (form.rol !== (selected.rol || 'USUARIO')) {
          console.log('🔄 Cambiando rol a:', form.rol);
          await apiCambiarRol(selected.id, form.rol);
        }
        
        showToast('Usuario actualizado', 'success');
      }
      setModal(null);
      cargar();
    } catch (e) {
      console.error('❌ Error:', e.message);
      showToast('Error: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total:   usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    admins:  usuarios.filter(u => u.rol === 'ADMIN').length,
  };

  return (
    <>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-val serif">{stats.total}</div>
          <div className="admin-stat-lbl">Total usuarios</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val serif">{stats.activos}</div>
          <div className="admin-stat-lbl">Activos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val serif">{stats.total - stats.activos}</div>
          <div className="admin-stat-lbl">Inactivos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val serif">{stats.admins}</div>
          <div className="admin-stat-lbl">Administradores</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'center' }}>
        <input type="text" placeholder="Buscar por nombre o correo…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '0.875rem' }} />
        <button className="admin-btn admin-btn-primary" onClick={abrirCrear}>+ Nuevo usuario</button>
      </div>

      {loading ? (
        <div className="admin-loading">Cargando usuarios…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Nacimiento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="admin-empty">Sin resultados</td></tr>
              ) : filtrados.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{u.id}</td>
                  <td><strong>{u.nombre}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{u.correo}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.telefono}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.fechaNacimiento}</td>
                  <td><RolBadge rol={u.rol || 'USUARIO'} /></td>
                  <td><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: u.activo ? '#d4edda' : '#f8d7da', color: u.activo ? '#155724' : '#721c24' }}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => abrirEditar(u)}>Editar</button>
                    <button className="admin-btn admin-btn-danger" onClick={() => handleEliminar(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: 550, maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'}</h3>

            {/* ✅ ID siempre visible */}
            <div className="field-group">
              <label>Número de documento (Cédula)</label>
              <input 
                type="text" 
                value={form.id || ''} 
                onChange={e => modal === 'crear' && setForm(f => ({ ...f, id: e.target.value }))}
                readOnly={modal === 'editar'}
                placeholder={modal === 'crear' ? '1234567890' : ''}
                style={{ 
                  padding: '8px 12px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px', 
                  background: modal === 'editar' ? '#f0f0f0' : 'var(--bg)', 
                  color: 'var(--text-1)', 
                  width: '100%',
                  cursor: modal === 'editar' ? 'not-allowed' : 'text'
                }} 
              />
              {errors.id && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.id}</span>}
            </div>

            {/* Tipo de documento: solo en creación */}
            {modal === 'crear' && (
              <div className="field-group">
                <label>Tipo de documento</label>
                <select value={form.tipoDocumento || ''} onChange={e => setForm(f => ({ ...f, tipoDocumento: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }}>
                  {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipoDocumento && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.tipoDocumento}</span>}
              </div>
            )}

            <div className="field-group">
              <label>Nombre</label>
              <input type="text" value={form.nombre || ''} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }} />
              {errors.nombre && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.nombre}</span>}
            </div>

            <div className="field-group">
              <label>Teléfono</label>
              <input type="tel" value={form.telefono || ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }} />
              {errors.telefono && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.telefono}</span>}
            </div>

            <div className="field-group">
              <label>Correo</label>
              <input type="email" value={form.correo || ''} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }} />
              {errors.correo && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.correo}</span>}
            </div>

            <div className="field-group">
              <label>Contraseña {modal === 'editar' && '(dejar vacío para no cambiar)'}</label>
              <input type="password" value={form.contrasena || ''} onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }} />
              {errors.contrasena && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.contrasena}</span>}
            </div>

            <div className="field-group">
              <label>Fecha de nacimiento</label>
              <input type="date" value={form.fechaNacimiento || ''} onChange={e => setForm(f => ({ ...f, fechaNacimiento: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }} />
              {errors.fechaNacimiento && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.fechaNacimiento}</span>}
            </div>

            <div className="field-group">
              <label>Género</label>
              <select value={form.sexo || ''} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
                <option value="P">Prefiero no decir</option>
              </select>
              {errors.sexo && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.sexo}</span>}
            </div>

            <div className="field-group">
              <label>Rol</label>
              <select value={form.rol || 'USUARIO'} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', width: '100%' }}>
                <option value="USUARIO">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div className="field-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.activo || false} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} />
                Activo
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="admin-btn" onClick={() => setModal(null)} disabled={saving}>Cancelar</button>
              <button className="admin-btn admin-btn-primary" onClick={handleGuardar} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TabSeguimiento({ showToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingU, setLoadingU] = useState(true);
  const [selected, setSelected] = useState(null);
  const [seg, setSeg] = useState([]);
  const [loadingS, setLoadingS] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setLoadingU(true);
    try {
      const data = await apiAdminResumenUsuarios();
      const usuariosArray = Array.isArray(data) ? data : (data?.usuarios || []);
      setUsuarios(usuariosArray);
    } catch (e) {
      showToast('Error al cargar usuarios: ' + e.message, 'error');
    } finally {
      setLoadingU(false);
    }
  }, [showToast]);

  const verSeguimiento = async (u) => {
    setSelected(u);
    setLoadingS(true);
    try {
      const data = await apiGetSeguimiento(u.id);
      setSeg(data || []);
    } catch (e) {
      showToast('Error al cargar seguimiento: ' + e.message, 'error');
    } finally {
      setLoadingS(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', alignItems: 'start' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Seleccionar usuario</div>
        {loadingU ? <div className="admin-loading" style={{ padding: '1.5rem' }}>Cargando…</div> : usuarios.map(u => (
          <div key={u.id} onClick={() => verSeguimiento(u)} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: selected?.id === u.id ? 'var(--violet-dim)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
            <div className="seg-avatar">{u.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{u.nombre}</div>
              <RolBadge rol={u.rol || 'USUARIO'} />
            </div>
          </div>
        ))}
      </div>

      <div>
        {!selected ? (
          <div className="admin-empty" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>Selecciona un usuario para ver su seguimiento</div>
        ) : (
          <>
            {loadingS ? <div className="admin-loading">Cargando seguimiento…</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Fecha</th><th>Actividad</th><th>Duración (min)</th><th>Estado</th></tr></thead>
                  <tbody>
                    {seg.length === 0 ? (
                      <tr><td colSpan={4} className="admin-empty">Sin registros</td></tr>
                    ) : seg.map((s, i) => (
                      <tr key={s.id || i}>
                        <td>{s.fecha}</td>
                        <td>{s.tipo || s.actividad || '—'}</td>
                        <td>{s.duracion || '—'}</td>
                        <td style={{ color: 'var(--text-2)' }}>{s.estado || 'Completado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabRecomendaciones({ showToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingU, setLoadingU] = useState(true);
  const [selected, setSelected] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loadingR, setLoadingR] = useState(false);
  const [nuevaRec, setNuevaRec] = useState({ texto: '', tipo: 'Bienestar', prioridad: 'Media' });
  const [saving, setSaving] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setLoadingU(true);
    try {
      const data = await apiAdminResumenUsuarios();
      const usuariosArray = Array.isArray(data) ? data : (data?.usuarios || []);
      setUsuarios(usuariosArray);
    } catch (e) {
      showToast('Error al cargar usuarios: ' + e.message, 'error');
    } finally {
      setLoadingU(false);
    }
  }, [showToast]);

  const verRecomendaciones = async (u) => {
    setSelected(u);
    setLoadingR(true);
    try {
      const data = await apiGetRecomendaciones(u.id);
      setRecs(data || []);
    } catch (e) {
      showToast('Error al cargar recomendaciones: ' + e.message, 'error');
    } finally {
      setLoadingR(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const handleEnviarRecomendacion = async () => {
    if (!nuevaRec.texto.trim()) { showToast('Escribe el texto de la recomendación', 'error'); return; }
    setSaving(true);
    try {
      const body = { idUsuario: selected.id, texto: nuevaRec.texto.trim(), tipo: nuevaRec.tipo, prioridad: nuevaRec.prioridad, fecha: today() };
      await apiGuardarRecomendacionAdmin(body);
      showToast('Recomendación enviada a ' + selected.nombre, 'success');
      setNuevaRec({ texto: '', tipo: 'Bienestar', prioridad: 'Media' });
      verRecomendaciones(selected);
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', alignItems: 'start' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Seleccionar usuario</div>
        {loadingU ? <div className="admin-loading" style={{ padding: '1.5rem' }}>Cargando…</div> : usuarios.map(u => (
          <div key={u.id} onClick={() => verRecomendaciones(u)} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: selected?.id === u.id ? 'var(--violet-dim)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
            <div className="seg-avatar">{u.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{u.nombre}</div>
              <RolBadge rol={u.rol || 'USUARIO'} />
            </div>
          </div>
        ))}
      </div>

      <div>
        {!selected ? (
          <div className="admin-empty" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>Selecciona un usuario para gestionar sus recomendaciones</div>
        ) : (
          <>
            <div className="rec-form">
              <h4>Nueva recomendación para <strong>{selected.nombre}</strong></h4>
              <div className="rec-form-row">
                <select value={nuevaRec.tipo} onChange={e => setNuevaRec(r => ({ ...r, tipo: e.target.value }))}>
                  <option>Bienestar</option>
                  <option>Respiración</option>
                  <option>Meditación</option>
                  <option>Mindfulness</option>
                  <option>Movimiento</option>
                  <option>Relajación</option>
                  <option>Estiramiento</option>
                  <option>Hábitos</option>
                </select>
                <select value={nuevaRec.prioridad} onChange={e => setNuevaRec(r => ({ ...r, prioridad: e.target.value }))}>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
              <textarea placeholder="Escribe aquí la recomendación personalizada…" value={nuevaRec.texto} onChange={e => setNuevaRec(r => ({ ...r, texto: e.target.value }))} rows={3} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '0.875rem', resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="admin-btn admin-btn-primary" onClick={handleEnviarRecomendacion} disabled={saving}>
                  {saving ? 'Enviando…' : '✦ Enviar recomendación'}
                </button>
              </div>
            </div>

            {loadingR ? <div className="admin-loading">Cargando recomendaciones…</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Tipo</th><th>Prioridad</th><th>Texto</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {recs.length === 0 ? (
                      <tr><td colSpan={5} className="admin-empty">Sin recomendaciones aún</td></tr>
                    ) : recs.map((r, i) => (
                      <tr key={r.id || i}>
                        <td style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{r.id}</td>
                        <td><span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: 'var(--violet-dim)', color: 'var(--violet)' }}>{r.tipo || '—'}</span></td>
                        <td><span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: r.prioridad === 'Alta' ? '#fce4e4' : r.prioridad === 'Media' ? '#fff3cd' : '#d4edda', color: r.prioridad === 'Alta' ? '#c0392b' : r.prioridad === 'Media' ? '#856404' : '#155724' }}>{r.prioridad || '—'}</span></td>
                        <td style={{ maxWidth: 300 }}>{r.texto || r.descripcion || '—'}</td>
                        <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{r.fecha || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState('usuarios');

  if (user && user.rol !== 'ADMIN') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const TABS = [
    { id: 'usuarios', label: '👥 Usuarios (CRUD)' },
    { id: 'seguimiento', label: '📊 Seguimiento' },
    { id: 'recomendaciones', label: '✦ Recomendaciones' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Panel de Administrador
          </div>
          <h1 className="page-title serif" style={{ marginTop: 8, marginBottom: 2 }}>Administración</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', margin: 0 }}>
            Hola, <strong>{user?.nombre}</strong> — gestiona usuarios, seguimiento y recomendaciones
          </p>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && <TabUsuarios showToast={showToast} />}
      {tab === 'seguimiento' && <TabSeguimiento showToast={showToast} />}
      {tab === 'recomendaciones' && <TabRecomendaciones showToast={showToast} />}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
