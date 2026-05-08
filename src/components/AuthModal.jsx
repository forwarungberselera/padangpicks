import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { X, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (password.length < 6) throw new Error("Password minimal 6 karakter");
        await register(email, password, name);
      }
      onClose(); // Close on success
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[400] flex items-center justify-center p-4 backdrop-blur-sm modal-backdrop">
      <div className="bg-[#fffcfc] rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative border border-primary/10 modal-panel">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="modal-content">
        {/* Tabs */}
        <div className="flex gap-1 bg-primary/5 p-1 rounded-2xl mb-6">
          <button 
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:bg-white/50'}`}
            onClick={() => setTab('login')}
          >
            Masuk
          </button>
          <button 
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${tab === 'register' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:bg-white/50'}`}
            onClick={() => setTab('register')}
          >
            Daftar
          </button>
        </div>

        <h2 className="font-display text-2xl text-[#58151c] leading-tight mb-1">
          {tab === 'login' ? 'Selamat datang kembali!' : 'Buat akun PadangPicks'}
        </h2>
        <p className="text-sm text-muted font-bold mb-5">
          {tab === 'login' ? 'Masuk untuk simpan favorit dan fitur eksklusif.' : 'Gratis. Simpan rekomendasi spot favoritmu.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-bold text-[#58151c] mb-1">Nama</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkapmu"
                className="w-full p-3 border-2 border-primary/10 rounded-xl bg-white/90 focus:border-primary/50 focus:ring-4 focus:ring-accent/10 outline-none transition-all font-semibold"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#58151c] mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              className="w-full p-3 border-2 border-primary/10 rounded-xl bg-white/90 focus:border-primary/50 focus:ring-4 focus:ring-accent/10 outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#58151c] mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPass ? 'text' : 'password'} 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Min. 6 karakter' : '********'}
                className="w-full p-3 pr-12 border-2 border-primary/10 rounded-xl bg-white/90 focus:border-primary/50 focus:ring-4 focus:ring-accent/10 outline-none transition-all font-semibold"
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted p-1"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold mt-1">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 p-3.5 rounded-xl bg-gradient-to-br from-primary to-accent text-white font-black shadow-[0_10px_24px_rgba(255,51,0,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(255,51,0,0.34)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Memuat...' : (tab === 'login' ? 'Masuk' : 'Buat Akun')}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
