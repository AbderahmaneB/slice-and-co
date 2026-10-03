import { businessStatus } from './business-hours.js';

const config = document.getElementById('business-config');
if (config) {
  const hours = JSON.parse(config.textContent);
  const updateHours = () => {
    const status = businessStatus(new Date(), hours);
    document.querySelectorAll('[data-business-status]').forEach(element => {
      element.querySelector('[data-business-status-text]').textContent = status.text;
      element.classList.toggle('is-open', status.open);
      element.hidden = false;
    });
  };
  updateHours();
  setInterval(() => { if (!document.hidden) updateHours(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateHours(); });
  addEventListener('pageshow', updateHours);
}

// La carte externe est chargée seulement quand le visiteur souhaite la consulter.
document.querySelectorAll('[data-load-map]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const shell = button.closest('.map-shell');
    if (shell.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.className = 'map';
    iframe.title = 'Plan d’accès à Slice & Co Pizza, 111 rue Olivier de Serres, Paris 15';
    iframe.referrerPolicy = 'no-referrer';
    iframe.src = 'https://www.google.com/maps?q=111+rue+Olivier+de+Serres+75015+Paris&output=embed';
    iframe.width = '1100';
    iframe.height = '420';
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Carte affichée ci-dessous';
    shell.append(iframe);
    shell.querySelector('[data-map-status]').textContent = 'Le plan Google Maps s’ouvre ci-dessous. Vous pouvez aussi utiliser le lien Itinéraire.';
  });
});

// Anticiper une navigation au survol ou au clavier, sans modifier les liens natifs.
const connection = navigator.connection;
if (!connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '')) {
  const prefetched = new Set();
  const routes = new Set(['/', '/menu', '/offres', '/contact']);
  const prefetch = event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !routes.has(url.pathname) || url.pathname === location.pathname || url.hash || url.search || prefetched.has(url.pathname) || prefetched.size >= 3) return;
    prefetched.add(url.pathname);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url.pathname;
    document.head.append(link);
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);
}
