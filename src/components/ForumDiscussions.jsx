import { useState, useEffect } from 'react';
import { fetchAnimeForum } from '../api';

export default function ForumDiscussions({ animeId, episodeNumber }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForum = async () => {
      try {
        setLoading(true);
        const data = await fetchAnimeForum(animeId);
        
        let filteredTopics = data;
        
        // If we are looking for a specific episode discussion
        if (episodeNumber) {
          // Standard MAL discussion titles usually look like: "Anime Name Episode X Discussion"
          // We look for "Episode X " or "Ep X" or "Ep. X" or something similar.
          filteredTopics = data.filter(topic => 
            new RegExp(`episode\\s+0*${episodeNumber}\\b`, 'i').test(topic.title) ||
            new RegExp(`ep\\s*\\.?\\s*0*${episodeNumber}\\b`, 'i').test(topic.title)
          );
        }

        // Fallback: If no specific episode topic is found, maybe show the top general ones, 
        // but since the user requested "only for that episode", we just show the filtered list.
        setTopics(filteredTopics.slice(0, 8));
      } catch (err) {
        console.error("Failed to load forum topics", err);
      } finally {
        setLoading(false);
      }
    };
    if (animeId) loadForum();
  }, [animeId, episodeNumber]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Discussions...</div>;
  }

  if (topics.length === 0) {
    return (
      <div className="forum-section" style={{ marginTop: '3rem', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>💬 No discussions found for this episode yet.</h2>
      </div>
    );
  }

  return (
    <div className="forum-section" style={{ marginTop: '3rem' }}>
      <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>💬 Community Discussions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {topics.map(topic => {
          const date = new Date(topic.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          
          return (
            <a 
              key={topic.mal_id} 
              href={topic.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'var(--bg-secondary)',
                padding: '1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--accent-light)' }}>{topic.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span>By <strong>{topic.author_username}</strong></span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  color: 'var(--accent-light)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap'
                }}>
                  💬 {topic.comments} Replies
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
