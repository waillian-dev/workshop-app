import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AttendeeDashboard from './pages/AttendeeDashboard';
import SchedulePage from './pages/SchedulePage';
import CheckInPage from './pages/CheckInPage';
import CertificatePage from './pages/CertificatePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminSessionsPage from './pages/AdminSessionsPage';
import AdminAttendeesPage from './pages/AdminAttendeesPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminQrPage from './pages/AdminQrPage';
import AdminCertificatesPage from './pages/AdminCertificatesPage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/schedule-public" element={<SchedulePage publicView />} />
        <Route path="/attendance/check-in" element={<CheckInPage />} />

        <Route element={<ProtectedRoute role="attendee" />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<AttendeeDashboard />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/certificate" element={<CertificatePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/sessions" element={<AdminSessionsPage />} />
            <Route path="/admin/attendees" element={<AdminAttendeesPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
            <Route path="/admin/qr" element={<AdminQrPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
