/**
 * Observe images with data-src and load them when near viewport.
 * Načíta obrázky až keď sú blízko vo viewporte.
 * @param {HTMLElement} container - parent element containing lazy images
 * @param {Logger} logger - logger for debug output
 * @param {string} [rootMargin='150px'] - pre-load distance before entering view
 */
export function observeLazyImages(container, logger, rootMargin = '150px') {
  const images = container.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.onload = () => img.classList.remove('skeleton');
        img.src = img.dataset.src;
        observer.unobserve(img);
        if (logger && typeof logger.log === 'function') {
          logger.log(`lazy load ${img.dataset.src}`);
        }
      }
    }
  }, { rootMargin, threshold: 0.1 });

  images.forEach(img => observer.observe(img));
}

/** Transparent 1×1 PNG as placeholder */
export const PLACEHOLDER_SRC =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
