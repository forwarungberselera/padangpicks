import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination component.
 *
 * Props:
 *  - currentPage  {number}   1-based current page
 *  - totalPages   {number}   total number of pages
 *  - onPageChange {Function} called with the new page number
 *  - totalItems   {number}   (optional) total item count, shown in summary
 *  - pageSize     {number}   (optional) items per page, shown in summary
 */
export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalItems);

  // Build page number array with ellipsis
  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 mt-8 mb-2 select-none">
      {/* Summary text */}
      {totalItems != null && pageSize != null && (
        <p className="text-xs text-muted">
          Menampilkan <span className="font-semibold text-text-main">{from}–{to}</span> dari{' '}
          <span className="font-semibold text-text-main">{totalItems}</span> tempat
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </NavButton>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-label={`Halaman ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all active:scale-95 ${
                p === currentPage
                  ? 'bg-primary text-cream shadow-sm'
                  : 'bg-white border border-border text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({ children, disabled, onClick, 'aria-label': ariaLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition-all active:scale-95 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
    >
      {children}
    </button>
  );
}

/**
 * Returns an array like [1, 2, '…', 7, 8, 9, '…', 20]
 * Always shows first, last, current ±1, with ellipsis gaps.
 */
function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}
