import AnimeCard from './AnimeCard';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-info">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

export default function AnimeGrid({ animeList, loading }) {
  if (loading && (!animeList || animeList.length === 0)) {
    return (
      <div className="anime-grid">
        {Array.from({ length: 20 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="anime-grid">
      {animeList.map((anime, index) => (
        <AnimeCard key={anime.id} anime={anime} index={index} />
      ))}
    </div>
  );
}
