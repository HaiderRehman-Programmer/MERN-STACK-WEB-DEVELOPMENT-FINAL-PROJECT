import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, TrendingUp, ChevronRight, Trophy, Flame, Heart } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';

interface EnrollmentData {
  enrollmentId: string;
  status: string;
  purchasedAt: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  coursePrice: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

interface DashboardData {
  stats: {
    totalEnrollments: number;
    totalCompleted: number;
    averageProgress: number;
  };
  enrollments: EnrollmentData[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, wishRes] = await Promise.all([
          api.get('/auth/me/dashboard'),
          api.get('/wishlist')
        ]);
        setData(dashRes.data.data);
        setWishlist(wishRes.data.data);
      } catch {
        // Silently fail, show empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleDownloadCertificate = (enrollmentId: string) => {
    api.get(`/enrollments/${enrollmentId}/certificate`, { responseType: 'blob' })
      .then((res: any) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `certificate-${enrollmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => alert('Failed to download certificate.'));
  };

  if (isLoading) {
    return <div className="auth-page"><span className="loader" /></div>;
  }

  const stats = data?.stats || { totalEnrollments: 0, totalCompleted: 0, averageProgress: 0 };
  const enrollments = data?.enrollments || [];

  // Find the "continue learning" course (highest progress that isn't 100%)
  const inProgressCourses = enrollments
    .filter(e => e.progressPercent < 100 && e.totalLessons > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);
  const continueCourse = inProgressCourses[0];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p className="welcome-text">
            Here's an overview of your learning journey.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="glass-panel stat-card stat-accent-indigo">
          <span className="stat-icon"><BookOpen size={20} /></span>
          <span className="stat-value">{stats.totalEnrollments}</span>
          <span className="stat-label">Enrolled Courses</span>
        </div>
        <div className="glass-panel stat-card stat-accent-green">
          <span className="stat-icon"><GraduationCap size={20} /></span>
          <span className="stat-value">{stats.totalCompleted}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="glass-panel stat-card stat-accent-purple">
          <span className="stat-icon"><TrendingUp size={20} /></span>
          <span className="stat-value">{stats.averageProgress}%</span>
          <span className="stat-label">Avg. Progress</span>
        </div>
        <div className="glass-panel stat-card stat-accent-amber">
          <span className="stat-icon"><Flame size={20} /></span>
          <span className="stat-value">{inProgressCourses.length}</span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      {/* Continue Learning Hero */}
      {continueCourse && (
        <div className="glass-panel continue-hero">
          <div className="continue-info">
            <span className="continue-label">Continue Learning</span>
            <h2>{continueCourse.courseTitle}</h2>
            <div className="continue-progress-row">
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${continueCourse.progressPercent}%` }} />
              </div>
              <span className="progress-text">{continueCourse.progressPercent}%</span>
            </div>
            <span className="continue-meta">
              {continueCourse.completedLessons} of {continueCourse.totalLessons} lessons completed
            </span>
          </div>
          <Link to={`/courses/${continueCourse.courseId}/learn`} className="btn-primary continue-btn">
            Resume <ChevronRight size={18} />
          </Link>
        </div>
      )}

      {/* My Courses Grid */}
      <h2 className="section-divider">My Courses</h2>

      {enrollments.length === 0 ? (
        <div className="empty-state glass-panel" style={{ padding: '3rem' }}>
          <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', width: 'auto' }}>
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="enrollment-grid">
          {enrollments.map(enr => (
            <div key={enr.enrollmentId} className="glass-panel enrollment-card">
              <div className="enrollment-card-top">
                <span className="badge badge-info">{enr.courseCategory}</span>
                {enr.progressPercent === 100 && (
                  <span className="badge badge-success"><Trophy size={10} /> Complete</span>
                )}
              </div>
              <h3 className="enrollment-title">{enr.courseTitle}</h3>
              <div className="enrollment-progress">
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${enr.progressPercent === 100 ? 'complete' : ''}`}
                    style={{ width: `${enr.progressPercent}%` }}
                  />
                </div>
                <div className="enrollment-progress-meta">
                  <span>{enr.completedLessons}/{enr.totalLessons} lessons</span>
                  <span className="progress-percent">{enr.progressPercent}%</span>
                </div>
              </div>
              <div className="enrollment-actions-row" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <Link to={`/courses/${enr.courseId}/learn`} className="btn-sm btn-manage enrollment-action" style={{ flex: 1 }}>
                  {enr.progressPercent === 100 ? 'Review' : enr.progressPercent > 0 ? 'Continue' : 'Start'} <ChevronRight size={14} />
                </Link>
                {enr.progressPercent === 100 && (
                  <button 
                    onClick={() => handleDownloadCertificate(enr.enrollmentId)}
                    className="btn-sm btn-success enrollment-action" 
                    title="Download Certificate"
                    style={{ flex: '0 0 auto', padding: '0.5rem' }}
                  >
                    <Trophy size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist Section */}
      {wishlist.length > 0 && (
        <>
          <h2 className="section-divider" style={{ marginTop: '3rem' }}>
            <Heart size={18} /> Saved for Later ({wishlist.length})
          </h2>
          <div className="enrollment-grid">
            {wishlist.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                initialIsFavorited={true}
                onToggleWishlist={(fav) => {
                  if (!fav) setWishlist(prev => prev.filter(c => c.id !== course.id));
                }}
                footerContent={
                  <Link to={`/courses/${course.id}`} className="btn-sm btn-primary">
                    View Course
                  </Link>
                }
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .dashboard-header { margin-bottom: 2rem; }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          position: relative;
          overflow: hidden;
        }
        .stat-card .stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.5rem;
        }
        .stat-accent-indigo .stat-icon { background: rgba(99,102,241,0.15); color: #818cf8; }
        .stat-accent-green .stat-icon { background: rgba(34,197,94,0.15); color: #4ade80; }
        .stat-accent-purple .stat-icon { background: rgba(168,85,247,0.15); color: #c084fc; }
        .stat-accent-amber .stat-icon { background: rgba(245,158,11,0.15); color: #fbbf24; }

        .stat-card .stat-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }
        .stat-card .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Continue Hero */
        .continue-hero {
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));
          border: 1px solid rgba(99,102,241,0.2);
        }
        .continue-info { flex: 1; }
        .continue-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--primary-color);
          margin-bottom: 0.25rem;
          display: block;
        }
        .continue-hero h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
        .continue-progress-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .continue-meta { font-size: 0.8rem; color: var(--text-muted); }
        .continue-btn {
          width: auto !important;
          white-space: nowrap;
          flex-shrink: 0;
          padding: 0.7rem 1.5rem !important;
        }

        /* Progress Bar */
        .progress-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .progress-bar-fill.complete {
          background: linear-gradient(90deg, #22c55e, #4ade80);
        }
        .progress-text { font-size: 0.9rem; font-weight: 700; color: var(--primary-color); min-width: 40px; text-align: right; }

        /* Enrollment Grid */
        .enrollment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .enrollment-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .enrollment-card-top { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .enrollment-title { font-size: 1.1rem; font-weight: 700; }
        .enrollment-progress { display: flex; flex-direction: column; gap: 0.5rem; }
        .enrollment-progress-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); }
        .progress-percent { font-weight: 700; color: var(--primary-color); }
        .enrollment-action {
          margin-top: auto;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
        }

        @media (max-width: 640px) {
          .continue-hero { flex-direction: column; align-items: stretch; }
          .continue-btn { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
