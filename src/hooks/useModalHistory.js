import { useEffect, useRef } from 'react';

/**
 * Pushes a history entry when a modal opens so the browser back button
 * closes the modal instead of navigating away from the page.
 *
 * @param {boolean} isOpen   - Whether the modal is currently open
 * @param {Function} onClose - Callback to close the modal
 */
export function useModalHistory(isOpen, onClose) {
  // Track whether WE pushed the entry so we don't double-pop
  const pushed = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Push a shallow history entry with a state flag
      window.history.pushState({ modal: true }, '');
      pushed.current = true;

      const handlePop = () => {
        pushed.current = false;
        onClose();
      };

      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    } else {
      // If the modal was closed programmatically (not via back button),
      // pop the history entry we pushed so the stack stays clean.
      if (pushed.current) {
        pushed.current = false;
        window.history.back();
      }
    }
  }, [isOpen, onClose]);
}

export default useModalHistory;
