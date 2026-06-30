import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSeriesDetails, fetchSeasonDetails, getTmdbImageUrl, getTmdbBackdropUrl, getTmdbScoreColor } from '../tmdb';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist, isEpisodeWatched } = useAuth();
  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSeriesDetails(id);
        setSeries(data);
        setInWatchlist(isInWatchlist(data.id, 'tv'));
        
        // Find default season (usually season 1, but sometimes 0 is specials)
        const defaultSeason = data.seasons.find(s => s.season_number > 0)?.season_number || 1;
        setSelectedSeason(defaultSeason);
        
        // Load episodes for default season
        loadSeason(id, defaultSeason);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  const loadSeason = async (seriesId, seasonNum) => {
    try {
      setLoadingEpisodes(true);
      const data = await fetchSeasonDetails(seriesId, seasonNum);
      setEpisodes(data.episodes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleSeasonChange = (e) => {
    const seasonNum = parseInt(e.target.value);
    setSelectedSeason(seasonNum);
    loadSeason(id, seasonNum);
  };

  if (loading) {
    return (
      <div className="watch-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading Series...</p>
      </div>
    );
  }

  if (!series) return <div className="error">Failed to load series details.</div>;

  const score = series.vote_average ? series.vote_average.toFixed(1) : 'N/A';
  const scoreClass = getTmdbScoreColor(score);
  const year = series.first_air_date ? series.first_air_date.substring(0, 4) : '';
  const backdropUrl = getTmdbBackdropUrl(series.backdrop_path);
  const posterUrl = getTmdbImageUrl(series.poster_path);

  const handleWatchlist = () => {
    if (!series) return;
    toggleWatchlist({
      id: series.id,
      type: 'tv',
      title: series.name,
      poster: getTmdbImageUrl(series.poster_path),
      score: series.vote_average
    });
    setInWatchlist(!inWatchlist);
  };

  return (
    <div className="detail-page">
      <div 
        className="detail-banner"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="detail-banner-overlay"></div>
      </div>

      <div className="detail-content content-area">
        <div className="detail-sidebar">
          <img src={posterUrl} alt={series.name} className="detail-poster" />
          <div className="detail-stats">
            {score !== 'N/A' && (
              <div className={`stat-box ${scoreClass}`}>
                <span className="stat-label">TMDB</span>
                <span className="stat-value">★ {score}</span>
              </div>
            )}
            <div className="stat-box">
              <span className="stat-label">Status</span>
              <span className="stat-value">{series.status}</span>
            </div>
            {series.number_of_seasons && (
              <div className="stat-box">
                <span className="stat-label">Seasons</span>
                <span className="stat-value">{series.number_of_seasons}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-main">
          <div className="detail-meta-header">
            <h1 className="detail-title">{series.name}</h1>
            {year && <span className="detail-year">({year})</span>}
          </div>

          <div className="detail-genres">
            {series.genres?.map(g => (
              <span key={g.id} className="genre-tag">{g.name}</span>
            ))}
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <button 
              className={`btn ${inWatchlist ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={handleWatchlist}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          </div>

          <div className="detail-description">
            <p>{series.overview}</p>
          </div>

          <div className="episodes-section">
            <div className="episodes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="section-title">Episodes</h2>
              
              <select 
                className="season-selector"
                value={selectedSeason}
                onChange={handleSeasonChange}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {series.seasons?.filter(s => s.season_number > 0).map(season => (
                  <option key={season.id} value={season.season_number} style={{ background: '#0a0a0a' }}>
                    Season {season.season_number}
                  </option>
                ))}
              </select>
            </div>

            {loadingEpisodes ? (
              <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
            ) : (
              <div className="episodes-grid">
                {episodes.map(ep => {
                  const isWatched = isEpisodeWatched(id, selectedSeason, ep.episode_number);
                  return (
                  <div 
                    key={ep.id} 
                    className="episode-card"
                    onClick={() => navigate(`/tv/watch/${id}/${selectedSeason}/${ep.episode_number}`)}
                    style={{ opacity: isWatched ? 0.7 : 1 }}
                  >
                    <div className="episode-thumbnail">
                      {ep.still_path ? (
                        <img src={getTmdbImageUrl(ep.still_path, 'w300')} alt={ep.name} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                      )}
                      <div className="episode-number-badge">
                        EP {ep.episode_number}
                        {isWatched && <span style={{ marginLeft: '4px', color: '#10b981' }}>✓</span>}
                      </div>
                      <div className="play-icon">▶</div>
                    </div>
                    <div className="episode-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div className="episode-title">{ep.name}</div>
                        <div className="episode-meta">
                          {ep.air_date ? ep.air_date.substring(0, 4) : ''} • {ep.runtime || '?'}m
                        </div>
                      </div>
                      
                      <button 
                        style={{ 
                          padding: '0.5rem', borderRadius: '50%', 
                          background: 'rgba(124, 58, 237, 0.2)', 
                          color: '#a78bfa', border: '1px solid rgba(124, 58, 237, 0.3)', 
                          zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s', marginRight: '1rem'
                        }}
                        title="Host Watch Party"
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.4)' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)' }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click
                          const roomId = Math.random().toString(36).substring(2, 9);
                          navigate(`/room/series/${roomId}/${series.id}/${selectedSeason}/${ep.episode_number}?title=${encodeURIComponent(series.name)}&poster=${encodeURIComponent(getTmdbImageUrl(series.poster_path))}`);
                        }}
                      >
                        👥
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
