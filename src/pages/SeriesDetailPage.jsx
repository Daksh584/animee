import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSeriesDetails, fetchSeasonDetails, getTmdbImageUrl, getTmdbBackdropUrl, getTmdbScoreColor } from '../tmdb';
import Footer from '../components/Footer';

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchSeriesDetails(id);
        setSeries(data);
        
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
                {episodes.map(ep => (
                  <div 
                    key={ep.id} 
                    className="episode-card"
                    onClick={() => navigate(`/tv/watch/${id}/${selectedSeason}/${ep.episode_number}`)}
                  >
                    <div className="episode-thumbnail">
                      {ep.still_path ? (
                        <img src={getTmdbImageUrl(ep.still_path, 'w300')} alt={ep.name} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                      )}
                      <div className="episode-number-badge">EP {ep.episode_number}</div>
                      <div className="play-icon">▶</div>
                    </div>
                    <div className="episode-info">
                      <div className="episode-title">{ep.name}</div>
                      <div className="episode-meta">
                        {ep.air_date ? ep.air_date.substring(0, 4) : ''} • {ep.runtime || '?'}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
