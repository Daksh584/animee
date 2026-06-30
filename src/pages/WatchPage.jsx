import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { fetchAnimeDetails, fetchAllAnimeEpisodes, getMalEmbedUrl, decodeHtmlEntities } from '../api';

export default function WatchPage() {
  const { id, epId: episodeNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(searchParams.get('lang') || 'sub');
  const currentEpNumber = parseInt(episodeNumber) || 1;

  const EPS_PER_PAGE = 100;
  const initialPage = Math.ceil(currentEpNumber / EPS_PER_PAGE);
  const [currentEpPage, setCurrentEpPage] = useState(initialPage || 1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAnimeDetails(id),
      fetchAllAnimeEpisodes(id)
    ])
      .then(([details, eps]) => {
        setAnime(details);
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

  const currentEpisodeIndex = useMemo(() => {
    return episodes.findIndex(ep => (ep.mal_id || 1) === currentEpNumber);
  }, [episodes, currentEpNumber]);

  const currentEpisode = episodes[currentEpisodeIndex] || null;
  const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

  const embedUrl = getMalEmbedUrl(id, currentEpNumber, language);

  const navigateToEpisode = (ep) => {
    const epNum = ep.mal_id || 1;
    navigate(`/watch/${id}/${epNum}?lang=${language}`);
  };

  if (loading) {
    return (
      <div className="watch-page">
        <div className="loading-container" style={{ minHeight: '80vh' }}>
          <div className="spinner" />
          <span className="loading-text">Loading player...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-page">
        <div className="error-page">
          <h2>😵</h2>
          <p>Failed to load. {error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const title = anime?.title_english || anime?.title;

  return (
    <div className="watch-page">
      <div className="watch-layout">
        {/* Main area */}
        <div className="watch-main">
          {/* Video player */}
          <div className="video-player-wrapper">
            <iframe
              key={`${id}-${currentEpNumber}-${language}`}
              src={embedUrl}
              title={`${title} Episode ${currentEpNumber}`}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>

          {/* Info below player */}
          <div className="watch-info">
            <Link to={`/anime/${id}`} style={{ textDecoration: 'none' }}>
              <h1 className="watch-title" style={{ cursor: 'pointer' }}>
                {decodeHtmlEntities(title)}
              </h1>
            </Link>
            <p className="watch-episode-title">
              Episode {currentEpNumber}
              {currentEpisode?.title && ` — ${decodeHtmlEntities(currentEpisode.title)}`}
            </p>

            {/* Controls */}
            <div className="watch-controls">
              <button
                className="watch-nav-btn"
                disabled={!prevEpisode}
                onClick={() => prevEpisode && navigateToEpisode(prevEpisode)}
              >
                ◀ Previous
              </button>
              <button
                className="watch-nav-btn"
                disabled={!nextEpisode}
                onClick={() => nextEpisode && navigateToEpisode(nextEpisode)}
              >
                Next ▶
              </button>

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

            {/* Description */}
            {anime?.synopsis && (
              <div className="watch-description">
                {decodeHtmlEntities(anime.synopsis).replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n').substring(0, 500)}
                {anime.synopsis.length > 500 ? '...' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Episode list */}
        <div className="watch-sidebar">
          <div className="watch-sidebar-header">
            <h3>Episodes ({episodes.length})</h3>
            <div className="watch-sidebar-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <div className="lang-toggle" style={{ transform: 'scale(0.85)', margin: '0' }}>
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

              {episodes.length > EPS_PER_PAGE && (
                <select
                  className="episode-page-select"
                  value={currentEpPage}
                  onChange={(e) => setCurrentEpPage(Number(e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.4rem',
                    borderRadius: '0.4rem',
                    outline: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    width: '100%'
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
            </div>
          </div>
          <div className="watch-sidebar-list">
            {episodes
              .slice((currentEpPage - 1) * EPS_PER_PAGE, currentEpPage * EPS_PER_PAGE)
              .map((ep) => {
                const epNum = ep.mal_id || 1;
                const isActive = epNum === currentEpNumber;
                return (
                  <div
                    key={epNum}
                    className={`watch-ep-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigateToEpisode(ep)}
                  >
                    <span className="watch-ep-num">{epNum}</span>
                    <span className="watch-ep-title">
                      {decodeHtmlEntities(ep.title) || `Episode ${epNum}`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
