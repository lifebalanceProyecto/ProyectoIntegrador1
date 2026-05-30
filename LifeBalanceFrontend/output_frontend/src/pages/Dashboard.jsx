import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthContext';
import SessionModal from '../components/SessionModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import {
  KEYS, SESIONES, HABITOS_DEFAULT,
  getItem, setItem,
  today, greeting,
  moodInfo, getLast7Days,
} from '../services/lb';
import { apiGetRecomendaciones } from '../services/api';
import './Dashboard.css';

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/* ═══════════════════════════════════════════════════════════
   Sub-componentes — reciben datos por props
═══════════════════════════════════════════════════════════ */

function StatCard({ iconSvg, value, label, sublabel, accentColor }) {
  return (
    <div className="stat-card card">
      <div className="sc-icon" style={{ background: accentColor + '18', color: accentColor }}>
        {iconSvg}
      </div>
      <div className="sc-value serif">{value}</div>
      <div className="sc-label">{label}</div>
      {sublabel && <div className="sc-sublabel">{sublabel}</div>}
    </div>
  );
}

function SessionRow({ session, index, onPlay }) {
  const BG = ['var(--sage-dim)', 'var(--violet-dim)', 'var(--sky-dim)', 'var(--orange-dim)'];
  return (
    <div className="session-row" onClick={() => onPlay(session)}>
      <div className="sr-thumb" style={{ background: BG[index % 4] }}>
        {session.emoji}
      </div>
      <div className="sr-info">
        <div className="sr-name">{session.nombre}</div>
        <div className="sr-meta">{session.tipo} · {session.nivel}</div>
      </div>
      <span className="sr-dur">{session.minutos} min</span>
      <button
        className="sr-play"
        onClick={e => { e.stopPropagation(); onPlay(session); }}
        aria-label="Iniciar sesión"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>
    </div>
  );
}

function MoodBars({ data }) {
  return (
    <div className="mood-bars">
      {data.map(({ day, avg, isToday }) => {
        const h = avg ? (avg / 10) * 68 + 12 : 4;
        return (
          <div key={day} className="mb-col">
            <div
              className={'mb-bar' + (isToday ? ' today' : '') + (!avg ? ' empty' : '')}
              style={{ height: h + 'px' }}
              title={avg ? `${day}: ${avg.toFixed(1)}/10` : `${day}: sin registro`}
            />
            <span className="mb-day">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

function WeekRing({ done, total }) {
  const r      = 36;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(done, total)) / total;
  const pct    = Math.round((done / total) * 100);
  return (
    <div className="week-ring-row">
      <div className="wr-ring">
        <svg viewBox="0 0 90 90" width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="var(--s3)" strokeWidth="8" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke="var(--sage)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="wr-center">
          <div className="wr-val serif">{done}/{total}</div>
          <div className="wr-sub">días con sesión</div>
        </div>
      </div>
      <div className="wr-pct">{pct}%</div>
    </div>
  );
}

function RecCard({ emoji, titulo, desc, bg }) {
  return (
    <div className="rec-card" style={{ background: bg }}>
      <span className="rc-emoji">{emoji}</span>
      <div>
        <div className="rc-titulo">{titulo}</div>
        <div className="rc-desc">{desc}</div>
      </div>
    </div>
  );
}

function HabitRow({ emoji, nombre, done, onToggle }) {
  return (
    <div className={'habit-row' + (done ? ' done' : '')}>
      <span className="habit-emoji">{emoji}</span>
      <span className="habit-name">{nombre}</span>
      <button
        className={'habit-check' + (done ? ' done' : '')}
        onClick={onToggle}
        aria-label={done ? 'Desmarcar' : 'Marcar como hecho'}
      >
        {done && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>
    </div>
  );
}

function ExploreCard({ emoji, titulo, desc, color, onClick }) {
  return (
    <div className="explore-card" onClick={onClick} style={{ borderTopColor: color }}>
      <span className="ec-emoji">{emoji}</span>
      <div className="ec-titulo">{titulo}</div>
      <div className="ec-desc">{desc}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Dashboard — página principal
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user }             = useAuthContext();
  const { toast, showToast } = useToast();
  const navigate             = useNavigate();

  // ── Estado ──────────────────────────────────────────────
  const [selectedMood, setSelectedMood]     = useState(null);
  const [stats, setStats]                   = useState({ sesiones: 0, mins: 0, racha: 0, animo: null, diasConSesion: 0 });
  const [chartData, setChartData]           = useState([]);
  const [habits, setHabits]                 = useState([]);
  const [sessions, setSessions]             = useState([]);
  const [pausas, setPausas]                 = useState([]);
  const [recs, setRecs]                     = useState([]);   // ← declarado correctamente
  const [activeSession, setActiveSession]   = useState(null);

  // ── Carga principal ──────────────────────────────────────
  const load = useCallback(() => {
    if (!user) return;
    const registros = getItem(KEYS.emocional);
    calcStats(registros);
    calcChart(registros);
    loadHabits();
    loadSessions();
    loadPausas();
    calcRecsLocales(registros);   // recomendaciones por defecto desde local
    loadRecsDesdeAPI();           // sobrescribe con las de MySQL si las hay
    const hoy = registros.filter(
      r => String(r.usuario_id) === String(user.id) && r.fecha === today()
    );
    if (hoy.length) setSelectedMood(hoy[hoy.length - 1].nivel_animo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── Estadísticas ─────────────────────────────────────────
  function calcStats(registros) {
    const seg = getItem(KEYS.seguimiento).filter(
      s => String(s.usuario_id) === String(user.id) && s.completado
    );

    const fechas = [...new Set(seg.map(s => s.fecha))].sort().reverse();
    let racha = 0;
    let d = new Date();
    for (let i = 0; i < 60; i++) {
      const ds = d.toISOString().split('T')[0];
      if (fechas.includes(ds)) { racha++; d.setDate(d.getDate() - 1); } else break;
    }

    const lun = new Date();
    lun.setDate(lun.getDate() - ((lun.getDay() + 6) % 7));
    lun.setHours(0, 0, 0, 0);
    const semana = seg.filter(s => new Date(s.fecha + 'T12:00') >= lun);

    const mins = seg.reduce((a, s) => {
      const ses = SESIONES.find(x => x.id === s.sesion_id);
      return a + (ses ? ses.minutos : 5);
    }, 0);

    const last7 = getLast7Days();
    const emS   = registros.filter(
      r => String(r.usuario_id) === String(user.id) && last7.includes(r.fecha)
    );
    const animo = emS.length
      ? (emS.reduce((a, e) => a + e.nivel_animo, 0) / emS.length).toFixed(1)
      : null;

    const diasConSesion = new Set(
      seg.filter(s => last7.includes(s.fecha)).map(s => s.fecha)
    ).size;

    setStats({ sesiones: semana.length, mins, racha, animo, diasConSesion });
  }

  // ── Gráfica ──────────────────────────────────────────────
  function calcChart(registros) {
    const last7    = getLast7Days();
    const todayStr = today();
    setChartData(last7.map(date => {
      const ents = registros.filter(
        r => String(r.usuario_id) === String(user.id) && r.fecha === date
      );
      const avg = ents.length
        ? ents.reduce((a, e) => a + e.nivel_animo, 0) / ents.length
        : 0;
      const day = DIAS_SEMANA[(new Date(date + 'T12:00').getDay() + 6) % 7];
      return { date, avg, day, isToday: date === todayStr };
    }));
  }

  // ── Hábitos ──────────────────────────────────────────────
  function loadHabits() {
    const key   = `${KEYS.habitos}_${user.id}_${today()}`;
    const saved = getItem(key);
    setHabits(HABITOS_DEFAULT.map((h, i) => ({ ...h, done: saved[i]?.done || false })));
  }

  function toggleHabit(idx) {
    const key     = `${KEYS.habitos}_${user.id}_${today()}`;
    const newList = habits.map((h, i) => (i === idx ? { ...h, done: !h.done } : h));
    setHabits(newList);
    setItem(key, newList.map(h => ({ done: h.done })));
    if (newList[idx].done) showToast(`✓ ${HABITOS_DEFAULT[idx].nombre}`, 'success');
  }

  // ── Sesiones recomendadas ─────────────────────────────────
  function loadSessions() {
    const h     = new Date().getHours();
    const order = h < 10 ? [1,0,5,6] : h < 14 ? [0,4,2,1] : h < 18 ? [2,4,0,3] : [3,1,6,0];
    setSessions(order.map(i => SESIONES[i]));
  }

  // ── Pausas ────────────────────────────────────────────────
  function loadPausas() {
    const now    = new Date();
    const nowStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const all    = getItem(KEYS.pausas).filter(
      p => String(p.usuario_id) === String(user.id) && p.activa
    );
    setPausas(
      all.sort((a, b) => a.hora.localeCompare(b.hora))
         .filter(p => p.hora >= nowStr)
         .slice(0, 3)
    );
  }

  // ── Recomendaciones locales (predeterminadas) ─────────────
  function calcRecsLocales(registros) {
    const myReg = registros
      .filter(r => String(r.usuario_id) === String(user.id))
      .sort((a, b) => b.id - a.id);
    const nivel = myReg[0]?.nivel_animo ?? 5;

    const todos = [
      { emoji: '🌬️', titulo: 'Respira antes de responder', desc: '3 respiraciones profundas antes de cada tarea nueva.',     bg: 'var(--sage-dim)'   },
      { emoji: '🧘',  titulo: 'Pausa de 5 minutos',          desc: 'Cierra los ojos, descansa la vista del monitor.',          bg: 'var(--violet-dim)' },
      { emoji: '💧',  titulo: 'Hidratación consciente',       desc: 'Bebe un vaso de agua ahora. Tu cuerpo lo necesita.',       bg: 'var(--sky-dim)'    },
      { emoji: '💆',  titulo: 'Estira el cuello',             desc: 'Suaves rotaciones para liberar tensión cervical.',         bg: 'var(--orange-dim)' },
      { emoji: '✨',  titulo: 'Visualiza tu meta del día',    desc: '1 minuto para recordar qué quieres lograr hoy.',           bg: 'var(--amber-dim)'  },
    ];

    const start = nivel <= 4 ? 3 : nivel <= 6 ? 0 : 1;
    setRecs([todos[start % 5], todos[(start + 1) % 5], todos[(start + 2) % 5]]);
  }

  // ── Recomendaciones desde MySQL ───────────────────────────
  async function loadRecsDesdeAPI() {
    if (!user) return;
    try {
      const data = await apiGetRecomendaciones(user.id);
      if (data && data.length > 0) {
        const COLORES = ['var(--sage-dim)', 'var(--sky-dim)', 'var(--amber-dim)', 'var(--violet-dim)'];
        const EMOJIS  = ['🌿', '✨', '💆', '🧘', '🌬️', '🚶'];
        const ultimas = data.slice(-3).reverse();
        setRecs(ultimas.map((r, i) => ({
          emoji:  EMOJIS[i % EMOJIS.length],
          titulo: r.sesion?.nombre ? `Completaste: ${r.sesion.nombre}` : 'Sesión completada',
          desc:   r.motivo || 'Sigue así, cada sesión cuenta.',
          bg:     COLORES[i % COLORES.length],
        })));
      }
    } catch (err) {
      // Si la API falla, mantiene las recomendaciones locales
      console.warn('Usando recomendaciones locales:', err.message);
    }
  }

  // ── Registrar mood ────────────────────────────────────────
  function handleMood(nivel) {
    setSelectedMood(nivel);
    const registros = getItem(KEYS.emocional);
    registros.push({
      id:          Date.now(),
      usuario_id:  user.id,
      nivel_animo: nivel,
      comentario:  '',
      fecha:       today(),
    });
    setItem(KEYS.emocional, registros);
    calcStats(registros);
    calcChart(registros);
    showToast('Estado emocional registrado 🌿', 'success');
  }

  // ── Constantes ────────────────────────────────────────────
  const MOOD_OPTS = [
    { nivel: 2,  emoji: '😣', label: 'Muy mal'   },
    { nivel: 4,  emoji: '😐', label: 'Regular'   },
    { nivel: 6,  emoji: '🙂', label: 'Bien'      },
    { nivel: 8,  emoji: '😊', label: 'Muy bien'  },
    { nivel: 10, emoji: '🤩', label: 'Excelente' },
  ];

  const EXPLORE = [
    { emoji: '🧘', titulo: 'Meditación guiada',  desc: 'Sesiones de mindfulness para cualquier momento.',    color: 'var(--sage)',   to: '/sesiones'  },
    { emoji: '📊', titulo: 'Registro emocional',  desc: 'Monitorea tu estado y detecta patrones.',            color: 'var(--sky)',    to: '/emocional' },
    { emoji: '🌿', titulo: 'Hábitos saludables',  desc: 'Construye rutinas que mejoran tu bienestar.',        color: 'var(--teal)',   to: '/historial' },
    { emoji: '⏰', titulo: 'Pausas activas',       desc: 'Programa recordatorios para moverte y respirar.',    color: 'var(--amber)',  to: '/pausas'    },
  ];

  const moodActual = selectedMood ? moodInfo(selectedMood) : null;
  const habitsDone = habits.filter(h => h.done).length;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="dashboard">

      {/* ENCABEZADO */}
      <header className="dash-header">
        <div>
          <h1 className="dash-greeting serif">{greeting(user?.nombre ?? '')}</h1>
          <p className="dash-date">
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="dash-header-actions">
          <button className="dash-icon-btn" title="Mi progreso" onClick={() => navigate('/historial')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button className="dash-icon-btn" title="Mi perfil" onClick={() => navigate('/perfil')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* CHECK-IN EMOCIONAL */}
      <section className="checkin-card card">
        <div className="ci-top">
          <div>
            <span className="ci-tag">Check-in emocional</span>
            <h2 className="ci-question serif">¿Cómo te sientes en este momento?</h2>
          </div>
          {stats.racha > 0 && (
            <div className="ci-streak">
              <span className="cis-fire">🔥</span>
              <div className="cis-num serif">{stats.racha}</div>
              <div className="cis-lbl">días seguidos</div>
            </div>
          )}
        </div>

        <div className="ci-moods">
          {MOOD_OPTS.map(({ nivel, emoji, label }) => (
            <button
              key={nivel}
              className={'ci-mood-btn' + (selectedMood === nivel ? ' active' : '')}
              onClick={() => handleMood(nivel)}
            >
              <span className="cmb-emoji">{emoji}</span>
              <span className="cmb-label">{label}</span>
            </button>
          ))}
        </div>

        {moodActual && (
          <p className="ci-feedback" style={{ color: moodActual.color }}>
            {moodActual.emoji} {moodActual.label} · nivel {selectedMood}/10 · Registrado hoy
          </p>
        )}

        <button className="ci-link" onClick={() => navigate('/emocional')}>
          Ver historial emocional completo →
        </button>
      </section>

      {/* STATS 4 COLUMNAS */}
      <div className="stats-row">
        <StatCard
          iconSvg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          value={stats.sesiones}
          label="Sesiones esta semana"
          sublabel={stats.sesiones > 0 ? '↑ Completadas' : '+ Empieza hoy'}
          accentColor="var(--sage)"
        />
        <StatCard
          iconSvg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          value={stats.mins}
          label="Minutos de bienestar"
          sublabel="Meta: 30 min/día"
          accentColor="var(--amber)"
        />
        <StatCard
          iconSvg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 3 3 21 21 21" /><polyline points="3 15 9 9 13 13 18 8 21 11" /></svg>}
          value={stats.animo ?? '—'}
          label="Ánimo promedio (7 días)"
          sublabel="Registra tu estado"
          accentColor="var(--sky)"
        />
        <StatCard
          iconSvg={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>}
          value={stats.racha}
          label="Racha de días"
          sublabel={stats.racha > 0 ? '¡Mantén el ritmo!' : 'Empieza hoy'}
          accentColor="var(--rose)"
        />
      </div>

      {/* GRID 2 COLS: sesiones | ánimo + progreso */}
      <div className="grid-two">

        {/* Sesiones recomendadas */}
        <div className="card">
          <div className="card-row-title">
            <h3 className="section-title">Sesiones recomendadas</h3>
            <button className="lnk" onClick={() => navigate('/sesiones')}>Ver todas →</button>
          </div>
          <div className="sessions-list">
            {sessions.map((s, i) => (
              <SessionRow key={s.id} session={s} index={i} onPlay={setActiveSession} />
            ))}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="right-col">
          <div className="card">
            <div className="card-row-title">
              <h3 className="section-title">Estado emocional</h3>
              <span className="sub-lbl">Últimos 7 días</span>
            </div>
            <MoodBars data={chartData} />
          </div>

          <div className="card">
            <div className="card-row-title">
              <h3 className="section-title">Progreso semanal</h3>
              <span className="sub-lbl">{Math.round((stats.diasConSesion / 7) * 100)}%</span>
            </div>
            <WeekRing done={stats.diasConSesion} total={7} />
          </div>
        </div>
      </div>

      {/* GRID 3 COLS: pausas | para ti hoy | hábitos */}
      <div className="grid-three">

        {/* Próximas pausas */}
        <div className="card">
          <div className="card-row-title">
            <h3 className="section-title">Próximas pausas</h3>
            <button className="lnk" onClick={() => navigate('/pausas')}>Editar →</button>
          </div>
          {pausas.length === 0 ? (
            <div className="no-pausas">
              <p>No hay pausas programadas.</p>
              <button className="lnk" onClick={() => navigate('/pausas')}>
                Configura tus pausas →
              </button>
            </div>
          ) : (
            <div className="pausa-list">
              {pausas.map((p, i) => {
                const ses = SESIONES.find(s => s.id === p.sesion_id);
                const DOTS = ['var(--sage)', 'var(--amber)', 'var(--sky)'];
                return (
                  <div key={p.id} className="pausa-item">
                    <span className="pi-hora">{p.hora}</span>
                    <span className="pi-dot" style={{ background: DOTS[i % 3] }} />
                    <div className="pi-info">
                      <div className="pi-name">
                        {ses ? `${ses.emoji} ${ses.nombre}` : 'Pausa activa'}
                      </div>
                      {p.nota && <div className="pi-nota">{p.nota}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Para ti hoy */}
        <div className="card">
          <div className="card-row-title">
            <h3 className="section-title">Para ti hoy</h3>
          </div>
          <div className="recs-list">
            {recs.map((r, i) => (
              <RecCard key={i} emoji={r.emoji} titulo={r.titulo} desc={r.desc} bg={r.bg} />
            ))}
          </div>
        </div>

        {/* Hábitos de hoy */}
        <div className="card">
          <div className="card-row-title">
            <h3 className="section-title">Hábitos de hoy</h3>
            <span className="habits-pct">{habitsDone}/{HABITOS_DEFAULT.length}</span>
          </div>
          <div className="habits-list">
            {habits.map((h, i) => (
              <HabitRow
                key={i}
                emoji={h.emoji}
                nombre={h.nombre}
                done={h.done}
                onToggle={() => toggleHabit(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RECOMENDACIONES PERSONALIZADAS — siempre visible */}
      <section className="card recom-section">
        <div className="card-row-title">
          <h3 className="section-title">Recomendaciones para ti</h3>
          <button className="lnk" onClick={() => navigate('/sesiones')}>Ver sesiones →</button>
        </div>
        <div className="recom-grid">
          {recs.map((r, i) => (
            <div key={i} className="recom-card" style={{ background: r.bg }}>
              <span className="recom-emoji">{r.emoji}</span>
              <div>
                <div className="recom-titulo">{r.titulo}</div>
                <div className="recom-desc">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

{/* GRAFICOS PYTHON */}

{/* GRAFICOS PYTHON */}

<section className="card">
  <div className="card-row-title">
    <h3 className="section-title">Análisis de datos</h3>
  </div>

  <div className="graficos-grid">

    {/* GRAFICA SESIONES */}
    <div className="grafico-item">
      <h4>Distribución sesiones</h4>

      <img
        src="/graficos/torta_sesiones_nombre.png"
        alt="Grafico sesiones"
        className="grafico-img"
      />
    </div>

    {/* GRAFICA USUARIOS */}
    <div className="grafico-item">
      <h4>Usuarios por sexo</h4>

      <img
        src="/graficos/barras_usuarios_id_alto.png"
        alt="Grafico usuarios"
        className="grafico-img"
      />
    </div>

  </div>
</section>

      {/* EXPLORAR */}
      <section className="explore-section">
        <h3 className="section-title" style={{ marginBottom: 14 }}>Explorar</h3>
        <div className="explore-grid">
          {EXPLORE.map(({ emoji, titulo, desc, color, to }) => (
            <ExploreCard
              key={titulo}
              emoji={emoji}
              titulo={titulo}
              desc={desc}
              color={color}
              onClick={() => navigate(to)}
            />
          ))}
        </div>
      </section>

      {/* MODAL DE SESIÓN */}
      {activeSession && (
        <SessionModal
          session={activeSession}
          userId={user.id}
          onClose={() => { setActiveSession(null); load(); }}
          onComplete={msg => { showToast(msg, 'success'); load(); }}
        />
      )}

      <Toast {...toast} />
    </div>
  );
}
