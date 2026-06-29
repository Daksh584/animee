import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecentAnime } from '../api';
import HeroSection from '../components/HeroSection';
import AnimeGrid from '../components/AnimeGrid';
import Footer from '../components/Footer';

export default function HomePage({ searchQuery }) {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  const loadAnime = useCallback(async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const data = await fetchRecentAnime(pageNum, 20);
      if (append) {
        setAnimeList(prev => [...prev, ...data.data]);
      } else {
        setAnimeList(data.data);
      }
      setTotalPages(data.pagination.total_pages);
    } catch (err) {
      console.error('Failed to load anime:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadAnime(1);
  }, [loadAnime]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAnime(nextPage, true);
  };

  // Filter by search query
  const filteredList = searchQuery
    ? animeList.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.alternative && a.alternative.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : animeList;

  return (
    <div>
      <HeroSection />

      <div className="content-area" id="trending">
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

        {!loading && !searchQuery && page < totalPages && (
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
