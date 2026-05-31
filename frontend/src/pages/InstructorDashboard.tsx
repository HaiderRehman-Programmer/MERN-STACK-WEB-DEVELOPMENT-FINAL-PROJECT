import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Trash2, Globe, Lock, Edit2, DollarSign, Users, TrendingUp, Star, BarChart3 } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import GlassPanel from '../components/ui/GlassPanel';
import Modal from '../components/Modal';
import CourseCard from '../components/CourseCard';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isPublished: boolean;
}

const CATEGORIES = ['Uncategorized', 'Programming', 'Technology', 'Business', 'Arts & Design', 'Science'];

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Uncategorized',
    price: 0,
  });

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses/mine');
      setCourses(res.data.data);
    } catch {
      setError('Failed to load your courses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
    // Fetch analytics
    api.get('/courses/mine/analytics')
      .then((r: any) => setAnalytics(r.data.data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      const res = await api.post('/courses', form);
      setSuccess(`Course "${res.data.data.title || form.title}" created successfully!`);
      setForm({ title: '', description: '', category: 'Uncategorized', price: 0 });
      fetchMyCourses();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create course.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      await api.patch(`/courses/${editingCourse.id}`, editingCourse);
      setSuccess('Course updated successfully!');
      setEditingCourse(null);
      fetchMyCourses();
    } catch {
      setError('Failed to update course.');
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    try {
      await api.patch(`/courses/${courseId}/publish`);
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, isPublished: !c.isPublished } : c
      ));
    } catch {
      setError('Failed to update publication status.');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Delete this course? All lessons and enrollments will be lost forever.')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSuccess('Course deleted successfully.');
    } catch {
      setError('Failed to delete course.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Instructor Dashboard</h1>
        <p>Welcome, {user?.firstName}. Manage your courses and content below.</p>
      </div>

      {/* Analytics Panel */}
      {!analyticsLoading && analytics && (
        <>
          <div className="analytics-stats">
            <GlassPanel className="analytics-card">
              <span className="analytics-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}><DollarSign size={20} /></span>
              <span className="analytics-value">${analytics.summary.totalRevenue.toLocaleString()}</span>
              <span className="analytics-label">Total Revenue</span>
            </GlassPanel>
            <GlassPanel className="analytics-card">
              <span className="analytics-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}><Users size={20} /></span>
              <span className="analytics-value">{analytics.summary.totalEnrollments}</span>
              <span className="analytics-label">Total Enrollments</span>
            </GlassPanel>
            <GlassPanel className="analytics-card">
              <span className="analytics-icon" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}><TrendingUp size={20} /></span>
              <span className="analytics-value">{analytics.summary.avgCompletion}%</span>
              <span className="analytics-label">Avg. Progress</span>
            </GlassPanel>
            <GlassPanel className="analytics-card">
              <span className="analytics-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}><BarChart3 size={20} /></span>
              <span className="analytics-value">{analytics.summary.publishedCourses}/{analytics.summary.totalCourses}</span>
              <span className="analytics-label">Published</span>
            </GlassPanel>
          </div>

          <div className="analytics-grid">
            {/* Revenue Area Chart */}
            <GlassPanel className="chart-container">
              <h3 className="chart-title"><DollarSign size={16} /> Revenue Growth</h3>
              <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {analytics.enrollmentTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.enrollmentTrends}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="sortKey" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#818cf8" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                        name="Revenue ($)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waiting for your first enrollment data...</p>
                )}
              </div>
            </GlassPanel>

            {/* Enrollment Trend Chart */}
            <GlassPanel className="chart-container">
              <h3 className="chart-title"><Users size={16} /> Enrollment Velocity</h3>
              <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {analytics.enrollmentTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="sortKey" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="enrollments" 
                        stroke="#c084fc" 
                        strokeWidth={3} 
                        dot={{ fill: '#c084fc', strokeWidth: 2, r: 4 }} 
                        name="New Enrollees" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waiting for your first enrollment data...</p>
                )}
              </div>
            </GlassPanel>
          </div>

          <div className="analytics-grid">
            {/* Quiz Performance Chart */}
            <GlassPanel className="chart-container">
              <h3 className="chart-title"><BarChart3 size={16} /> Quiz Success Metrics</h3>
              <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {analytics.quizPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.quizPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="title" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="avgScore" name="Avg Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate (%)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No quiz data available yet.</p>
                )}
              </div>
            </GlassPanel>

            {/* Engagement Drilldown */}
            {analytics.engagement && (
              <GlassPanel className="chart-container">
                <h3 className="chart-title"><TrendingUp size={16} /> Student Drop-off Analysis</h3>
                <div style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '0.5rem' }}>
                  {analytics.engagement.lessonCompletion.length > 0 ? (
                    analytics.engagement.lessonCompletion.slice(0, 10).map((l: any, i: number) => (
                      <div key={i} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.courseTitle} - {l.title}</span>
                          <span style={{ fontWeight: 700, color: l.rate < 50 ? '#ef4444' : 'inherit' }}>{l.rate}%</span>
                        </div>
                        <div className="analytics-bar-track" style={{ width: '100%' }}>
                          <div 
                            className="analytics-bar-fill" 
                            style={{ 
                              width: `${l.rate}%`, 
                              background: l.rate < 50 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #38bdf8, #818cf8)' 
                            }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No engagement data available.</p>
                  )}
                </div>
              </GlassPanel>
            )}
          </div>

          {analytics.courses.length > 0 && (
            <GlassPanel style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={16} /> Revenue Breakdown</h3>
              <div className="analytics-table">
                {analytics.courses.map((c: any) => {
                  const maxEnrollment = Math.max(...analytics.courses.map((x: any) => x.enrollments), 1);
                  const barWidth = (c.enrollments / maxEnrollment) * 100;
                  return (
                    <div key={c.courseId} className="analytics-row">
                      <div className="analytics-row-info">
                        <span className="analytics-row-title">{c.title}</span>
                        <div className="analytics-row-meta">
                          <span>{c.enrollments} students</span>
                          <span>·</span>
                          <span>${c.revenue.toLocaleString()}</span>
                          {c.reviewCount > 0 && (
                            <>
                              <span>·</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Star size={11} fill="#fbbf24" color="#fbbf24" /> {c.avgRating}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="analytics-bar-track">
                        <div className="analytics-bar-fill" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          )}
        </>
      )}

      {/* Create Course Form */}
      <h2 className="section-divider"><Plus size={18} /> Create New Course</h2>

      <GlassPanel className="inline-form">
        <form onSubmit={handleCreate}>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <div className="form-group">
            <label htmlFor="ins-title">Course Title</label>
            <input
              id="ins-title"
              className="premium-input"
              type="text"
              name="title"
              placeholder="e.g. Advanced React Patterns"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ins-desc">Description</label>
            <textarea
              id="ins-desc"
              className="premium-textarea"
              name="description"
              placeholder="A detailed description of the course content..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="ins-category">Category</label>
              <select
                id="ins-category"
                className="premium-input"
                name="category"
                value={form.category}
                onChange={handleChange as any}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, maxWidth: '200px' }}>
              <label htmlFor="ins-price">Price ($)</label>
              <input
                id="ins-price"
                className="premium-input"
                type="number"
                name="price"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" isLoading={isCreating} style={{ maxWidth: '220px' }}>
            <Plus size={16} /> Create Course
          </Button>
        </form>
      </GlassPanel>

      {/* My Courses List */}
      <h2 className="section-divider">Your Courses</h2>

      {isLoading ? (
        <Loader center />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course}
              showInstructor={false}
              footerContent={
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleTogglePublish(course.id)}
                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                    style={{ padding: '0.4rem' }}
                  >
                    {course.isPublished ? <Lock size={14} /> : <Globe size={14} />}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setEditingCourse(course)}
                    title="Edit Course"
                    style={{ padding: '0.4rem' }}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Link to={`/courses/${course.id}/manage-lessons`} className="btn-sm btn-manage" style={{ textDecoration: 'none' }}>
                    <Settings size={14} /> Lessons
                  </Link>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDelete(course.id)}
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Edit Course Modal */}
      <Modal 
        isOpen={!!editingCourse} 
        onClose={() => setEditingCourse(null)} 
        title="Edit Course"
      >
        {editingCourse && (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Course Title</label>
              <input
                className="premium-input"
                type="text"
                value={editingCourse.title}
                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="premium-textarea"
                value={editingCourse.description}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                required
                rows={4}
              />
            </div>
            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <select
                  className="premium-input"
                  value={editingCourse.category || 'Uncategorized'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Price ($)</label>
                <input
                  className="premium-input"
                  type="number"
                  step="0.01"
                  value={editingCourse.price}
                  onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setEditingCourse(null)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" style={{ flex: 1 }}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <style>{`
        .course-card.draft { opacity: 0.8; }
        .course-card-badges { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-content { padding: 2rem; border: 1px solid rgba(255,255,255,0.1); }

        .analytics-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .analytics-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .analytics-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
        .analytics-value { font-size: 2rem; font-weight: 800; line-height: 1; }
        .analytics-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

        .analytics-table { display: flex; flex-direction: column; gap: 1rem; }
        .analytics-row { display: flex; align-items: center; gap: 1.5rem; }
        .analytics-row-info { flex: 1; min-width: 0; }
        .analytics-row-title { font-size: 0.9rem; font-weight: 600; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .analytics-row-meta { display: flex; gap: 0.4rem; font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; }
        .analytics-bar-track { width: 160px; height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; flex-shrink: 0; }
        .analytics-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 4px; transition: width 0.6s ease; }

        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .chart-container { padding: 1.5rem; }
        .chart-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); }
        
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;
