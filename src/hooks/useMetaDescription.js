import { useEffect } from 'react';

const BASE_DESCRIPTION =
  'Temukan coffee shop terbaik, hotel nyaman, dan tempat lifestyle seru di Kota Padang. Kurasi terpercaya dari komunitas lokal.';

/**
 * Dynamically sets <meta name="description"> for the current page.
 * Restores the default description when the component unmounts.
 *
 * @param {string} description - Page-specific description. Falls back to base if empty.
 */
export function useMetaDescription(description) {
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]');
    if (!tag) return;

    const prev = tag.getAttribute('content');
    tag.setAttribute('content', description || BASE_DESCRIPTION);

    return () => {
      tag.setAttribute('content', prev);
    };
  }, [description]);
}

export default useMetaDescription;
