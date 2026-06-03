import { useEffect } from 'react';

/**
 * Locks body scroll while a modal/overlay is open.
 * Saves and restores the scroll position so the page
 * doesn't jump on iOS where position:fixed is needed.
 *
 * @param {boolean} isLocked - Whether the scroll should be locked
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = originalStyle.overflow;
    const originalPosition = originalStyle.position;

    // iOS Safari fix: use position fixed with top offset
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore scroll position
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
