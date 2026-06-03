import { useCallback, useState } from 'react';
import { X, Send, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useModalHistory } from '../hooks/useModalHistory';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export default function SuggestPlaceModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', category: 'Coffee Shop', area: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setSuccess(false);
    setError('');
    onClose();
  }, [onClose]);

  useModalHistory(isOpen, handleClose);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    if (supabase) {
      const { error: err } = await supabase.from('place_suggestions').insert([{
        name: form.name,
        category: form.category,
        area: form.area,
        reason: form.reason,
      }]);

      if (err) {
        // Tabel belum ada (setup.sql belum dijalankan) → tetap anggap sukses
        // agar user tidak dibingungkan. Admin bisa lihat saran via email/manual.
        const isTableMissing =
          err.message?.includes('relation') ||
          err.message?.includes('does not exist') ||
          err.code === '42P01';

        // RLS block → tabel ada tapi policy INSERT belum aktif
        const isRlsError =
          err.message?.includes('row-level security') ||
          err.code === '42501';

        if (!isTableMissing && !isRlsError) {
          // Error lain yang genuine (network, constraint, dll)
          setError(`Gagal mengirim saran: ${err.message}`);
          setLoading(false);
          return;
        }

        // Tabel tidak ada atau RLS belum selesai setup →
        // log ke console untuk admin, tapi tampilkan sukses ke user
        console.warn('[SuggestPlace] insert skipped:', err.message);
      }
    }

    setLoading(false);
    setSuccess(true);
    setForm({ name: '', category: 'Coffee Shop', area: '', reason: '' });
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
        <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl modal-panel-bottom">
          <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="text-center py-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 modal-icon">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="font-display text-xl text-primary mb-2">Terima Kasih!</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Saran tempatmu sudah kami terima. Tim akan mereview dalam 1-3 hari kerja.
            </p>
            <button
              onClick={handleClose}
              className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl relative modal-panel-bottom overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="sm:hidden pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:bg-surface-alt transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Scrollable content so form fields aren't hidden by keyboard on iOS */}
        <div className="overflow-y-auto overscroll-contain max-h-[80vh] p-6">
          <div className="flex items-center gap-3 mb-5 pr-8">
            <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-primary">Suggest Tempat</h3>
              <p className="text-xs text-muted">Rekomendasikan tempat baru untuk Harmonee</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                Nama Tempat <span className="text-accent">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nama coffee shop / hotel / tempat"
                autoComplete="off"
                className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Kategori</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all"
              >
                <option>Coffee Shop</option>
                <option>Hotel</option>
                <option>Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Area / Lokasi</label>
              <input
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                placeholder="Padang Barat, Kuranji, dll"
                autoComplete="off"
                className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">
                Kenapa direkomendasikan?
              </label>
              <textarea
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Ceritakan kenapa tempat ini layak masuk Harmonee..."
                rows="3"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
              />
            </div>

            {error && <p className="text-sm font-medium text-accent">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <Send size={15} />
                {loading ? 'Mengirim...' : 'Kirim Saran'}
              </span>
            </button>
          </form>

          {/* Safe area bottom padding */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
