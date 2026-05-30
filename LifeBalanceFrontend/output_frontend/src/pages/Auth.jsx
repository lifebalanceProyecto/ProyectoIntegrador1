import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import './Auth.css';

function getStrength(p) {
  let s = 0;
  if (p.length >= 8)           s++;
  if (/[A-Z]/.test(p))         s++;
  if (/[0-9]/.test(p))         s++;
  if (/[^A-Za-z0-9]/.test(p))  s++;
  return s;
}

const STR_LABELS = ['', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
const STR_COLORS = ['', '#e03535', '#d97706', '#1e8a4a', '#25a85a'];

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'PPT', label: 'Permiso de Permanencia Temporal' },
];

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const { user, login, register } = useAuthContext();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // ── Login ──
  const [lf, setLf]     = useState({ correo: '', contraseña: '' });
  const [le, setLe]     = useState({});
  const [ll, setLl]     = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lf.correo)) errs.correo = 'Correo inválido';
    if (!lf.contraseña) errs.contraseña = 'Ingresa tu contraseña';
    if (Object.keys(errs).length) { setLe(errs); return; }
    setLl(true);
    try {
      await login({ correo: lf.correo, contraseña: lf.contraseña });
      showToast('¡Bienvenid@ de vuelta! 🌿', 'success');
      setTimeout(() => navigate('/dashboard', { replace: true }), 500);
    } catch (err) {
      const msg = err.message.includes('fetch')
        ? 'No se pudo conectar al servidor. ¿Está corriendo el backend?'
        : err.message;
      setLe({ contraseña: msg });
      showToast(msg, 'error');
    } finally { setLl(false); }
  }

  // ── Register ──
  const [rf, setRf] = useState({
    cedula: '',
    tipo_documento: 'CC',
    nombre: '',
    telefono: '',
    correo: '',
    contraseña: '',
    confirmar: '',
    fecha_nacimiento: '',
    sexo: '',
  });
  const [re, setRe] = useState({});
  const [rl, setRl] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const strength = getStrength(rf.contraseña);

  async function handleRegister(e) {
    e.preventDefault();
    const errs = {};

    // Validar cédula (5-10 dígitos)
    if (!rf.cedula || rf.cedula.trim().length === 0) {
      errs.cedula = 'El número de documento es obligatorio';
    } else if (!/^\d{5,10}$/.test(rf.cedula.trim())) {
      errs.cedula = 'El documento debe tener entre 5 y 10 dígitos';
    }

    // Validar tipo de documento
    if (!rf.tipo_documento) {
      errs.tipo_documento = 'Selecciona un tipo de documento';
    }

    // Validar nombre
    if (!rf.nombre || rf.nombre.trim().length < 2) {
      errs.nombre = 'Mínimo 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(rf.nombre.trim())) {
      errs.nombre = 'El nombre solo puede contener letras';
    }

    // Validar teléfono (7-15 dígitos)
    if (!rf.telefono || rf.telefono.trim().length === 0) {
      errs.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{7,15}$/.test(rf.telefono.trim())) {
      errs.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
    }

    // Validar fecha de nacimiento
    if (!rf.fecha_nacimiento) {
      errs.fecha_nacimiento = 'Requerido';
    }

    // Validar sexo
    if (!rf.sexo) {
      errs.sexo = 'Elige una opción';
    }

    // Validar correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rf.correo)) {
      errs.correo = 'Correo inválido';
    }

    // Validar contraseña
    if (rf.contraseña.length < 8) {
      errs.contraseña = 'Mínimo 8 caracteres';
    }

    // Validar confirmación
    if (rf.contraseña !== rf.confirmar) {
      errs.confirmar = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errs).length) { setRe(errs); return; }

    setRl(true);
    try {
      await register({
        id: rf.cedula.trim(),  // ← CÉDULA COMO ID
        tipoDocumento: rf.tipo_documento,  // ← TIPO DE DOCUMENTO
        nombre: rf.nombre.trim(),
        telefono: rf.telefono.trim(),  // ← TELÉFONO (REQUERIDO)
        correo: rf.correo,
        contrasena: rf.contraseña,  // ← camelCase para backend
        fechaNacimiento: rf.fecha_nacimiento,
        sexo: rf.sexo,
      });
      showToast('¡Cuenta creada! 🌿', 'success');
      setTimeout(() => navigate('/dashboard', { replace: true }), 600);
    } catch (err) {
      const msg = err.message.includes('fetch')
        ? 'No se pudo conectar al servidor. ¿Está corriendo el backend?'
        : err.message;
      if (msg.toLowerCase().includes('correo')) setRe({ correo: msg });
      else if (msg.toLowerCase().includes('documento')) setRe({ cedula: msg });
      else if (msg.toLowerCase().includes('teléfono') || msg.toLowerCase().includes('telefono')) setRe({ telefono: msg });
      else setRe({ general: msg });
      showToast(msg, 'error');
    } finally { setRl(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb-1" />
        <div className="auth-bg-orb orb-2" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 3-5 4-5 7a5 5 0 0010 0c0-3-3.5-4-5-7z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4M10 14h4"/>
            </svg>
          </div>
          <h1 className="auth-brand-name serif">LifeBalance</h1>
          <p className="auth-brand-sub">Tu bienestar, en equilibrio</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={'auth-tab' + (tab === 'login' ? ' active' : '')}
              onClick={() => { setTab('login'); setLe({}); }}>Iniciar sesión</button>
            <button className={'auth-tab' + (tab === 'register' ? ' active' : '')}
              onClick={() => { setTab('register'); setRe({}); }}>Registrarse</button>
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form className="auth-form fadein" onSubmit={handleLogin} noValidate>
              <div className="field-group">
                <label className="field-label">Correo electrónico</label>
                <input type="email" className={'input-field' + (le.correo ? ' error' : '')}
                  placeholder="tu@correo.com" value={lf.correo}
                  onChange={e => { setLf(f => ({ ...f, correo: e.target.value })); setLe(x => ({ ...x, correo: '' })); }}
                  autoComplete="email"/>
                {le.correo && <span className="field-error">{le.correo}</span>}
              </div>
              <div className="field-group">
                <label className="field-label">Contraseña</label>
                <input type="password" className={'input-field' + (le.contraseña ? ' error' : '')}
                  placeholder="••••••••" value={lf.contraseña}
                  onChange={e => { setLf(f => ({ ...f, contraseña: e.target.value })); setLe(x => ({ ...x, contraseña: '' })); }}
                  autoComplete="current-password"/>
                {le.contraseña && <span className="field-error">{le.contraseña}</span>}
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={ll}>
                {ll ? <><div className="spinner"/>Verificando…</> : 'Entrar'}
              </button>
              <p className="auth-switch">¿No tienes cuenta?{' '}
                <button type="button" className="link-btn" onClick={() => setTab('register')}>Regístrate</button>
              </p>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <form className="auth-form fadein" onSubmit={handleRegister} noValidate>
              {/* Cédula + Tipo de Documento */}
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Tipo de documento</label>
                  <select className={'input-field' + (re.tipo_documento ? ' error' : '')}
                    value={rf.tipo_documento}
                    onChange={e => { setRf(f => ({ ...f, tipo_documento: e.target.value })); setRe(x => ({ ...x, tipo_documento: '' })); }}>
                    {TIPOS_DOCUMENTO.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {re.tipo_documento && <span className="field-error">{re.tipo_documento}</span>}
                </div>
                <div className="field-group">
                  <label className="field-label">Número de documento</label>
                  <input type="text" className={'input-field' + (re.cedula ? ' error' : '')}
                    placeholder="1234567890" value={rf.cedula}
                    onChange={e => { setRf(f => ({ ...f, cedula: e.target.value })); setRe(x => ({ ...x, cedula: '' })); }}
                    autoComplete="off"/>
                  {re.cedula && <span className="field-error">{re.cedula}</span>}
                </div>
              </div>

              {/* Nombre */}
              <div className="field-group">
                <label className="field-label">Nombre completo</label>
                <input type="text" className={'input-field' + (re.nombre ? ' error' : '')}
                  placeholder="Tu nombre" value={rf.nombre}
                  onChange={e => { setRf(f => ({ ...f, nombre: e.target.value })); setRe(x => ({ ...x, nombre: '' })); }}
                  autoComplete="name"/>
                {re.nombre && <span className="field-error">{re.nombre}</span>}
              </div>

              {/* Teléfono */}
              <div className="field-group">
                <label className="field-label">Teléfono</label>
                <input type="tel" className={'input-field' + (re.telefono ? ' error' : '')}
                  placeholder="3101234567" value={rf.telefono}
                  onChange={e => { setRf(f => ({ ...f, telefono: e.target.value })); setRe(x => ({ ...x, telefono: '' })); }}
                  autoComplete="tel"/>
                {re.telefono && <span className="field-error">{re.telefono}</span>}
              </div>

              {/* Fecha de nacimiento + Sexo */}
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Fecha de nacimiento</label>
                  <input type="date" className={'input-field' + (re.fecha_nacimiento ? ' error' : '')}
                    value={rf.fecha_nacimiento}
                    onChange={e => { setRf(f => ({ ...f, fecha_nacimiento: e.target.value })); setRe(x => ({ ...x, fecha_nacimiento: '' })); }}/>
                  {re.fecha_nacimiento && <span className="field-error">{re.fecha_nacimiento}</span>}
                </div>
                <div className="field-group">
                  <label className="field-label">Género</label>
                  <select className={'input-field' + (re.sexo ? ' error' : '')} value={rf.sexo}
                    onChange={e => { setRf(f => ({ ...f, sexo: e.target.value })); setRe(x => ({ ...x, sexo: '' })); }}>
                    <option value="">Seleccionar…</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                    <option value="P">Prefiero no decir</option>
                  </select>
                  {re.sexo && <span className="field-error">{re.sexo}</span>}
                </div>
              </div>

              {/* Correo */}
              <div className="field-group">
                <label className="field-label">Correo electrónico</label>
                <input type="email" className={'input-field' + (re.correo ? ' error' : '')}
                  placeholder="tu@correo.com" value={rf.correo}
                  onChange={e => { setRf(f => ({ ...f, correo: e.target.value })); setRe(x => ({ ...x, correo: '' })); }}
                  autoComplete="email"/>
                {re.correo && <span className="field-error">{re.correo}</span>}
              </div>

              {/* Contraseña */}
              <div className="field-group">
                <label className="field-label">Contraseña
                  <button type="button" className="show-pass-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </label>
                <input type={showPass ? 'text' : 'password'} className={'input-field' + (re.contraseña ? ' error' : '')}
                  placeholder="Mínimo 8 caracteres" value={rf.contraseña}
                  onChange={e => { setRf(f => ({ ...f, contraseña: e.target.value })); setRe(x => ({ ...x, contraseña: '' })); }}
                  autoComplete="new-password"/>
                {rf.contraseña && (
                  <div className="strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="strength-seg"
                        style={{ background: i <= strength ? STR_COLORS[strength] : 'var(--s4)' }}/>
                    ))}
                    <span style={{ color: STR_COLORS[strength], fontSize: '0.72rem' }}>{STR_LABELS[strength]}</span>
                  </div>
                )}
                {re.contraseña && <span className="field-error">{re.contraseña}</span>}
              </div>

              {/* Confirmar contraseña */}
              <div className="field-group">
                <label className="field-label">Confirmar contraseña</label>
                <input type={showPass ? 'text' : 'password'} className={'input-field' + (re.confirmar ? ' error' : '')}
                  placeholder="Repite tu contraseña" value={rf.confirmar}
                  onChange={e => { setRf(f => ({ ...f, confirmar: e.target.value })); setRe(x => ({ ...x, confirmar: '' })); }}
                  autoComplete="new-password"/>
                {re.confirmar && <span className="field-error">{re.confirmar}</span>}
              </div>

              {/* Error general */}
              {re.general && <div className="field-error" style={{ marginBottom: 16 }}>⚠️ {re.general}</div>}

              <button type="submit" className="btn btn-primary auth-submit" disabled={rl}>
                {rl ? <><div className="spinner"/>Creando cuenta…</> : 'Crear cuenta'}
              </button>
              <p className="auth-switch">¿Ya tienes cuenta?{' '}
                <button type="button" className="link-btn" onClick={() => setTab('login')}>Iniciar sesión</button>
              </p>
            </form>
          )}
        </div>
      </div>
      <Toast {...toast} />
    </div>
  );
}
