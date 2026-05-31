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
      onClose();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative modal-panel">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors"
        >
          <X size={18} />
        </button>

        <div className="modal-content">
          {/* Tabs */}
          <div className="flex bg-surface-alt p-1 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === 'login' ? 'bg-white text-text-main shadow-sm' : 'text-muted hover:text-text-secondary'}`}
              onClick={() => setTab('login')}
            >
              Masuk
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === 'register' ? 'bg-white text-text-main shadow-sm' : 'text-muted hover:text-text-secondary'}`}
              onClick={() => setTab('register')}
            >
              Daftar
            </button>
          </div>

          <h2 className="text-xl font-bold text-text-main">
            {tab === 'login' ? 'Selamat datang kembali' : 'Buat akun baru'}
          </h2>
          <p className="mt-1 text-sm text-text-secondary mb-5">
            {tab === 'login' ? 'Masuk untuk simpan favorit dan beri rating.' : 'Gratis. Simpan spot favoritmu di Padang.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'Min. 6 karakter' : '••••••••'}
                  className="w-full h-10 px-3 pr-10 text-sm border border-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {loading ? 'Memuat...' : (tab === 'login' ? 'Masuk' : 'Buat Akun')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
