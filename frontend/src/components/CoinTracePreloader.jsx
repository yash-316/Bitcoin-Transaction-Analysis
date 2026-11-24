import React, { useState, useEffect, useRef } from 'react';
import { introConfig } from '../config/introConfig';
import '../styles/CoinTracePreloader.css';

export default function CoinTracePreloader({ onFinish }) {
  // Check if intro is enabled and should show
  const shouldRun = () => {
    if (!introConfig.enabled) return false;
    if (introConfig.showOnlyOnce) {
      const seen = sessionStorage.getItem('ct_preloader_seen');
      if (seen) return false;
    }
    return true;
  };

  const [active, setActive] = useState(shouldRun);
  const [fadingOut, setFadingOut] = useState(false);
  const [scene, setScene] = useState(1); // 1: Awakening, 2: Welcome, 3: Branding, 4: Transition
  const [progress, setProgress] = useState(0);
  const [typedWelcome, setTypedWelcome] = useState('');

  const canvasRef = useRef(null);
  const fullWelcomeText = "Enter the World of Blockchain Intelligence";

  // Lock body scroll while intro is visible
  useEffect(() => {
    if (!active) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [active]);

  // Handle Complete Transition
  const triggerComplete = () => {
    if (fadingOut) return;
    setFadingOut(true);
    if (introConfig.showOnlyOnce) {
      sessionStorage.setItem('ct_preloader_seen', 'true');
    }
    setTimeout(() => {
      setActive(false);
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 850);
  };

  // Keyboard Escape to Skip
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, fadingOut]);

  // Main Timeline & Progress Counter
  useEffect(() => {
    if (!active) return;

    const totalDuration = introConfig.duration || 7000;
    const startTime = Date.now();

    // Scene milestones based on proportion
    const s2Time = totalDuration * (2.0 / 7.0); // ~2000ms
    const s3Time = totalDuration * (4.0 / 7.0); // ~4000ms
    const s4Time = totalDuration * (6.0 / 7.0); // ~6000ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(currentProgress);

      if (elapsed >= s4Time) {
        setScene(4);
      } else if (elapsed >= s3Time) {
        setScene(3);
      } else if (elapsed >= s2Time) {
        setScene(2);
      } else {
        setScene(1);
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        triggerComplete();
      }
    }, 35);

    return () => clearInterval(interval);
  }, [active]);

  // Typewriter effect for Scene 2
  useEffect(() => {
    if (!active || scene < 2) return;

    let index = 0;
    setTypedWelcome('');
    const typingInterval = setInterval(() => {
      if (index <= fullWelcomeText.length) {
        setTypedWelcome(fullWelcomeText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [scene, active]);

  // Background Particle & Blockchain Network Canvas
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const particleCount = Math.min(50, Math.floor((width * height) / 25000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        color: i % 3 === 0 ? 'rgba(0, 229, 255, ' : 'rgba(37, 99, 235, ',
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className={`ct-preloader ${fadingOut ? 'ct-fading-out' : ''}`}>
      {/* Background Canvas Particles */}
      <canvas ref={canvasRef} className="ct-canvas" />

      {/* Cyber Grid & Scanning Lines */}
      <div className="ct-grid-overlay" />
      <div className="ct-scan-beam" />

      {/* Central Interactive Animation Stage */}
      <div className="ct-stage">
        {/* Scene 1: Digital Awakening (0–2s) */}
        {scene === 1 && (
          <div className="ct-awakening">
            <div className="ct-radar-pulse">
              <div className="ct-radar-ring" />
              <div className="ct-radar-ring" />
              <div className="ct-radar-core" />
            </div>
            <div className="ct-status-badge">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>Initializing Blockchain Intelligence</span>
            </div>
          </div>
        )}

        {/* Scene 2: Welcome Message (2–4s) */}
        {scene === 2 && (
          <div className="ct-welcome-wrapper">
            <span className="ct-welcome-sub">System Awakening</span>
            <h2 className="ct-welcome-title">
              {typedWelcome}
              <span className="inline-block w-2.5 h-6 ml-1 bg-[#00E5FF] animate-pulse" />
            </h2>
            <div className="ct-welcome-beam-line" />
          </div>
        )}

        {/* Scene 3: CoinTrace Branding & Scene 4: Transition (4–7s) */}
        {(scene === 3 || scene === 4) && (
          <div className="ct-branding-wrapper">
            {/* Holographic Crypto Emblem */}
            <div className="ct-logo-emblem">
              <div className="ct-emblem-ring" />
              <div className="ct-emblem-ring-inner" />
              <div className="ct-emblem-core">₿</div>
            </div>

            <h1 className="ct-brand-title">
              Coin<span>Trace</span>
            </h1>

            <div className="ct-brand-sub">
              Bitcoin Transaction Pattern Clustering
            </div>

            <div className="ct-brand-tagline">
              &ldquo;Tracing Patterns. Revealing Connections.&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Bottom Loading Progress Panel */}
      <div className="ct-footer-panel">
        <div className="ct-progress-header">
          <span>
            {scene === 1 && 'Scanning Node Topology...'}
            {scene === 2 && 'Calibrating Clustering Matrices...'}
            {scene === 3 && 'Loading Isolation Forest Trees...'}
            {scene === 4 && 'Synchronized · Launching Interface...'}
          </span>
          <span className="ct-progress-pct">{progress}%</span>
        </div>
        <div className="ct-progress-track">
          <div className="ct-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
