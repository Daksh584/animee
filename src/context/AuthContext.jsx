import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    // Check local storage for token on mount
    const storedToken = localStorage.getItem('animee_token');
    const storedUsername = localStorage.getItem('animee_username');
    if (storedToken && storedUsername) {
      setToken(storedToken);
      setUser(storedUsername);
      fetchLibrary(storedToken);
    } else {
      // Load legacy local storage if not logged in
      try {
        setHistory(JSON.parse(localStorage.getItem('animee_history')) || []);
        setWatchlist(JSON.parse(localStorage.getItem('animee_watchlist')) || []);
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const fetchLibrary = async (jwtToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/library`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setWatchlist(data.watchlist || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const login = (jwtToken, username) => {
    setToken(jwtToken);
    setUser(username);
    localStorage.setItem('animee_token', jwtToken);
    localStorage.setItem('animee_username', username);
    setShowAuthModal(false);
    fetchLibrary(jwtToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('animee_token');
    localStorage.removeItem('animee_username');
    
    // Clear legacy local storage library to prevent sync issues
    localStorage.removeItem('animee_history');
    localStorage.removeItem('animee_watchlist');
    setHistory([]);
    setWatchlist([]);
  };

  const addToHistory = async (item) => {
    if (!token) {
      // Fallback local storage
      let h = [...history];
      const existingIdx = h.findIndex(i => i.id == item.id && i.type === item.type);
      let watchedEpisodes = [];
      
      if (existingIdx !== -1) {
        watchedEpisodes = h[existingIdx].watchedEpisodes || [];
        h.splice(existingIdx, 1); // remove old entry
      }
      
      if (item.episodeNumber && !watchedEpisodes.includes(Number(item.episodeNumber))) {
        watchedEpisodes.push(Number(item.episodeNumber));
      }
      
      item.timestamp = Date.now();
      item.watchedEpisodes = watchedEpisodes;
      h.unshift(item);
      
      if (h.length > 40) h = h.slice(0, 40);
      setHistory(h);
      localStorage.setItem('animee_history', JSON.stringify(h));
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const h = await res.json();
        setHistory(h);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWatchlist = async (item) => {
    if (!token) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isInWatchlist = (id, type) => {
    return watchlist.some(i => i.id == id && i.type === type);
  };

  const isEpisodeWatched = (id, type, episodeNumber) => {
    const item = history.find(i => i.id == id && i.type === type);
    if (!item || !item.watchedEpisodes) return false;
    return item.watchedEpisodes.includes(Number(episodeNumber));
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, logout, 
      showAuthModal, openAuthModal, closeAuthModal,
      history, watchlist, addToHistory, toggleWatchlist, isInWatchlist, isEpisodeWatched
    }}>
      {children}
    </AuthContext.Provider>
  );
};
