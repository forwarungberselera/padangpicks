import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { supabase } from '../lib/supabase';
import { X, Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setError(''); setShowForgot(false); setForgotSent(false);
    setRegisterSuccess(false); setForgotEmail('');
  };

  const handleClose = () => { resetState(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        handleClose();
      } else {
        if (password.length < 6) throw new Error("Password minimal 6 karakter");
        await register(email, password, name);
        setRegisterSuccess(true);
      }
    } catch (err) { setError(err.message || 'Terjadi kesalahan.'); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!supabase || !forgotEmail) return;
    setForgotLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/account',
    });
    setForgotLoading(false);
    if (error) setError(error.message);
    else setForgotSent(true);
  };

  // Register success screen
  if (registerSuccess) {
    return (
      <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
        <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative modal-panel-bottom">
          <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 modal-icon">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="font-display text-xl text-primary mb-2">Akun Berhasil Dibuat!</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-1">
              Kami sudah mengirim email verifikasi ke:
            </p>
            <p className="text-sm font-semibold text-primary mb-4">{email}</p>
            <p className="text-xs text-muted leading-relaxed mb-6">
              Buka email dan klik link verifikasi untuk mengaktifkan akunmu. Cek juga folder spam.
            </p>
            <button onClick={handleClose} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all">
              Mengerti
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password screen
  if (showForgot) {
    return (
      <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
        <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative modal-panel-bottom">
          <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <button onClick={() => { setShowForgot(false); setError(''); setForgotSent(false); }} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors">
            <ArrowLeft size={18} />
          </button>
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors">
            <X size={18} />
          </button>

          {forgotSent ? (
            <div className="text-center py-4 mt-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 modal-icon">
                <Mail size={28} className="text-emerald-500" />
              </div>
              <h2 className="font-display text-xl text-primary mb-2">Email Terkirim!</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-1">Link reset password sudah dikirim ke:</p>
              <p className="text-sm font-semibold text-primary mb-4">{forgotEmail}</p>
              <p className="text-xs text-muted mb-6">Cek inbox dan folder spam. Link berlaku 1 jam.</p>
              <button onClick={handleClose} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all">Tutup</button>
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="font-display text-xl text-primary mb-1">Lupa Password?</h2>
              <p className="text-sm text-text-secondary mb-5">Masukkan email akunmu dan kami akan kirim link untuk reset password.</p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Email</label>
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="email@kamu.com" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                </div>
                {error && <p className="text-sm font-medium text-accent">{error}</p>}
                <button type="submit" disabled={forgotLoading} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all disabled:opacity-60">
                  {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main login/register form
  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative modal-panel-bottom">
        <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors"><X size={18} /></button>
        <div className="modal-content">
          <div className="flex bg-surface-alt p-1 rounded-xl mb-5">
            <button className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`} onClick={() => { setTab('login'); setError(''); }}>Masuk</button>
            <button className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'register' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`} onClick={() => { setTab('register'); setError(''); }}>Daftar</button>
          </div>
          <h2 className="font-display text-xl text-primary">{tab === 'login' ? 'Selamat datang' : 'Buat akun'}</h2>
          <p className="mt-1 text-sm text-text-secondary mb-5">{tab === 'login' ? 'Masuk untuk simpan favorit dan beri rating.' : 'Gratis. Simpan spot favoritmu.'}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && <div><label className="block text-sm font-medium text-text-main mb-1">Nama</label><input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /></div>}
            <div><label className="block text-sm font-medium text-text-main mb-1">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@kamu.com" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /></div>
            <div><label className="block text-sm font-medium text-text-main mb-1">Password</label><div className="relative"><input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'register' ? 'Min. 6 karakter' : '••••••••'} className="w-full h-12 px-4 pr-12 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {tab === 'login' && (
              <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); setError(''); }} className="text-xs font-medium text-primary hover:underline">
                Lupa password?
              </button>
            )}
            {error && <p className="text-sm font-medium text-accent">{error}</p>}
            <button type="submit" disabled={loading} className="w-full h-12 mt-2 text-sm font-semibold text-cream bg-primary rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60">{loading ? 'Memuat...' : (tab === 'login' ? 'Masuk' : 'Buat Akun')}</button>
          </form>
          {tab === 'register' && (
            <p className="mt-4 text-[11px] text-muted text-center leading-relaxed">
              Dengan mendaftar, kamu menyetujui <a href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</a> dan <a href="/terms" className="text-primary hover:underline">Syarat & Ketentuan</a> kami.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
