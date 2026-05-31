import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Ban, Trash2, MessageSquare, Reply } from 'lucide-react';
import api from '../utils/api';
import Button from '../components/ui/Button';

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
}

interface Stats {
  users: number;
  courses: number;
  enrollments: number;
}

interface ModerationData {
  discussions: any[];
  replies: any[];
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'moderation'>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [modData, setModData] = useState<ModerationData>({ discussions: [], replies: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, modRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/moderation')
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
      setModData(modRes.data.data);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map((u: UserRow) => u.id === userId ? { ...u, role: newRole } : u));
      setSuccess(`Role updated to ${newRole}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBan = async (user: UserRow) => {
    const action = user.isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) return;

    setUpdatingId(user.id);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/admin/users/${user.id}/ban`, { isBanned: !user.isBanned });
      setUsers(prev => prev.map((u: UserRow) => u.id === user.id ? { ...u, isBanned: !user.isBanned } : u));
      setSuccess(`User ${!user.isBanned ? 'banned' : 'unbanned'} successfully`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update ban status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user: UserRow) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) return;

    setUpdatingId(user.id);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(prev => prev.filter((u: UserRow) => u.id !== user.id));
      setSuccess(`User ${user.firstName} ${user.lastName} deleted successfully.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteContent = async (type: 'discussions' | 'replies', id: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/${type}/${id}`);
      setModData(prev => ({
        ...prev,
        [type]: prev[type as keyof ModerationData].filter((item: any) => item.id !== id)
      }));
      setSuccess('Content deleted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete content.');
    }
  };

  if (isLoading) {
    return <div className="auth-page"><span className="loader" /></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>System overview and platform moderation.</p>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-banner" style={{ marginBottom: '1rem' }}>{success}</div>}

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

      {/* Tabs */}
      <div className="tab-navigation" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button 
          className={`btn-tab ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', paddingBottom: '0.5rem', 
            borderBottom: activeTab === 'users' ? '2px solid var(--primary-color)' : 'none'
          }}
        >
          User Management
        </button>
        <button 
          className={`btn-tab ${activeTab === 'moderation' ? 'active' : ''}`} 
          onClick={() => setActiveTab('moderation')}
          style={{ 
            background: 'none', border: 'none', color: activeTab === 'moderation' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', paddingBottom: '0.5rem', 
            borderBottom: activeTab === 'moderation' ? '2px solid var(--primary-color)' : 'none'
          }}
        >
          Content Moderation
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="glass-panel" style={{ overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: UserRow) => (
                <tr key={user.id}>
                  <td className="user-name">{user.firstName} {user.lastName}</td>
                  <td className="user-email">{user.email}</td>
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
                  <td>
                    <span className={`badge ${user.isBanned ? 'badge-error' : 'badge-success'}`}>
                      {user.isBanned ? 'BANNED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    <Button 
                      variant={user.isBanned ? 'success' : 'danger'} 
                      onClick={() => handleToggleBan(user)} 
                      isLoading={updatingId === user.id}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {user.isBanned ? 'Unban' : <><Ban size={12} /> Ban</>}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDeleteUser(user)} 
                      isLoading={updatingId === user.id}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={12} /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="moderation-feed" style={{ display: 'grid', gap: '1rem' }}>
          <h3>Recent Discussions</h3>
          {modData.discussions.length === 0 && <p className="empty-text">No discussions found.</p>}
          {modData.discussions.map((disc: any) => (
            <div key={disc.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MessageSquare size={14} color="var(--primary-color)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{disc.user.firstName} {disc.user.lastName}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>in {disc.lesson.course.title}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{disc.content}</p>
              </div>
              <Button variant="danger" onClick={() => handleDeleteContent('discussions', disc.id)} style={{ padding: '0.4rem' }}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}

          <h3 style={{ marginTop: '1.5rem' }}>Recent Replies</h3>
          {modData.replies.length === 0 && <p className="empty-text">No replies found.</p>}
          {modData.replies.map((reply: any) => (
            <div key={reply.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--accent-glow)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Reply size={14} color="var(--accent-glow)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{reply.user.firstName} {reply.user.lastName}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{reply.content}</p>
              </div>
              <Button variant="danger" onClick={() => handleDeleteContent('replies', reply.id)} style={{ padding: '0.4rem' }}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
