import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import WatchPage from './pages/WatchPage';
import MoviesPage from './pages/MoviesPage';
import MovieWatchPage from './pages/MovieWatchPage';
import SeriesPage from './pages/SeriesPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import SeriesWatchPage from './pages/SeriesWatchPage';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Navigate to home if on another page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Router>
      <Navbar onSearch={handleSearch} />
      <Routes>
        {/* Anime Routes */}
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/watch/:id/:epId" element={<WatchPage />} />

        {/* Movies Routes */}
        <Route path="/movies" element={<MoviesPage searchQuery={searchQuery} />} />
        <Route path="/movie/:id" element={<MovieWatchPage />} />

        {/* Series Routes */}
        <Route path="/series" element={<SeriesPage searchQuery={searchQuery} />} />
        <Route path="/tv/:id" element={<SeriesDetailPage />} />
        <Route path="/tv/watch/:id/:season/:episode" element={<SeriesWatchPage />} />

        <Route path="*" element={
          <div className="detail-page">
            <div className="error-page">
              <h2>404</h2>
              <p>Page not found</p>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
