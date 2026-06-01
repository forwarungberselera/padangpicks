import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { X, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (tab === 'login') await login(email, password);
      else { if (password.length < 6) throw new Error("Password minimal 6 karakter"); await register(email, password, name); }
      onClose();
    } catch (err) { setError(err.message || 'Terjadi kesalahan.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative modal-panel-bottom">
        <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors"><X size={18} /></button>
        <div className="modal-content">
          <div className="flex bg-surface-alt p-1 rounded-xl mb-5">
            <button className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`} onClick={() => setTab('login')}>Masuk</button>
            <button className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'register' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`} onClick={() => setTab('register')}>Daftar</button>
          </div>
          <h2 className="font-display text-xl text-primary">{tab === 'login' ? 'Selamat datang' : 'Buat akun'}</h2>
          <p className="mt-1 text-sm text-text-secondary mb-5">{tab === 'login' ? 'Masuk untuk simpan favorit dan beri rating.' : 'Gratis. Simpan spot favoritmu.'}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && <div><label className="block text-sm font-medium text-text-main mb-1">Nama</label><input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /></div>}
            <div><label className="block text-sm font-medium text-text-main mb-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@kamu.com" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /></div>
            <div><label className="block text-sm font-medium text-text-main mb-1">Password</label><div className="relative"><input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'register' ? 'Min. 6 karakter' : '••••••••'} className="w-full h-12 px-4 pr-12 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {error && <p className="text-sm font-medium text-accent">{error}</p>}
            <button type="submit" disabled={loading} className="w-full h-12 mt-2 text-sm font-semibold text-cream bg-primary rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60">{loading ? 'Memuat...' : (tab === 'login' ? 'Masuk' : 'Buat Akun')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
