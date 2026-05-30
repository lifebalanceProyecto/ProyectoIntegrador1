import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

/**
 * Envuelve rutas privadas.
 * Si el usuario no está autenticado → redirige a /auth
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg)',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
