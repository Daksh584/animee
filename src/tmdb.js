const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const VIDEASY_COLOR = '8B5CF6'; // Brand purple

// Helper for fetching
async function fetchTmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

// ----------------------------------------------------------------------
// Image Helpers
// ----------------------------------------------------------------------
export function getTmdbImageUrl(path, size = 'w500') {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getTmdbBackdropUrl(path, size = 'original') {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ----------------------------------------------------------------------
// Fetching Data
// ----------------------------------------------------------------------
export async function fetchTrendingMovies(page = 1) {
  return fetchTmdb('/trending/movie/week', { page });
}

export async function fetchTrendingSeries(page = 1) {
  return fetchTmdb('/trending/tv/week', { page });
}

export async function fetchMovieDetails(id) {
  return fetchTmdb(`/movie/${id}`, { append_to_response: 'credits,videos' });
}

export async function fetchSeriesDetails(id) {
  return fetchTmdb(`/tv/${id}`, { append_to_response: 'credits,videos' });
}

export async function fetchSeasonDetails(seriesId, seasonNumber) {
  return fetchTmdb(`/tv/${seriesId}/season/${seasonNumber}`);
}

export async function searchMulti(query, page = 1) {
  return fetchTmdb('/search/multi', { query, page });
}

// ----------------------------------------------------------------------
// Videasy Player URLs
// ----------------------------------------------------------------------
export function getVideasyMovieUrl(tmdbId) {
  return `https://player.videasy.net/movie/${tmdbId}?color=${VIDEASY_COLOR}`;
}

export function getVideasySeriesUrl(tmdbId, season, episode) {
  return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=${VIDEASY_COLOR}`;
}

// Helper to get consistent score color logic
export function getTmdbScoreColor(score) {
  const num = parseFloat(score);
  if (num >= 7.5) return 'high';
  if (num >= 5.5) return 'mid';
  if (num > 0) return 'low';
  return '';
}
