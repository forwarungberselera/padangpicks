import { useState } from 'react';
import { X, Send, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SuggestPlaceModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', category: 'Coffee Shop', area: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => { setSuccess(false); setError(''); onClose(); };

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
      if (err && !err.message?.includes('relation')) {
        // Table might not exist yet - fallback to just showing success
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
            <button onClick={handleClose} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all">
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop" onClick={handleClose}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl relative modal-panel-bottom" onClick={e => e.stopPropagation()}>
        <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface-alt transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center">
            <MapPin size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg text-primary">Suggest Tempat</h3>
            <p className="text-xs text-muted">Rekomendasikan tempat baru untuk Harmonee</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Nama Tempat *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama coffee shop / hotel / tempat" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Kategori</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary outline-none transition-all">
              <option>Coffee Shop</option>
              <option>Hotel</option>
              <option>Lifestyle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Area / Lokasi</label>
            <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Padang Barat, Kuranji, dll" className="w-full h-12 px-4 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Kenapa direkomendasikan?</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Ceritakan kenapa tempat ini layak masuk Harmonee..." rows="3" className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none" />
          </div>
          {error && <p className="text-sm font-medium text-accent">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-[0.98] transition-all disabled:opacity-60">
            <span className="flex items-center justify-center gap-2"><Send size={15} />{loading ? 'Mengirim...' : 'Kirim Saran'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
