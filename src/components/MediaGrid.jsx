import MediaCard from './MediaCard';

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

export default function MediaGrid({ items, loading, type }) {
  if (loading && (!items || items.length === 0)) {
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
      {items.map((item, index) => {
        // If searching multi, the item has media_type. 
        // If not, we use the type prop passed in.
        const itemType = item.media_type || type;
        
        // Skip people in search results
        if (itemType === 'person') return null;

        return (
          <MediaCard key={item.id} item={item} index={index} type={itemType} />
        );
      })}
    </div>
  );
}
