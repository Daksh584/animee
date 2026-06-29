import { useState, useEffect } from 'react';

/* Floating animated shape — inspired by Kokonut UI's ElegantShape */
function FloatingShape({ delay = 0, width, height, rotate, gradient, className }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`floating-shape ${className || ''} ${visible ? 'visible' : ''}`}
      style={{
        '--shape-w': `${width}px`,
        '--shape-h': `${height}px`,
        '--shape-rotate': `${rotate}deg`,
        '--shape-delay': `${delay}s`,
      }}
    >
      <div className="floating-shape-inner">
        <div className={`floating-shape-body ${gradient || ''}`} />
      </div>
    </div>
  );
}

/* Animated counter for stats */
function AnimatedStat({ value, label, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`hero-stat ${isVisible ? 'visible' : ''}`}>
      <div className="hero-stat-value">{value}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

export default function HeroSection({ title, gradientText, subtitle }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg">
        {/* Animated floating shapes */}
        <div className="hero-shapes">
          <FloatingShape delay={0.3} width={500} height={120} rotate={12} gradient="shape-purple" className="shape-1" />
          <FloatingShape delay={0.5} width={400} height={100} rotate={-15} gradient="shape-pink" className="shape-2" />
          <FloatingShape delay={0.4} width={250} height={70} rotate={-8} gradient="shape-violet" className="shape-3" />
          <FloatingShape delay={0.6} width={180} height={50} rotate={20} gradient="shape-cyan" className="shape-4" />
          <FloatingShape delay={0.7} width={120} height={35} rotate={-25} gradient="shape-amber" className="shape-5" />
        </div>
        
        {/* Particle field */}
        <div className="hero-particles">
          {Array.from({ length: 20 }, (_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className={`hero-content ${loaded ? 'loaded' : ''}`}>
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          🔥 Your Entertainment Universe
        </div>
        <h1>
          {title || 'Stream Your Favorite'}<br />
          <span className="gradient-text">{gradientText || 'Anime For Free'}</span>
        </h1>
        <p className="hero-subtitle">
          {subtitle || 'Discover thousands of anime series with both sub and dub options. Start watching instantly — no sign-up, no hassle.'}
        </p>
        <div className="hero-actions">
          <button 
            className="btn btn-primary btn-glow" 
            onClick={() => {
              document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="btn-shine" />
            ▶ Start Watching
          </button>
          <button 
            className="btn btn-secondary btn-glass"
            onClick={() => {
              document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Browse Library
          </button>
        </div>
        <div className="hero-stats">
          <AnimatedStat value="10K+" label="Anime Titles" delay={0.6} />
          <AnimatedStat value="HD" label="Quality" delay={0.8} />
          <AnimatedStat value="Free" label="Forever" delay={1.0} />
        </div>
      </div>
    </section>
  );
}
