import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, BookOpen } from 'lucide-react';
import api from '../utils/api';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setError('No session ID found.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/payments/verify-session', { params: { session_id: sessionId } });
        if (res.data.data.status === 'paid') {
          setCourseId(res.data.data.courseId);
        } else {
          setError('Payment not confirmed yet. Please wait a moment and refresh.');
        }
      } catch {
        setError('Could not verify payment.');
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  if (isLoading) {
    return <div className="auth-page"><span className="loader" /></div>;
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem', color: '#fca5a5' }}>Payment Issue</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            <BookOpen size={16} /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          animation: 'fadeIn 0.5s ease'
        }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You have been enrolled. Start learning right away!
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {courseId && (
            <Link to={`/courses/${courseId}/learn`} className="btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
              Start Learning
            </Link>
          )}
          <Link to="/dashboard" className="btn-secondary" style={{ display: 'inline-flex', width: 'auto' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
