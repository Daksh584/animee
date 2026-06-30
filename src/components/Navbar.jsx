import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function Navbar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, showAuthModal, openAuthModal, closeAuthModal, login, logout } = useAuth();
  
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      login(data.token, data.username);
      setAuthForm({ username: '', password: '' });
      closeAuthModal();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <Link to="/" className="nav-logo" onClick={handleClearSearch}>
            <div className="logo-icon">A</div>
            <span>Animee</span>
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', marginLeft: '2rem', marginRight: 'auto' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={handleClearSearch}>Anime</Link>
            <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`} onClick={handleClearSearch}>Movies</Link>
            <Link to="/series" className={`nav-link ${location.pathname === '/series' ? 'active' : ''}`} onClick={handleClearSearch}>Series</Link>
            {user && <Link to="/library" className={`nav-link ${location.pathname === '/library' ? 'active' : ''}`} onClick={handleClearSearch} style={{ color: 'var(--accent-primary)' }}>My Library</Link>}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <form className="nav-search" onSubmit={handleSubmit} style={{ margin: 0 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            {user ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>{user}</span>
                <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={openAuthModal}>Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{authTab === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button onClick={closeAuthModal} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                className={`btn ${authTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
              >Login</button>
              <button 
                className={`btn ${authTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
              >Register</button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Username" 
                value={authForm.username}
                onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', outline: 'none' }}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', outline: 'none' }}
                required
              />
              
              {authError && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{authError}</div>}
              
              <button type="submit" className="btn btn-primary" disabled={authLoading}>
                {authLoading ? 'Loading...' : (authTab === 'login' ? 'Sign In' : 'Sign Up')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
