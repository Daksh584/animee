// In dev, requests to /api/anikoto/* are proxied to https://anikotoapi.site/*
// via the Vite dev server proxy (see vite.config.js)
const ANIKOTO_BASE = '/api/anikoto';

export async function fetchRecentAnime(page = 1, perPage = 20) {
  const res = await fetch(`${ANIKOTO_BASE}/recent-anime?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error('API returned error');
  return data;
}

export async function fetchSeries(id) {
  const res = await fetch(`${ANIKOTO_BASE}/series/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error('API returned error');
  return data.data;
}

export function getEmbedUrl(episodeEmbedId, language = 'sub') {
  return `https://megaplay.buzz/stream/s-2/${episodeEmbedId}/${language}`;
}

export function getScoreColor(score) {
  const num = parseFloat(score);
  if (num >= 7.5) return 'high';
  if (num >= 5.5) return 'mid';
  return 'low';
}

export function decodeHtmlEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
