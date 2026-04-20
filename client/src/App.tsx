import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import InstructorDashboard from './pages/InstructorDashboard';
import ManageLessons from './pages/ManageLessons';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import LessonView from './pages/LessonView';
import PaymentSuccess from './pages/PaymentSuccess';
import Home from './pages/Home';
import { LogOut, User } from 'lucide-react';

/* ---- Route Guard Components ---- */

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

/* ---- Navbar ---- */

import Magnetic from './components/ui/Magnetic';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <Magnetic amount={0.2}>
        <Link to="/" className="logo" style={{ fontSize: '1.4rem' }}>LMS PLATFORM</Link>
      </Magnetic>
      
      <div className="nav-links">
        <Link to="/courses">Courses</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
              <Magnetic amount={0.1}>
                <Link to="/instructor" className="badge badge-info" style={{ textDecoration: 'none' }}>Instructor</Link>
              </Magnetic>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin">Admin</Link>
            )}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="author-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                {user?.firstName?.[0]}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.firstName}</span>
            </Link>
            <Magnetic amount={0.1}>
              <button
                className="btn-secondary"
                onClick={logout}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '50px' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </Magnetic>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Magnetic amount={0.1}>
              <Link to="/register">
                <Button size="sm" style={{ borderRadius: '50px' }}>Join Now</Button>
              </Link>
            </Magnetic>
          </>
        )}
      </div>
    </nav>
  );
};

/* ---- Root App ---- */

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/courses/:courseId/learn" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

        {/* Role-gated routes */}
        <Route path="/instructor" element={<RoleRoute roles={['INSTRUCTOR', 'ADMIN']}><InstructorDashboard /></RoleRoute>} />
        <Route path="/instructor/courses/:courseId/lessons" element={<RoleRoute roles={['INSTRUCTOR', 'ADMIN']}><ManageLessons /></RoleRoute>} />
        <Route path="/admin" element={<RoleRoute roles={['ADMIN']}><AdminPanel /></RoleRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </>
  );
};

export default App;
