import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Courses from '../pages/Courses';
import InstructorDashboard from '../pages/InstructorDashboard';
import ManageLessons from '../pages/ManageLessons';
import AdminPanel from '../pages/AdminPanel';
import Profile from '../pages/Profile';
import LessonView from '../pages/LessonView';
import PaymentSuccess from '../pages/PaymentSuccess';
import Home from '../pages/Home';
import About from '../pages/About';
import CourseDetail from '../pages/CourseDetail';

/* ---- Route Guard Components ---- */

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const RoleRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password/:token" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      <Route path="/verify-email/:token" element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
      
      <Route path="/about" element={<About />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/courses/:courseId/learn" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />

      {/* Instructor Routes */}
      <Route path="/instructor" element={<RoleRoute roles={['INSTRUCTOR', 'ADMIN']}><InstructorDashboard /></RoleRoute>} />
      <Route path="/courses/:courseId/manage-lessons" element={<RoleRoute roles={['INSTRUCTOR', 'ADMIN']}><ManageLessons /></RoleRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<RoleRoute roles={['ADMIN']}><AdminPanel /></RoleRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
