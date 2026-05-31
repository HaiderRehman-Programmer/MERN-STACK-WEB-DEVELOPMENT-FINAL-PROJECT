import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';
import GlassPanel from '../components/ui/GlassPanel';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <GlassPanel className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--primary-color)' }} />
            <h1>Verifying...</h1>
            <p className="text-muted">Please wait while we activate your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--success-color)' }} />
            <h1>Email Verified!</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>{message}</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--error-color)' }} />
            <h1>Verification Failed</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>{message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login" className="btn-secondary">Back to Login</Link>
              <Link to="/register" className="btn-primary">Try Signing Up Again</Link>
            </div>
          </>
        )}
      </GlassPanel>
    </div>
  );
};

export default VerifyEmail;
