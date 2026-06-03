import { useEffect } from 'react';

const BASE_TITLE = 'Harmonee';

/**
 * Hook to dynamically set page title
 * @param {string} title - Page title (will be appended to base title)
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}

export default usePageTitle;
