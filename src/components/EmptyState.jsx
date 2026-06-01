import { Coffee, Building2, Sparkles, Search, Heart, Star } from 'lucide-react';

const ICONS = { coffee: Coffee, hotel: Building2, lifestyle: Sparkles, search: Search, heart: Heart, star: Star };

/**
 * Reusable empty state component
 * @param {string} icon - Icon key (coffee, hotel, lifestyle, search, heart, star)
 * @param {string} title - Main message
 * @param {string} description - Secondary text
 * @param {object} action - { label, onClick } for optional CTA button
 */
export default function EmptyState({ icon = 'coffee', title, description, action }) {
  const Icon = ICONS[icon] || Coffee;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary/50" />
      </div>
      <h3 className="font-display text-lg text-primary mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs leading-relaxed">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 h-10 px-5 text-sm font-semibold text-cream bg-primary rounded-xl active:scale-95 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
