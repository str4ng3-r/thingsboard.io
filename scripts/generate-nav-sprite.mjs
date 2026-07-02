import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

// Builds public/nav-sprite.svg from src/assets/images/landings/nav/*.svg.
//
// The navigation mega-menu references its icons via <use href="/nav-sprite.svg#nav-…">
// (see NavIcon.astro), which keeps ~100KB of icon markup out of every page's
// HTML stream. Re-run after adding or editing an icon:
//
//   pnpm generate:nav-sprite

const SRC_DIR = resolve('src/assets/images/landings/nav');
const OUT_FILE = resolve('public/nav-sprite.svg');

// Attributes that must not be copied from a source <svg> root onto its
// <symbol>: sizing is controlled by the referencing <svg>, and identity /
// namespace attributes don't belong on symbols.
const DROP_ATTRS = new Set(['width', 'height', 'id', 'class', 'xmlns', 'xmlns:xlink', 'version']);

const files = readdirSync(SRC_DIR)
	.filter((f) => f.endsWith('.svg'))
	.sort();

const symbols = [];
for (const file of files) {
	const name = basename(file, '.svg');
	let raw = readFileSync(join(SRC_DIR, file), 'utf8').replace(/<\?xml[^>]*\?>\s*/, '');

	const match = raw.match(/<svg([^>]*)>([\s\S]*)<\/svg>\s*$/);
	if (!match) throw new Error(`${file}: could not parse <svg> root`);
	const [, rootAttrs, inner] = match;

	// Prefix internal ids per icon so defs (gradients, clip paths) from
	// different icons can't collide inside the combined sprite.
	const prefixed = inner
		.replace(/\bid="([^"]+)"/g, `id="${name}--$1"`)
		.replace(/url\(#([^)]+)\)/g, `url(#${name}--$1)`)
		.replace(/\b(xlink:href|href)="#([^"]+)"/g, `$1="#${name}--$2"`);

	// Carry presentation attributes (fill="none", stroke rules, viewBox…)
	// onto the <symbol>; they inherit into its content when instantiated.
	const kept = [];
	for (const attrMatch of rootAttrs.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g)) {
		const [, attrName, value] = attrMatch;
		if (DROP_ATTRS.has(attrName)) continue;
		kept.push(`${attrName}="${value}"`);
	}
	if (!kept.some((a) => a.startsWith('viewBox='))) {
		throw new Error(`${file}: missing viewBox — the sprite needs it for scaling`);
	}

	symbols.push(`<symbol id="nav-${name}" ${kept.join(' ')}>${prefixed.trim()}</symbol>`);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${symbols.join('\n')}</svg>\n`;
writeFileSync(OUT_FILE, sprite);
console.log(`✓ public/nav-sprite.svg — ${symbols.length} symbols, ${(sprite.length / 1024).toFixed(0)} KB`);
