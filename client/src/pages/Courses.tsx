import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import GlassPanel from '../components/ui/GlassPanel';

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  instructor?: { firstName: string; lastName: string };
  avgRating?: number;
  reviewCount?: number;
}

const CATEGORIES = ['All', 'Uncategorized', 'Programming', 'Technology', 'Business', 'Arts & Design', 'Science'];

const Courses: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = async (currentSearch: string, currentCategory: string, currentPage: number) => {
    try {
      setIsLoading(true);
      const res = await api.get('/courses', {
        params: { search: currentSearch, category: currentCategory, page: currentPage, limit: 9 }
      });
      setCourses(res.data.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch {
      setError('Failed to load courses.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unified effect for searching, filtering, and paging
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses(searchTerm, category, page);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, category, page]);

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, category]);

  const handleEnroll = async (courseId: string, price: number) => {
    setEnrollingId(courseId);
    try {
      if (price === 0) {
        // Free course — direct enrollment
        await api.post('/enrollments', { courseId });
        setEnrolledIds(prev => new Set(prev).add(courseId));
      } else {
        // Paid course — redirect to Stripe Checkout
        const res = await api.post('/payments/create-checkout', { courseId });
        if (res.data.data.free) {
          // Server decided it was free (edge case)
          setEnrolledIds(prev => new Set(prev).add(courseId));
        } else if (res.data.data.url) {
          window.location.href = res.data.data.url;
          return; // Don't reset enrollingId, we're navigating away
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Enrollment failed.';
      if (msg.toLowerCase().includes('already enrolled')) {
        setEnrolledIds(prev => new Set(prev).add(courseId));
      } else {
        alert(msg);
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Course Catalog</h1>
        <p>Browse all available courses and start learning today.</p>
      </div>

      {/* Search & Filter Bar */}
      <GlassPanel className="search-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            className="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </GlassPanel>

      {error && <div className="error-banner">{error}</div>}

      {isLoading ? (
        <Loader center />
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>{searchTerm ? `No results found for "${searchTerm}"` : 'No courses have been published yet.'}</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course}
              footerContent={
                isAuthenticated && user?.role === 'STUDENT' && (
                  enrolledIds.has(course.id) ? (
                    <Link to={`/courses/${course.id}/learn`} className="btn-sm btn-manage" style={{ textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Go to Course
                    </Link>
                  ) : (
                    <Button 
                      variant="enroll" 
                      onClick={() => handleEnroll(course.id, course.price)}
                      isLoading={enrollingId === course.id}
                    >
                      Enroll
                    </Button>
                  )
                )
              }
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="page-indicator">Page {page} of {totalPages}</span>
          <button 
            className="btn-secondary" 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .search-container { display: flex; align-items: center; padding: 0.8rem 1.5rem; margin-bottom: 2rem; gap: 1rem; background: rgba(255, 255, 255, 0.05); flex-wrap: wrap; }
        .search-icon { color: var(--text-muted); }
        .search-input { background: none; border: none; font-size: 1rem; color: var(--text-main); width: 100%; outline: none; }
        .search-input::placeholder { color: var(--text-muted); opacity: 0.6; }
        .category-filter { background: rgba(0,0,0,0.2); color: var(--text-main); border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 6px; outline: none; min-width: 150px; }
        .pagination-controls { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 3rem; }
        .page-indicator { color: var(--text-muted); font-size: 0.9rem; }
        .course-rating { display: flex; align-items: center; gap: 0.5rem; }
        .stars-row { display: flex; gap: 1px; }
        .rating-text { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
      `}</style>
    </div>
  );
};

export default Courses;
