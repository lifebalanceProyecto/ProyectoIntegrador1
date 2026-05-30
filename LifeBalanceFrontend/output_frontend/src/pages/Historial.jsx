import { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthContext';
import {
  KEYS, SESIONES, getItem,
  formatDate, getLast7Days,
} from '../services/lb';
import './Historial.css';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Historial() {
  const { user } = useAuthContext();
  const [seguimiento, setSeguimiento] = useState([]);
  const [chartData, setChartData]     = useState([]);
  const [stats, setStats]             = useState({ total: 0, mins: 0, racha: 0, tipos: {} });

  useEffect(() => {
    if (!user) return;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function load() {
    const seg = getItem(KEYS.seguimiento)
      .filter(s => String(s.usuario_id) === String(user.id) && s.completado)
      .sort((a, b) => b.id - a.id);
    setSeguimiento(seg);

    // Stats
    const mins = seg.reduce((a, s) => {
      const ses = SESIONES.find(x => x.id === s.sesion_id);
      return a + (ses ? ses.minutos : 5);
    }, 0);

    // Racha
    const fechas = [...new Set(seg.map(s => s.fecha))].sort().reverse();
    let racha = 0, d = new Date();
    for (let i = 0; i < 60; i++) {
      const ds = d.toISOString().split('T')[0];
      if (fechas.includes(ds)) { racha++; d.setDate(d.getDate() - 1); } else break;
    }

    // Tipos breakdown
    const tipos = {};
    seg.forEach(s => {
      const ses = SESIONES.find(x => x.id === s.sesion_id);
      if (ses) tipos[ses.tipo] = (tipos[ses.tipo] || 0) + 1;
    });

    setStats({ total: seg.length, mins, racha, tipos });

    // Activity chart (last 7 days)
    const last7 = getLast7Days();
    const today = new Date().toISOString().split('T')[0];
    setChartData(last7.map((date, i) => {
      const count = seg.filter(s => s.fecha === date).length;
      const d2 = new Date(date + 'T12:00');
      return { date, count, day: DIAS[(d2.getDay() + 6) % 7], isToday: date === today };
    }));
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const TYPE_COLORS = {
    'Respiración':  'var(--sky)',
    'Meditación':   'var(--sage)',
    'Estiramiento': 'var(--amber)',
    'Mindfulness':  'var(--rose)',
    'Movimiento':   'var(--sage-lt)',
    'Relajación':   'var(--sky)',
  };

  return (
    <div className="historial-page">
      <div className="page-header">
        <h1 className="page-title serif">Mi progreso</h1>
        <p className="page-sub">Tu camino hacia el bienestar</p>
      </div>

      {/* Stats */}
      <div className="hist-stats">
        {[
          { label: 'Sesiones completadas', value: stats.total, icon: '🧘' },
          { label: 'Minutos de práctica',  value: stats.mins,  icon: '⏱' },
          { label: 'Días de racha',         value: stats.racha, icon: '🔥' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card hist-stat">
            <span className="hist-stat-icon">{icon}</span>
            <div className="hist-stat-val serif">{value}</div>
            <div className="hist-stat-lbl">{label}</div>
          </div>
        ))}
      </div>

      <div className="hist-grid">
        {/* Activity chart */}
        <div className="card">
          <h3 className="section-title">Actividad — últimos 7 días</h3>
          <div className="activity-chart">
            {chartData.map(({ day, count, isToday }) => {
              const h = (count / maxCount) * 80 + (count > 0 ? 10 : 4);
              return (
                <div key={day} className="act-group">
                  <div className="act-count">{count > 0 ? count : ''}</div>
                  <div
                    className={`act-bar ${isToday ? 'today' : ''} ${count === 0 ? 'empty' : ''}`}
                    style={{ height: `${h}px` }}
                    title={`${count} sesión${count !== 1 ? 'es' : ''}`}
                  />
                  <div className="act-day">{day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tipos breakdown */}
        <div className="card">
          <h3 className="section-title">Por tipo de sesión</h3>
          {Object.keys(stats.tipos).length === 0 ? (
            <p className="empty-msg">Aún no hay sesiones completadas.</p>
          ) : (
            <div className="tipos-list">
              {Object.entries(stats.tipos)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, count]) => {
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={tipo} className="tipo-row">
                      <div className="tipo-info">
                        <span className="tipo-name">{tipo}</span>
                        <span className="tipo-count">{count} sesión{count !== 1 ? 'es' : ''}</span>
                      </div>
                      <div className="tipo-bar-track">
                        <div
                          className="tipo-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: TYPE_COLORS[tipo] || 'var(--sage)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Session list */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 14 }}>
          Historial de sesiones
          <span className="hist-total-badge">{stats.total} completadas</span>
        </h3>
        {seguimiento.length === 0 ? (
          <p className="empty-msg">Aún no has completado ninguna sesión.<br />
            <a href="/sesiones" className="card-link">Explorar sesiones →</a>
          </p>
        ) : (
          <div className="seg-list">
            {seguimiento.slice(0, 20).map(s => {
              const ses = SESIONES.find(x => x.id === s.sesion_id);
              if (!ses) return null;
              return (
                <div key={s.id} className="seg-item">
                  <div className="seg-emoji">{ses.emoji}</div>
                  <div className="seg-info">
                    <div className="seg-name">{ses.nombre}</div>
                    <div className="seg-meta">{ses.tipo} · {ses.minutos} min</div>
                  </div>
                  <div className="seg-right">
                    <span className="seg-done">✓</span>
                    <span className="seg-date">{formatDate(s.fecha)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
