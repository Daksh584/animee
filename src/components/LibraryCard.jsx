import { useNavigate } from 'react-router-dom';

export default function LibraryCard({ item, isHistory }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (isHistory && item.url) {
      navigate(item.url);
    } else {
      if (item.type === 'anime') navigate(`/anime/${item.id}`);
      else if (item.type === 'movie') navigate(`/movie/${item.id}`);
      else if (item.type === 'tv') navigate(`/tv/${item.id}`);
    }
  };

  const scoreClass = item.score >= 7.5 ? 'high' : item.score >= 5.5 ? 'mid' : 'low';

  return (
    <div className="anime-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="anime-card-poster">
        <img src={item.poster} alt={item.title} loading="lazy" />
        <div className="anime-card-badges">
          {item.type && <span className="badge badge-sub">{item.type.toUpperCase()}</span>}
          {item.score > 0 && (
            <span className={`badge badge-score ${scoreClass}`}>
              ★ {parseFloat(item.score).toFixed(1)}
            </span>
          )}
        </div>
        <div className="anime-card-play">
          <div className="play-icon">{isHistory ? '▶ Resume' : '▶'}</div>
        </div>
      </div>
      <div className="anime-card-info">
        <div className="anime-card-title">{item.title}</div>
        {isHistory && item.timestamp && (
          <div className="anime-card-meta">
            <span>Last watched: {new Date(item.timestamp).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
