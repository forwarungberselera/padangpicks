import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 md:bottom-8 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-primary text-cream shadow-lg active:scale-90 transition-all animate-fadeIn"
      aria-label="Kembali ke atas"
    >
      <ChevronUp size={20} />
    </button>
  );
}
