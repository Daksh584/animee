const HISTORY_KEY = 'animee_history';
const WATCHLIST_KEY = 'animee_watchlist';
const MAX_HISTORY = 40;

const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const getHistory = () => load(HISTORY_KEY);

export const addToHistory = (item) => {
  let history = getHistory();
  history = history.filter(i => !(i.id == item.id && i.type === item.type));
  item.timestamp = Date.now();
  history.unshift(item);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  save(HISTORY_KEY, history);
};

export const getWatchlist = () => load(WATCHLIST_KEY);

export const isInWatchlist = (id, type) => {
  const list = getWatchlist();
  return list.some(i => i.id == id && i.type === type);
};

export const toggleWatchlist = (item) => {
  let list = getWatchlist();
  if (isInWatchlist(item.id, item.type)) {
    list = list.filter(i => !(i.id == item.id && i.type === item.type));
  } else {
    item.timestamp = Date.now();
    list.unshift(item);
  }
  save(WATCHLIST_KEY, list);
};
