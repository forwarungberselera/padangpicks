import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import AuthModal from './AuthModal';
import { Coffee, Hotel, LogOut, Menu, Shield, Sparkles, User, UserRoundCog, X } from 'lucide-react';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const navClass = ({ isActive }) => (
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      isActive
        ? 'text-primary bg-primary/5'
        : 'text-text-secondary hover:text-text-main hover:bg-surface-alt'
    }`
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/padangpicks-logo.png" alt="PadangPicks" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold text-lg text-text-main">PadangPicks</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
              <NavLink to="/" className={navClass}>
                <span className="flex items-center gap-1.5"><Coffee size={15} /> Coffee</span>
              </NavLink>
              <NavLink to="/hotel" className={navClass}>
                <span className="flex items-center gap-1.5"><Hotel size={15} /> Hotel</span>
              </NavLink>
              <NavLink to="/lifestyle" className={navClass}>
                <span className="flex items-center gap-1.5"><Sparkles size={15} /> Lifestyle</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  <span className="flex items-center gap-1.5"><Shield size={15} /> Admin</span>
                </NavLink>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface-alt hover:bg-border-light transition-colors"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-[0.65rem] font-bold text-white">
                      {initials(user.user_metadata?.full_name || user.email)}
                    </span>
                    <span className="hidden sm:block text-sm font-medium text-text-main">
                      {(user.user_metadata?.full_name || user.email).split(' ')[0]}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-56 rounded-xl bg-white border border-border shadow-lg overflow-hidden animate-slideDown z-[300]">
                      <div className="px-4 py-3 border-b border-border-light">
                        <div className="font-semibold text-sm text-text-main truncate">{user.user_metadata?.full_name || user.email.split('@')[0]}</div>
                        <div className="text-xs text-muted truncate">{user.email}</div>
                      </div>
                      <div className="py-1">
                        <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-surface-alt transition-colors">
                          <UserRoundCog size={15} className="text-muted" /> Akun Saya
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-surface-alt transition-colors">
                            <Shield size={15} className="text-muted" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={15} /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="h-9 px-4 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Masuk
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-surface-alt transition-colors"
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileNavOpen && (
            <nav className="md:hidden py-3 border-t border-border-light animate-slideDown">
              <div className="flex flex-col gap-1">
                <NavLink to="/" onClick={() => setMobileNavOpen(false)} className={navClass}>
                  <span className="flex items-center gap-2"><Coffee size={16} /> Coffee</span>
                </NavLink>
                <NavLink to="/hotel" onClick={() => setMobileNavOpen(false)} className={navClass}>
                  <span className="flex items-center gap-2"><Hotel size={16} /> Hotel</span>
                </NavLink>
                <NavLink to="/lifestyle" onClick={() => setMobileNavOpen(false)} className={navClass}>
                  <span className="flex items-center gap-2"><Sparkles size={16} /> Lifestyle</span>
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" onClick={() => setMobileNavOpen(false)} className={navClass}>
                    <span className="flex items-center gap-2"><Shield size={16} /> Admin</span>
                  </NavLink>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
