import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', form);

      // Store the access token in memory for future API calls
      const { accessToken } = res.data.data;
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Hydrate global auth state from the server
      await checkAuth();
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="glass-panel auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to continue your journey.</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            className="premium-input"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="premium-input"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? <span className="loader" /> : <><LogIn size={18} /> Sign In</>}
        </button>

        <div className="auth-footer" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Forgot Password?</Link>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
