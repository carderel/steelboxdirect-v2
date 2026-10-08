/**
 * SPEC CLAIMS GUARD
 * =================
 *
 * WHY THIS FILE EXISTS. The numeric facts audit of 2026-10-08
 * (`UDO Project/.outputs/research/2026-10-08-facts-audit.md`) traced 186 factual numeric claims to
 * their sources and found 15 typed wrong and 8 with no source at all. None of them was caught by
 * anything, because nothing compared copy with data. The pattern was the same every time:
 *   - "Floor Space ~160 sq ft" beside interior dimensions whose product is about 148. 160 is the
 *     OUTSIDE footprint (20 x 8). Six pages and the pricing module itself carried the mix-up.
 *   - A 20ft payload of 47,900 lbs (an old 24,000 kg rating), and a High Cube tare copied from the
 *     standard 40ft.
 *   - "73% of farm operations...", "1 in 3 buyers...", "40-60% less than new", "50% savings": figures
 *     that had been on the site since the first commit with no source anywhere in the repo.
 *   - "30% less per cubic foot" and "~40-60% more cost": typed comparisons of feed prices, wrong the
 *     first time the feed moved.
 *   - A door "7' 9" wide" on the homepage and "7'5" wide" on /for/contractors/, against the 7'8"
 *     in the spec block.
 *
 * WHAT IT BLOCKS
 *   1. PERCENTAGES AND "1 IN N". Any "N%", "N percent" or "1 in N" in copy fails unless an entry in
 *      SOURCED_FIGURES (src/data/stats.ts) accounts for it: the exact figure, a context pattern
 *      that must sit next to it, and a public source URL. Or, in built HTML only, unless it is one
 *      of DERIVED_FIGURES below: a figure a page computes from the pricing helpers, checked here
 *      against the same helper so a stale build or a hand edit cannot pass.
 *   2. CONTAINER DIMENSIONS that disagree with the data modules:
 *      - square feet in the container range: must be an INTERIOR floor area from containers.ts or
 *        containerReference.ts. The outside footprint (160 / 320) is allowed only when the word
 *        "footprint" is in the same unit of text.
 *      - cubic feet in the container range: must be a capacity from one of those modules.
 *      - pounds next to tare / payload / empty / weight: must fall inside a containers.ts range.
 *      - feet-and-inches followed by wide / tall / high: must be a width or height those modules
 *        state, and inside a sentence about the door, a door width or height specifically.
 *      Rounding is allowed when the copy says so: "about", "roughly", "~" and similar let a figure
 *      round to 5, 10, 100 (or 1,000 lb for weights). An unmarked figure must be exact.
 *
 * WHERE IT LOOKS. Twice, because each pass sees what the other cannot.
 *   - SOURCE (always): src/pages, src/components, src/layouts, src/data and src/content/blog, with
 *     comments, <style> and <script> blocks stripped. Reports file and line. Runs pre-build inside
 *     `npm run guard`, the same gate as the HS_003 guard, so a typed figure never reaches a build.
 *   - BUILT HTML (when dist/ exists): visible text plus every JSON-LD string. This is the pass that
 *     sees interpolated values, which is the whole point of reading the rendered output (see the
 *     pre-deploy SEO scan header for the hidden-text incident that taught the project that).
 *     `npm run guard` sets SPEC_GUARD_DIST=skip, because before a build dist/ is the PREVIOUS build
 *     and would fail the very build that fixes it. The pre-push gate sets SPEC_GUARD_DIST=require,
 *     under which a missing dist/ is a failure, never a skip.
 *
 * THE CANONICAL MODULES ARE NOT SCANNED for the dimension rules, because they ARE the reference:
 * src/data/containers.ts, src/data/containerReference.ts, and src/data/stats.ts (the registry).
 * src/data/rtoTerms.ts is likewise the single source of the 20% down term and is skipped.
 *
 * KNOWN LIMITS, stated so nobody mistakes the guard for more than it is.
 *   - Size attribution is by value, not by sentence parsing: a square-foot figure must equal SOME
 *     container's floor area, so "40ft: about 150 sq ft" would pass (150 is a 20ft floor). The
 *     common error, footprint quoted as floor, is caught; a size swap is not.
 *   - Feet-and-inches values with no axis word after them are not checked.
 *   - Ranges outside the container bands (a 70 sq ft 10ft, a 3,900 cu ft 53ft) are ignored.
 *
 * FIXING A FAILURE. Read the figure from src/data/containers.ts (interiorFloorSqFt, footprintSqFt,
 * cubicFeet, dimAxis) or src/data/sizeComparison.ts, or reword it without the number. Only add a
 * SOURCED_FIGURES entry for a figure you can prove at a public URL.
 *
 * No em dash and no en dash anywhere in this file: the dash guard scans tests too.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import {
  containers,
  dimAxes,
  feetFromDim,
  interiorFloorSqFt,
  footprintSqFt,
  cubicFeet,
  weightRangeLbs,
  type Container,
} from '../../data/containers';
import { referenceSizes, heightWidthCodes } from '../../data/containerReference';
import { SOURCED_FIGURES } from '../../data/stats';
import { pricing, priceBySlug } from '../../data/pricing';
import { pctCheaperPerCuFt } from '../../data/sizeComparison';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');

/* ------------------------------------------------------------------ canonical values */

/** Unrounded interior floor areas, square feet. containers.ts first, then the ISO reference table. */
const FLOOR_SQFT: number[] = [
  ...containers.map((c) => {
    const a = dimAxes(c.specs.internalDims);
    return feetFromDim(a.L!) * feetFromDim(a.W!);
  }),
  ...referenceSizes.map((r) => feetFromDim(r.intL) * feetFromDim(r.intW)),
];

/** Unrounded outside footprints, square feet. Allowed only beside the word footprint. */
const FOOTPRINT_SQFT: number[] = [
  ...containers.map((c) => {
    const a = dimAxes(c.specs.externalDims);
    return feetFromDim(a.L!) * feetFromDim(a.W!);
  }),
  ...referenceSizes.map((r) => {
    const [l, w] = r.ext.split('×').map((x) => feetFromDim(x.trim()));
    return l! * w!;
  }),
];

const CUBIC_FT: number[] = [
  ...containers.map(cubicFeet),
  ...referenceSizes.map((r) => Number(r.capacity.replace(/[^\d]/g, ''))),
];

const WEIGHT_RANGES: [number, number][] = containers.flatMap((c) => [
  weightRangeLbs(c.specs.tare),
  weightRangeLbs(c.specs.payload),
]);

/** Feet and inches as a canonical key: 7'8" -> "7'8", 8' -> "8'0". */
const ftIn = (feet: string | number, inches: string | number = 0): string => `${Number(feet)}'${Number(inches)}`;
const keyOf = (dim: string): string => {
  const m = dim.trim().match(/^(\d+)'\s*(?:(\d+(?:\.\d+)?)")?$/);
  if (!m) throw new Error(`spec-claims-guard: cannot key "${dim}"`);
  return ftIn(m[1]!, m[2] ?? 0);
};

const refDoor = (r: (typeof referenceSizes)[number]) => r.door.split('×').map((x) => x.trim());
const refExt = (r: (typeof referenceSizes)[number]) => r.ext.split('×').map((x) => x.trim());

const DOOR_W = new Set([
  ...containers.map((c) => keyOf(dimAxes(c.specs.doorOpening).W!)),
  ...referenceSizes.map((r) => keyOf(refDoor(r)[0]!)),
]);
const DOOR_H = new Set([
  ...containers.map((c) => keyOf(dimAxes(c.specs.doorOpening).H!)),
  ...referenceSizes.map((r) => keyOf(refDoor(r)[1]!)),
]);
const ALL_W = new Set([
  ...DOOR_W,
  ...containers.flatMap((c) => [dimAxes(c.specs.externalDims).W!, dimAxes(c.specs.internalDims).W!].map(keyOf)),
  ...referenceSizes.flatMap((r) => [keyOf(r.intW), keyOf(refExt(r)[1]!)]),
]);
const ALL_H = new Set([
  ...DOOR_H,
  ...containers.flatMap((c) => [dimAxes(c.specs.externalDims).H!, dimAxes(c.specs.internalDims).H!].map(keyOf)),
  ...referenceSizes.flatMap((r) => [keyOf(r.intH), keyOf(refExt(r)[2]!)]),
  // ISO 6346 height codes, which the reference page and the ID-number post quote.
  ...heightWidthCodes.flatMap((h) => [...h.meaning.matchAll(/(\d+)'(\d+)"/g)].map((m) => ftIn(m[1]!, m[2]!))),
]);

/* ------------------------------------------------------------------ matching */

const APPROX_BEFORE = /(?:~|\babout|\broughly|\bapproximately|\baround|\bnearly|\bclose to|\bjust (?:under|over)|\bsome|\bapprox\.?)\s*$/i;

function isApprox(text: string, index: number): boolean {
  return APPROX_BEFORE.test(text.slice(Math.max(0, index - 20), index));
}

const roundTo = (n: number, step: number): number => Math.round(n / step) * step;

/** v states c: exactly (whole number), to the nearest 5 always, or rounder when the copy says about. */
function states(v: number, c: number, approx: boolean): boolean {
  if (v === Math.round(c) || v === roundTo(c, 5)) return true;
  if (!approx) return false;
  return [10, 50, 100].some((step) => v === roundTo(c, step));
}

const num = (s: string): number => Number(s.replace(/,/g, ''));

/* ------------------------------------------------------------------ the checker */

export interface Finding {
  rule: 'percent' | 'sqft' | 'cuft' | 'lb' | 'ft-in';
  figure: string;
  context: string;
  why: string;
}

/** A figure a page renders FROM the helpers. Allowed only in built HTML, and only at the live value. */
interface DerivedFigure {
  id: string;
  /** Captures the number in group 1. */
  pattern: RegExp;
  expected: () => number;
  source: string;
}
const DERIVED_FIGURES: DerivedFigure[] = [
  {
    id: 'size-page-per-cubic-foot',
    pattern: /about (\d+)% less per cubic foot than two 20-ft units/,
    expected: () => pctCheaperPerCuFt('40ftStandard', '20ftCargo'),
    source: 'src/data/sizeComparison.ts pctCheaperPerCuFt, rendered on /size/ with the price disclaimer',
  },
];

const PERCENT_RE = /(\d[\d,]*(?:\.\d+)?(?:\s?(?:-|to)\s?\d[\d,]*(?:\.\d+)?)?)\s?(%|percent\b)|\b(?:1|one) in (?:\d+|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
const SQFT_RE = /(\d[\d,]*(?:\.\d+)?)\s*(?:sq\.?\s*ft|square[- ]f(?:ee|oo)t)\b/gi;
const CUFT_RE = /(\d[\d,]*(?:\.\d+)?)\s*(?:cu\.?\s*ft|cubic[- ]f(?:ee|oo)t)\b/gi;
const LB_RE = /(\d[\d,]*)\s*(?:lbs?|pounds)\b/gi;
const FTIN_AXIS_RE = /(\d+)\s?['’′]\s?(\d+(?:\.\d+)?)\s?(?:"|”|″)\s*(?:of\s+)?(wide|width|tall|high|height)\b|(\d+)\s?ft\.?\s?(\d+)\s?in\.?\s+(wide|tall|high)\b/gi;

const SQFT_BAND: [number, number] = [120, 420];
const CUFT_BAND: [number, number] = [900, 3200];
const WEIGHT_CONTEXT = /\b(?:tare|payload|empty|weigh(?:s|t|ts)?)\b/i;
const NOT_CONTAINER_WEIGHT = /\btruck\b|\bground\b|\brig\b|\btrailer\b/i;

const around = (text: string, start: number, end: number, span = 160): string =>
  text.slice(Math.max(0, start - span), Math.min(text.length, end + span));

/**
 * Check one unit of text: a source line, or a block of rendered text. `built` is true for dist/,
 * where derived figures may appear at their computed value.
 */
export function checkUnit(text: string, built: boolean): Finding[] {
  const out: Finding[] = [];
  const ctx = (s: number, e: number) => around(text, s, e, 60).replace(/\s+/g, ' ').trim();

  for (const m of text.matchAll(PERCENT_RE)) {
    const start = m.index!;
    const end = start + m[0].length;
    const figure = m[2] ? `${m[1]}%` : m[0];
    const window = around(text, start, end);
    const sourced = SOURCED_FIGURES.some((f) => f.figure === figure && f.context.test(window));
    const derived = built && DERIVED_FIGURES.some((d) => {
      const hit = window.match(d.pattern);
      return hit !== null && Number(hit[1]) === d.expected() && window.includes(m[0]);
    });
    if (!sourced && !derived) {
      out.push({ rule: 'percent', figure: m[0], context: ctx(start, end), why: 'no SOURCED_FIGURES entry (src/data/stats.ts) and not a derived figure at its live value' });
    }
  }

  for (const m of text.matchAll(SQFT_RE)) {
    const v = num(m[1]!);
    if (v < SQFT_BAND[0] || v > SQFT_BAND[1]) continue;
    const approx = isApprox(text, m.index!);
    const unit = around(text, m.index!, m.index! + m[0].length, 120);
    const footprintOk = /footprint/i.test(unit);
    const ok = FLOOR_SQFT.some((c) => states(v, c, approx))
      || (footprintOk && FOOTPRINT_SQFT.some((c) => states(v, c, approx)));
    if (!ok) {
      const isFootprint = FOOTPRINT_SQFT.some((c) => states(v, c, approx));
      out.push({
        rule: 'sqft', figure: m[0], context: ctx(m.index!, m.index! + m[0].length),
        why: isFootprint
          ? 'this is the OUTSIDE footprint; say "footprint" beside it, or use interiorFloorSqFt() for floor space'
          : `not an interior floor area in containers.ts or containerReference.ts (${FLOOR_SQFT.map((x) => x.toFixed(1)).join(', ')})`,
      });
    }
  }

  for (const m of text.matchAll(CUFT_RE)) {
    const v = num(m[1]!);
    if (v < CUFT_BAND[0] || v > CUFT_BAND[1]) continue;
    const approx = isApprox(text, m.index!);
    if (!CUBIC_FT.some((c) => states(v, c, approx))) {
      out.push({ rule: 'cuft', figure: m[0], context: ctx(m.index!, m.index! + m[0].length), why: `not a capacity in containers.ts or containerReference.ts (${CUBIC_FT.join(', ')})` });
    }
  }

  for (const m of text.matchAll(LB_RE)) {
    const near = around(text, m.index!, m.index! + m[0].length, 80);
    if (!WEIGHT_CONTEXT.test(near) || NOT_CONTAINER_WEIGHT.test(near)) continue;
    const v = num(m[1]!);
    const approx = isApprox(text, m.index!);
    const slack = approx ? 500 : 0;
    // A range in copy ("4,920 to 5,180 lbs") states its low end just before; checking the high end
    // against the same ranges covers both.
    if (!WEIGHT_RANGES.some(([lo, hi]) => v >= lo - slack && v <= hi + slack)) {
      out.push({ rule: 'lb', figure: m[0], context: ctx(m.index!, m.index! + m[0].length), why: `outside every tare and payload range in containers.ts (${WEIGHT_RANGES.map(([a, b]) => `${a}-${b}`).join(', ')})` });
    }
  }

  for (const m of text.matchAll(FTIN_AXIS_RE)) {
    const key = m[1] ? ftIn(m[1], m[2]!) : ftIn(m[4]!, m[5]!);
    const axisWord = (m[3] ?? m[6] ?? '').toLowerCase();
    const isWidth = axisWord === 'wide' || axisWord === 'width';
    const door = /\bdoors?\b/i.test(around(text, m.index!, m.index! + m[0].length, 60));
    const allowed = door ? (isWidth ? DOOR_W : DOOR_H) : (isWidth ? ALL_W : ALL_H);
    if (!allowed.has(key)) {
      out.push({ rule: 'ft-in', figure: m[0], context: ctx(m.index!, m.index! + m[0].length), why: `not a ${door ? 'door ' : ''}${isWidth ? 'width' : 'height'} the data modules state (${[...allowed].join('", ')}")` });
    }
  }

  return out;
}

/* ------------------------------------------------------------------ source pass */

const SCAN_TARGETS = ['src/pages', 'src/components', 'src/layouts', 'src/data', 'src/content/blog'];

/** The reference modules themselves, and the registry. See the header. */
const CANONICAL = new Set([
  'src/data/containers.ts',
  'src/data/containerReference.ts',
  'src/data/stats.ts',
  'src/data/rtoTerms.ts',
  'src/data/geoPricing.ts',
]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|tsx|md|mdx)$/.test(entry) && !/\.test\.ts$|\.d\.ts$/.test(entry)) acc.push(p);
  }
  return acc;
}

/** Blank a match out while keeping its newlines, so line numbers survive. */
const blank = (s: string): string => s.replace(/[^\n]/g, ' ');

/** Quote-aware JS comment stripper (same approach as the HS_003 guard), newline-preserving. */
function stripJsComments(code: string): string {
  let out = '';
  let i = 0;
  let quote = '';
  while (i < code.length) {
    const ch = code[i] ?? '';
    const next = code[i + 1] ?? '';
    if (quote) {
      if (ch === '\\') { out += ch + next; i += 2; continue; }
      if (ch === quote) quote = '';
      out += ch; i += 1; continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; i += 1; continue; }
    if (ch === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') { out += ' '; i += 1; }
      continue;
    }
    if (ch === '/' && next === '*') {
      out += '  '; i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) { out += code[i] === '\n' ? '\n' : ' '; i += 1; }
      if (i < code.length) { out += '  '; i += 2; }
      continue;
    }
    out += ch; i += 1;
  }
  return out;
}

/** Copy only: comments, styles, scripts and inline style attributes removed. */
export function copyOf(file: string, src: string): string {
  const stripMarkup = (s: string): string => s
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<style[\s\S]*?<\/style>/gi, blank)
    .replace(/<script[\s\S]*?<\/script>/gi, blank)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/\bstyle=(?:"[^"]*"|'[^']*'|\{\{[\s\S]*?\}\})/g, blank);
  if (file.endsWith('.astro')) {
    const fm = src.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) return stripMarkup(src);
    const head = '---\n' + stripJsComments(fm[1]!) + '\n---';
    return head + stripMarkup(src.slice(fm[0].length));
  }
  if (file.endsWith('.ts') || file.endsWith('.tsx')) return stripMarkup(stripJsComments(src));
  return stripMarkup(src);
}

function sourceFindings(): string[] {
  const findings: string[] = [];
  for (const target of SCAN_TARGETS) {
    for (const file of walk(join(REPO_ROOT, target))) {
      const r = rel(file);
      if (CANONICAL.has(r)) continue;
      const lines = copyOf(r, readFileSync(file, 'utf8')).split('\n');
      lines.forEach((line, i) => {
        for (const f of checkUnit(line, false)) {
          findings.push(`${r}:${i + 1} [${f.rule}] "${f.figure}" ${f.why}\n    ...${f.context}...`);
        }
      });
    }
  }
  return findings;
}

/* ------------------------------------------------------------------ built pass */

const DIST = join(REPO_ROOT, 'dist');
const DIST_MODE = process.env.SPEC_GUARD_DIST ?? 'auto'; // auto | skip | require

function htmlFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) { if (entry !== 'admin') htmlFiles(p, acc); }
    else if (entry.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const decode = (s: string): string => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

/** Every string value in a JSON-LD block, one per line. */
function ldStrings(json: string): string[] {
  const out: string[] = [];
  const visit = (v: unknown): void => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') Object.values(v).forEach(visit);
  };
  try { visit(JSON.parse(json)); } catch { out.push(json); }
  return out;
}

/** Visible text as block-level units, plus JSON-LD strings. */
export function renderedUnits(html: string): string[] {
  const units: string[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) units.push(...ldStrings(m[1]!));
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Source newlines inside a paragraph are not boundaries; only block tags are.
    .replace(/\s+/g, ' ')
    .replace(/<(?:\/?(?:p|li|td|th|tr|div|h[1-6]|section|article|aside|header|footer|ul|ol|table|caption|figcaption|dd|dt|br|summary|details|nav|main))\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  units.push(...decode(body).split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean));
  return units;
}

function builtFindings(): string[] {
  const findings: string[] = [];
  for (const file of htmlFiles(DIST)) {
    const page = '/' + relative(DIST, file).split(sep).join('/').replace(/index\.html$/, '');
    for (const unit of renderedUnits(readFileSync(file, 'utf8'))) {
      for (const f of checkUnit(unit, true)) findings.push(`${page} [${f.rule}] "${f.figure}" ${f.why}\n    ...${f.context}...`);
    }
  }
  return [...new Set(findings)];
}

const report = (findings: string[]): string =>
  `\n${findings.length} unsupported figure(s). Read it from src/data/containers.ts or src/data/sizeComparison.ts, ` +
  `reword it without the number, or (only with a public source) add it to SOURCED_FIGURES in src/data/stats.ts.\n\n` +
  findings.join('\n');

/* ------------------------------------------------------------------ tests */

describe('spec claims guard: the reference values are what the audit says they are', () => {
  it('computes interior floor from interior dimensions, and keeps it distinct from the footprint', () => {
    const [c20, c40, c40hc] = ['20-foot-shipping-container', '40-foot-shipping-container', '40-foot-high-cube-container']
      .map((s) => containers.find((c) => c.slug === s) as Container);
    expect(interiorFloorSqFt(c20!)).toBe(148);
    expect(interiorFloorSqFt(c40!)).toBe(302);
    expect(interiorFloorSqFt(c40hc!)).toBe(302);
    expect(footprintSqFt(c20!)).toBe(160);
    expect(footprintSqFt(c40!)).toBe(320);
  });

  it('feeds pricing.ts the interior floor, so every per square foot figure is on that basis', () => {
    for (const [slug, price] of Object.entries(priceBySlug)) {
      const c = containers.find((x) => x.slug === slug)!;
      expect(price.sqft, slug).toBe(interiorFloorSqFt(c));
    }
    expect(pricing['20ftCargo'].sqft).not.toBe(160);
  });

  it('keeps every spec block sourced, with weights stated as ranges and the High Cube its own tare', () => {
    for (const c of containers) {
      expect(c.specs.sources.length, c.slug).toBeGreaterThan(0);
      for (const s of c.specs.sources) expect(s.url, c.slug).toMatch(/^https:\/\//);
      expect(c.specs.tare, c.slug).toMatch(/ to /);
      expect(c.specs.payload, c.slug).toMatch(/ to /);
      expect(dimAxes(c.specs.doorOpening).W, c.slug).toBe('7\'8"');
    }
    const tare = (slug: string) => containers.find((c) => c.slug === slug)!.specs.tare;
    expect(tare('40-foot-high-cube-container')).not.toBe(tare('40-foot-shipping-container'));
  });

  it('keeps the sourced-figure registry small, and every entry has a public URL', () => {
    expect(SOURCED_FIGURES.length).toBeLessThanOrEqual(5);
    for (const f of SOURCED_FIGURES) {
      expect(f.sourceUrl, f.id).toMatch(/^https:\/\//);
      expect(f.figure, f.id).toMatch(/^\d+%$/);
    }
  });
});

describe('spec claims guard: it catches every defect the 2026-10-08 audit found', () => {
  const CAUGHT: [string, Finding['rule']][] = [
    ['<span class="lbl">Floor Space</span><span class="val">~160 sq ft</span>', 'sqft'],
    ['A 40ft container gives you roughly 320 square feet of floor space.', 'sqft'],
    ['20ft: ~160 sq ft. Fits one tractor.', 'sqft'],
    ['73% of farm operations store equipment year-round.', 'percent'],
    ['1 in 3 buyers initially choose the wrong size.', 'percent'],
    ['40-ft costs 30% less per cubic foot than two 20-ft units.', 'percent'],
    ['A 40-foot unit provides 2x the space of a 20-foot for only ~40-60% more cost.', 'percent'],
    ['Used units provide equivalent weather protection for 50% less.', 'percent'],
    ['at 40-60% less than new.', 'percent'],
    ['Payload 47,900 lbs and tare 4,850 lbs', 'lb'],
    ['Door opening 7\' 9" wide', 'ft-in'],
    ['the door opening is roughly 7\'5" wide by 7\'5" tall', 'ft-in'],
    ['A 40ft container (about 2,500 cubic feet)', 'cuft'],
  ];
  for (const [text, rule] of CAUGHT) {
    it(`fails: ${text}`, () => {
      expect(checkUnit(text, false).map((f) => f.rule)).toContain(rule);
    });
  }

  const PASSES = [
    'Gross floor footprint, ~320 sq ft = 8x40',
    'about 148 sq ft of floor inside',
    'about 150 square feet of floor space and 1,172 cubic feet of room',
    'A 40ft High Cube holds about 2,700 cubic feet',
    'a 20ft runs about 5,000 lbs and a 40ft about 8,000 lbs or more',
    'the door opening is roughly 7\'8" wide by 7\'5" tall',
    'Ground must support a 30,000 lb truck',
    'Beyond that distance the down payment is 20%.',
    'a 10% cancellation fee will be incurred',
  ];
  for (const text of PASSES) {
    it(`passes: ${text}`, () => {
      expect(checkUnit(text, false)).toEqual([]);
    });
  }

  it('accepts a derived percentage in built output only at its live value', () => {
    const live = pctCheaperPerCuFt('40ftStandard', '20ftCargo');
    expect(checkUnit(`40-ft costs about ${live}% less per cubic foot than two 20-ft units`, true)).toEqual([]);
    expect(checkUnit(`40-ft costs about ${live + 7}% less per cubic foot than two 20-ft units`, true)).not.toEqual([]);
    // and never in source, where a digit before % can only be typed
    expect(checkUnit(`40-ft costs about ${live}% less per cubic foot than two 20-ft units`, false)).not.toEqual([]);
  });
});

describe('spec claims guard: the site', () => {
  it('scans the surfaces it claims to', () => {
    const count = SCAN_TARGETS.reduce((n, t) => n + walk(join(REPO_ROOT, t)).length, 0);
    expect(count).toBeGreaterThan(80);
  });

  it('source carries no unsupported percentage, 1-in-N or container dimension', () => {
    const findings = sourceFindings();
    expect(findings, report(findings)).toEqual([]);
  });

  const haveDist = existsSync(join(DIST, 'index.html'));

  it.runIf(DIST_MODE === 'require')('has a build to check when the gate requires one', () => {
    expect(haveDist, 'SPEC_GUARD_DIST=require but there is no dist/. Run npm run build first.').toBe(true);
  });

  it.runIf(DIST_MODE !== 'skip' && haveDist)('built HTML carries no unsupported percentage, 1-in-N or container dimension', () => {
    const findings = builtFindings();
    expect(findings, report(findings)).toEqual([]);
  });
});
