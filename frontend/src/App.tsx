import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LogOut, Layout, Menu, X, User as UserIcon } from 'lucide-react';
import Magnetic from './components/ui/Magnetic';
import Button from './components/ui/Button';
import { ASSET_URL } from './utils/api';

import AppRoutes from './routes/AppRoutes';

/* ---- Navigation Component ---- */

const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Browse', path: '/courses' },
    { name: 'About', path: '/about' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    ...(user?.role === 'INSTRUCTOR' ? [{ name: 'Teaching', path: '/instructor' }] : []),
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <nav className="navbar glass-panel sticky-nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><Layout size={20} /></div>
          <span>LMS</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="nav-links desktop-only">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="nav-link">{link.name}</Link>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="profile-link" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="nav-avatar" style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', 
                  background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {user?.avatarUrl ? (
                    <img src={`${ASSET_URL}/${user.avatarUrl}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
                <span>{user?.firstName}</span>
              </Link>
              <Magnetic amount={0.1}>
                <button 
                  className="btn-secondary" 
                  onClick={logout}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50px' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </Magnetic>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Magnetic amount={0.1}>
                <Link to="/register">
                  <Button size="sm" style={{ borderRadius: '50px' }}>Join Now</Button>
                </Link>
              </Magnetic>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu glass-panel mobile-only">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              {link.name}
            </Link>
          ))}
          <hr />
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
              <button className="btn-secondary" onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

/* ---- Root App ---- */

const App: React.FC = () => {
  return (
    <>
      <Navigation />
      <main className="main-content">
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
