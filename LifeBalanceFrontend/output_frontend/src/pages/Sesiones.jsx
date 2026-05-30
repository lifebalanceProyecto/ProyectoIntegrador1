import { useState } from 'react';
import { useAuthContext } from '../components/AuthContext';
import SessionModal from '../components/SessionModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { SESIONES, KEYS, getItem } from '../services/lb';
import './Sesiones.css';

const TIPOS = ['Todas', 'Respiración', 'Meditación', 'Estiramiento', 'Mindfulness', 'Movimiento', 'Relajación'];

export default function Sesiones() {
  const { user } = useAuthContext();
  const { toast, showToast } = useToast();
  const [filtro, setFiltro] = useState('Todas');
  const [activeSession, setActiveSession] = useState(null);

  const seguimiento = getItem(KEYS.seguimiento).filter(
    s => s.usuario_id === user?.id && s.completado
  );
  const doneSet = new Set(seguimiento.map(s => s.sesion_id));

  const filtered = filtro === 'Todas'
    ? SESIONES
    : SESIONES.filter(s => s.tipo === filtro);

  const stats = {
    total: seguimiento.length,
    mins: seguimiento.reduce((a, s) => {
      const ses = SESIONES.find(x => x.id === s.sesion_id);
      return a + (ses ? ses.minutos : 5);
    }, 0),
    favorita: (() => {
      const counts = {};
      seguimiento.forEach(s => { counts[s.sesion_id] = (counts[s.sesion_id] || 0) + 1; });
      const favId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      return SESIONES.find(s => s.id === parseInt(favId))?.emoji ?? '—';
    })(),
  };

  return (
    <div className="sesiones-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title serif">Sesiones</h1>
          <p className="page-sub">Encuentra tu práctica perfecta</p>
        </div>
      </div>

      {/* Stats */}
      <div className="ses-stats">
        <div className="card ses-stat">
          <div className="ses-stat-val serif">{stats.total}</div>
          <div className="ses-stat-lbl">Completadas</div>
        </div>
        <div className="card ses-stat">
          <div className="ses-stat-val serif">{stats.mins}</div>
          <div className="ses-stat-lbl">Minutos totales</div>
        </div>
        <div className="card ses-stat">
          <div className="ses-stat-val">{stats.favorita}</div>
          <div className="ses-stat-lbl">Favorita</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        {TIPOS.map(t => (
          <button
            key={t}
            className={`filter-chip ${filtro === t ? 'active' : ''}`}
            onClick={() => setFiltro(t)}
          >
            {t}
          </button>
        ))}
        <span className="filter-count">{filtered.length} sesión{filtered.length !== 1 ? 'es' : ''}</span>
      </div>

      {/* Grid */}
      <div className="ses-grid">
        {filtered.map((s, i) => {
          const done = doneSet.has(s.id);
          return (
            <div
              key={s.id}
              className="ses-card card fadein"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="ses-card-top">
                <div className="ses-emoji">{s.emoji}</div>
                <div className="ses-badges">
                  <span className="badge badge-tipo">{s.tipo}</span>
                  <span className="badge badge-nivel">{s.nivel}</span>
                  {done && <span className="badge badge-done">✓ Hecho</span>}
                </div>
              </div>
              <h3 className="ses-name">{s.nombre}</h3>
              <p className="ses-desc">{s.desc}</p>
              <div className="ses-benefits">
                {s.beneficios.map(b => (
                  <span key={b} className="ses-benefit">{b}</span>
                ))}
              </div>
              <div className="ses-footer">
                <span className="ses-dur">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {s.minutos} min
                </span>
                <button
                  className={`btn ses-play-btn ${done ? 'done' : ''}`}
                  onClick={() => setActiveSession(s)}
                >
                  {done ? '↺ Repetir' : '▶ Iniciar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeSession && (
        <SessionModal
          session={activeSession}
          userId={user?.id}
          onClose={() => setActiveSession(null)}
          onComplete={msg => showToast(msg, 'success')}
        />
      )}

      <Toast {...toast} />
    </div>
  );
}
