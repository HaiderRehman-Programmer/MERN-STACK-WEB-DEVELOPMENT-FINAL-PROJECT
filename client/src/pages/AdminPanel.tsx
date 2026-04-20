import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Shield } from 'lucide-react';
import api from '../utils/api';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Stats {
  users: number;
  courses: number;
  enrollments: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
        ]);
        setUsers(usersRes.data.data);
        setStats(statsRes.data.data);
      } catch {
        setError('Failed to load admin data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess(`Role updated to ${newRole}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="auth-page"><span className="loader" /></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>System overview and user management.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* Stats */}
      {stats && (
        <div className="stat-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel stat-card">
            <span className="stat-label"><Users size={16} /> Total Users</span>
            <span className="stat-value">{stats.users}</span>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label"><BookOpen size={16} /> Total Courses</span>
            <span className="stat-value">{stats.courses}</span>
          </div>
          <div className="glass-panel stat-card">
            <span className="stat-label"><GraduationCap size={16} /> Enrollments</span>
            <span className="stat-value">{stats.enrollments}</span>
          </div>
        </div>
      )}

      {/* User Table */}
      <h2 className="section-divider"><Shield size={18} /> User Management</h2>

      <div className="glass-panel" style={{ overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="user-name">{user.firstName} {user.lastName}</td>
                <td className="user-email">{user.email}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-warning' :
                    user.role === 'INSTRUCTOR' ? 'badge-info' : 'badge-success'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="user-date">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className="role-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
