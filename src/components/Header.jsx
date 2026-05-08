import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import AuthModal from './AuthModal';
import { Coffee, Hotel, LogOut, Shield, Sparkles, Star, User, UserRoundCog } from 'lucide-react';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (name) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  const accountName = user
    ? (user.user_metadata?.full_name || user.email).split(' ')[0]
    : 'Akun';

  const navClass = ({ isActive }) => (
    `inline-flex items-center justify-center gap-2 min-h-[44px] px-3 sm:px-4 rounded-2xl border text-[0.82rem] font-black uppercase tracking-wide transition-all ${
      isActive
        ? 'bg-white text-primary border-white shadow-[0_14px_28px_rgba(52,19,20,0.18)]'
        : 'bg-white/8 border-white/14 text-white/88 hover:bg-white/18 hover:border-white/30'
    }`
  );

  return (
    <>
      <header className="relative overflow-hidden bg-[#351013] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(255,255,255,0.15),transparent_26%),radial-gradient(circle_at_86%_8%,rgba(44,181,167,0.34),transparent_24%),linear-gradient(135deg,#351013_0%,#8a0f0f_42%,#ff1818_70%,#ff6a3d_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fff8f7] to-transparent" />

        <div className="relative z-10 w-[min(1180px,calc(100%-1.25rem))] sm:w-[min(1180px,calc(100%-1.5rem))] mx-auto pt-4 sm:pt-5 pb-10 sm:pb-12">
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/12 bg-white/8 p-2.5 backdrop-blur-md">
            <Link to="/" className="inline-flex items-center gap-3 text-left">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_14px_28px_rgba(52,19,20,0.18)]">
                <img src="/padangpicks-logo.png" alt="PadangPicks logo" className="h-full w-full object-cover" />
              </span>
              <span>
                <span className="block font-display text-[1.35rem] sm:text-2xl font-black leading-none tracking-[-0.02em]">PadangPicks</span>
                <span className="block text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/68">Brew Guide</span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              {user && (
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-2xl bg-white text-primary text-[0.82rem] font-black uppercase tracking-wide shadow-[0_14px_28px_rgba(0,0,0,0.12)] hover:bg-[#fff7f5] transition-colors"
                >
                  <UserRoundCog size={16} />
                  {accountName}
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-2xl bg-[#2cb5a7] text-[#082b2a] text-[0.82rem] font-black uppercase tracking-wide shadow-[0_14px_28px_rgba(0,0,0,0.16)] hover:bg-[#7ee0d6] transition-colors"
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="mt-7 sm:mt-10 grid gap-5 sm:gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-[760px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white/82 backdrop-blur-md">
                <Sparkles size={14} />
                Padang Edition
              </div>
              <h1 className="mt-5 font-display text-[clamp(2.15rem,11vw,5rem)] sm:text-[clamp(2.7rem,5.8vw,5.25rem)] leading-[1.04] tracking-[-0.025em] text-white max-w-[13ch]">
                Temukan spot ngopi yang pas untuk harimu.
              </h1>
              <p className="mt-4 max-w-[38rem] text-[0.95rem] sm:text-base font-bold leading-relaxed text-white/82">
                Kurasi coffee shop, cafe, dan tempat nongkrong favorit di Kota Padang, lengkap dengan area, harga, jam buka, dan rating komunitas.
              </p>
            </div>

            <nav className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 rounded-[24px] border border-white/16 bg-black/12 p-2 backdrop-blur-md lg:justify-end" aria-label="Navigasi utama">
              <NavLink to="/" className={navClass}>
                <Coffee size={16} />
                Coffee
              </NavLink>
              <NavLink to="/hotel" className={navClass}>
                <Hotel size={16} />
                Hotel
              </NavLink>
              <NavLink to="/lifestyle" className={navClass}>
                <Sparkles size={16} />
                Lifestyle
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `sm:hidden inline-flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-2xl border text-[0.82rem] font-black uppercase tracking-wide transition-all ${isActive ? 'bg-[#2cb5a7] text-[#082b2a] border-[#2cb5a7]' : 'bg-[#2cb5a7]/90 text-[#082b2a] border-[#2cb5a7] hover:bg-[#7ee0d6]'}`}>
                  <Shield size={16} />
                  Admin
                </NavLink>
              )}

              {user && (
                <NavLink to="/account" className={({ isActive }) => `sm:hidden inline-flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-2xl border text-[0.82rem] font-black uppercase tracking-wide transition-all ${isActive ? 'bg-white text-primary border-white' : 'bg-white/8 border-white/14 text-white/88 hover:bg-white/18 hover:border-white/30'}`}>
                  <UserRoundCog size={16} />
                  {accountName}
                </NavLink>
              )}

              <div className="relative inline-flex items-center" ref={menuRef}>
                <button
                  onClick={() => user ? setMenuOpen(!menuOpen) : setIsAuthOpen(true)}
                  className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-[44px] px-3 sm:px-4 rounded-2xl border text-[0.82rem] font-black uppercase tracking-wide transition-all whitespace-nowrap ${
                    user
                      ? 'bg-white text-primary border-white'
                      : 'bg-white/8 border-white/14 text-white/88 hover:bg-white/18 hover:border-white/30'
                  }`}
                >
                  {user ? (
                    <>
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-[0.72rem] text-white">
                        {initials(user.user_metadata?.full_name || user.email)}
                      </span>
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      <span>Masuk</span>
                    </>
                  )}
                </button>

                {menuOpen && user && (
                  <div className="absolute top-[calc(100%+10px)] right-0 min-w-[220px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-primary/10 bg-white text-text-main shadow-[0_20px_42px_rgba(52,19,20,0.18)] z-[300] animate-in slide-in-from-top-2 duration-150">
                    <div className="p-4 bg-[#fff8f7] border-b border-primary/10 text-left">
                      <div className="font-black text-[#58151c] text-sm">{user.user_metadata?.full_name || user.email.split('@')[0]}</div>
                      <div className="text-xs text-muted truncate">{user.email}</div>
                    </div>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 w-full p-3 text-sm font-black text-[#0e605b] hover:bg-[#e9fbf8] transition-colors text-left">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}

                    <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 w-full p-3 text-sm font-bold text-text-main hover:bg-[#fff0ef] hover:text-accent-dark transition-colors text-left">
                      <UserRoundCog size={16} /> Akun Saya
                    </Link>

                    <button onClick={() => setMenuOpen(false)} className="flex items-center gap-2 w-full p-3 text-sm font-bold text-text-main hover:bg-[#fff0ef] hover:text-accent-dark transition-colors text-left">
                      <Star size={16} /> Favorit Saya
                    </button>

                    <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 w-full p-3 text-sm font-bold text-red-600 border-t border-primary/5 hover:bg-[#fff0ef] transition-colors text-left">
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
