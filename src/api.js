// Jikan API Base URL
const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Delay helper to respect Jikan's rate limits (3 requests per second)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTopAnime(page = 1) {
  // Jikan's top anime endpoint
  const res = await fetch(`${JIKAN_BASE}/top/anime?page=${page}&limit=20`);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  const data = await res.json();
  return data;
}

export async function searchAnime(query, page = 1) {
  const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20&sfw=true`);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  const data = await res.json();
  return data;
}

export async function fetchAnimeDetails(id) {
  const res = await fetch(`${JIKAN_BASE}/anime/${id}/full`);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  const data = await res.json();
  return data.data;
}

export async function fetchAnimeEpisodes(id, page = 1) {
  // Jikan returns episodes in pages of 100
  const res = await fetch(`${JIKAN_BASE}/anime/${id}/episodes?page=${page}`);
  if (!res.ok) {
    if (res.status === 404) return { data: [], pagination: { has_next_page: false } }; // Some anime have no episode list
    throw new Error(`Jikan API error: ${res.status}`);
  }
  const data = await res.json();
  return data;
}

// Fetch all episodes sequentially to bypass the 100 per page limit if needed
export async function fetchAllAnimeEpisodes(id) {
  let allEpisodes = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await fetchAnimeEpisodes(id, page);
    allEpisodes = allEpisodes.concat(res.data || []);
    hasNext = res.pagination?.has_next_page || false;
    if (hasNext) {
      page++;
      await delay(350); // Respect rate limit
    }
  }

  // Jikan sometimes returns episodes backwards, sort them just in case
  allEpisodes.sort((a, b) => a.mal_id - b.mal_id);
  return allEpisodes;
}

export function getMalEmbedUrl(malId, epNum, language = 'sub') {
  return `https://megaplay.buzz/stream/mal/${malId}/${epNum}/${language}`;
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
