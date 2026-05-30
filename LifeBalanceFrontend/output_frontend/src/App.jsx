import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import AuthPage   from './pages/Auth';
import Dashboard  from './pages/Dashboard';
import Sesiones   from './pages/Sesiones';
import Emocional  from './pages/Emocional';
import Historial  from './pages/Historial';
import Pausas     from './pages/Pausas';
import Perfil     from './pages/Perfil';
import Admin      from './pages/Admin';

/* ─── Layout con sidebar (páginas privadas) ─── */
function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sesiones"
            element={
              <ProtectedRoute>
                <AppLayout><Sesiones /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emocional"
            element={
              <ProtectedRoute>
                <AppLayout><Emocional /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute>
                <AppLayout><Historial /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pausas"
            element={
              <ProtectedRoute>
                <AppLayout><Pausas /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <AppLayout><Perfil /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AppLayout><Admin /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirige raíz → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 → dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
