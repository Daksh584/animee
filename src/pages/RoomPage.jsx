import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMalEmbedUrl } from '../api';
import { getVideasyMovieUrl, getVideasySeriesUrl } from '../tmdb';
import Footer from '../components/Footer';

const SOCKET_SERVER_URL = 'http://localhost:4000';

export default function RoomPage({ type }) {
  // Extract all possible params from all three routes
  const { roomId, animeId, epId, movieId, seriesId, seasonId } = useParams();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mediaTitle = searchParams.get('title') || 'Media';
  const posterUrl = searchParams.get('poster') || '';
  const language = searchParams.get('lang') || 'sub';

  // Determine embed URL based on type
  let embedUrl = '';
  if (type === 'anime') embedUrl = getMalEmbedUrl(animeId, epId, language);
  else if (type === 'movie') embedUrl = getVideasyMovieUrl(movieId);
  else if (type === 'series') embedUrl = getVideasySeriesUrl(seriesId, seasonId, epId);
  
  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [timestampInput, setTimestampInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  
  const [countdown, setCountdown] = useState(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!hasJoined) return;

    // 1. Connect Socket
    socketRef.current = io(SOCKET_SERVER_URL);
    
    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      socketRef.current.emit('join-room', roomId, username);
    });

    socketRef.current.on('room-state', (roomUsers) => {
      setUsers(roomUsers);
    });

    socketRef.current.on('chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('start-countdown', () => {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else if (count === 0) {
          setCountdown('GO!');
        } else {
          setCountdown(null);
          clearInterval(interval);
        }
      }, 1000);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId, hasJoined, username]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) setHasJoined(true);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    
    socketRef.current.emit('chat-message', { roomId, text: chatInput });
    setChatInput('');
  };

  const updateStatus = (status) => {
    if (socketRef.current) {
      socketRef.current.emit('status-update', { roomId, status });
    }
  };

  const startCountdown = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-countdown', roomId);
    }
  };

  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Invite link copied to clipboard!');
  };

  const handleSendTimestamp = (e) => {
    e.preventDefault();
    if (!timestampInput.trim() || !socketRef.current) return;
    
    socketRef.current.emit('chat-message', { 
      roomId, 
      text: `⏱️ I am currently at timestamp: ${timestampInput}` 
    });
    setTimestampInput('');
  };

  if (!hasJoined) {
    return (
      <div className="room-join-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '1rem', textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Join Watch Party</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter a nickname to join the room for <strong>{mediaTitle}</strong> {epId ? `(Ep ${epId})` : ''}</p>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Nickname" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#111', border: '1px solid #333', color: 'white', outline: 'none' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={!username.trim()}>Join Room</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* COUNTDOWN OVERLAY */}
      {countdown && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <h1 style={{ fontSize: '10rem', color: 'var(--accent-primary)', textShadow: '0 0 40px var(--accent-primary)', animation: 'pulse 1s infinite' }}>
            {countdown}
          </h1>
        </div>
      )}

      {/* HEADER */}
      <div className="room-header" style={{ padding: '1rem 2rem', background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {posterUrl && <img src={posterUrl} alt="Poster" style={{ height: '40px', borderRadius: '4px' }} />}
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{mediaTitle} {epId ? `- Episode ${epId}` : ''}</h1>
          </div>
        </div>
        
        <div className="room-stats" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="stat-pill" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-light)', padding: '0.4rem 0.8rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: socketConnected ? '#10b981' : '#ef4444' }}></span>
            {socketConnected ? 'Connected' : 'Connecting...'}
          </div>
          <button onClick={handleInvite} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.9rem' }}>
            🔗 Copy Invite Link
          </button>
        </div>
      </div>

      <div className="room-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* MAIN VIDEO AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', position: 'relative' }}>
          
          {/* BUFFERING OVERLAY */}
          {users.some(u => u.status === 'buffering') && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(120, 53, 15, 0.4)', zIndex: 500, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)', animation: 'pulse 2s infinite'
            }}>
              <div style={{ background: '#78350f', color: '#fbbf24', padding: '1rem 3rem', borderRadius: '2rem', fontSize: '2rem', fontWeight: 'bold', border: '2px solid #fbbf24', boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}>
                ⚠️ SOMEONE IS BUFFERING! ⚠️
              </div>
            </div>
          )}

          <div style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '1100px', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10 }}>
              <iframe 
                src={embedUrl} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen 
                title="Watch Player"
              ></iframe>
            </div>
          </div>

          {/* SYNC CONTROLS */}
          <div style={{ padding: '1rem 2rem', background: '#111', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => updateStatus('ready')} style={{ background: '#064e3b', color: '#34d399', borderColor: '#064e3b' }}>🟢 I'm Ready</button>
              <button className="btn btn-secondary" onClick={() => updateStatus('buffering')} style={{ background: '#78350f', color: '#fbbf24', borderColor: '#78350f' }}>🟡 Buffering!</button>
              <button className="btn btn-secondary" onClick={() => updateStatus('paused')} style={{ background: '#7f1d1d', color: '#f87171', borderColor: '#7f1d1d' }}>🔴 Paused</button>
            </div>

            <form onSubmit={handleSendTimestamp} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Share Time:</span>
              <input 
                type="text" 
                placeholder="e.g. 12:34" 
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                style={{ width: '90px', padding: '0.5rem', borderRadius: '0.5rem', background: '#222', border: '1px solid #444', color: 'white', outline: 'none', textAlign: 'center' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" disabled={!timestampInput.trim()}>Send</button>
            </form>

            <div>
              <button className="btn btn-primary" onClick={startCountdown} style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}>
                🚀 Start Sync Countdown
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR (Chat & Users) */}
        <div style={{ width: '350px', background: 'var(--bg-secondary)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          
          {/* USER LIST */}
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Party Members ({users.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
              {users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                  <span style={{ fontWeight: u.id === socketRef.current?.id ? 'bold' : 'normal', color: u.id === socketRef.current?.id ? 'var(--accent-primary)' : 'white' }}>
                    {u.username} {u.id === socketRef.current?.id && '(You)'}
                  </span>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '12px', 
                    background: u.status === 'ready' ? '#064e3b' : u.status === 'buffering' ? '#78350f' : u.status === 'paused' ? '#7f1d1d' : '#333',
                    color: u.status === 'ready' ? '#34d399' : u.status === 'buffering' ? '#fbbf24' : u.status === 'paused' ? '#f87171' : 'white'
                  }}>
                    {u.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT BOX */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{ 
                  alignSelf: msg.isSystem ? 'center' : (msg.senderId === socketRef.current?.id ? 'flex-end' : 'flex-start'),
                  background: msg.isSystem ? 'transparent' : (msg.senderId === socketRef.current?.id ? 'var(--accent-primary)' : '#222'),
                  color: msg.isSystem ? 'var(--text-muted)' : 'white',
                  padding: msg.isSystem ? '0' : '0.5rem 0.75rem',
                  borderRadius: msg.isSystem ? '0' : '8px',
                  maxWidth: '85%',
                  fontSize: msg.isSystem ? '0.8rem' : '0.95rem',
                  fontStyle: msg.isSystem ? 'italic' : 'normal'
                }}>
                  {!msg.isSystem && msg.senderId !== socketRef.current?.id && (
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.2rem' }}>{msg.sender}</div>
                  )}
                  <div>{msg.text}</div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
            
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '2rem', background: '#111', border: '1px solid #333', color: 'white', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', borderRadius: '2rem' }}>Send</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
