import { useState, useEffect, useCallback } from 'react';
import { fetchTrendingMovies } from '../tmdb';
import HeroSection from '../components/HeroSection';
import MediaGrid from '../components/MediaGrid';
import Footer from '../components/Footer';

export default function MoviesPage({ searchQuery }) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMovies = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const data = await fetchTrendingMovies(pageNum);
      
      if (append) {
        setMovies(prev => [...prev, ...data.results]);
      } else {
        setMovies(data.results);
      }
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, true);
  };

  const filteredList = searchQuery
    ? movies.filter(m => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  return (
    <div>
      <HeroSection 
        title="Stream Blockbuster" 
        gradientText="Movies For Free" 
        subtitle="Discover popular and trending movies in high quality."
      />

      <div className="content-area" id="trending">
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? (
              <>Results for "<span className="highlight">{searchQuery}</span>"</>
            ) : (
              <>🎬 <span className="highlight">Trending</span> Movies</>
            )}
          </h2>
        </div>

        <MediaGrid items={filteredList} loading={loading} type="movie" />

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
