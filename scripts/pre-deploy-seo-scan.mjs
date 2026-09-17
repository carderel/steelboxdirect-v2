#!/usr/bin/env node
/**
 * PRE-DEPLOY SEO SCAN
 *
 * Why this exists: on 2026-09-16 a hidden "AI citation" block was found shipping in the site
 * footer at opacity 0.05, on all ~161 pages, for an unknown length of time. Nobody caught it,
 * because every check we had read the SOURCE. An external tool found it by reading the RENDERED
 * OUTPUT. At the same time the homepage hero, the LCP element, was found carrying loading="lazy".
 *
 * So this scans dist/, not src/. It is deliberately mechanical: it catches the two classes of
 * defect that actually shipped, and it says nothing about the things a human has to judge.
 * It is a floor, not a review.
 *
 * Run: node scripts/pre-deploy-seo-scan.mjs
 * Exit 0 = clean. Exit 1 = findings. Exit 2 = could not scan (no dist).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

/** Inline styles that make text unreadable to a person but readable to a crawler. */
const HIDDEN_TEXT_PATTERNS = [
  {
    id: 'low-opacity',
    // opacity below 0.3, inline. Catches "opacity: 0.05" and "opacity:.05".
    re: /style="[^"]*opacity:\s*(0?\.[0-2]\d*)\s*[;"]/gi,
    why: 'Inline opacity under 0.3 hides text from people and not from crawlers.',
  },
  {
    id: 'tiny-font',
    re: /style="[^"]*font-size:\s*([0-9](?:\.\d+)?)px/gi,
    why: 'Inline font-size under 10px is functionally invisible body text.',
  },
  {
    id: 'offscreen',
    re: /style="[^"]*(?:left|top|text-indent):\s*-\d{4,}px/gi,
    why: 'Content positioned far off screen is a classic cloaking pattern.',
  },
];

/**
 * An <img> above the fold must not be lazy.
 *
 * "First image on the page" is the obvious rule and it is WRONG here: the header logo is always
 * first, so the real hero is second. Verified on the homepage, where the logo sits at byte 11012
 * and the hero at 19054. So we use a byte-offset proxy for above the fold instead, and skip site
 * chrome by class name. Images further down (the delivery diagram at ~32k) are correctly ignored.
 */
const IMG_RE = /<img\b[^>]*>/gi;
const ABOVE_FOLD_BYTES = 25000;
const CHROME_CLASS_RE = /class="[^"]*\b(brand-logo|fbrand-logo|logo|icon)\b/i;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error('pre-deploy-seo-scan: no dist/ to scan. Run "npm run build" first.');
  process.exit(2);
}

const findings = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '');

  for (const pattern of HIDDEN_TEXT_PATTERNS) {
    pattern.re.lastIndex = 0;
    const hit = pattern.re.exec(html);
    if (hit) findings.push({ kind: pattern.id, page, why: pattern.why, sample: hit[0].slice(0, 120) });
  }

  IMG_RE.lastIndex = 0;
  let img;
  while ((img = IMG_RE.exec(html)) !== null) {
    if (img.index > ABOVE_FOLD_BYTES) break;
    if (CHROME_CLASS_RE.test(img[0])) continue;
    if (!/loading=["']lazy["']/i.test(img[0])) continue;
    findings.push({
      kind: 'lazy-hero',
      page,
      why: 'A lazy-loaded image sits above the fold. If it is the LCP element this delays it, and LCP is a ranking signal.',
      sample: img[0].slice(0, 160),
    });
    break; // one per page is enough to act on
  }
}

/**
 * Only hidden text BLOCKS.
 *
 * It is unambiguous: there is no legitimate reason to serve 5%-opacity or 9px body text, and it is
 * the pattern that actually shipped. Lazy above-the-fold images only WARN, because the rule cannot
 * be decided mechanically: a lazy thumbnail on a blog listing is correct, a lazy hero is a defect,
 * and the markup looks the same. An early draft of this script blocked on both and produced 13
 * findings of which 12 were fine. A gate that cries wolf gets bypassed, and then it protects
 * nothing. The judgement call belongs to the SEO review; this file holds the floor.
 */
const BLOCKING = new Set(['low-opacity', 'tiny-font', 'offscreen']);
const blockers = findings.filter((f) => BLOCKING.has(f.kind));
const warnings = findings.filter((f) => !BLOCKING.has(f.kind));

const report = (list, label, out) => {
  const byKind = list.reduce((acc, f) => ((acc[f.kind] ||= []).push(f), acc), {});
  for (const [kind, hits] of Object.entries(byKind)) {
    out(`${label} [${kind}] ${hits.length} page(s). ${hits[0].why}`);
    for (const f of hits.slice(0, 3)) out(`   ${f.page}\n     ${f.sample}`);
    if (hits.length > 3) out(`   ...and ${hits.length - 3} more`);
    out('');
  }
};

if (warnings.length) report(warnings, 'WARN', (m) => console.log(m));

if (blockers.length === 0) {
  console.log(
    `pre-deploy-seo-scan: no hidden text. ${files.length} built pages scanned` +
      (warnings.length ? `, ${warnings.length} warning(s) above for the SEO review to judge.` : '.')
  );
  process.exit(0);
}

console.error(`\npre-deploy-seo-scan: BLOCKED. ${blockers.length} hidden-text finding(s).\n`);
report(blockers, 'BLOCK', (m) => console.error(m));
console.error('Hidden text is a Google spam signal. Remove it; do not reimplement it in another hidden form.');
process.exit(1);
