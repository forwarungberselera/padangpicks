import { useEffect, useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const defaultIntro = { enabled: true, title: 'Selamat datang di Harmonee', body: 'Harmonee adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.', buttonLabel: 'Mulai Jelajah' };

export default function SiteIntroModal() {
  const [intro, setIntro] = useState(defaultIntro);
  const [version, setVersion] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadIntro = async () => {
      let nextIntro = defaultIntro, nextVersion = 'default';
      if (supabase) {
        const { data } = await supabase.from('app_settings').select('value, updated_at').eq('key', 'intro_popup').maybeSingle();
        if (data?.value) { nextIntro = { ...defaultIntro, ...data.value }; nextVersion = data.updated_at || JSON.stringify(data.value); }
      }
      if (cancelled || !nextIntro.enabled) return;
      setIntro(nextIntro); setVersion(nextVersion);
      if (window.localStorage.getItem('harmonee_intro_seen') !== nextVersion) setIsOpen(true);
    };
    loadIntro();
    return () => { cancelled = true; };
  }, []);

  const closeIntro = () => { window.localStorage.setItem('harmonee_intro_seen', version); setIsOpen(false); };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 modal-backdrop">
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden modal-panel-bottom">
        <div className="sm:hidden pt-3 pb-1"><div className="w-10 h-1 bg-border rounded-full mx-auto" /></div>
        <button type="button" onClick={closeIntro} className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors"><X size={18} /></button>
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mb-5 modal-icon">
            <img src="/harmonee-logo.png" alt="" className="w-10 h-10 rounded-lg object-cover" />
          </div>
          <h2 className="font-display text-2xl text-primary leading-tight mb-3">{intro.title}</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">{intro.body}</p>
          <button type="button" onClick={closeIntro} className="w-full h-12 text-sm font-semibold text-cream bg-primary rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all">{intro.buttonLabel}</button>
        </div>
      </div>
    </div>
  );
}
