import { useState, useRef, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Optimized image component with:
 * - Lazy loading via IntersectionObserver
 * - Blur-up placeholder
 * - Error fallback
 * - Fade-in animation on load
 */
export default function OptimizedImage({ src, alt, className = '', fallbackClass = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  if (error || !src) {
    return (
      <div ref={imgRef} className={`flex items-center justify-center bg-cream ${fallbackClass || className}`}>
        <ImageOff size={24} className="text-primary/30" />
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-cream ${className}`}>
      {inView && (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {/* Placeholder while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-cream animate-pulse" />
      )}
    </div>
  );
}
