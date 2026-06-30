import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import WatchPage from './pages/WatchPage';
import MoviesPage from './pages/MoviesPage';
import MovieWatchPage from './pages/MovieWatchPage';
import SeriesPage from './pages/SeriesPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import SeriesWatchPage from './pages/SeriesWatchPage';
import LibraryPage from './pages/LibraryPage';
import RoomPage from './pages/RoomPage';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Navigate to home if on another page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <Routes>
        {/* Room Routes */}
        <Route path="/room/:roomId/:animeId/:epId" element={<RoomPage type="anime" />} />
        <Route path="/room/movie/:roomId/:movieId" element={<RoomPage type="movie" />} />
        <Route path="/room/series/:roomId/:seriesId/:seasonId/:epId" element={<RoomPage type="series" />} />
        
        <Route path="/library" element={<LibraryPage />} />
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
    </>
  );
}

export default App;
