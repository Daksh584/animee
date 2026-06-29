import { useState, useEffect, useCallback } from 'react';
import { fetchTrendingSeries } from '../tmdb';
import HeroSection from '../components/HeroSection';
import MediaGrid from '../components/MediaGrid';
import Footer from '../components/Footer';

export default function SeriesPage({ searchQuery }) {
  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadSeries = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data = await fetchTrendingSeries(pageNum);
      
      if (append) {
        setSeries(prev => [...prev, ...data.results]);
      } else {
        setSeries(data.results);
      }
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load series:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadSeries(1);
  }, [loadSeries]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSeries(nextPage, true);
  };

  const filteredList = searchQuery
    ? series.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : series;

  return (
    <div>
      <HeroSection 
        title="Binge Your Favorite" 
        gradientText="TV Series" 
        subtitle="Explore trending TV shows and binge all seasons right here."
      />

      <div className="content-area" id="trending">
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? (
              <>Results for "<span className="highlight">{searchQuery}</span>"</>
            ) : (
              <>📺 <span className="highlight">Trending</span> Series</>
            )}
          </h2>
        </div>

        <MediaGrid items={filteredList} loading={loading} type="tv" />

        {!loading && !searchQuery && page < totalPages && (
          <div className="load-more-container">
            <button className="btn btn-primary" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
