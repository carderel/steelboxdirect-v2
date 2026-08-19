/**
 * public/robots.txt structural guard.
 *
 * WHY THIS FILE EXISTS. RFC 9309 section 2.2.1 gives a crawler exactly one group, the most specific
 * one that matches its product token, and groups do not inherit. Until 2026-08-18 this repository
 * shipped a robots.txt with six named AI crawler groups that each carried only Allow: /, plus a
 * Disallow: /admin/ that sat alone in the * group. The effect was that Disallow: /admin/ bound
 * nothing except crawlers falling through to *, so all six named crawlers were permitted to fetch
 * /admin/login, /admin/dashboard and /admin/reset. Nobody could tell, because no test read the file.
 *
 * The same no-inheritance rule governs the Content-signal line added in the same change: a signal
 * placed only under * is invisible to every crawler that has its own group, which is precisely the
 * set of crawlers the signal is aimed at. So the rule this file enforces is not a list of desired
 * lines, it is the invariant that EVERY group is self contained.
 *
 * WHY IT PARSES RATHER THAN GREPS. A substring search over the raw text passes on a file whose rules
 * sit in the wrong group, which is the exact bug above, and it also trips over the comment block that
 * warns about Cloudflare managed robots.txt, because that warning has to name Disallow: / in order to
 * warn about it. Grouping the directives the way a crawler groups them is the only check that
 * distinguishes a rule from a mention of a rule.
 *
 * THE ASSERTION THAT MATTERS MOST is the one that every group naming an AI crawler still carries
 * Allow: /. This site is a lead generation channel whose entire strategy is being crawled, indexed,
 * quoted and cited. A single character typo turning an Allow into a Disallow, or the Cloudflare
 * managed robots.txt feature being switched on and prepending its default Disallow: / groups for
 * GPTBot, ClaudeBot, CCBot and Google-Extended, would be silent, reversible only after the damage,
 * and invisible in any rendering test.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const ROBOTS = join(REPO_ROOT, 'public/robots.txt');

const raw = readFileSync(ROBOTS, 'utf8');

/** The six crawlers this site deliberately invites by name. */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
];

/** The Content Signals policy grant this site publishes, exactly. */
const EXPECTED_SIGNALS: Record<string, string> = {
  search: 'yes',
  'ai-input': 'yes',
  'ai-train': 'yes',
  use: 'reference',
};

type Directive = { field: string; value: string; line: number };
type Group = { agents: string[]; rules: Directive[]; startLine: number };

/**
 * Directive lines, comments and blank lines removed.
 *
 * Field names are lowercased because RFC 5234 makes them case insensitive, and values are kept as
 * authored because paths are case sensitive.
 */
const directives: Directive[] = raw.split('\n').flatMap((rawLine, i) => {
  const line = rawLine.replace(/#.*$/, '').trim();
  if (!line) return [];
  const idx = line.indexOf(':');
  if (idx < 0) return [];
  return [
    {
      field: line.slice(0, idx).trim().toLowerCase(),
      value: line.slice(idx + 1).trim(),
      line: i + 1,
    },
  ];
});

/**
 * Grouping exactly as RFC 9309 section 2.2 describes it: consecutive user-agent lines with no rule
 * between them name one group, and the first rule after them closes the agent list. A user-agent line
 * appearing after a rule starts a new group. Non group records such as sitemap belong to no group.
 */
const NON_GROUP_FIELDS = new Set(['sitemap']);

const groups: Group[] = [];
const nonGroup: Directive[] = [];
let current: Group | null = null;
let seenRule = false;

for (const d of directives) {
  if (NON_GROUP_FIELDS.has(d.field)) {
    nonGroup.push(d);
    continue;
  }
  if (d.field === 'user-agent') {
    if (!current || seenRule) {
      current = { agents: [], rules: [], startLine: d.line };
      groups.push(current);
      seenRule = false;
    }
    current.agents.push(d.value);
    continue;
  }
  if (!current) continue;
  current.rules.push(d);
  seenRule = true;
}

const label = (g: Group) => `group at line ${g.startLine} (${g.agents.join(', ')})`;

const rulesOf = (g: Group, field: string) =>
  g.rules.filter((r) => r.field === field).map((r) => r.value);

describe('public/robots.txt: group structure', () => {
  it('parses into one group per named user agent plus the wildcard', () => {
    expect(groups.length).toBe(AI_CRAWLERS.length + 1);
    expect(groups[0].agents).toEqual(['*']);
  });

  it('names every AI crawler this site invites, each in its own group', () => {
    for (const agent of AI_CRAWLERS) {
      const owning = groups.filter((g) => g.agents.some((a) => a.toLowerCase() === agent.toLowerCase()));
      expect(owning.length, `${agent} should appear in exactly one group`).toBe(1);
    }
  });

  it('gives every group at least one rule, so no group is an empty shell', () => {
    for (const g of groups) expect(g.rules.length, label(g)).toBeGreaterThan(0);
  });
});

describe('public/robots.txt: rules repeat in every group, because groups do not inherit', () => {
  it('disallows /admin/ in every group', () => {
    for (const g of groups) {
      expect(rulesOf(g, 'disallow'), `${label(g)} must repeat Disallow: /admin/`).toContain('/admin/');
    }
  });

  it('keeps Allow: / in every group that names an AI crawler', () => {
    for (const g of groups) {
      const isAi = g.agents.some((a) => AI_CRAWLERS.some((c) => c.toLowerCase() === a.toLowerCase()));
      if (!isAi) continue;
      expect(rulesOf(g, 'allow'), `${label(g)} must keep Allow: /`).toContain('/');
    }
  });

  it('keeps Allow: / in the wildcard group too', () => {
    expect(rulesOf(groups[0], 'allow')).toContain('/');
  });

  it('never disallows the site root in any group', () => {
    for (const g of groups) {
      for (const value of rulesOf(g, 'disallow')) {
        expect(value, `${label(g)} disallows the whole site`).not.toBe('/');
        expect(value, `${label(g)} disallows the whole site`).not.toBe('/*');
      }
    }
  });

  it('carries a Content-signal line in every group', () => {
    for (const g of groups) {
      expect(rulesOf(g, 'content-signal').length, `${label(g)} must repeat Content-signal`).toBe(1);
    }
  });

  it('places Content-signal after the User-agent line of its group', () => {
    for (const g of groups) {
      const signal = g.rules.find((r) => r.field === 'content-signal');
      expect(signal, label(g)).toBeDefined();
      expect(signal!.line, label(g)).toBeGreaterThan(g.startLine);
    }
  });
});

describe('public/robots.txt: the Content Signals grant', () => {
  it('states exactly the four signals, with the values this site grants', () => {
    for (const g of groups) {
      const [value] = rulesOf(g, 'content-signal');
      const pairs = value.split(',').map((p) => p.trim()).filter(Boolean);
      const parsed: Record<string, string> = {};
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        expect(v, `${label(g)} signal ${pair} must be key=value`).toBeDefined();
        parsed[k.trim().toLowerCase()] = v.trim().toLowerCase();
      }
      expect(parsed, label(g)).toEqual(EXPECTED_SIGNALS);
    }
  });

  it('uses reference rather than full, because reference is the value that links back', () => {
    expect(raw).not.toMatch(/use\s*=\s*full/i);
    for (const g of groups) {
      expect(rulesOf(g, 'content-signal')[0], label(g)).toMatch(/use\s*=\s*reference/);
    }
  });

  it('carries no reservation of rights language, which would contradict a grant', () => {
    expect(raw).not.toMatch(/reserv\w*\s+(of\s+)?(its\s+|our\s+)?rights/i);
    expect(raw).not.toMatch(/article\s*4/i);
    expect(raw).not.toMatch(/\bDSM\b|\b2019\/790\b/);
  });
});

describe('public/robots.txt: discovery records', () => {
  it('publishes exactly one sitemap, as a non group record at the end of the file', () => {
    expect(nonGroup.filter((d) => d.field === 'sitemap').length).toBe(1);
    const sitemap = nonGroup.find((d) => d.field === 'sitemap')!;
    expect(sitemap.value).toBe('https://steelboxdirect.com/sitemap-index.xml');
    const lastLine = Math.max(...directives.map((d) => d.line));
    expect(sitemap.line, 'sitemap should be the final directive').toBe(lastLine);
  });

  it('references llms.txt as a comment, since no standard field exists for it', () => {
    expect(raw).toMatch(/#[^\n]*llms\.txt/);
    expect(directives.some((d) => d.field.includes('llms'))).toBe(false);
  });

  it('warns the next maintainer off Cloudflare managed robots.txt', () => {
    expect(raw).toMatch(/managed robots\.txt/i);
    expect(raw).toMatch(/#[^\n]*(do not enable|DO NOT ENABLE)/i);
  });
});
