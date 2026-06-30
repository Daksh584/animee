import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchSeriesDetails, fetchSeasonDetails, getVideasySeriesUrl, getTmdbImageUrl } from '../tmdb';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function SeriesWatchPage() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToHistory, isEpisodeWatched } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // We need series details for the title/overview
        const seriesData = await fetchSeriesDetails(id);
        setSeries(seriesData);
        
        // We need season details for the episode list
        const seasonData = await fetchSeasonDetails(id, season);
        setEpisodes(seasonData.episodes || []);


      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id, season]);

  // Handle URL changes to scroll to top (like changing episode)
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Log to history
    if (series) {
      addToHistory({
        id,
        type: 'tv',
        title: series.name,
        poster: getTmdbImageUrl(series.poster_path),
        score: series.vote_average,
        url: `/tv/watch/${id}/${season}/${episode}`,
        episodeNumber: episode
      });
    }
  }, [id, season, episode, series]);

  if (loading) {
    return (
      <div className="watch-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading Episode...</p>
      </div>
    );
  }

  if (!series) return <div className="error">Failed to load series.</div>;

  const currentEpNum = parseInt(episode);
  const currentEpData = episodes.find(ep => ep.episode_number === currentEpNum);
  
  const hasPrev = currentEpNum > 1;
  const hasNext = currentEpNum < episodes.length;
  
  const videasyUrl = getVideasySeriesUrl(id, season, episode);

  return (
    <div className="watch-page">
      <div className="watch-container">
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

          <div className="player-controls">
            <button 
              className="btn btn-secondary"
              disabled={!hasPrev}
              onClick={() => navigate(`/tv/watch/${id}/${season}/${currentEpNum - 1}`)}
            >
              ◀ Previous
            </button>
            <button 
              className="btn btn-primary"
              disabled={!hasNext}
              onClick={() => navigate(`/tv/watch/${id}/${season}/${currentEpNum + 1}`)}
            >
              Next ▶
            </button>
          </div>

          <div className="watch-info">
            <Link to={`/tv/${id}`} className="series-back-link" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              ← Back to {series.name}
            </Link>
            <h1 className="watch-title">{series.name}</h1>
            <h2 className="watch-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Season {season} • Episode {episode} {currentEpData?.name ? `- ${currentEpData.name}` : ''}
            </h2>
            
            <div className="detail-description">
              <p>{currentEpData?.overview || series.overview}</p>
            </div>
          </div>
        </div>

        <div className="episodes-sidebar">
          <div className="episodes-sidebar-header">
            <h3>Season {season} Episodes</h3>
            <span className="episode-count">{episodes.length} Episodes</span>
          </div>
          
          <div className="episodes-sidebar-list">
            {episodes.map((ep) => {
              const isActive = ep.episode_number === currentEpNum;
              const isWatched = isEpisodeWatched(id, 'tv', ep.episode_number);
              return (
                <div 
                  key={ep.id}
                  className={`sidebar-episode ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/tv/watch/${id}/${season}/${ep.episode_number}`)}
                  style={{ opacity: (isWatched && !isActive) ? 0.6 : 1 }}
                >
                  <div className="sidebar-ep-thumb">
                    {ep.still_path ? (
                      <img src={getTmdbImageUrl(ep.still_path, 'w300')} alt={ep.name} />
                    ) : (
                      <div className="no-thumb">No Image</div>
                    )}
                    <div className="sidebar-ep-num">
                      {ep.episode_number}
                      {(isWatched && !isActive) && <span style={{ marginLeft: '4px', color: '#10b981', fontSize: '0.9rem' }}>✓</span>}
                    </div>
                    {isActive && <div className="playing-indicator">▶</div>}
                  </div>
                  <div className="sidebar-ep-info">
                    <div className="sidebar-ep-title">{ep.name}</div>
                    <div className="sidebar-ep-date">{ep.air_date ? ep.air_date.substring(0, 4) : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
