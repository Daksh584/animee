import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import LibraryCard from '../components/LibraryCard';
import Footer from '../components/Footer';

export default function LibraryPage() {
  const { history, watchlist, loading, user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState('history');

  if (loading) return null;

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <h2 style={{ marginBottom: '1rem' }}>Login Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You must be logged in to view your Library.</p>
        <button className="btn btn-primary" onClick={openAuthModal}>Sign In</button>
      </div>
    );
  }

  const items = activeTab === 'history' ? history : watchlist;

  return (
    <div>
      <HeroSection 
        title="Your Personal" 
        gradientText="Library" 
        subtitle="Pick up where you left off or find something from your watchlist."
      />

      <div className="content-area">
        <div className="library-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            🕒 Continue Watching
          </button>
          <button 
            className={`btn ${activeTab === 'watchlist' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('watchlist')}
          >
            🔖 My Watchlist
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <h2>Nothing here yet!</h2>
            <p>Start watching or add items to your watchlist to see them here.</p>
          </div>
        ) : (
          <div className="anime-grid">
            {items.map((item, index) => (
              <LibraryCard key={`${item.type}-${item.id}-${index}`} item={item} isHistory={activeTab === 'history'} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
