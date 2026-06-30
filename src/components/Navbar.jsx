import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  return (
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
        </div>
        <form className="nav-search" onSubmit={handleSubmit}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            id="search-input"
          />
        </form>
      </div>
    </nav>
  );
}
