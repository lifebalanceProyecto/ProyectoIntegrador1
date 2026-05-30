import { useState, useEffect, useRef, useCallback } from 'react';
import { KEYS, getItem, setItem, today } from '../services/lb';
import { apiGuardarOObtenerSesion, apiGuardarSeguimiento, apiGuardarRecomendacion } from '../services/api';
import './SessionModal.css';

/* ══════════════════════════════════════════════════════════════
   WEB SPEECH API — voz guiada en español (calmada y armónica)
══════════════════════════════════════════════════════════════ */

let _cachedVoice = null;
function getVozEspanol() {
  if (_cachedVoice) return _cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const PREFERIDAS = [
    'Paulina', 'Monica', 'Mónica', 'Luciana', 'Valeria',
    'Google español', 'Google español de Estados Unidos',
    'Microsoft Sabina', 'Microsoft Helena', 'Microsoft Laura',
  ];
  for (const nombre of PREFERIDAS) {
    const v = voices.find(v => v.name.includes(nombre));
    if (v) { _cachedVoice = v; return v; }
  }
  const fallback = voices.find(v => v.lang.startsWith('es')) || null;
  _cachedVoice = fallback;
  return fallback;
}

function speak(text, rate = 0.72) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utt    = new SpeechSynthesisUtterance(text);
  utt.lang     = 'es-MX';
  utt.rate     = rate;
  utt.pitch    = 0.88;
  utt.volume   = 0.92;

  const asignarVoz = () => {
    const voz = getVozEspanol();
    if (voz) utt.voice = voz;
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', asignarVoz, { once: true });
  } else {
    asignarVoz();
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

const SCRIPTS = {
  'Respiración': {
    start:  'Bienvenido a este momento. Encuentra una postura cómoda y permite que tus ojos se cierren suavemente.',
    inhala: 'Inhala con calma por la nariz... uno... dos... tres... cuatro. Siente cómo el aire llena tu vientre.',
    reten:  'Retén el aire con suavidad... uno... dos... tres... cuatro... cinco... seis... siete.',
    exhala: 'Exhala lentamente por la boca... soltando todo... uno... dos... tres... cuatro... cinco... seis... siete... ocho.',
    mitad:  'Lo estás haciendo muy bien. Sigue a tu propio ritmo. Cada respiración te calma un poco más.',
    done:   'Has completado la sesión. Respira con normalidad y lleva esta calma contigo.',
  },
  'Meditación': {
    start:  'Bienvenido a tu espacio de meditación. Cierra los ojos. Relaja los hombros y suelta cualquier tensión.',
    inhala: 'Respira profundo y con suavidad... siente el aire entrar... dejando entrar la paz.',
    reten:  'Sostén este instante... deja ir cualquier pensamiento... no hay nada que hacer... solo estar.',
    exhala: 'Exhala lentamente... suelta todo lo que no necesitas... estás en completa calma.',
    mitad:  'Vas muy bien. Cada ciclo te lleva más adentro de ti. Permanece presente.',
    done:   'Meditación completada. Abre los ojos suavemente. Llevas esa paz adentro.',
  },
  'Mindfulness': {
    start:  'Comenzamos el escaneo corporal. Lleva tu atención, con ternura, a la coronilla de la cabeza.',
    inhala: 'Inhala y siente la energía recorriendo tu cuerpo de arriba hacia abajo... despacio.',
    reten:  'Observa: cuello... hombros... espalda... abdomen... sin juicio... solo conciencia.',
    exhala: 'Exhala y suelta la tensión de esa zona. Sigue bajando, con curiosidad y calma.',
    mitad:  'Ya vas por la mitad. Tu atención es un regalo que le das a tu cuerpo.',
    done:   'Escaneo completado. Cuerpo y mente en armonía. Bien hecho.',
  },
  'Estiramiento': {
    start:  'Comenzamos los estiramientos. Mueve el cuello muy despacio, con gentileza.',
    inhala: 'Inhala profundo y siente cómo el cuerpo se alarga, se abre con cada respiración.',
    reten:  'Mantén la postura con suavidad. Siente el músculo recibir ese espacio.',
    exhala: 'Exhala y profundiza un poco más, sin forzar. Tu cuerpo sabe hasta dónde ir.',
    mitad:  'Muy bien. Tómate un momento para hidratarte si lo necesitas. Sigue con calma.',
    done:   'Estiramientos completados. Tu cuerpo agradece este cuidado.',
  },
  'Movimiento': {
    start:  'Caminata consciente. Camina despacio, como si cada paso fuera una caricia al suelo.',
    inhala: 'Inhala y nota el peso de tu cuerpo... la sensación de cada pie tocando la tierra.',
    reten:  'Observa tu entorno sin apresurarte. Solo percibe colores, texturas, sonidos.',
    exhala: 'Exhala y suelta el ruido mental. Solo este paso, este momento, este instante.',
    mitad:  'Llevas la mitad. Cada paso es intencional. Estás aquí, completamente.',
    done:   'Caminata completada. Movimiento con plena conciencia. Hermoso.',
  },
  'Relajación': {
    start:  'Relajación muscular progresiva. Acuéstate cómodamente. Empezamos por los pies.',
    inhala: 'Inhala suavemente y tensa ese grupo muscular con delicadeza.',
    reten:  'Mantén esa tensión un momento... siente la diferencia entre tensión y calma.',
    exhala: 'Exhala y suelta completamente. Siente el alivio, el peso, la relajación profunda.',
    mitad:  'Tu cuerpo libera tensiones que cargaba sin saber. Sigue con la misma ternura.',
    done:   'Relajación completada. Tu cuerpo y tu mente están en descanso profundo.',
  },
  default: {
    start:  'Comenzamos la sesión. Encuentra una posición cómoda y cierra los ojos suavemente.',
    inhala: 'Inhala profundo.',
    reten:  'Retén la respiración.',
    exhala: 'Exhala lentamente.',
    mitad:  'Muy bien. Sigue así.',
    done:   'Sesión completada. Excelente.',
  },
};

function getScript(tipo) { return SCRIPTS[tipo] || SCRIPTS.default; }

/* ══════════════════════════════════════════════════════════════
   SessionModal
══════════════════════════════════════════════════════════════ */
export default function SessionModal({ session, userId, onClose, onComplete }) {
  const [running, setRunning]           = useState(false);
  const [timeLeft, setTimeLeft]         = useState(session ? session.minutos * 60 : 0);
  const [breathPhase, setBreathPhase]   = useState('Respira');
  const [breathExpand, setBreathExpand] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [midSpoken, setMidSpoken]       = useState(false);

  const timerRef  = useRef(null);
  const breathRef = useRef(null);

  function stopTimer() {
    clearInterval(timerRef.current);
    clearTimeout(breathRef.current);
    setRunning(false);
    setBreathPhase('Respira');
    setBreathExpand(false);
  }

  function stopAll() {
    stopTimer();
    stopSpeech();
  }

  const handleComplete = useCallback(async () => {
    if (saving) return;

    stopTimer();
    setSaving(true);

    const fechaHoy = today();

    const segLocal = getItem(KEYS.seguimiento);
    segLocal.push({
      id:         Date.now(),
      usuario_id: userId,
      sesion_id:  session.id,
      completado: true,
      fecha:      fechaHoy,
    });
    setItem(KEYS.seguimiento, segLocal);

    try {
      // ✅ CORREGIDO: Enviar usuarioId DIRECTAMENTE en el body
      console.log('📤 POST /api/sesiones con usuarioId:', userId);
      const body = {
        nombre:          session.nombre,
        tipo:            session.tipo,
        duracion:        session.minutos,
        usuarioId:       userId,  // ✅ Nuevo: enviar directamente el usuario_id
      };
      console.log('📦 Body enviado:', body);
      
      const sesionBD = await apiGuardarOObtenerSesion(body);
      console.log('✅ Sesión guardada en BD:', sesionBD.id, 'usuarioId:', sesionBD.usuarioId);

      await apiGuardarSeguimiento({
        completado: true,
        fecha:      fechaHoy,
        usuario:    { id: userId },
        sesion:     { id: sesionBD.id },
      });
      console.log('✅ Seguimiento guardado');

      await apiGuardarRecomendacion({
        motivo:  `Sesión "${session.nombre}" completada el ${fechaHoy}`,
        fecha:   new Date().toISOString().slice(0, 19),
        usuario: { id: userId },
        sesion:  { id: sesionBD.id },
      });
      console.log('✅ Recomendación guardada');
    } catch (err) {
      console.warn('⚠️ Solo guardado en localStorage:', err.message);
    }

    setSaving(false);
    
    if (voiceEnabled) {
      setTimeout(() => speak(getScript(session.tipo).done, 0.72), 500);
    }
    
    onComplete?.(`🎉 ¡${session.nombre} completada!`);
    setTimeout(onClose, 2000);
  }, [session, userId, onComplete, onClose, saving, voiceEnabled]);

  useEffect(() => {
    if (!session) return;
    stopAll();
    setTimeLeft(session.minutos * 60);
    setSaving(false);
    setMidSpoken(false);
  }, [session]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return; }

    if (voiceEnabled) setTimeout(() => speak(getScript(session.tipo).start), 300);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const total = session.minutos * 60;

        if (!midSpoken && t <= Math.floor(total / 2) + 1 && t >= Math.floor(total / 2) - 1) {
          if (voiceEnabled) setTimeout(() => speak(getScript(session.tipo).mitad), 200);
          setMidSpoken(true);
        }

        if (t <= 1) {
          clearInterval(timerRef.current);
          handleComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running]);

  const runBreath = useCallback(() => {
    const s = getScript(session.tipo);
    setBreathPhase('Inhala'); setBreathExpand(true);
    if (voiceEnabled) speak(s.inhala, 0.75);

    breathRef.current = setTimeout(() => {
      setBreathPhase('Retén');
      if (voiceEnabled) speak(s.reten, 0.80);

      breathRef.current = setTimeout(() => {
        setBreathPhase('Exhala'); setBreathExpand(false);
        if (voiceEnabled) speak(s.exhala, 0.72);

        breathRef.current = setTimeout(runBreath, 8000);
      }, 7000);
    }, 4000);
  }, [session, voiceEnabled]);

  useEffect(() => {
    if (running) {
      setTimeout(runBreath, 3500);
    } else {
      clearTimeout(breathRef.current);
      setBreathPhase('Respira');
      setBreathExpand(false);
    }
    return () => clearTimeout(breathRef.current);
  }, [running, runBreath]);

  if (!session) return null;

  const totalSecs = session.minutos * 60;
  const progress  = ((totalSecs - timeLeft) / totalSecs) * 100;
  const mins      = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs      = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="session-modal fadein">

        <div className="sm-header">
          <div className="sm-meta">
            <span className="sm-type">{session.tipo}</span>
            <span className="sm-dot">·</span>
            <span className="sm-dur">{session.minutos} min</span>
            <span className="sm-dot">·</span>
            <span className="sm-nivel">{session.nivel}</span>
          </div>
          <div className="sm-header-right">
            <button
              className={'sm-voice-btn' + (voiceEnabled ? ' active' : '')}
              onClick={() => { stopSpeech(); setVoiceEnabled(v => !v); }}
              title={voiceEnabled ? 'Silenciar' : 'Activar voz'}
            >
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button className="sm-close" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        </div>

        <div className={'breath-wrapper' + (breathExpand ? ' expanded' : '')}>
          <div className="breath-outer" />
          <div className="breath-circle">
            <span className="breath-emoji">{session.emoji}</span>
            <span className="breath-label">{breathPhase}</span>
          </div>
        </div>

        <h2 className="sm-title serif">{session.nombre}</h2>
        <div className="sm-timer serif">{mins}:{secs}</div>

        <div className="sm-progress-track">
          <div className="sm-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="sm-controls">
          <button
            className="sm-btn sm-btn-secondary"
            title="Reiniciar"
            onClick={() => {
              stopAll();
              setTimeLeft(session.minutos * 60);
              setMidSpoken(false);
            }}
          >↺</button>

          <button
            className="sm-btn sm-btn-primary"
            onClick={() => setRunning(r => !r)}
          >
            {running ? '⏸' : '▶'}
          </button>

          <button
            className="sm-btn sm-btn-secondary"
            title="Marcar como completada"
            onClick={handleComplete}
            disabled={saving}
          >
            {saving ? '…' : '✓'}
          </button>
        </div>

        <div className="sm-benefits">
          {session.beneficios.map(b => (
            <span key={b} className="sm-benefit">{b}</span>
          ))}
        </div>

      </div>
    </div>
  );
}