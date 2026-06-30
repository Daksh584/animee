import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAnimeDetails, fetchAllAnimeEpisodes, getScoreColor, decodeHtmlEntities } from '../api';
import Footer from '../components/Footer';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('sub');
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [currentEpPage, setCurrentEpPage] = useState(1);
  const EPS_PER_PAGE = 100;

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      fetchAnimeDetails(id),
      fetchAllAnimeEpisodes(id)
    ])
      .then(([details, eps]) => {
        setAnime(details);
        // If Jikan has no episodes, inject a dummy episode 1 so it's playable
        if (eps.length === 0) {
          setEpisodes([{ mal_id: 1, title: 'Episode 1' }]);
        } else {
          setEpisodes(eps);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container" style={{ minHeight: '80vh' }}>
          <div className="spinner" />
          <span className="loading-text">Loading anime details...</span>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="detail-page">
        <div className="error-page">
          <h2>😵</h2>
          <p>Failed to load anime details. {error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const title = anime.title_english || anime.title;
  const genres = anime.genres?.map(g => g.name) || [];
  const studios = anime.studios?.map(s => s.name) || [];
  const scoreClass = getScoreColor(anime.score || 0);
  const description = decodeHtmlEntities(anime.synopsis || '').replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n');
  const truncatedDesc = description.length > 400 && !showFullDesc
    ? description.substring(0, 400) + '...'
    : description;

  const poster = anime.images?.jpg?.large_image_url;
  const bannerImage = anime.trailer?.images?.maximum_image_url || poster;

  return (
    <div className="detail-page">
      {/* Banner */}
      <div className="detail-banner">
        <img src={bannerImage} alt={title} />
      </div>

      <div className="detail-content">
        {/* Poster */}
        <div className="detail-poster">
          <img src={poster} alt={title} />
        </div>
        
        {/* Info & Episodes */}
        <div className="detail-info">
          <h1 className="detail-title">{decodeHtmlEntities(title)}</h1>
            {anime.title_japanese && anime.title_japanese !== title && (
              <p className="detail-alt-title">{decodeHtmlEntities(anime.title_japanese)}</p>
            )}

            {/* Score */}
            {parseFloat(anime.score) > 0 && (
              <div className="detail-score">
                <span className={`detail-score-value`} style={{
                  color: scoreClass === 'high' ? 'var(--score-high)' :
                         scoreClass === 'mid' ? 'var(--score-mid)' : 'var(--score-low)'
                }}>
                  ★ {anime.score}
                </span>
                <span className="detail-score-label">Score</span>
              </div>
            )}

            {/* Meta */}
            <div className="detail-meta">
              {anime.year > 0 && (
                <span className="detail-meta-item">
                  <span className="meta-icon">📅</span> {anime.year}
                </span>
              )}
              {anime.status && (
                <span className="detail-meta-item">
                  <span className="meta-icon">📺</span> {anime.status}
                </span>
              )}
              {anime.duration && (
                <span className="detail-meta-item">
                  <span className="meta-icon">⏱</span> {anime.duration}
                </span>
              )}
              {anime.rating && (
                <span className="detail-meta-item">
                  <span className="meta-icon">🏷</span> {anime.rating}
                </span>
              )}
              {studios.length > 0 && (
                <span className="detail-meta-item">
                  <span className="meta-icon">🏢</span> {studios.join(', ')}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="detail-genres">
                {genres.map(g => (
                  <span key={g} className="genre-badge">{g}</span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="detail-description">
              {truncatedDesc}
              {description.length > 400 && (
                <button
                  className="btn-ghost"
                  style={{ marginLeft: 4, color: 'var(--accent-light)', fontSize: '0.85rem' }}
                  onClick={() => setShowFullDesc(!showFullDesc)}
                >
                  {showFullDesc ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
            
            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="episodes-section" style={{ marginTop: '3rem' }}>
                <div className="episodes-header">
                  <h2>📋 Episodes ({episodes.length})</h2>
                  
                  <div className="episodes-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {episodes.length > EPS_PER_PAGE && (
                      <select 
                        className="episode-page-select"
                        value={currentEpPage}
                        onChange={(e) => setCurrentEpPage(Number(e.target.value))}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({ length: Math.ceil(episodes.length / EPS_PER_PAGE) }).map((_, idx) => {
                          const page = idx + 1;
                          const startEp = (page - 1) * EPS_PER_PAGE + 1;
                          const endEp = Math.min(page * EPS_PER_PAGE, episodes.length);
                          return (
                            <option key={page} value={page} style={{ background: '#1a1a1a' }}>
                              Episodes {startEp} - {endEp}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    <div className="lang-toggle">
                      <button
                        className={language === 'sub' ? 'active' : ''}
                        onClick={() => setLanguage('sub')}
                      >
                        SUB
                      </button>
                      <button
                        className={language === 'dub' ? 'active' : ''}
                        onClick={() => setLanguage('dub')}
                      >
                        DUB
                      </button>
                    </div>
                  </div>
                </div>
                <div className="episode-grid">
                  {episodes
                    .slice((currentEpPage - 1) * EPS_PER_PAGE, currentEpPage * EPS_PER_PAGE)
                    .map((ep) => {
                    // Determine episode number (some APIs have ep.mal_id as episode number)
                    // If it's a dummy episode it has mal_id=1. Otherwise, if the episode is valid, we'll use its mal_id as the episode number.
                    const epNum = ep.mal_id || 1;
                    return (
                      <div
                        key={epNum}
                        className="episode-card"
                        onClick={() => navigate(`/watch/${id}/${epNum}?lang=${language}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="episode-number">{epNum}</div>
                        <div className="episode-info">
                          <div className="episode-title">{decodeHtmlEntities(ep.title) || `Episode ${epNum}`}</div>
                          {ep.title_japanese && (
                            <div className="episode-jp-title">{decodeHtmlEntities(ep.title_japanese)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        </div>

      <Footer />
    </div>
  );
}
