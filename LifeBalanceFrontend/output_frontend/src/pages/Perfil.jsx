import { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import {
  KEYS, getItem, getUserStats, formatDate,
} from '../services/lb';
import './Perfil.css';

export default function Perfil() {
  const { user, logout } = useAuthContext();
  const { toast, showToast } = useToast();
  const [stats, setStats] = useState({ sesiones: 0, mins: 0, racha: 0, avgAnimo: null });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const s = getUserStats(user.id);
    setStats(s);
    const usuarios = getItem(KEYS.usuarios);
    const found = usuarios.find(u => u.id === user.id);
    setUserData(found || null);
  }, [user]);

  function handleLogout() {
    logout();
  }

  const initials = user?.nombre
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const MENU = [
    { icon: '⚙️', label: 'Configuración', action: () => showToast('Próximamente disponible', '') },
    { icon: '🔔', label: 'Recordatorios', action: () => showToast('Configura tus pausas en la sección Pausas activas', '') },
    { icon: '📊', label: 'Mi historial emocional', href: '/emocional' },
    { icon: '📈', label: 'Mi progreso', href: '/historial' },
  ];

  return (
    <div className="perfil-page">
      {/* Header */}
      <div className="perfil-hero">
        <div className="perfil-avatar-lg">{initials}</div>
        <h1 className="perfil-nombre serif">{user?.nombre}</h1>
        <p className="perfil-correo">{user?.correo}</p>
        {userData?.fecha_creacion && (
          <p className="perfil-member">
            Miembro desde {formatDate(userData.fecha_creacion.split('T')[0])}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="perfil-stats">
        <div className="card perfil-stat">
          <div className="ps-val serif">{stats.sesiones}</div>
          <div className="ps-lbl">Sesiones</div>
        </div>
        <div className="card perfil-stat">
          <div className="ps-val serif">{stats.racha}</div>
          <div className="ps-lbl">Días de racha</div>
        </div>
        <div className="card perfil-stat">
          <div className="ps-val serif">{stats.mins}</div>
          <div className="ps-lbl">Minutos totales</div>
        </div>
        <div className="card perfil-stat">
          <div className="ps-val serif">{stats.avgAnimo ?? '—'}</div>
          <div className="ps-lbl">Ánimo promedio</div>
        </div>
      </div>

      {/* User info card */}
      {userData && (
        <div className="card perfil-info-card">
          <h3 className="section-title" style={{ marginBottom: 14 }}>Información personal</h3>
          <div className="info-row">
            <span className="info-label">Nombre</span>
            <span className="info-value">{userData.nombre}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Correo</span>
            <span className="info-value">{userData.correo}</span>
          </div>
          {userData.fecha_nacimiento && (
            <div className="info-row">
              <span className="info-label">Nacimiento</span>
              <span className="info-value">{formatDate(userData.fecha_nacimiento)}</span>
            </div>
          )}
          {userData.sexo && (
            <div className="info-row">
              <span className="info-label">Género</span>
              <span className="info-value">
                {{ M: 'Masculino', F: 'Femenino', O: 'Otro', P: 'Prefiero no decir' }[userData.sexo] ?? userData.sexo}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Menu */}
      <div className="card perfil-menu">
        {MENU.map(({ icon, label, action, href }) => (
          href ? (
            <a key={label} href={href} className="menu-item">
              <span className="mi-icon">{icon}</span>
              <span className="mi-label">{label}</span>
              <span className="mi-arrow">›</span>
            </a>
          ) : (
            <button key={label} className="menu-item" onClick={action}>
              <span className="mi-icon">{icon}</span>
              <span className="mi-label">{label}</span>
              <span className="mi-arrow">›</span>
            </button>
          )
        ))}
        <button className="menu-item danger" onClick={handleLogout}>
          <span className="mi-icon">🚪</span>
          <span className="mi-label">Cerrar sesión</span>
          <span className="mi-arrow">›</span>
        </button>
      </div>

      <Toast {...toast} />
    </div>
  );
}
