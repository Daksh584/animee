import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, getTmdbImageUrl, getTmdbBackdropUrl, getVideasyMovieUrl, getTmdbScoreColor } from '../tmdb';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function MovieWatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToHistory, toggleWatchlist, isInWatchlist } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMovieDetails(id);
        setMovie(data);
        setInWatchlist(isInWatchlist(data.id, 'movie'));
        
        addToHistory({
          id: data.id,
          type: 'movie',
          title: data.title,
          poster: getTmdbImageUrl(data.poster_path),
          score: data.vote_average,
          url: `/movie/${data.id}`
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="watch-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading Movie...</p>
      </div>
    );
  }

  if (!movie) {
    return <div className="error">Failed to load movie details.</div>;
  }

  const score = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const scoreClass = getTmdbScoreColor(score);
  const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
  const videasyUrl = getVideasyMovieUrl(id);

  const handleWatchlist = () => {
    if (!movie) return;
    toggleWatchlist({
      id: movie.id,
      type: 'movie',
      title: movie.title,
      poster: getTmdbImageUrl(movie.poster_path),
      score: movie.vote_average
    });
    setInWatchlist(!inWatchlist);
  };

  return (
    <div className="watch-page">
      <div className="watch-container" style={{ gridTemplateColumns: '1fr', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="player-section">
          {/* 16:9 Aspect Ratio Container for Videasy */}
          <div className="video-player-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe 
              src={videasyUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0" 
              allowFullScreen
              allow="encrypted-media"
            ></iframe>
          </div>

          <div className="watch-info" style={{ marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/movies')} style={{ marginBottom: '1.5rem' }}>
              ← Back to Movies
            </button>
            
            <div className="detail-meta-header" style={{ marginBottom: '1rem' }}>
              <h1 className="detail-title">{movie.title}</h1>
              {year && <span className="detail-year">({year})</span>}
            </div>

            <div style={{ margin: '1.5rem 0', display: 'flex', gap: '1rem' }}>
              <button 
                className={`btn ${inWatchlist ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleWatchlist}
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
              
              <button 
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '0.5rem', 
                  background: 'rgba(124, 58, 237, 0.2)', 
                  color: '#a78bfa', border: '1px solid rgba(124, 58, 237, 0.3)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold'
                }}
                title="Host Watch Party"
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.4)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)' }}
                onClick={() => {
                  const roomId = Math.random().toString(36).substring(2, 9);
                  navigate(`/room/movie/${roomId}/${movie.id}?title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(getTmdbImageUrl(movie.poster_path))}`);
                }}
              >
                👥 Host Watch Party
              </button>
            </div>

            <div className="detail-stats">
              {score !== 'N/A' && (
                <div className={`stat-box ${scoreClass}`}>
                  <span className="stat-label">TMDB</span>
                  <span className="stat-value">★ {score}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="stat-box">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">{movie.runtime}m</span>
                </div>
              )}
            </div>
            
            {movie.genres && movie.genres.length > 0 && (
              <div className="detail-genres" style={{ marginTop: '1rem' }}>
                {movie.genres.map(g => (
                  <span key={g.id} className="genre-tag">{g.name}</span>
                ))}
              </div>
            )}
            
            {movie.tagline && <h3 className="tagline" style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '1rem' }}>"{movie.tagline}"</h3>}
            
            <div className="detail-description" style={{ marginTop: '1.5rem' }}>
              <p>{movie.overview}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
