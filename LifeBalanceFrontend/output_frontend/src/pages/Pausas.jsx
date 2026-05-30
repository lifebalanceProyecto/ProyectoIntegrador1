import { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { KEYS, SESIONES, getItem, setItem } from '../services/lb';
import './Pausas.css';

const SESIONES_PAUSAS = SESIONES.slice(0, 6);

export default function Pausas() {
  const { user } = useAuthContext();
  const { toast, showToast } = useToast();
  const [pausas, setPausas] = useState([]);
  const [form, setForm] = useState({ hora: '', sesion_id: '1', nota: '' });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function load() {
    const all = getItem(KEYS.pausas).filter(p => p.usuario_id === user.id);
    setPausas(all.sort((a, b) => a.hora.localeCompare(b.hora)));
  }

  function handleAdd(e) {
    e.preventDefault();
    const errs = {};
    if (!form.hora) errs.hora = 'Selecciona una hora';
    if (!form.sesion_id) errs.sesion_id = 'Elige una sesión';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const all = getItem(KEYS.pausas);
    all.push({
      id: Date.now(),
      usuario_id: user.id,
      hora: form.hora,
      sesion_id: parseInt(form.sesion_id),
      nota: form.nota.trim(),
      activa: true,
    });
    setItem(KEYS.pausas, all);
    setForm({ hora: '', sesion_id: '1', nota: '' });
    setErrors({});
    setShowForm(false);
    load();
    showToast('⏰ Pausa programada correctamente', 'success');
  }

  function toggleActiva(id) {
    const all = getItem(KEYS.pausas).map(p =>
      p.id === id ? { ...p, activa: !p.activa } : p
    );
    setItem(KEYS.pausas, all);
    load();
  }

  function eliminar(id) {
    const all = getItem(KEYS.pausas).filter(p => p.id !== id);
    setItem(KEYS.pausas, all);
    load();
    showToast('Pausa eliminada', '');
  }

  const now = new Date();
  const nowStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  const activasPausas  = pausas.filter(p => p.activa);
  const inactivasPausas = pausas.filter(p => !p.activa);

  return (
    <div className="pausas-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title serif">Pausas activas</h1>
          <p className="page-sub">Programa momentos de bienestar a lo largo del día</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva pausa'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card pausa-form fadein">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Programar nueva pausa</h3>
          <form onSubmit={handleAdd} noValidate>
            <div className="pausa-form-grid">
              <div className="field-group">
                <label className="field-label">Hora</label>
                <input
                  type="time"
                  className={`input-field ${errors.hora ? 'error' : ''}`}
                  value={form.hora}
                  onChange={e => { setForm(f => ({ ...f, hora: e.target.value })); setErrors(er => ({ ...er, hora: '' })); }}
                />
                {errors.hora && <span className="field-error">{errors.hora}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Tipo de sesión</label>
                <select
                  className={`input-field ${errors.sesion_id ? 'error' : ''}`}
                  value={form.sesion_id}
                  onChange={e => setForm(f => ({ ...f, sesion_id: e.target.value }))}
                >
                  {SESIONES_PAUSAS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.nombre} ({s.minutos} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Nota (opcional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Pausa del almuerzo"
                  value={form.nota}
                  onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
              Guardar pausa
            </button>
          </form>
        </div>
      )}

      {/* Active breaks */}
      <div className="card">
        <div className="card-title-row">
          <h3 className="section-title">
            Pausas activas
            <span className="pausa-badge-count">{activasPausas.length}</span>
          </h3>
        </div>

        {activasPausas.length === 0 ? (
          <p className="empty-msg">No tienes pausas activas.<br />Crea tu primera pausa para comenzar.</p>
        ) : (
          <div className="pausas-list">
            {activasPausas.map(p => {
              const ses = SESIONES.find(s => s.id === p.sesion_id);
              const isPast = p.hora < nowStr;
              return (
                <div key={p.id} className={`pausa-item-full ${isPast ? 'past' : ''}`}>
                  <div className="pi-time">
                    <span className="pi-hora">{p.hora}</span>
                    {!isPast && <span className="pi-next-badge">Próxima</span>}
                    {isPast && <span className="pi-past-badge">Pasada</span>}
                  </div>
                  <div className="pi-ses">
                    <span className="pi-emoji">{ses?.emoji ?? '⏱'}</span>
                    <div>
                      <div className="pi-ses-name">{ses?.nombre ?? 'Pausa activa'}</div>
                      {p.nota && <div className="pi-nota">{p.nota}</div>}
                    </div>
                  </div>
                  <div className="pi-dur">{ses?.minutos ?? 5} min</div>
                  <div className="pi-actions">
                    <button className="pi-btn" onClick={() => toggleActiva(p.id)} title="Desactivar">⏸</button>
                    <button className="pi-btn danger" onClick={() => eliminar(p.id)} title="Eliminar">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inactive breaks */}
      {inactivasPausas.length > 0 && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 14 }}>
            Pausas inactivas
            <span className="pausa-badge-count dimmed">{inactivasPausas.length}</span>
          </h3>
          <div className="pausas-list">
            {inactivasPausas.map(p => {
              const ses = SESIONES.find(s => s.id === p.sesion_id);
              return (
                <div key={p.id} className="pausa-item-full inactive">
                  <div className="pi-time">
                    <span className="pi-hora">{p.hora}</span>
                  </div>
                  <div className="pi-ses">
                    <span className="pi-emoji" style={{ opacity: 0.4 }}>{ses?.emoji ?? '⏱'}</span>
                    <div>
                      <div className="pi-ses-name" style={{ color: 'var(--dim)' }}>{ses?.nombre ?? 'Pausa activa'}</div>
                      {p.nota && <div className="pi-nota">{p.nota}</div>}
                    </div>
                  </div>
                  <div className="pi-actions">
                    <button className="pi-btn success" onClick={() => toggleActiva(p.id)} title="Activar">▶</button>
                    <button className="pi-btn danger" onClick={() => eliminar(p.id)} title="Eliminar">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Toast {...toast} />
    </div>
  );
}
