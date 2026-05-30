import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { KEYS, getItem } from '../services/lb';
import './Sidebar.css';

export default function Sidebar({ user: propUser }) {
  const { user: ctxUser, logout } = useAuthContext();
  const user = propUser || ctxUser;
  const navigate = useNavigate();

  // Contar pausas activas del usuario
  const pausasCount = user
    ? getItem(KEYS.pausas).filter(p => p.usuario_id === user.id && p.activa).length
    : 0;

  const isAdmin = user?.rol === 'ADMIN';

  const NAV_ITEMS = [
    {
      group: 'Principal',
      items: [
        { to: '/dashboard', label: 'Dashboard',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
        { to: '/sesiones', label: 'Sesiones',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg> },
        { to: '/pausas', label: 'Pausas activas', badge: true,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
        { to: '/historial', label: 'Mi progreso',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg> },
      ],
    },
    {
      group: 'Bienestar',
      items: [
        { to: '/emocional', label: 'Registro emocional',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
      ],
    },
    {
      group: 'Cuenta',
      items: [
        { to: '/perfil', label: 'Mi perfil',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
        ...(isAdmin ? [{ to: '/admin', label: 'Panel Admin',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
          adminOnly: true }] : []),
      ],
    },
  ];

  function handleLogout() {
    logout();
    navigate('/auth', { replace: true });
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <NavLink to="/dashboard" className="sidebar-brand">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 3-5 4-5 7a5 5 0 0010 0c0-3-3.5-4-5-7z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4M10 14h4"/>
          </svg>
        </div>
        <span className="brand-name serif">LifeBalance</span>
      </NavLink>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ group, items }) => (
          <div key={group} className="nav-group">
            <span className="nav-group-label">{group}</span>
            {items.map((item) => {
              const { to, label, icon, badge } = item;
              return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '') + (item.adminOnly ? ' nav-item-admin' : '')}
              >
                <span className="nav-icon">{icon}</span>
                {label}
                {badge && pausasCount > 0 && (
                  <span className="nav-badge">{pausasCount}</span>
                )}
              </NavLink>
            );
            })}
          </div>
        ))}
      </nav>

      {/* User chip */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">
            {user?.nombre?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.nombre ?? '—'}</div>
            <div className="user-role">{isAdmin ? 'Administrador' : 'Miembro'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
