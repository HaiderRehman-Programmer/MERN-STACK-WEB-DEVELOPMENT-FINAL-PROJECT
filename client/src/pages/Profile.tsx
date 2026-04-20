import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, ExternalLink, Lock, Shield, Check, X, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

interface Enrollment {
  enrollmentId: string;
  status: string;
  purchasedAt: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  // Password State
  const [showSecurity, setShowSecurity] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isPassSaving, setIsPassSaving] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const [profileRes, enrollRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/auth/me/enrollments'),
      ]);
      const userData = profileRes.data.data.user;
      setProfileData(userData);
      setEditForm({ firstName: userData.firstName, lastName: userData.lastName });
      setEnrollments(enrollRes.data.data);
    } catch {
      setError('Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/auth/me', editForm);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setError('New passwords do not match.');
    }
    setIsPassSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
        confirmPassword: passForm.confirmPassword
      });
      setSuccess('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSecurity(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setIsPassSaving(false);
    }
  };

  if (isLoading) {
    return <div className="auth-page"><span className="loader" /></div>;
  }

  const displayUser = profileData || user;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>My Profile</h1>
          <p>Your account information and settings.</p>
        </div>
        {!isEditing && (
          <button className="btn-sm btn-manage" onClick={() => setIsEditing(true)}>
            <Edit3 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-banner" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Profile Card */}
      <div className="glass-panel profile-card" style={{ marginBottom: '2rem' }}>
        <div className="profile-avatar">
          <User size={36} />
        </div>
        <div className="profile-details">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                  className="premium-input" 
                  value={editForm.firstName} 
                  onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                  placeholder="First Name"
                  required
                />
                <input 
                  className="premium-input" 
                  value={editForm.lastName} 
                  onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit" isLoading={isSaving} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  <Check size={14} /> Save
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  <X size={14} /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <h2>{displayUser?.firstName} {displayUser?.lastName}</h2>
              <span className="profile-email">{displayUser?.email}</span>
              <div className="profile-meta">
                <span className={`badge ${
                  displayUser?.role === 'ADMIN' ? 'badge-warning' :
                  displayUser?.role === 'INSTRUCTOR' ? 'badge-info' : 'badge-success'
                }`}>
                  {displayUser?.role}
                </span>
                {displayUser?.createdAt && (
                  <span className="profile-joined">
                    <Calendar size={13} /> Joined {new Date(displayUser.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
              <Shield size={20} color="var(--accent-glow)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Security Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage your password and account security.</p>
            </div>
          </div>
          <button className="btn-sm btn-secondary" onClick={() => setShowSecurity(!showSecurity)}>
            {showSecurity ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showSecurity && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Current Password</label>
              <input 
                type="password" 
                className="premium-input" 
                value={passForm.currentPassword}
                onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>New Password</label>
              <input 
                type="password" 
                className="premium-input" 
                value={passForm.newPassword}
                onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                required
                placeholder="Min. 8 chars, 1 uppercase, 1 digit"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Confirm New Password</label>
              <input 
                type="password" 
                className="premium-input" 
                value={passForm.confirmPassword}
                onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <Button type="submit" isLoading={isPassSaving} style={{ marginTop: '0.5rem' }}>
              <Lock size={14} /> Update Password
            </Button>
          </form>
        )}
      </div>

      {/* Enrolled Courses */}
      <h2 className="section-divider"><BookOpen size={18} /> My Enrollments ({enrollments.length})</h2>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Find Courses</Link>
        </div>
      ) : (
        <div className="lesson-list">
          {enrollments.map(enr => (
            <div key={enr.enrollmentId} className="glass-panel lesson-item" style={{ flexWrap: 'wrap' }}>
              <div className="lesson-info" style={{ flex: '1 1 300px' }}>
                <span className="lesson-title">{enr.courseTitle}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className={`badge ${enr.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                  {enr.status}
                </span>
                <span className="price-tag">
                  {enr.coursePrice === 0 ? 'Free' : `$${enr.coursePrice.toFixed(2)}`}
                </span>
                <Link to={`/courses/${enr.courseId}/learn`} className="btn-sm btn-manage" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Learn
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
