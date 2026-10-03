import { readFile, writeFile } from 'node:fs/promises';
import { site, pages, faq } from '../site.config.mjs';
import { enhanceInteractionMarkup } from './interaction-markup.mjs';

const origin = new URL(process.env.SITE_ORIGIN || site.origin).origin;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const plain = value => value.replace(/<span class="sr-only">.*?<\/span>/g, '').replace(/<[^>]+>/g, '').replaceAll('&amp;', '&');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const restaurant = {
  '@type': 'Restaurant', '@id': `${origin}/#restaurant`, name: site.name, url: `${origin}/`,
  telephone: site.telephone, address: { '@type': 'PostalAddress', ...site.address },
  servesCuisine: ['Pizza'], priceRange: '€€', menu: `${origin}/menu`,
  image: `${origin}/assets/img/pizzas/web/margherita-800.webp`, logo: `${origin}/assets/logo.png`,
  sameAs: [site.instagram],
  openingHoursSpecification: site.weeklyHours.flatMap((times, index) => times.map(([opens, closes]) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: week[index], opens, closes: closes === '24:00' ? '00:00' : closes
  })))
};
const faqHtml = `<!-- FAQ:START -->
<section class="section site-faq" aria-labelledby="faq-title"><div class="wrap faq-layout">
  <div class="faq-heading"><span class="eyebrow">Les infos utiles</span><h2 id="faq-title">Une question<br>avant de commander ?</h2><p>Votre pizzeria au cœur de Paris 15ᵉ.</p><a href="/contact">Nous contacter <span aria-hidden="true">→</span></a></div>
  <div class="faq-list">${faq.map(entry => `
    <details><summary>${escape(entry.question)}<span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-answer"><p>${entry.answer}</p></div></details>`).join('')}
  </div>
</div></section>
<!-- FAQ:END -->`;
const quickActions = `<!-- QUICK-ACTIONS:START -->
<nav class="mobile-actions" aria-label="Commander ou appeler la pizzeria"><a href="tel:${site.telephone}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m7 3 3 5-3 3c2 4 4 6 8 7l3-3 4 3c0 3-2 4-4 3C9 19 4 14 2 6c0-3 2-4 5-3Z"/></svg>Appeler</a><a href="/contact#commander-livraison">Commander <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></a></nav>
<!-- QUICK-ACTIONS:END -->`;
const status = '<p class="business-status" data-business-status hidden><span class="business-status-dot" aria-hidden="true"></span><span data-business-status-text></span></p><small class="business-status-note">Selon les horaires habituels</small>';

function metadata(page, noindex = false) {
  const url = `${origin}${page.path}`;
  const graph = [restaurant, { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: site.name, inLanguage: 'fr-FR', publisher: { '@id': restaurant['@id'] } }];
  graph.push({ '@type': page.type, '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'fr-FR', isPartOf: { '@id': `${origin}/#website` }, about: { '@id': restaurant['@id'] } });
  if (page.path !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: page.label, item: url }] });
  if (page.path === '/') graph.push({ '@type': 'FAQPage', '@id': `${origin}/#faq`, mainEntity: faq.map(entry => ({ '@type': 'Question', name: entry.question, acceptedAnswer: { '@type': 'Answer', text: plain(entry.answer) } })) });
  return `<!-- SEO:START -->
<title>${escape(page.title)}</title>
<meta name="description" content="${escape(page.description)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
${noindex ? '' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${escape(site.name)}">
<meta property="og:title" content="${escape(page.title)}">
<meta property="og:description" content="${escape(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${origin}/assets/share-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Slice &amp; Co Pizza, pizzeria à Paris 15, sur place, à emporter et en livraison">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(page.title)}">
<meta name="twitter:description" content="${escape(page.description)}">
<meta name="twitter:image" content="${origin}/assets/share-cover.png">
<meta name="theme-color" content="#141414">
<script type="application/ld+json" id="site-schema">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>
<script type="application/json" id="business-config">${json({ timeZone: site.timeZone, weeklyHours: site.weeklyHours })}</script>
<!-- SEO:END -->`;
}

for (const page of pages) {
  let html = await readFile(`public/${page.file}`, 'utf8');
  html = html.replace(/\s*<button class="motion-toggle"[^>]*>[\s\S]*?<\/button>/g, '')
    .replace(/<span id="motion-preference-note"[^>]*>[\s\S]*?<\/span>\s*/g, '')
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->\s*/g, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta name="description"[^>]*>\s*/g, '')
    .replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g, '')
    .replace(/<meta name="viewport"[^>]*>/, match => `${match}\n${metadata(page)}`);
  for (const target of pages) html = html.replace(new RegExp(`href="${target.file.replace('.', '\\.')}(?=["#])`, 'g'), `href="${target.path}`);
  if (!html.includes('assets/enhancements.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/enhancements.css?v=20261003-optimize">\n</head>');
  if (!html.includes('assets/enhancements.js')) html = html.replace('</body>', '<script type="module" src="assets/enhancements.js?v=20261003-optimize"></script>\n</body>');
  html = html.replace(/<!-- QUICK-ACTIONS:START -->[\s\S]*?<!-- QUICK-ACTIONS:END -->\s*/g, '');
  html = html.replace(/assets\/site\.js\?v=[^" ]+/g, 'assets/site.js?v=20261003-veggie');
  html = html.replace(/assets\/intro\.js(?:\?v=[^" ]+)?/g, 'assets/intro.js?v=20261003-click');
  html = html.replace(/assets\/home\.css\?v=[^" ]+/g, 'assets/home.css?v=20261003-hover');
  html = html.replace(/assets\/interactions\.css(?:\?v=[^" ]+)?/g, 'assets/interactions.css?v=20261003-click');
  html = html.replace(/assets\/(styles|enhancements)\.css(?:\?v=[^" ]+)?/g, 'assets/$1.css?v=20261003-hover');
  if (!html.includes('assets/hover.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/hover.css?v=20261003-hover">\n</head>');
  html = html.replace('</body>', `${page.path === '/' ? quickActions.replace('/contact#commander-livraison', '#commander') : quickActions}\n</body>`);
  if (!html.includes('data-business-status')) html = html.replace(/(<dl class="footer-hours">)/, `${status}\n        $1`);
  if (page.path === '/') {
    html = html.includes('<!-- FAQ:START -->') ? html.replace(/<!-- FAQ:START -->[\s\S]*?<!-- FAQ:END -->/, faqHtml) : html.replace('</main>', `${faqHtml}\n</main>`);
  } else if (!html.includes('class="breadcrumbs"')) {
    html = html.replace('<section class="page-hero">', `<section class="page-hero">\n  <nav class="breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">${escape(page.label)}</span></nav>`);
  }
  // Existing HTML files remain the source of the site's design and content.
  await writeFile(`public/${page.file}`, enhanceInteractionMarkup(html));
}

let notFound = await readFile('public/contact.html', 'utf8');
notFound = notFound.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, metadata({ path: '/404', label: 'Page introuvable', title: 'Page introuvable · Slice & Co Pizza', description: 'Retrouvez la carte, les offres et les coordonnées de Slice & Co Pizza à Paris 15.', type: 'WebPage' }, true));
notFound = notFound.replace(/<main id="contenu"[^>]*>[\s\S]*?<\/main>/, '<main id="contenu" tabindex="-1"><section class="page-hero error-page"><span class="eyebrow">Erreur 404</span><h1>Cette page<br>n’est plus à la carte.</h1><p>Retrouvez nos pizzas et les infos de la pizzeria.</p><a class="btn ghost" href="/">Retour à l’accueil</a> <a class="btn ink" href="/menu">Voir les pizzas</a></section></main>');
notFound = notFound.replace(/ class="active" aria-current="page"/g, '');
// Absolute asset paths work even for missing URLs nested in subdirectories.
notFound = notFound.replace(/(src|href)="assets\//g, '$1="/assets/');
await writeFile('public/404.html', enhanceInteractionMarkup(notFound));
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /motion/\nDisallow: /assets/img/pizzas.zip\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`SEO, FAQ, sitemap et page 404 générés pour ${origin} (${pages.length} pages).`);
