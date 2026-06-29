import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSeries, getScoreColor, decodeHtmlEntities } from '../api';
import Footer from '../components/Footer';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('sub');
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [currentEpPage, setCurrentEpPage] = useState(1);
  const EPS_PER_PAGE = 100;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSeries(id)
      .then(data => {
        setSeriesData(data);
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

  if (error || !seriesData) {
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

  const { anime, episodes = [] } = seriesData;
  const genres = anime.terms_by_type?.genre || [];
  const studios = anime.terms_by_type?.studios || [];
  const scoreClass = getScoreColor(anime.score);
  const description = decodeHtmlEntities(anime.description || '').replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n');
  const truncatedDesc = description.length > 400 && !showFullDesc
    ? description.substring(0, 400) + '...'
    : description;

  const bannerImage = anime.background_image || anime.poster;

  return (
    <div className="detail-page">
      {/* Banner */}
      <div className="detail-banner">
        <img src={bannerImage} alt={anime.title} />
      </div>

      <div className="detail-content">
        {/* Header: Poster + Info */}
        <div className="detail-header">
          <div className="detail-poster">
            <img src={anime.poster} alt={anime.title} />
          </div>
          <div className="detail-info">
            <h1 className="detail-title">{decodeHtmlEntities(anime.title)}</h1>
            {anime.alternative && anime.alternative !== anime.title && (
              <p className="detail-alt-title">{decodeHtmlEntities(anime.alternative)}</p>
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
                  <span className="meta-icon">⏱</span> {anime.duration} min
                </span>
              )}
              {anime.rating && (
                <span className="detail-meta-item">
                  <span className="meta-icon">🏷</span> {anime.rating}
                </span>
              )}
              {anime.is_sub > 0 && (
                <span className="detail-meta-item">
                  <span className="meta-icon">💬</span> {anime.is_sub} Sub
                </span>
              )}
              {anime.is_dub > 0 && (
                <span className="detail-meta-item">
                  <span className="meta-icon">🎙</span> {anime.is_dub} Dub
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
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <div className="episodes-section">
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
                const embedUrl = ep.embed_url?.[language];
                const isAvailable = !!embedUrl;
                return (
                  <div
                    key={ep.id}
                    className={`episode-card ${!isAvailable ? 'disabled' : ''}`}
                    onClick={() => {
                      if (isAvailable) {
                        navigate(`/watch/${id}/${ep.episode_embed_id}?lang=${language}&ep=${ep.number}`);
                      }
                    }}
                    style={{ opacity: isAvailable ? 1 : 0.4, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="episode-number">{ep.number || '?'}</div>
                    <div className="episode-info">
                      <div className="episode-title">{decodeHtmlEntities(ep.title) || `Episode ${ep.number}`}</div>
                      {ep.jp_title && (
                        <div className="episode-jp-title">{decodeHtmlEntities(ep.jp_title)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
