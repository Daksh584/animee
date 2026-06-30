import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTopAnime, searchAnime } from '../api';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import AnimeGrid from '../components/AnimeGrid';
import LibraryCard from '../components/LibraryCard';
import Footer from '../components/Footer';

export default function HomePage({ searchQuery }) {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { history } = useAuth();
  const navigate = useNavigate();

  const loadAnime = useCallback(async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let data;
      if (searchQuery) {
        data = await searchAnime(searchQuery, pageNum);
      } else {
        data = await fetchTopAnime(pageNum);
      }

      if (append) {
        setAnimeList(prev => [...prev, ...data.data]);
      } else {
        setAnimeList(data.data);
      }
      setTotalPages(data.pagination.last_visible_page || 1);
    } catch (err) {
      console.error('Failed to load anime:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    loadAnime(1);
  }, [loadAnime, searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAnime(nextPage, true);
  };

  // Filter by search query (handled by API now, so just pass the list)
  const filteredList = animeList;

  return (
    <div>
      <HeroSection />

      <div className="content-area" id="trending">
        {!searchQuery && history.length > 0 && (
          <div className="continue-watching-section" style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2 className="section-title">🕒 Continue Watching</h2>
            </div>
            <div className="history-scroller" style={{ 
              display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem',
              scrollbarWidth: 'none' // Hide scrollbar for Firefox
            }}>
              {history.slice(0, 5).map((item, index) => (
                <div key={`${item.id}-${index}`} style={{ flex: '0 0 220px' }}>
                  <LibraryCard item={item} isHistory={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? (
              <>Results for "<span className="highlight">{searchQuery}</span>"</>
            ) : (
              <>🔥 <span className="highlight">Trending</span> Anime</>
            )}
          </h2>
        </div>

        <AnimeGrid animeList={filteredList} loading={loading} />

        {!loading && page < totalPages && (
          <div className="load-more-container">
            <button
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
