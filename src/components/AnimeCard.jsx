import { useNavigate } from 'react-router-dom';
import { getScoreColor } from '../api';

export default function AnimeCard({ anime, index }) {
  const navigate = useNavigate();
  const score = parseFloat(anime.score) || 0;
  const scoreClass = getScoreColor(anime.score);
  
  const title = anime.title_english || anime.title;
  const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <div
      className="anime-card"
      style={{ animationDelay: `${(index % 20) * 0.04}s` }}
      onClick={() => navigate(`/anime/${anime.mal_id}`)}
      id={`anime-card-${anime.mal_id}`}
    >
      <div className="anime-card-poster">
        <img
          src={poster}
          alt={title}
          loading="lazy"
        />
        <div className="anime-card-badges">
          {anime.type && <span className="badge badge-sub">{anime.type}</span>}
          {score > 0 && (
            <span className={`badge badge-score ${scoreClass}`}>
              ★ {score.toFixed(1)}
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
          {anime.year > 0 && <span>{anime.year}</span>}
          {anime.episodes > 0 && <span>• {anime.episodes} Eps</span>}
        </div>
      </div>
    </div>
  );
}
