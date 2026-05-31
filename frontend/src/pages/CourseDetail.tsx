import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Users, PlayCircle, ShieldCheck } from 'lucide-react';
import { CourseService } from '../services/courses.service';
import { PaymentService } from '../services/payments.service';
import { EnrollmentService } from '../services/enrollments.service';
import { ReviewService } from '../services/reviews.service';
import { LessonService } from '../services/lessons.service';
import { useAuth } from '../context/AuthContext';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const [courseRes, reviewsRes, lessonsRes] = await Promise.all([
          CourseService.getCourse(id),
          ReviewService.getCourseReviews(id),
          LessonService.getCourseLessons(id).catch(() => ({ data: { data: [] } }))
        ]);
        
        setCourse(courseRes.data.data);
        setReviews(reviewsRes.data.data);
        setLessons(lessonsRes.data.data);
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT' && id) {
      // Check enrollment status via student enrollment endpoint
      import('../utils/api').then(({ default: apiClient }) => {
        apiClient.get('/auth/me/enrollments')
          .then((res: any) => {
            const enrolled = res.data.data.some((e: any) => e.courseId === id);
            setIsEnrolled(enrolled);
          })
          .catch(() => {});
      });
    }
  }, [isAuthenticated, user, id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    if (!id || !course) return;

    setIsEnrolling(true);
    try {
      if (course.price === 0) {
        await EnrollmentService.enrollFree(id);
        setIsEnrolled(true);
        navigate(`/courses/${id}/learn`);
      } else {
        const res = await PaymentService.createCheckout(id);
        if (res.data.data.free) {
          setIsEnrolled(true);
          navigate(`/courses/${id}/learn`);
        } else if (res.data.data.url) {
          window.location.href = res.data.data.url;
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Enrollment failed.';
      if (msg.toLowerCase().includes('already enrolled')) {
        setIsEnrolled(true);
        navigate(`/courses/${id}/learn`);
      } else {
        alert(msg);
      }
      setIsEnrolling(false);
    }
  };

  if (isLoading) return <Loader center />;
  if (!course) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Course not found.</div>;

  return (
    <div className="container">
      {/* Header Section */}
      <GlassPanel style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-main)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {course.category || 'Uncategorized'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{course.title}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {course.description}
          </p>
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--primary-main)" />
              <span>Created by <strong style={{ color: 'var(--text-main)' }}>{course.instructor?.firstName} {course.instructor?.lastName}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              <span><strong style={{ color: 'var(--text-main)' }}>{course.avgRating || '0.0'}</strong> ({course.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div style={{ width: '320px', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
          </h2>
          
          {isEnrolled || (isAuthenticated && user?.role === 'INSTRUCTOR' && user.id === course.instructorId) ? (
            <Button onClick={() => navigate(`/courses/${id}/learn`)} style={{ width: '100%', marginBottom: '1rem' }}>
              Go to Course
            </Button>
          ) : (
            <Button onClick={handleEnroll} isLoading={isEnrolling} style={{ width: '100%', marginBottom: '1rem' }}>
              Enroll Now
            </Button>
          )}
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>This course includes:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}><BookOpen size={16} color="var(--text-muted)" /> {lessons.length} lessons</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}><PlayCircle size={16} color="var(--text-muted)" /> On-demand video</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}><ShieldCheck size={16} color="var(--text-muted)" /> Certificate of completion</li>
            </ul>
          </div>
        </div>
      </GlassPanel>

      {/* Course Content preview */}
      <h3 style={{ marginBottom: '1.5rem' }}>Course Curriculum</h3>
      <GlassPanel style={{ padding: '2rem', marginBottom: '3rem' }}>
        {lessons.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No lessons available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons.map((lesson: any, i: number) => (
              <div key={lesson.id || lesson._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                    {i + 1}
                  </div>
                  <span>{lesson.title}</span>
                </div>
                {lesson.isFreePreview && <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>Preview available</span>}
              </div>
            ))}
          </div>
        )}
      </GlassPanel>

      {/* Reviews */}
      <h3 style={{ marginBottom: '1.5rem' }}>Student Reviews</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No reviews yet.</p>
        ) : (
          reviews.map((r: any) => (
            <GlassPanel key={r.id || r._id} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600 }}>{r.studentFirstName} {r.studentLastName}</div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#fbbf24' : 'transparent'} color={s <= r.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)'} />)}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{r.comment || 'No comment provided.'}</p>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
