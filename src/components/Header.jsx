import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import AuthModal from './AuthModal';
import { Coffee, Building2, Info, LogOut, Shield, Sparkles, User } from 'lucide-react';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (name) => {
    if (!name) return 'U';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  };

  // Bottom nav items - conditionally include Akun
  const bottomNavItems = [
    { to: '/', icon: Coffee, label: 'Coffee' },
    { to: '/hotel', icon: Building2, label: 'Hotel' },
    { to: '/lifestyle', icon: Sparkles, label: 'Lifestyle' },
  ];
  if (user) {
    bottomNavItems.push({ to: '/account', icon: User, label: 'Akun' });
  }

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/harmonee-logo.png" alt="Harmonee" className="h-9 w-9 rounded-xl object-cover" />
              <span className="font-display text-xl text-primary tracking-tight">Harmonee</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
              <DesktopNavLink to="/" icon={Coffee} label="Coffee" />
              <DesktopNavLink to="/hotel" icon={Building2} label="Hotel" />
              <DesktopNavLink to="/lifestyle" icon={Sparkles} label="Lifestyle" />
              <DesktopNavLink to="/tentang" icon={Info} label="Tentang" />
              {isAdmin && <DesktopNavLink to="/admin" icon={Shield} label="Admin" />}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 h-10 px-3 rounded-xl bg-cream hover:bg-cream-dark transition-colors"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-[0.65rem] font-bold text-cream">
                      {initials(user.user_metadata?.full_name || user.email)}
                    </span>
                    <span className="hidden sm:block text-sm font-semibold text-primary">
                      {(user.user_metadata?.full_name || user.email).split(' ')[0]}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-56 rounded-2xl bg-white border border-border shadow-xl overflow-hidden animate-slideDown z-[300]">
                      <div className="px-4 py-3 border-b border-border-light bg-surface-alt">
                        <div className="font-semibold text-sm text-primary truncate">{user.user_metadata?.full_name || user.email.split('@')[0]}</div>
                        <div className="text-xs text-muted truncate">{user.email}</div>
                      </div>
                      <div className="py-1">
                        <Link to="/account" className="flex items-center gap-2.5 px-4 py-3 text-sm text-text-main hover:bg-surface-alt transition-colors">
                          <User size={16} className="text-muted" /> Akun Saya
                        </Link>
                        <Link to="/tentang" className="flex items-center gap-2.5 px-4 py-3 text-sm text-text-main hover:bg-surface-alt transition-colors">
                          <Info size={16} className="text-muted" /> Tentang Harmonee
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm text-text-main hover:bg-surface-alt transition-colors">
                            <Shield size={16} className="text-muted" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-accent hover:bg-red-50 transition-colors">
                          <LogOut size={16} /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="h-10 px-5 text-sm font-semibold text-cream bg-primary rounded-xl hover:bg-primary-hover active:scale-95 transition-all"
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - dynamic grid based on login state */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border safe-bottom" aria-label="Navigasi mobile">
        <div className={`grid ${user ? 'grid-cols-4' : 'grid-cols-3'} max-w-md mx-auto`}>
          {bottomNavItems.map(item => (
            <MobileNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

function DesktopNavLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
          isActive ? 'text-primary bg-cream' : 'text-text-secondary hover:text-primary hover:bg-surface-alt'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

function MobileNavLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
          isActive ? 'text-primary' : 'text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className="mt-0.5">{label}</span>
        </>
      )}
    </NavLink>
  );
}
