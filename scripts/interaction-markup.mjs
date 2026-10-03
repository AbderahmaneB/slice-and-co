// These transformations target the site's static, non-nested a/button markup.
// Keep unknown pictograms and raw script/style content intact.
const attributesPattern = String.raw`(?:[^"'<>]|"[^"]*"|'[^']*')*`;
const attributePattern = /\s+([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const arrowPath = 'M4 17.5C11 17.5 17.5 16.5 27 14.5M19 7l8 7.5-7.5 9';
const pathDirections = new Map([
  ['M5 12h14m-6-6 6 6-6 6', 'right'],
  ['M4 12h16m-6-6 6 6-6 6', 'right'],
  ['M1 12h28M20 3l9 9-9 9', 'right'],
  ['M6 18 18 6M6 6h12v12', 'external'],
  ['M12 19V5m-6 6 6-6 6 6', 'up'],
].map(([path, direction]) => [path.replace(/\s+/g, ''), direction]));
const glyphDirections = new Map([['→', 'right'], ['↗', 'external'], ['↑', 'up']]);

function findAttribute(attributes, name) {
  for (const match of attributes.matchAll(attributePattern)) {
    if (match[1].toLowerCase() === name) return match;
  }
  return null;
}

function attributeValue(attributes, name) {
  const match = findAttribute(attributes, name);
  return match ? match[2] ?? match[3] ?? match[4] ?? '' : null;
}

function hasClass(attributes, name) {
  return (attributeValue(attributes, 'class') || '').split(/\s+/).includes(name);
}

function addActionClass(attributes) {
  if (hasClass(attributes, 'sco-action')) return attributes;
  const match = findAttribute(attributes, 'class');
  if (!match) return `${attributes} class="sco-action"`;
  const value = match[2] ?? match[3] ?? match[4] ?? '';
  const quote = match[3] !== undefined ? "'" : '"';
  const whitespace = match[0].match(/^\s+/)[0];
  const separator = value && !/\s$/.test(value) ? ' ' : '';
  const replacement = `${whitespace}${match[1]}=${quote}${value}${separator}sco-action${quote}`;
  return attributes.slice(0, match.index) + replacement + attributes.slice(match.index + match[0].length);
}

function renderArrowMark(direction) {
  const rotation = direction === 'external' ? -45 : direction === 'up' ? -90 : 0;
  const inner = `<g${rotation ? ` transform="rotate(${rotation} 16 16)"` : ''}><path d="${arrowPath}"/></g>`;
  return `<g class="sco-arrow-mark">${inner}</g>`;
}

function renderArrow(direction, oldClasses = '') {
  const classes = [...new Set(['sco-arrow', `sco-arrow--${direction}`, ...oldClasses.split(/\s+/).filter(Boolean)])].join(' ');
  return `<svg class="${classes.replaceAll('"', '&quot;')}" viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${renderArrowMark(direction)}</svg>`;
}

function hasIcon(content) {
  if (/<(?:svg|img)\b/i.test(content)) return true;
  const tags = new RegExp(`<([a-z][\\w:-]*)\\b(${attributesPattern})>`, 'gi');
  for (const match of content.matchAll(tags)) {
    const classes = (attributeValue(match[2], 'class') || '').split(/\s+/);
    if (classes.some(name => /(?:^|[-_])icon(?:$|[-_])|^fa(?:s|r|b|l|d)?$|^fa-/.test(name))) return true;
    if (attributeValue(match[2], 'data-icon') !== null || attributeValue(match[2], 'role') === 'img') return true;
    if (/^(?:span|i)$/i.test(match[1]) && attributeValue(match[2], 'aria-hidden') === 'true') return true;
  }
  return false;
}

/** Normalize only the site's decorative arrows, preserving action content/attributes. */
export function enhanceInteractionMarkup(html) {
  // Protect comments and raw-text elements before running the controlled tag regexes.
  let prefix = '__SCO_RAW_';
  while (html.includes(prefix)) prefix += '_';
  const rawRegions = [];
  const rawPattern = new RegExp(`<!--[\\s\\S]*?-->|<(script|style|textarea)\\b${attributesPattern}>[\\s\\S]*?<\\/\\1\\s*>`, 'gi');
  let markup = html.replace(rawPattern, region => `${prefix}${rawRegions.push(region) - 1}__`);

  const spanPattern = new RegExp(`<span\\b(${attributesPattern})>\\s*([→↗↑])\\s*<\\/span\\s*>`, 'gi');
  markup = markup.replace(spanPattern, (original, attributes, glyph) => {
    if (attributeValue(attributes, 'aria-hidden') !== 'true') return original;
    return renderArrow(glyphDirections.get(glyph), attributeValue(attributes, 'class') || '');
  });

  const svgPattern = new RegExp(`<svg\\b(${attributesPattern})>([\\s\\S]*?)<\\/svg\\s*>`, 'gi');
  const singlePathPattern = new RegExp(`^\\s*<path\\b(${attributesPattern})(?:\\/\\s*>|>\\s*<\\/path\\s*>)\\s*$`, 'i');
  markup = markup.replace(svgPattern, (original, attributes, content) => {
    if (hasClass(attributes, 'sco-arrow')) {
      const direction = ['right', 'external', 'up'].find(value => hasClass(attributes, `sco-arrow--${value}`));
      if (!direction) return original;
      const mark = renderArrowMark(direction);
      return content === mark ? original : `<svg${attributes}>${mark}</svg>`;
    }
    const path = content.match(singlePathPattern);
    if (!path) return original;
    const direction = pathDirections.get((attributeValue(path[1], 'd') || '').replace(/\s+/g, ''));
    return direction ? renderArrow(direction, attributeValue(attributes, 'class') || '') : original;
  });

  const actionPattern = new RegExp(`<(a|button)\\b(${attributesPattern})>([\\s\\S]*?)<\\/\\1\\s*>`, 'gi');
  markup = markup.replace(actionPattern, (original, tag, attributes, content) => {
    if (hasClass(attributes, 'btn') && !hasIcon(content)) content += ` ${renderArrow('right')}`;
    const hasArrow = [...content.matchAll(svgPattern)].some(match => hasClass(match[1], 'sco-arrow'));
    if (!hasArrow) return original;
    return `<${tag}${addActionClass(attributes)}>${content}</${tag}>`;
  });

  return markup.replace(new RegExp(`${prefix}(\\d+)__`, 'g'), (_, index) => rawRegions[Number(index)]);
}
