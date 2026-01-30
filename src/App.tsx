import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/store';
import { LoginPage } from './auth/LoginPage';
import { OfficeShell } from './shell/OfficeShell';
import { DashboardPage } from './shell/DashboardPage';

function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useAuth(s => s.session);
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LoginGate({ children }: { children: React.ReactNode }) {
  const session = useAuth(s => s.session);
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginGate><LoginPage /></LoginGate>} />

        <Route element={<AuthGate><OfficeShell /></AuthGate>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Module routes will be added here as we build them */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
