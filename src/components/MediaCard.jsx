import { useNavigate } from 'react-router-dom';
import { getTmdbImageUrl, getTmdbScoreColor } from '../tmdb';

export default function MediaCard({ item, index, type }) {
  const navigate = useNavigate();
  
  // TMDB returns vote_average out of 10.
  const score = item.vote_average ? item.vote_average.toFixed(1) : 0;
  const scoreClass = getTmdbScoreColor(score);
  
  const title = item.title || item.name;
  const poster = getTmdbImageUrl(item.poster_path, 'w500');
  
  const year = item.release_date 
    ? item.release_date.substring(0, 4) 
    : (item.first_air_date ? item.first_air_date.substring(0, 4) : '');

  const linkPath = type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;

  return (
    <div
      className="anime-card"
      style={{ animationDelay: `${(index % 20) * 0.04}s` }}
      onClick={() => navigate(linkPath)}
    >
      <div className="anime-card-poster">
        <img
          src={poster}
          alt={title}
          loading="lazy"
        />
        <div className="anime-card-badges">
          <span className="badge badge-sub" style={{ background: 'rgba(236, 72, 153, 0.7)' }}>
            {type === 'movie' ? 'MOVIE' : 'SERIES'}
          </span>
          {score > 0 && (
            <span className={`badge badge-score ${scoreClass}`}>
              ★ {score}
            </span>
          )}
        </div>
        <div className="anime-card-play">
          <div className="play-icon">▶</div>
        </div>
      </div>
      <div className="anime-card-info">
        <div className="anime-card-title">{title}</div>
        <div className="anime-card-meta">
          {year && <span>{year}</span>}
          {item.media_type && <span>• {item.media_type.toUpperCase()}</span>}
        </div>
      </div>
    </div>
  );
}
