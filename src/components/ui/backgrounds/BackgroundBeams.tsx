'use client';

import { useEffect, useRef } from 'react';

/**
 * Aceternity-style animated background beams.
 * SVG paths with crimson/purple glow traveling along them.
 */
export default function BackgroundBeams() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Animate beam opacities for a living background feel
    const paths = svgRef.current?.querySelectorAll('.beam-path');
    if (!paths) return;

    const intervals: ReturnType<typeof setInterval>[] = [];
    paths.forEach((path, i) => {
      const el = path as SVGPathElement;
      const delay = i * 800;
      const interval = setInterval(() => {
        el.style.opacity = '0.6';
        setTimeout(() => {
          el.style.opacity = '0.15';
        }, 2000);
      }, 4000 + delay);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
            <stop offset="50%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffd700" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
          </linearGradient>
          <filter id="beam-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Crimson beams */}
        <path
          className="beam-path"
          d="M-100 200 Q400 100 800 300 T1600 200 T2100 400"
          stroke="url(#beam1)"
          strokeWidth="2"
          fill="none"
          filter="url(#beam-blur)"
          style={{ opacity: 0.15, transition: 'opacity 2s ease' }}
        />
        <path
          className="beam-path"
          d="M-50 600 Q300 500 700 700 T1400 500 T2000 700"
          stroke="url(#beam1)"
          strokeWidth="1.5"
          fill="none"
          filter="url(#beam-blur)"
          style={{ opacity: 0.1, transition: 'opacity 2s ease' }}
        />

        {/* Purple beams */}
        <path
          className="beam-path"
          d="M2000 100 Q1500 300 1000 150 T200 350 T-100 200"
          stroke="url(#beam2)"
          strokeWidth="1.5"
          fill="none"
          filter="url(#beam-blur)"
          style={{ opacity: 0.12, transition: 'opacity 2s ease' }}
        />
        <path
          className="beam-path"
          d="M1920 800 Q1200 700 800 900 T100 750 T-100 900"
          stroke="url(#beam2)"
          strokeWidth="2"
          fill="none"
          filter="url(#beam-blur)"
          style={{ opacity: 0.1, transition: 'opacity 2s ease' }}
        />

        {/* Gold beams */}
        <path
          className="beam-path"
          d="M960 -50 Q800 300 960 500 T960 900 T960 1150"
          stroke="url(#beam3)"
          strokeWidth="1"
          fill="none"
          filter="url(#beam-blur)"
          style={{ opacity: 0.08, transition: 'opacity 2s ease' }}
        />
      </svg>

      {/* Ambient gradients */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)',
          transform: 'translate(20%, 20%)',
        }}
      />
    </div>
  );
}
