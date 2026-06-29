import { useNavigate } from 'react-router-dom';
import { getScoreColor } from '../api';

export default function AnimeCard({ anime, index }) {
  const navigate = useNavigate();
  const score = parseFloat(anime.score);
  const scoreClass = getScoreColor(anime.score);

  return (
    <div
      className="anime-card"
      style={{ animationDelay: `${(index % 20) * 0.04}s` }}
      onClick={() => navigate(`/anime/${anime.id}`)}
      id={`anime-card-${anime.id}`}
    >
      <div className="anime-card-poster">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
        />
        <div className="anime-card-badges">
          {anime.is_sub > 0 && <span className="badge badge-sub">SUB</span>}
          {anime.is_dub > 0 && <span className="badge badge-dub">DUB</span>}
          {score > 0 && (
            <span className={`badge badge-score ${scoreClass}`}>
              ★ {anime.score}
            </span>
          )}
        </div>
        <div className="anime-card-play">
          <div className="play-icon">▶</div>
        </div>
      </div>
      <div className="anime-card-info">
        <div className="anime-card-title">{anime.title}</div>
        <div className="anime-card-meta">
          {anime.year > 0 && <span>{anime.year}</span>}
          {anime.status && <span>• {anime.status}</span>}
        </div>
      </div>
    </div>
  );
}
