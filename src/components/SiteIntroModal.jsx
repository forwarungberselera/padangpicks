import { useEffect, useState } from 'react';
import { Coffee, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const defaultIntro = {
  enabled: true,
  title: 'Selamat datang di PadangPicks',
  body: 'PadangPicks adalah direktori kurasi untuk menemukan coffee shop, hotel, dan lifestyle spot pilihan di Kota Padang.',
  buttonLabel: 'Mulai Jelajah',
};

export default function SiteIntroModal() {
  const [intro, setIntro] = useState(defaultIntro);
  const [version, setVersion] = useState('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadIntro = async () => {
      let nextIntro = defaultIntro;
      let nextVersion = 'default';

      if (supabase) {
        const { data } = await supabase.from('app_settings').select('value, updated_at').eq('key', 'intro_popup').maybeSingle();
        if (data?.value) {
          nextIntro = { ...defaultIntro, ...data.value };
          nextVersion = data.updated_at || JSON.stringify(data.value);
        }
      }

      if (cancelled || !nextIntro.enabled) return;
      setIntro(nextIntro);
      setVersion(nextVersion);
      const seenVersion = window.localStorage.getItem('padangpicks_intro_seen');
      if (seenVersion !== nextVersion) setIsOpen(true);
    };
    loadIntro();
    return () => { cancelled = true; };
  }, []);

  const closeIntro = () => {
    window.localStorage.setItem('padangpicks_intro_seen', version);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 modal-backdrop">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden modal-panel">
        <button
          type="button"
          onClick={closeIntro}
          className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text-main hover:bg-surface-alt transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 modal-icon">
            <Coffee size={26} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text-main leading-tight mb-3">
            {intro.title}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {intro.body}
          </p>
          <button
            type="button"
            onClick={closeIntro}
            className="w-full h-11 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            {intro.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
