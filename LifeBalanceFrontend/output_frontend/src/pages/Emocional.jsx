import { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import {
  KEYS, getItem, setItem,
  today, formatDate, moodInfo,
  getLast7Days, getLast30Days,
} from '../services/lb';
import { apiGuardarRegistroEmocional, apiGetRegistrosEmocionales } from '../services/api';
import './Emocional.css';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MOOD_OPTS = [
  { nivel: 2,  emoji: '😔', label: 'Muy mal'   },
  { nivel: 4,  emoji: '😐', label: 'Regular'   },
  { nivel: 6,  emoji: '🙂', label: 'Bien'      },
  { nivel: 8,  emoji: '😊', label: 'Muy bien'  },
  { nivel: 10, emoji: '🤩', label: 'Excelente' },
];

export default function Emocional() {
  const { user }             = useAuthContext();
  const { toast, showToast } = useToast();

  const [selectedNivel, setSelectedNivel] = useState(5);
  const [comment, setComment]             = useState('');
  const [alreadyToday, setAlreadyToday]   = useState(false);
  const [weekData, setWeekData]           = useState([]);
  const [trendData, setTrendData]         = useState([]);
  const [historial, setHistorial]         = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Carga registros desde la API MySQL.
   * Convierte los campos del backend (nivelAnimo → nivel_animo, etc.)
   * para que el resto de la UI siga funcionando igual.
   * 
   * Si la API falla, fallback a localStorage.
   */
  async function load() {
    setLoading(true);
    let registros = [];

    try {
      const apiData = await apiGetRegistrosEmocionales(user.id);
      // Adaptar formato backend → frontend
      registros = apiData.map(r => ({
        id:          r.id,
        usuario_id:  r.usuario?.id ?? user.id,
        nivel_animo: r.nivelAnimo,
        comentario:  r.comentario || '',
        fecha:       r.fecha,
      }));
      console.log('✅ Registros cargados desde MySQL:', registros.length);
      // Sincronizar localStorage con la BD
      setItem(KEYS.emocional, registros);
    } catch (err) {
      console.warn('⚠️ Error cargando de MySQL, usando localStorage:', err.message);
      // Fallback a localStorage si el backend no responde
      registros = getItem(KEYS.emocional).filter(r => String(r.usuario_id) === String(user.id));
    }

    const hoy = registros.filter(r => r.fecha === today());
    if (hoy.length) {
      const last = hoy[hoy.length - 1];
      setAlreadyToday(true);
      setSelectedNivel(last.nivel_animo);
      setComment(last.comentario || '');
    }

    buildWeek(registros);
    buildTrend(registros);
    buildHistorial(registros);
    setLoading(false);
  }

  function buildWeek(mine) {
    const last7 = getLast7Days();
    setWeekData(last7.map(date => {
      const entries = mine.filter(r => r.fecha === date);
      const avg = entries.length
        ? entries.reduce((a, e) => a + e.nivel_animo, 0) / entries.length
        : null;
      const d = new Date(date + 'T12:00');
      return { date, avg, day: DAYS_ES[d.getDay()], isToday: date === today() };
    }));
  }

  function buildTrend(mine) {
    const last30 = getLast30Days();
    setTrendData(last30.map(date => {
      const entries = mine.filter(r => r.fecha === date);
      const avg = entries.length
        ? entries.reduce((a, e) => a + e.nivel_animo, 0) / entries.length
        : 0;
      return { date, avg, isToday: date === today() };
    }));
  }

  function buildHistorial(mine) {
    setHistorial([...mine].sort((a, b) => b.id - a.id).slice(0, 15));
  }

  /**
   * Guarda el registro emocional en MySQL y localStorage.
   * ✅ CRÍTICO: SIEMPRE envía la fecha (hoy), aunque no venga en el form
   */
  async function handleSave() {
    const fechaHoy = today();

    // 1 ─ Guardar en localStorage (historial local inmediato)
    const todosLocal = getItem(KEYS.emocional);
    const nuevoLocal = {
      id:          Date.now(),
      usuario_id:  user.id,
      nivel_animo: selectedNivel,
      comentario:  comment.trim(),
      fecha:       fechaHoy,
    };
    todosLocal.push(nuevoLocal);
    setItem(KEYS.emocional, todosLocal);

    // 2 ─ Guardar en MySQL
    try {
      const body = {
        nivelAnimo:  selectedNivel,
        comentario:  comment.trim(),
        fecha:       fechaHoy,  // ← CRÍTICO: SIEMPRE se envía
        usuario:     { id: user.id },
      };
      
      console.log('📤 Enviando registro emocional a MySQL:', body);
      await apiGuardarRegistroEmocional(body);
      console.log('✅ Registro emocional guardado en MySQL');
      showToast('💚 Estado ' + selectedNivel + '/10 guardado en la base de datos', 'success');
    } catch (err) {
      console.error('❌ Error guardando en MySQL:', err.message);
      showToast('⚠️ Guardado en local (sin conexión a servidor)', 'warning');
    }

    setAlreadyToday(true);
    const mine = todosLocal.filter(r => String(r.usuario_id) === String(user.id));
    buildWeek(mine);
    buildTrend(mine);
    buildHistorial(mine);
  }

  const filledDays = trendData.filter(d => d.avg > 0).length;
  const avgTrend = filledDays
    ? (trendData.filter(d => d.avg > 0).reduce((a, d) => a + d.avg, 0) / filledDays).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="emocional-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="emocional-page">
      <div className="page-header">
        <h1 className="page-title serif">Registro emocional</h1>
        <p className="page-sub">Conecta con tu estado interno</p>
      </div>

      <div className="em-layout">
        {/* ── Columna izquierda ── */}
        <div className="em-col-left">
          <div className="card em-input-card">
            <div className="card-title-row">
              <h3 className="section-title">¿Cómo estás hoy?</h3>
              {alreadyToday && <span className="already-badge">Ya registrado ✓</span>}
            </div>

            <div className="em-mood-opts">
              {MOOD_OPTS.map(({ nivel, emoji, label }) => (
                <button key={nivel}
                  className={'em-mood-btn' + (selectedNivel === nivel ? ' selected' : '')}
                  onClick={() => setSelectedNivel(nivel)}>
                  <span className="em-emoji">{emoji}</span>
                  <span className="em-label">{label}</span>
                  <span className="em-num">{nivel}/10</span>
                </button>
              ))}
            </div>

            <div className="em-slider-wrap">
              <input type="range" min="1" max="10" value={selectedNivel}
                className="em-slider"
                onChange={e => setSelectedNivel(Number(e.target.value))} />
              <div className="em-slider-labels">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} style={{
                    color: n === selectedNivel ? 'var(--sage-lt)' : 'var(--dim)',
                    fontWeight: n === selectedNivel ? 600 : 400
                  }}>{n}</span>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Nota adicional (opcional)</label>
              <textarea className="input-field em-textarea"
                placeholder="¿Qué influyó en tu estado de ánimo hoy?"
                value={comment} onChange={e => setComment(e.target.value)} rows={3} />
            </div>

            <div className="em-date">
              📅 {new Date().toLocaleDateString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
              {alreadyToday ? 'Actualizar mi estado' : 'Guardar registro'}
            </button>
          </div>

          {/* Seguimiento semanal */}
          <div className="card">
            <h3 className="section-title">Esta semana</h3>
            <div className="week-track">
              {weekData.map(({ day, avg, isToday }) => {
                const info = avg ? moodInfo(Math.round(avg)) : null;
                return (
                  <div key={day} className="wt-day">
                    <div className={'wt-circle' + (avg ? ' filled' : '') + (isToday ? ' today' : '')}
                      style={avg ? { borderColor: info.color + '80' } : {}}>
                      {avg ? info.emoji : <span className="wt-empty">—</span>}
                    </div>
                    <div className="wt-lbl">{day}</div>
                    {avg && <div className="wt-val" style={{ color: info.color }}>{Math.round(avg)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="em-col-right">
          {/* Tendencia 30 días */}
          <div className="card">
            <div className="card-title-row">
              <h3 className="section-title">Tendencia 30 días</h3>
              {avgTrend && (
                <span className="trend-summary">Promedio: {avgTrend}/10 · {filledDays} días</span>
              )}
            </div>
            <div className="trend-chart">
              {trendData.map(({ date, avg, isToday }) => {
                const h = avg ? (avg / 10) * 75 + 5 : 3;
                return (
                  <div key={date} className="trend-bar-wrap">
                    <div className={'trend-bar' + (isToday ? ' today' : '') + (!avg ? ' empty' : '')}
                      style={{ height: h + 'px' }}
                      title={avg ? date + ': ' + avg.toFixed(1) + '/10' : 'Sin registro'} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 14 }}>Historial reciente</h3>
            {historial.length === 0 ? (
              <p className="empty-msg">Aún no hay registros.</p>
            ) : (
              <div className="em-list">
                {historial.map(r => {
                  const info = moodInfo(r.nivel_animo);
                  return (
                    <div key={r.id} className="em-item">
                      <div className="em-item-emoji">{info.emoji}</div>
                      <div className="em-item-body">
                        <div className="em-item-header">
                          <span className="em-nivel" style={{ color: info.color }}>
                            {info.label} · {r.nivel_animo}/10
                          </span>
                          <span className="em-item-date">{formatDate(r.fecha)}</span>
                        </div>
                        {r.comentario && <p className="em-comment">"{r.comentario}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  );
}
