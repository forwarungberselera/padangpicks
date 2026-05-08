import { useEffect, useState } from 'react';
import { Coffee, Sparkles, X } from 'lucide-react';
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
        const { data } = await supabase
          .from('app_settings')
          .select('value, updated_at')
          .eq('key', 'intro_popup')
          .maybeSingle();

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

    return () => {
      cancelled = true;
    };
  }, []);

  const closeIntro = () => {
    window.localStorage.setItem('padangpicks_intro_seen', version);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-[#201113]/72 p-0 backdrop-blur-sm sm:items-center sm:p-4 modal-backdrop">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-t-[28px] border border-white/20 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:rounded-[30px] modal-panel-bottom">
        <button
          type="button"
          onClick={closeIntro}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-2xl bg-white/14 text-white transition-colors hover:bg-white/24"
          aria-label="Tutup popup"
        >
          <X size={18} />
        </button>

        <div className="bg-[linear-gradient(135deg,#431417,#ff1818_60%,#2cb5a7)] p-6 text-white sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]">
            <Sparkles size={14} />
            PadangPicks
          </div>
          <div className="mt-6 grid h-16 w-16 place-items-center rounded-3xl bg-white text-primary shadow-[0_18px_36px_rgba(0,0,0,0.18)] modal-icon">
            <Coffee size={30} />
          </div>
          <h2 className="mt-5 font-display text-[clamp(2rem,7vw,3rem)] leading-none text-white">
            {intro.title}
          </h2>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 modal-content">
          <p className="text-sm font-bold leading-relaxed text-[#6f4749] sm:text-base">
            {intro.body}
          </p>
          <button
            type="button"
            onClick={closeIntro}
            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(255,24,24,0.22)] transition-colors hover:bg-accent-dark"
          >
            {intro.buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
