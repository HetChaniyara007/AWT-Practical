import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import Home from './pages/student/Home';
import Events from './pages/student/Events';
import EventDetail from './pages/student/EventDetail';
import MyTickets from './pages/student/MyTickets';

// Club Admin Pages
import ClubDashboard from './pages/club/Dashboard';
import MyEvents from './pages/club/MyEvents';
import CreateEvent from './pages/club/CreateEvent';
import Attendees from './pages/club/Attendees';

// Superadmin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ApprovalQueue from './pages/admin/ApprovalQueue';
import AdminClubs from './pages/admin/Clubs';
import AdminUsers from './pages/admin/Users';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }
  return children;
};

// Public route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={getDefaultRoute(user.role)} replace />;
  return children;
};

const getDefaultRoute = (role) => {
  if (role === 'superadmin') return '/admin/dashboard';
  if (role === 'club_admin') return '/club/dashboard';
  return '/';
};

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<ProtectedRoute allowedRoles={['student']}><Home /></ProtectedRoute>} />
        <Route path="events" element={<ProtectedRoute allowedRoles={['student']}><Events /></ProtectedRoute>} />
        <Route path="events/:id" element={<ProtectedRoute allowedRoles={['student']}><EventDetail /></ProtectedRoute>} />
        <Route path="my-tickets" element={<ProtectedRoute allowedRoles={['student']}><MyTickets /></ProtectedRoute>} />
      </Route>

      {/* Club Admin Routes */}
      <Route path="/club" element={<Layout />}>
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={['club_admin']}><ClubDashboard /></ProtectedRoute>} />
        <Route path="events" element={<ProtectedRoute allowedRoles={['club_admin']}><MyEvents /></ProtectedRoute>} />
        <Route path="events/new" element={<ProtectedRoute allowedRoles={['club_admin']}><CreateEvent /></ProtectedRoute>} />
        <Route path="events/:id/edit" element={<ProtectedRoute allowedRoles={['club_admin']}><CreateEvent /></ProtectedRoute>} />
        <Route path="events/:id/attendees" element={<ProtectedRoute allowedRoles={['club_admin']}><Attendees /></ProtectedRoute>} />
      </Route>

      {/* Superadmin Routes */}
      <Route path="/admin" element={<Layout />}>
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="approvals" element={<ProtectedRoute allowedRoles={['superadmin']}><ApprovalQueue /></ProtectedRoute>} />
        <Route path="clubs" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminClubs /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminUsers /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
