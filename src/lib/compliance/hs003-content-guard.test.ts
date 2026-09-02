/**
 * PROJECT_HS_003 BUILD-TIME CONTENT GUARD
 * =======================================
 *
 * Encodes `UDO Project/HARD_STOPS.md` PROJECT_HS_003: never publish copy that determines or
 * promises a regulatory, tax, insurance, or structural outcome on the reader's behalf, in either
 * direction, for any jurisdiction or any third party. Seven banned classes, enumerated below.
 *
 * Authorized as todo T-025. Evidence base:
 *   `UDO Project/.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md`
 * Style precedent: `src/data/cities.test.ts` lines 44 to 49 (vitest, describe/it/expect, walks
 * real project data and asserts absence of prohibited claims).
 *
 * WHY THIS IS NOT A BANNED-PHRASE LIST
 * ------------------------------------
 * A blacklist was tried and failed three separate times in the 2026-08-10 audit:
 *   1. Eight enumerated banned phrases returned ZERO hits site-wide while `src/data/containers.ts`
 *      reached permit-free meaning via "without a permanent structure permit in most counties".
 *   2. The inventory's own quote of `for/businesses` missed a SECOND lifting claim in the same
 *      paragraph ("doesn't require a crane").
 *   3. A ten-term sweep of the spec docs found 24 hits, then a supplementary pattern set found 4
 *      MORE, and those 4 were the worst in the repo.
 * So the guard matches the SHAPE of a determination, not a wording:
 *
 *   REGULATED TOPIC  +  DETERMINATION MARKER  -  DEFERRAL MARKER  =  VIOLATION
 *
 * A regulated topic is a permit / classification / zoning / tax / insurance / structural noun.
 * A determination marker is certainty, negation, or a quantifier (no, not, without, never, always,
 * most, usually, typically, generally, stays, qualifies, exempt, covers, can, will).
 * A deferral marker hands the question back to whoever actually decides (your county, your carrier,
 * your accountant, county auditor, zoning office, licensed engineer, buyer's responsibility,
 * we do not determine, ask, confirm, varies, depends, whether).
 *
 * Three strictness modes, because the classes are not equally hedgeable:
 *   - ABSOLUTE  (class 2, plus the literals HS_003 enumerates): banned regardless of hedging.
 *     Required by the rule text ("Both directions are banned") and proven necessary: the live
 *     `for/farmers` FAQ "You're not putting up a permanent building, though confirming local
 *     zoning is still the buyer's responsibility" is a HARD VIOLATION that carries a perfect
 *     deferral in the same sentence.
 *   - STRICT (classes 5, 6, and every atomic surface): the deferral must sit in the SAME sentence.
 *     HS_003 requires attribution AT the claim for third-party and physical claims ("Ask your
 *     carrier whether X" is compliant, "your carrier covers X" is not), and every compliant
 *     example in the repo does exactly that. Atomic surfaces (headings, table cells, alt text,
 *     link labels, meta descriptions, short data fields) are always strict because, per HS_003,
 *     they strip surrounding attribution and a hedge two sentences away does not travel.
 *   - BLOCK (classes 1, 3, 4, 7): the deferral may sit anywhere in the same text unit (paragraph,
 *     table cell, or FAQ answer string). This is correct rather than lenient: HS_003 REQUIRES
 *     describing the question ("what axis matters, who decides, what changes the answer"), which
 *     takes several sentences, and the unit is exactly what travels into the FAQPage JSON-LD via
 *     `src/lib/schema/buildPageSchema.ts`. Every compliant template in the repo closes its
 *     paragraph with the deferral. The window is the paragraph, never the page, so
 *     `for/farmers` line 117's compliant paragraph does NOT clear the violating paragraph five
 *     lines below it.
 *
 * SOURCE, NOT BUILT OUTPUT
 * ------------------------
 * The guard scans `src/` rather than `dist/`. Tradeoff, stated honestly:
 *   + Reports file and line, which is what a maintainer needs to act.
 *   + Runs in vitest in under a second with no build, matching the `cities.test.ts` precedent,
 *     so it can gate a commit rather than only a deploy.
 *   + Sees data files and non-rendered-but-tracked files. That matters here: the audit found
 *     `src/pages/permits/_index.astro.bak` git-tracked with five severe permit determinations,
 *     one `git mv` from being live. A dist scan sees none of that.
 *   + The FAQPage JSON-LD is built from the same frontmatter strings this scans, so scanning
 *     source covers the schema surface too.
 *   - Cannot see text composed at runtime from template interpolation or props passed between
 *     components. That is a real hole; see KNOWN LIMITATIONS at the bottom of this file.
 *
 * DRAFT BLOG POSTS ARE SCANNED. Deliberate. `draft: true` posts are excluded from production at
 * four gates, so they are not live, but flipping one live is a one-word edit and the `.bak` file
 * above is proof that non-rendered files rot. Set SCAN_DRAFT_POSTS to false to change the policy.
 *
 * COMMENT STRIPPING IN THE EXTRACTOR (2026-08-19, T-146)
 * ------------------------------------------------------
 * String-literal extraction runs on frontmatter and data-file source with `//` and block comments
 * stripped first, by the string-aware, length-preserving `stripJsComments` below. Before this, the
 * literal-pairing regex ran over raw source, so an ODD number of stray quote characters in
 * comments (one apostrophe was enough) re-paired every literal below it, swallowed real atomic
 * literals into giant non-atomic blobs, silently destroyed the file's scan coverage, and once
 * manufactured a phantom class-1 finding against a compliant FAQ. An EVEN count was benign, which
 * is why the defect hid. The in-file "keep comments free of apostrophes" warnings that guarded
 * against this (shipping-container-guides hub, tools.ts editing rules) are resolved as of this fix
 * and now carry one-line historical notes instead.
 *
 * HOW TO CLEAR A FAILURE (two documented escapes, both require a reason)
 * ---------------------------------------------------------------------
 *   1. Fix the copy. Copy a compliant template; they are listed in the failure message.
 *   2. If the guard is genuinely wrong, add an ALLOWLIST entry below with a `reason`. Entries are
 *      asserted to be non-empty AND still matching, so a stale entry fails the suite and cannot
 *      quietly widen the hole.
 *   3. For a one-off, put `hs003-allow: <reason>` in a source comment on or directly above the
 *      line. The reason text is required.
 * Do NOT delete patterns to make this pass. If you believe a pattern is wrong, that is an owner
 * decision under HS_003's violation protocol, not a test edit.
 *
 * WHAT ELSE IS IN HERE
 * --------------------
 * Two more suites below the live scan, neither of which is a text check:
 *   1. The T-146 comment-stripping regression suite: fixtures with odd and even counts of comment
 *      apostrophes must extract the identical, correct unit list, URLs inside literals must
 *      survive, reported line numbers must stay true, and the hedged permit FAQ must produce no
 *      phantom finding.
 *   2. The persona FAQ copy-override invariant: on the persona pages a few FAQ answers are ALSO
 *      hardcoded in an `{i === N ? (<p>...` copy-override branch, and only the `faqs` array copy
 *      reaches the FAQPage JSON-LD. That test asserts the two stay identical after anchor
 *      stripping and entity decoding, because a page that ships one answer to humans and another
 *      to answer engines defeats every text check above it.
 *
 * CURRENT STATE (2026-08-19)
 * --------------------------
 * All tests pass and the live-surface scan reports ZERO findings. History, kept because the
 * failure messages and fixtures reference it: when the guard landed on 2026-08-10 the scan FAILED
 * with 5 findings across 4 claims (the HeroSection "zoned exempt" ticker, farmers :136, the
 * pole-barn draft post, and wind-and-water-tight-explained :45), all reported to the owner per the
 * HS_003 violation protocol rather than fixed in that change. Every one has since been reframed in
 * place (none was allowlisted): the ticker copy is gone from HeroSection, and the blog and persona
 * copy now defers load ratings to the manufacturer or a licensed engineer. The pre-cleanup
 * versions survive as the KNOWN_VIOLATIONS and LIVE_UNFIXED_FIXTURES positive fixtures below, so
 * the guard still proves it would catch each of them.
 *
 * NOTE ON DASHES: HS-OUT-001 forbids em and en dashes in project output, and the pre-cleanup
 * fixture strings below contain them, so they are written as \u2014 escapes. The runtime string is
 * byte-identical to the copy that shipped.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// If this resolves wrong, the "scans the surfaces the rule actually applies to" test fails loudly
// rather than the guard silently scanning zero files.
const REPO_ROOT = import.meta.dirname
  ? join(import.meta.dirname, '..', '..', '..')
  : process.cwd();
const SCAN_DRAFT_POSTS = true;

/**
 * Surfaces scanned. Persona pages, the data files that feed product and city pages, the blog, and
 * BOTH component directories. `src/components/` and `src/layouts/` are not optional: the
 * 2026-08-10 audit concluded that "src/components/ carries no permit, classification, tax, or
 * structural copy", and that conclusion is wrong. `src/components/home/HeroSection.astro` ships
 * "Most farm storage is zoned exempt" in the homepage ticker, twice, at baseline 544077b.
 */
const SCAN_TARGETS = [
  'src/pages',
  'src/components',
  'src/layouts',
  'src/data',
  'src/content/blog',
];

/* ------------------------------------------------------------------ marker sets */

const DETERMINATION: RegExp[] = [
  /\bno\b/i, /\bnot\b/i, /\bnone\b/i, /\bnever\b/i, /\bwithout\b/i, /n['’]t\b/i,
  /\balways\b/i, /\ball\b/i, /\bmost\b/i, /\bmany\b/i, /\busually\b/i, /\btypically\b/i,
  /\bgenerally\b/i, /\bcommonly\b/i, /\boften\b/i, /\brarely\b/i, /\bseldom\b/i,
  /\blikely\b/i, /\bunlikely\b/i, /\btends? to\b/i, /\bguarantee/i, /\bexempt/i,
  /\bqualif(?:y|ies|ied)\b/i, /\bmeets?\b/i, /\bstays?\b/i, /\bremains?\b/i,
  /\bcounts? as\b/i, /\btreated as\b/i, /\bconsidered\b/i, /\bclassif/i,
  /\btriggers?\b/i, /\bavoids?\b/i, /\bcan\b/i, /\bwill\b/i, /\bcovers?\b/i,
  /\bcovered\b/i, /\brequires?\b/i,
];

const DEFERRAL: RegExp[] = [
  // whose call it is
  /buyer['’]s responsibility/i, /buyer['’]s job/i, /your responsibility/i, /\bup to you\b/i,
  /\byours to\b/i, /\byour job\b/i,
  /we do not determine/i, /we don['’]t determine/i, /we do not advise/i,
  /we make no representation/i, /we take no position/i, /\bnot ours\b/i, /rather than ours/i,
  /\bnot from us\b/i, /we do not issue/i, /we don['’]t make that call/i,
  /we do not guess/i, /isn['’]t ours\b/i, /we do not speak for/i, /we cannot hand you/i,
  // who actually decides
  /your county/i, /your local/i, /your city/i, /your municipal/i, /your township/i,
  /your zoning/i, /your building/i, /county auditor/i, /county zoning/i, /zoning office/i,
  /building office/i, /building department/i, /local authority/i, /local zoning/i,
  /\bassessor\b/i, /your accountant/i, /\bCPA\b/, /your carrier/i, /your insurer/i,
  /your agent\b/i, /your polic(?:y|ies)\b/i, /your insurance/i, /licensed engineer/i,
  /manufacturer/i, /kit vendor/i, /\battorney\b/i, /\bHOA\b/, /\bunderwriter/i,
  // instruction to go find out
  /\bask(?:s|ed|ing)?\b/i, /\bconfirm/i, /check with/i, /\bconsult/i, /\bcontact\b/i,
  /\bcall your\b/i, /\bverify\b/i,
  // conditionality
  /\bvaries\b/i, /\bvary\b/i, /\bdepends?\b/i, /\bdiffer/i, /not a determination/i,
  /general references?/i, /not legal advice/i, /\bwhether\b/i, /separate question/i,
  /\bown provisions\b/i,
];

/* ------------------------------------------------------------------ the seven classes */

interface Topic { re: RegExp; requires?: RegExp }
interface HsClass {
  id: number;
  name: string;
  mode: 'absolute' | 'strict' | 'block';
  /** Violations regardless of any hedge. HS_003 enumerates these outright. */
  absolute: RegExp[];
  /** Regulated nouns. Need a determination marker in the same sentence to fire. */
  topics: Topic[];
}

const HS_CLASSES: HsClass[] = [
  {
    id: 1,
    name: 'PERMIT OUTCOME',
    mode: 'block',
    absolute: [
      /\bno permit\b/i, /\bpermit[- ]free\b/i, /\bwithout a permit\b/i,
      /\bdon['’]t need a permit\b/i, /\bdoesn['’]t require a permit\b/i,
      /\bno inspection\b/i, /\busually no permit\b/i, /\brarely need a permit\b/i,
      /without a permanent structure permit/i, /\bno permit(?:s)? (?:needed|required)\b/i,
    ],
    topics: [
      { re: /\bpermit(?:s|ting)?\b/i },
      { re: /\bpermitted\b(?! by (?:law|applicable))/i },
      { re: /\bbuilding inspection\b/i },
      { re: /\bzoning inspection\b/i },
      { re: /\bcertificate of occupancy\b/i },
      { re: /\bzoning certificate\b/i },
    ],
  },
  {
    id: 2,
    name: 'BUILDING CLASSIFICATION',
    mode: 'absolute',
    absolute: [
      /\bpersonal property\b/i, /\breal property\b/i, /\btangible property\b/i,
      /\bpermanent structures?\b/i, /\bpermanent building\b/i, /\btemporary structures?\b/i,
      /\baccessory structures?\b/i, /\bnot a building\b/i, /\bis a building\b/i,
      /\bclassified as\b/i, /\breclassif/i, /\bpermanent[- ]structure review\b/i,
      /\bnot (?:a |an )?permanent\b/i,
    ],
    topics: [],
  },
  {
    id: 3,
    name: 'ZONING OUTCOME',
    mode: 'block',
    absolute: [
      /\bzoning allows\b/i, /\ballowed by right\b/i, /\bby right\b/i, /\bno variance\b/i,
      /\bgrandfather/i, /\bzoned exempt\b/i, /\bzoning exempt\b/i, /\bzoning permits you\b/i,
    ],
    topics: [
      { re: /\bzoning\b/i },
      { re: /\bzoned\b/i },
      { re: /\bvariance\b/i },
      { re: /\bsetback/i },
      { re: /\bland[- ]use (?:rule|law|code|permit|approval|restriction)/i },
      { re: /\bcode enforcement\b/i },
    ],
  },
  {
    id: 4,
    name: 'TAX / ASSESSMENT OUTCOME',
    mode: 'block',
    absolute: [
      /\bno reassessment\b/i, /\breassessment of your\b/i, /\bnot taxable\b/i,
      /\bwon['’]t raise your taxes\b/i, /\bassessed value\b/i,
      /\bproperty[- ]tax reclassification\b/i, /\bno property tax\b/i,
    ],
    topics: [
      { re: /\bproperty tax/i },
      { re: /\btax(?:es|able|ation)?\b/i },
      { re: /\breassess/i },
      { re: /\bproperty assessment\b/i },
      { re: /\btax assessment\b/i },
      { re: /\breal[- ]estate assessment\b/i },
      { re: /\bassessor\b/i },
      { re: /\bcounty auditor\b/i },
      // depreciation only counts as a tax topic in a tax context, not as "steel doesn't depreciate"
      { re: /\bdepreciat/i, requires: /\btax|\bIRS\b|\bMACRS\b|accountant|asset class|recovery period/i },
      { re: /\bMACRS\b/ },
    ],
  },
  {
    id: 5,
    name: 'INSURANCE COVERAGE',
    mode: 'strict',
    absolute: [
      /\b(?:most|many|standard|typical|commercial|all)\s+(?:\w+\s+){0,3}polic(?:y|ies)\b/i,
      /polic(?:y|ies)\s+(?:\w+\s+){0,2}(?:cover|covers|require|requires|accept|accepts)\b/i,
      /\bmeets the bar\b/i,
      /\bcovered (?:by|under)\b[^.]{0,60}polic/i,
      /\binsurance\b[^.]{0,40}\bcovers?\b/i,
    ],
    topics: [
      { re: /\binsurance\b/i },
      { re: /\binsurer/i },
      { re: /\bcarrier\b/i },
      { re: /\bunderwrit/i },
      { re: /\bcoverage\b/i },
      { re: /\bdeductible\b/i },
      // "policy" alone is the privacy policy far more often than an insurance policy
      { re: /\bpolic(?:y|ies)\b/i, requires: /insur|carrier|underwrit|deductible|coverage|claim/i },
    ],
  },
  {
    id: 6,
    name: 'STRUCTURAL / LOAD / MOUNTING CAPACITY',
    mode: 'strict',
    absolute: [
      /\brated for\b/i, /\bload[- ]bearing\b/i, /\bsupports? the weight\b/i,
      /\bcan support\b/i, /\bmounts? (?:directly )?to\b/i, /\bpsf\b/i,
      /\b\d+\s*mph\b/i, /\bsnow load\b/i, /\bwind rating\b/i, /\bholds? the weight\b/i,
    ],
    topics: [
      { re: /\brated\b/i },
      { re: /\brating\b/i },
      { re: /\bload (?:rating|capacity|limit)\b/i },
      { re: /\bcarry (?:a |the )?load\b/i },
      { re: /\bweight capacity\b/i },
      { re: /\b(?:pounds?|lbs?|tons?) per\b/i },
      { re: /\bwind (?:load|speed)\b/i },
      { re: /\bspan(?:s|ned|ning)\b/i },
      { re: /\banchor/i },
      { re: /\bbolt(?:s|ed)? (?:to|into|through)\b/i },
      { re: /\bmount(?:s|ed|ing)? (?:to|into|onto|on the|directly)\b/i },
      { re: /\bfasten/i },
      { re: /\bweld(?:s|ed)? (?:to|onto)\b/i },
      { re: /(?:requires?|needs?|takes?|without|no)\s+(?:a\s+)?crane\b/i },
      { re: /\bhoist/i },
      { re: /\brigging\b/i },
      { re: /\blift(?:s|ed|ing)? (?:it|the unit|and shift)\b/i },
      // "pallets stacked two-high" is a volume statement, not a load rating. Only stacking
      // CONTAINERS is a class 6 claim.
      { re: /\bstack(?:ing|ed)?\s+(?:\w+\s+){0,2}(?:containers?|units?|boxes)\b/i },
      { re: /\b(?:containers?|units?|boxes)\s+(?:can|could|may|are|will)?\s*(?:be\s+)?stacked\b/i },
      { re: /\bstack(?:ing|ed)?\s+(?:two|three|four|\d)[- ](?:high|deep)\b/i, requires: /container|unit|box/i },
      { re: /\bstructural (?:capacity|rating|integrity of|approval for)\b/i },
      { re: /\bstructurally (?:rated|capable|sufficient)\b/i },
    ],
  },
  {
    id: 7,
    name: 'JURISDICTION PLUS OUTCOME',
    mode: 'block',
    absolute: [],
    topics: [], // handled by the dedicated jurisdiction pass below
  },
];

/**
 * Class 7 gets its own pass: a NAMED county / city / township / state in the same sentence as a
 * permit, zoning, or tax outcome. Mandatory because the spec-doc sweep's worst four violations were
 * exactly this shape. Every one of the 13 `zoning:` arrays in `src/data/cities.ts` names a county,
 * so this pass has to survive the hardest negative cases in the repo: it requires a determination
 * marker, which county-plus-office-plus-url reference data never has.
 */
const JURISDICTION_STATES = [
  'Ohio', 'Indiana', 'Kentucky', 'West Virginia', 'Michigan', 'Georgia', 'Texas', 'Virginia',
  'South Carolina', 'North Carolina', 'New York', 'Missouri', 'Kansas', 'Tennessee', 'Illinois',
  'Pennsylvania',
];
const JURISDICTION: RegExp[] = [
  /\b[A-Z][a-z]+ County\b/,
  /\b[A-Z][a-z]+ Township\b/,
  /\bCity of [A-Z][a-z]+/,
  new RegExp(`\\b(?:${JURISDICTION_STATES.join('|')})\\b`),
  /\b(?:Cincinnati|Dayton|Columbus|Indianapolis|Louisville|Cleveland|Savannah|Charleston|Norfolk|Houston|Detroit|Kansas City|New York)\b/,
];
const JURISDICTION_OUTCOME: RegExp[] = [
  /\bpermit/i, /\bzoning\b/i, /\bzoned\b/i, /\btax/i, /\bassess/i, /\bexempt/i, /\bvariance\b/i,
];

/* ------------------------------------------------------------------ allowlist */

interface AllowEntry {
  /** Repo-relative path, POSIX separators. Empty string means "any file". */
  file: string;
  /** Substring of the flagged sentence. Case sensitive. */
  contains: string;
  /** Which class ids this entry clears. */
  classes: number[];
  /** REQUIRED. Why this copy is not a PROJECT_HS_003 determination. */
  reason: string;
}

const ALLOWLIST: AllowEntry[] = [
  {
    file: 'src/pages/terms.astro',
    contains: 'assume exclusive liability',
    classes: [2, 4],
    reason:
      'Sale-terms indemnity boilerplate. It assigns tax LIABILITY to the customer and determines ' +
      'no outcome for anyone. "personal property taxes" is the statutory name of a tax category ' +
      'here, not a classification claim about the container. HS_003 bans determinations, and this ' +
      'clause makes the opposite move by disclaiming them.',
  },
  {
    file: 'src/data/cities.ts',
    contains: 'City of Houston (no zoning',
    classes: [3, 7],
    reason:
      'Adjudicated in the 2026-08-10 violation inventory (BORDERLINE section, cities.ts:629, now ' +
      '639): factual about Houston\'s development-rule regime, not a determination about the ' +
      'reader\'s container. It is the `zoning[].county` label, the paired `office` and `url` ' +
      'fields render beside it, and the next sentence defers. Not schema-bound.',
  },
  {
    file: 'src/data/containerReference.ts',
    contains: 'usually needs an oversize permit',
    classes: [1],
    reason:
      'Road-transport permit pulled by the hauler for an over-length load, not a land-use ' +
      'determination about the reader\'s property. HS_003 class 1 targets reader reliance on a ' +
      'permit outcome for their own parcel. Flagged to the owner as an allowlist judgment call; ' +
      'if the owner scopes transport permits in, delete this entry and reword the note.',
  },
  // NOTE, and the reason the entry above is only a judgment call:
  // `src/content/blog/shipping-container-dimensions-size-chart.md:96` makes the SAME oversize-permit
  // statement and needs no entry at all, because it closes with "Checking on permits is the buyer's
  // job, with the local permitting office." That sentence is the fix to copy into the
  // containerReference.ts note, after which the entry above should be deleted.
  {
    file: 'src/content/blog/contractor-who-stopped-losing-tools.md',
    contains: 'It did not cover the deductible',
    classes: [5],
    reason:
      'Past-tense narrative about one character\'s own settled claim in a parable post, not a ' +
      'statement about what any reader\'s policy covers. A deductible is by definition the ' +
      'uncovered portion. The same post is cited in the 2026-08-10 inventory as a CLEAN model.',
  },
  {
    file: 'src/content/blog/check-used-container-identity-free-bic-lookups.md',
    contains: 'Coverage is partial and voluntary',
    classes: [5],
    reason:
      'The subject of "Coverage" here is a DATABASE, not a policy: it is how much of the world ' +
      'container fleet appears in BIC BoxTech, sourced to UK MCA notice MIN 633 in the very next ' +
      'sentence. No insurer, no carrier and no reader policy is named anywhere in the paragraph, ' +
      'and the sentence attributes the claim to a regulator rather than determining anything for ' +
      'the reader. Class 5 fires only on the bare word "Coverage" plus a negation.',
  },
];

/* ------------------------------------------------------------------ detector */

const anyHit = (list: RegExp[], s: string): RegExp | undefined => list.find((r) => r.test(s));

function topicHit(topics: Topic[], sentence: string): { re: RegExp; text: string } | undefined {
  for (const t of topics) {
    if (t.requires && !t.requires.test(sentence)) continue;
    const m = sentence.match(t.re);
    if (m) return { re: t.re, text: m[0] };
  }
  return undefined;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z"'“(])|(?<=[;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** A question cannot be a determination. Kills FAQ `q:` fields and interrogative headings. */
const isQuestion = (s: string): boolean => /\?\s*$/.test(s);

/**
 * A bare citation label is attribution, which HS_003 names as one of the two permitted tools.
 * "Ohio agricultural zoning exemption \u2014 Ohio Revised Code §519.21" is a link label naming a
 * statute. It becomes a determination the moment it acquires a subject, so any reference to the
 * reader or the container disqualifies it.
 */
function isBareCitationLabel(text: string): boolean {
  const cites = /§|\bORC\b|\bKRS\b|\bIC \d|Revised Code|U\.S\.C\.|Publication \d+|Chapter \d+|Extension\b/;
  const subject = /\b(?:you|your|we|our|us|it|its|container|containers|contains)\b/i;
  return cites.test(text) && !subject.test(text);
}

export interface Hit {
  classId: number;
  className: string;
  matched: string;
  sentence: string;
  layer: 'absolute' | 'shape' | 'jurisdiction';
}

export interface ScanOptions {
  /** Atomic surfaces (heading, table cell, alt, link label, meta, short data field) are strict. */
  atomic?: boolean;
  /** Set false to prove the shape layer catches paraphrases a blacklist would miss. */
  useAbsolute?: boolean;
}

/** Scans one text UNIT (a paragraph, a table cell, or a single data / FAQ string). */
export function scanUnit(text: string, opts: ScanOptions = {}): Hit[] {
  const atomic = opts.atomic ?? false;
  const useAbsolute = opts.useAbsolute ?? true;
  const hits: Hit[] = [];
  if (isBareCitationLabel(text)) return hits;

  const unitDeferral = !!anyHit(DEFERRAL, text);

  for (const sentence of splitSentences(text)) {
    const sentenceDeferral = !!anyHit(DEFERRAL, sentence);
    const determination = isQuestion(sentence) ? undefined : anyHit(DETERMINATION, sentence);

    for (const cls of HS_CLASSES) {
      if (useAbsolute) {
        for (const re of cls.absolute) {
          const m = sentence.match(re);
          if (m) {
            hits.push({
              classId: cls.id, className: cls.name, matched: m[0],
              sentence, layer: 'absolute',
            });
          }
        }
      }

      if (cls.id === 7) {
        if (!determination) continue;
        const j = anyHit(JURISDICTION, sentence);
        const o = anyHit(JURISDICTION_OUTCOME, sentence);
        if (!j || !o) continue;
        const cleared = atomic ? sentenceDeferral : sentenceDeferral || unitDeferral;
        if (cleared) continue;
        hits.push({
          classId: 7, className: cls.name,
          matched: `${sentence.match(j)?.[0]} + ${sentence.match(o)?.[0]}`,
          sentence, layer: 'jurisdiction',
        });
        continue;
      }

      if (cls.mode === 'absolute' || !cls.topics.length || !determination) continue;
      const t = topicHit(cls.topics, sentence);
      if (!t) continue;
      const strict = atomic || cls.mode === 'strict';
      const cleared = strict ? sentenceDeferral : sentenceDeferral || unitDeferral;
      if (cleared) continue;
      hits.push({
        classId: cls.id, className: cls.name,
        matched: `${t.text} + ${sentence.match(determination)?.[0]}`,
        sentence, layer: 'shape',
      });
    }
  }
  return hits;
}

/* ------------------------------------------------------------------ surface extraction */

interface Unit { line: number; text: string; atomic: boolean; startLine: number; endLine: number }

const decode = (s: string): string =>
  s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&times;/g, 'x').replace(/&mdash;/g, ' ').replace(/&sect;/g, '§');
const stripTags = (s: string): string =>
  decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const lineAt = (src: string, index: number): number => src.slice(0, index).split('\n').length;
const ATOMIC_TAGS = /^(?:h[1-6]|td|th|span|strong|em|summary|figcaption|dt)$/i;
const ATOMIC_MAX_CHARS = 120;

/**
 * Strips `//` line comments and block comments from JS/TS source BEFORE string-literal extraction
 * (T-146). Without this, a stray quote character inside a comment is treated as an opening string
 * delimiter and re-pairs every literal below it. The failure is a PARITY bug: an even number of
 * comment quotes is benign, an odd number swallows real atomic literals into giant non-atomic
 * blobs, silently destroying scan coverage while every test stays green. It manufactured a phantom
 * class-1 finding against a compliant FAQ before it was diagnosed.
 *
 * String-aware by a character walk, not a regex:
 *   - Inside a string literal (opened by " ' or `, honoring backslash escapes): comment markers are
 *     literal text and survive, so a URL like 'https://example.com' stays intact. Template-literal
 *     content is treated simply; `${}` interiors are not re-tokenized, which is fine because
 *     scanUnit blanks `${...}` spans anyway.
 *   - Inside a comment: every stripped character becomes a space and newlines are kept, so the
 *     output is the SAME LENGTH as the input. That matters: findings report `file:line` positions
 *     computed by `lineAt` from match indices, and index fidelity is what keeps them true.
 * Known, accepted limitation: regex literals are not tokenized, so a regex containing `//` (for
 * example an escaped-slash URL pattern) would open a false line comment to end of line. No scanned
 * file does this today; the exposure is one line, not the rest of the file.
 */
export function stripJsComments(code: string): string {
  let out = '';
  let i = 0;
  let quote = '';
  while (i < code.length) {
    const ch = code[i] ?? '';
    const next = code[i + 1] ?? '';
    if (quote) {
      if (ch === '\\') { out += ch + next; i += 2; continue; }
      if (ch === quote) quote = '';
      out += ch;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; i += 1; continue; }
    if (ch === '/' && next === '/') {
      while (i < code.length && code[i] !== '\n') { out += ' '; i += 1; }
      continue;
    }
    if (ch === '/' && next === '*') {
      out += '  ';
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) {
        out += code[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      if (i < code.length) { out += '  '; i += 2; }
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function extractUnits(file: string, src: string): Unit[] {
  const units: Unit[] = [];
  const push = (startIdx: number, raw: string, text: string, atomic: boolean): void => {
    if (text.length < 12) return;
    const start = lineAt(src, startIdx);
    units.push({
      line: start, startLine: start, endLine: start + raw.split('\n').length - 1,
      text, atomic: atomic || text.length < ATOMIC_MAX_CHARS,
    });
  };

  if (/\.mdx?$/.test(file)) {
    const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
    let body = src;
    if (fm) {
      const fmBlock = fm[1] ?? '';
      for (const m of fmBlock.matchAll(/^(title|description|excerpt|summary|answer):\s*["']?(.+?)["']?\s*$/gm)) {
        push(src.indexOf(fmBlock) + (m.index ?? 0), m[0] ?? '', (m[2] ?? '').trim(), true);
      }
      body = src.slice((fm[0] ?? '').length);
    }
    const offset = src.length - body.length;
    let cursor = 0;
    for (const para of body.split(/\n\s*\n/)) {
      const idx = body.indexOf(para, cursor);
      cursor = idx + para.length;
      const text = stripTags(
        para.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'),
      );
      push(offset + idx, para, text, /^#+\s/.test(para));
    }
    return units;
  }

  const isAstro = file.endsWith('.astro');
  let head = src;
  let body = '';
  if (isAstro) {
    const m = src.match(/^---\n([\s\S]*?)\n---\n/);
    if (m) { head = m[1] ?? ''; body = src.slice((m[0] ?? '').length); } else { head = ''; body = src; }
  }

  // Frontmatter / data-file string literals. This is the surface that feeds the FAQPage JSON-LD.
  // Comments are stripped first (T-146): the stripper is length-preserving, so match indices, and
  // therefore the file:line numbers findings report, still point at the original source.
  const litSrc = stripJsComments(isAstro ? head : src);
  const litOffset = isAstro && head ? src.indexOf(head) : 0;
  for (const m of litSrc.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
    const raw = m[2] ?? '';
    if (raw.length < 25) continue;
    if (/^[\w./#@:-]+$/.test(raw) || /^https?:/.test(raw)) continue;
    const text = stripTags(raw.replace(/\\(['"`])/g, '$1').replace(/\$\{[^}]*\}/g, ' '));
    push(litOffset + (m.index ?? 0), raw, text, false);
  }

  if (!body) return units;

  const blanked = body
    .replace(/<style[\s\S]*?<\/style>/g, (s) => s.replace(/[^\n]/g, ' '))
    .replace(/<script[\s\S]*?<\/script>/g, (s) => s.replace(/[^\n]/g, ' '));
  const bodyOffset = src.length - body.length;
  for (const m of blanked.matchAll(
    /<(p|h[1-6]|li|td|th|span|figcaption|summary|blockquote|dd|dt)\b[^>]*>([\s\S]*?)<\/\1>/g,
  )) {
    push(bodyOffset + (m.index ?? 0), m[0] ?? '', stripTags(m[2] ?? ''), ATOMIC_TAGS.test(m[1] ?? ''));
  }
  // Attribute surfaces that ship as text. HS_003 calls these out by name.
  for (const m of blanked.matchAll(
    /\b(?:alt|title|aria-label|content|metaDescription|description|headline)=(["'])([\s\S]*?)\1/g,
  )) {
    push(bodyOffset + (m.index ?? 0), m[0] ?? '', stripTags(m[2] ?? ''), true);
  }
  return units;
}

/* ------------------------------------------------------------------ file walk */

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|md|mdx)$/.test(entry) && !/\.bak$|\.test\.ts$|\.d\.ts$/.test(entry)) acc.push(p);
  }
  return acc;
}

function collectFiles(): string[] {
  const out: string[] = [];
  for (const target of SCAN_TARGETS) {
    const p = join(REPO_ROOT, target);
    if (!existsSync(p)) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out.sort();
}

const rel = (p: string): string => relative(REPO_ROOT, p).split(sep).join('/');

const isDraftPost = (src: string): boolean => /^draft:\s*true\s*$/m.test(src);

function inlineAllowed(srcLines: string[], unit: Unit): string | undefined {
  const from = Math.max(0, unit.startLine - 2);
  const to = Math.min(srcLines.length, unit.endLine);
  for (let i = from; i < to; i++) {
    const m = (srcLines[i] ?? '').match(/hs003-allow:\s*(.+)/);
    if (m && (m[1] ?? '').replace(/[-*/>\s]+$/, '').trim().length > 0) return m[1];
  }
  return undefined;
}

function allowlisted(file: string, hit: Hit): AllowEntry | undefined {
  return ALLOWLIST.find(
    (e) => (e.file === '' || e.file === file)
      && e.classes.includes(hit.classId)
      && hit.sentence.includes(e.contains),
  );
}

/* ------------------------------------------------------------------ reporting */

const COMPLIANT_TEMPLATES = [
  'src/pages/permits/index.astro (whole page, audited compliant 2026-08-10)',
  'src/pages/for/farmers/index.astro lines 17, 116, 117 (cite the statute, then disclaim the determination)',
  'src/pages/for/homeowners/index.astro lines 27, 59, 149',
  'src/pages/shipping-containers-for-sale/index.astro:38 (the model for a structural question)',
  'src/data/cities.ts zoning arrays (named county + office + url + buyer responsibility)',
];

const CLASS_GUIDANCE: Record<number, string> = {
  1: 'Describe who decides and what changes the answer. Never assert a permit is or is not needed.',
  2: 'Do not classify the container in EITHER direction. Not "personal property", not "permanent structure". Describe the physical setup instead: what gets poured, what gets built, what can be moved.',
  3: 'Zoning outcomes belong to the zoning office. "Your zoning office decides X" is fine, "zoning allows X" is not.',
  4: 'Tax and assessment outcomes belong to the accountant and the county auditor. No comparative assessment claims about alternatives either.',
  5: 'Never state what a third party\'s policy covers, requires, or accepts. "Ask your carrier whether X" is compliant, "your carrier covers X" is not, and the deferral must sit in the SAME sentence as the claim.',
  6: 'Deflect structural, load, and mounting questions to the container or kit manufacturer or a licensed engineer. No figures, even attributed ones.',
  7: 'Never name a county, city, township, or state in the same breath as a permit, zoning, or tax outcome. Name the OFFICE instead of the outcome.',
};

function formatFinding(file: string, unit: Unit, hit: Hit): string {
  return [
    '',
    `  ${file}:${unit.line}${unit.atomic ? '  [ATOMIC SURFACE: no room for a hedge, strictest handling]' : ''}`,
    `    PROJECT_HS_003 class ${hit.classId}: ${hit.className}   (detected by: ${hit.layer} layer)`,
    `    matched : ${hit.matched}`,
    `    sentence: ${hit.sentence.length > 300 ? `${hit.sentence.slice(0, 300)}...` : hit.sentence}`,
    `    why     : ${CLASS_GUIDANCE[hit.classId]}`,
  ].join('\n');
}

function failureMessage(findings: string[]): string {
  return [
    '',
    `PROJECT_HS_003 GUARD: ${findings.length} prohibited determination(s) found in scanned content.`,
    '',
    'The rule: never determine or promise a regulatory, tax, insurance, or structural outcome on',
    'the reader\'s behalf, in either direction, for any jurisdiction or any third party.',
    'Full text: "UDO Project/HARD_STOPS.md", section PROJECT_HS_003.',
    'Going silent is NOT the fix. HS_003 says reframe, do not remove: describe the QUESTION, name',
    'who decides, say what changes the answer, and hand the call back to the reader.',
    ...findings,
    '',
    'COPY ONE OF THESE COMPLIANT TEMPLATES INSTEAD OF INVENTING PHRASING:',
    ...COMPLIANT_TEMPLATES.map((t) => `  - ${t}`),
    '',
    'IF THE GUARD IS WRONG (it can be), do not delete patterns:',
    '  1. Add an ALLOWLIST entry in this test file with a `reason`. Stale entries fail the suite,',
    '     so the list cannot silently rot.',
    '  2. Or put "hs003-allow: <reason>" in a comment on or directly above the source line.',
    '  Reporting a real violation to the owner rather than fixing it silently is also correct;',
    '  that is the HS_003 violation protocol.',
    '',
  ].join('\n');
}

/* ------------------------------------------------------------------ fixtures */

/**
 * The 12 HARD VIOLATIONS from
 * `UDO Project/.outputs/container-shelter/2026-08-10-permit-gate-violation-inventory.md`,
 * verbatim from `git show 544077b:<path>` (the pre-cleanup tree). Every one was live for six to
 * nine weeks and six of them fed the FAQPage JSON-LD. This is the test's own test: without these
 * there is no evidence the guard works.
 */
interface Fixture {
  id: string;
  where: string;
  text: string;
  atomic?: boolean;
  expectClasses: number[];
  /** True if the shape layer alone (absolute patterns off) must also catch it. */
  shapeAlone?: boolean;
}

const KNOWN_VIOLATIONS: Fixture[] = [
  {
    id: 'V1',
    where: 'src/pages/for/businesses/index.astro:32 (faqs index 3, feeds FAQPage JSON-LD)',
    text:
      'A purchased container is generally treated as tangible personal property and depreciates '
      + 'under MACRS as a 5- or 7-year asset under standard IRS classifications \u2014 though your '
      + 'accountant should confirm the right treatment for your specific use. The container is not '
      + 'real property, so it does not typically trigger a real-estate assessment or a property-tax '
      + 'reclassification. A leased container would instead be expensed as an operating cost. We '
      + 'provide a standard bill of sale for every purchase for your records.',
    expectClasses: [2, 4],
  },
  {
    id: 'V2',
    where: 'src/pages/for/businesses/index.astro:291 (second hardcoded copy of V1, rendered)',
    text:
      'A purchased container is generally treated as tangible personal property and depreciates '
      + 'under MACRS (IRS Publication 946) as a 5- or 7-year asset under standard IRS '
      + 'classifications \u2014 though your accountant should confirm the right treatment for your '
      + 'specific use. The container is not real property, so it does not typically trigger a '
      + 'real-estate assessment or a property-tax reclassification.',
    expectClasses: [2, 4],
  },
  {
    id: 'V3',
    where: 'src/pages/for/homeowners/index.astro:43 (faqs index 5, JSON-LD + visible at 289)',
    text:
      'No foundation is required. A container rests on its four corner castings, so most homeowners '
      + 'place a concrete block, a railroad tie, or a paver under each corner to keep it level and '
      + 'lift the steel floor off wet ground. Level, firm ground \u2014 a driveway, a gravel pad, or '
      + 'compacted grass \u2014 is all you need. A foundation or slab is optional and only matters if '
      + "you're building something permanent. Because it isn't anchored to a foundation, the "
      + "container stays personal property, which is part of why it's often treated differently "
      + 'from permanent structures under local rules.',
    expectClasses: [2],
  },
  {
    id: 'V4',
    where: 'src/pages/for/farmers/index.astro:122 (compliant line 117 sits FIVE lines above it)',
    text:
      "Because it isn't anchored to the ground, it stays classified as personal property. You can "
      + 'place it, relocate it across the farm, or sell it off without triggering a '
      + 'permanent-structure review or a reassessment of your land. That flexibility is the '
      + "difference between an asset you control and a building you're committed to for good.",
    expectClasses: [2, 4],
    shapeAlone: true,
  },
  {
    id: 'V5',
    where: 'src/pages/for/farmers/index.astro:37 (faqs index 5, JSON-LD + visible at 304)',
    text:
      'For secure, enclosed storage it usually works out leaner. A pole barn is a permanent '
      + 'structure \u2014 posts set in concrete, weeks of on-site construction, and often permits and a '
      + 'bump in assessed value. A container is a one-time purchase delivered ready to use, with no '
      + 'foundation and no build, and it stays personal property you can resell or move.',
    expectClasses: [2, 4],
  },
  {
    id: 'V6',
    where: 'src/pages/for/farmers/index.astro:166 (table cells, the most quotable form on the site)',
    text: 'One-time buy; stays personal property and resells',
    atomic: true,
    expectClasses: [2],
  },
  {
    id: 'V6b',
    where: 'src/pages/for/farmers/index.astro:166 (pole barn column of the same row)',
    text: 'Built structure; can raise your assessed value',
    atomic: true,
    expectClasses: [4],
    shapeAlone: false,
  },
  {
    id: 'V7',
    where: 'src/pages/for/businesses/index.astro:126 (TWO claims; the inventory quote reached only the first)',
    text:
      'Container doors open at ground level to a hardwood or steel plate floor rated for the weight '
      + 'of loaded pallets. Standard ISO containers have forklift pockets on the underside, so '
      + "repositioning a unit on your site doesn't require a crane \u2014 a forklift of adequate "
      + 'capacity can lift and shift it. Pallet jacks and forklifts drive straight in through the '
      + 'doors. No dock, no lift gate, no ramp required for ground-level loading.',
    expectClasses: [6],
    shapeAlone: true,
  },
  {
    id: 'V8',
    where: 'src/pages/for/businesses/index.astro:143 (and its H3 at :142, a heading surface)',
    text:
      'A Cor-Ten steel container fitted with a puck-lock hasp meets the bar for covered '
      + 'business-property storage under most commercial property insurance policies. There\'s no '
      + 'soft aluminum skin, no roofline gap, and no plastic panel to cut through \u2014 the recessed '
      + 'lockbox shields the lock shackle from bolt cutters. We provide delivery documentation for '
      + 'your records, and if your carrier has a specific requirement \u2014 a particular lock type, a '
      + "documented placement, a serial number for the schedule \u2014 let us know and we'll "
      + 'accommodate it.',
    expectClasses: [5],
  },
  {
    id: 'V8b',
    where: 'src/pages/for/businesses/index.astro:142 (H3; HS_003 names headings as a stripping surface)',
    text: 'Secure enough for most commercial insurance policies',
    atomic: true,
    expectClasses: [5],
  },
  {
    id: 'V9',
    where: 'src/pages/for/businesses/index.astro:44 (faqs index 6, feeds FAQPage JSON-LD)',
    text:
      'For most commercial inventory, yes. The container body is Cor-Ten steel with no soft panels '
      + 'or roofline gaps, and the recessed lockbox shields a puck-lock hasp from bolt cutters '
      + '\u2014 substantially harder to breach than a job-site trailer or a wood structure. That '
      + 'construction is why most commercial property insurance policies cover goods stored in a '
      + 'sealed, locked container. For high-value loads, businesses commonly add a secondary lock, '
      + 'motion lighting, or a camera, and we can document placement and serial numbers for your '
      + 'insurer.',
    expectClasses: [5],
  },
  {
    id: 'V10',
    where: 'src/pages/for/businesses/index.astro:56 (faqs index 9, feeds FAQPage JSON-LD)',
    text:
      "Yes \u2014 it's one of the most common commercial uses. A Wind & Water Tight container is sealed "
      + 'against rain, wind, and snow and locks with a puck-lock hasp, so it suits inventory, '
      + 'equipment, records, and seasonal overflow kept on your own property. Most commercial '
      + 'property insurance policies cover goods stored in a sealed, locked container; if your '
      + 'carrier has specific requirements we can document placement and serial numbers. Set it on '
      + 'gravel, asphalt, or leveling blocks for year-round use, and confirm local zoning for '
      + "placement (the buyer's responsibility).",
    expectClasses: [5],
  },
  {
    id: 'V11',
    where: 'src/data/containers.ts:41 (the case that PROVED a blacklist insufficient)',
    text:
      'Secure, weatherproof storage for equipment, feed, and tools without a permanent structure '
      + 'permit in most counties.',
    atomic: true,
    expectClasses: [1, 2],
    shapeAlone: true,
  },
  {
    id: 'V12',
    where: 'src/pages/for/farmers/index.astro:33 (faqs index 4; carries a PERFECT deferral in the same sentence)',
    text:
      "You're not putting up a permanent building, though confirming local zoning for placement is "
      + "still the buyer's responsibility.",
    expectClasses: [2],
  },
];

/**
 * LIVE, PRE-EXISTING, AND NOT PART OF THE 12. Present at baseline 544077b, so the 2026-08-10
 * cleanup did not introduce it and did not remove it. It ships twice in `dist/index.html` because
 * the marquee duplicates its track, and it sits in `src/components/`, the directory the audit's
 * clustering analysis declared free of this copy.
 *
 * This is the single most valuable fixture in the file:
 *   - The audit enumerated zoning-outcome phrases as "by right", "no variance", "grandfathered" and
 *     reported the category as ZERO. "zoned exempt" was live the whole time. That is the fourth
 *     independent proof that a phrase list does not work.
 *   - So the literals are asserted BOTH ways: as absolute phrases, and again with the phrase list
 *     disabled, because the next one will use words nobody enumerated either.
 * Reported to the owner as a finding. NOT fixed here, and NOT allowlisted.
 * (Status 2026-08-19: the ticker copy has since been reframed and this string is no longer live.
 * The fixtures stay, as the proof the guard catches the shape; only the array name is now dated.)
 */
const LIVE_UNFIXED_FIXTURES: Fixture[] = [
  {
    id: 'L1',
    where: 'src/components/home/HeroSection.astro:46 and :55 (homepage ticker, ships twice)',
    text: 'Most farm storage is zoned exempt',
    atomic: true,
    expectClasses: [3],
    shapeAlone: true,
  },
  {
    id: 'L2',
    where: 'the same claim spelled the other way, to cover the obvious near-miss rewrite',
    text: 'Farm storage is zoning exempt in most counties',
    atomic: true,
    expectClasses: [3],
    shapeAlone: true,
  },
  {
    id: 'L3',
    where: 'the same MEANING with none of the enumerated words, which is the real test',
    text: 'Most farm storage sits outside what the zoning code reaches',
    atomic: true,
    expectClasses: [3],
    shapeAlone: true,
  },
];

/**
 * Class 7 has no positive fixture among the 12 (the audit found zero jurisdiction-plus-outcome HARD
 * violations in `src/`), so these come from the spec docs that the sweep condemned. They are the
 * shape the brief calls the worst in the repo.
 */
const JURISDICTION_FIXTURES: Fixture[] = [
  {
    id: 'J1',
    where: 'UDO Project/.outputs/use-case-content/farmers-article.md:61 (condemned draft copy)',
    text:
      'Zoning rules in Ohio, Indiana, and Kentucky typically exempt agricultural land from the '
      + 'permit requirements that apply to residential or commercial properties. If your property '
      + 'is classified as agricultural, a storage container is usually treated as farm equipment, '
      + 'not a permanent structure. That generally means no permit paperwork, no waiting period, '
      + 'and no variance hearing.',
    expectClasses: [1, 2, 7],
    shapeAlone: true,
  },
  {
    id: 'J2',
    where: '2026-08-09 session transcript, quoted as a condemned claim',
    text: 'Most ag-classified parcels in Kentucky qualify for zoning exemptions',
    atomic: true,
    expectClasses: [7],
    shapeAlone: true,
  },
  {
    id: 'J3',
    where: 'synthetic: the named-county-plus-outcome shape, worst class per the brief',
    text: 'Hamilton County treats a storage container as exempt from a zoning certificate.',
    atomic: true,
    expectClasses: [7],
    shapeAlone: true,
  },
];

/**
 * Verified-compliant copy. These are the negative fixtures that matter most: the guard must not
 * fire on correct writing, or authors will route around it. Sources: the 2026-08-10 inventory's
 * "CLEAN, and these are the models to copy" section.
 */
const COMPLIANT_FIXTURES: { id: string; where: string; text: string; atomic?: boolean }[] = [
  {
    id: 'C1',
    where: 'src/pages/permits/index.astro:22-25, the page lede',
    text:
      "It depends on where you are and how you'll use the container. Permit and zoning rules vary "
      + "by county, municipality, and intended use \u2014 and it's the buyer's responsibility to confirm "
      + 'them with the local authority before purchasing. We do not determine, advise on, or '
      + 'guarantee permit requirements.',
  },
  {
    id: 'C2',
    where: 'src/pages/permits/index.astro:35, asserts requirements in BOTH directions but defers',
    text:
      'Whether a permit is required depends on your jurisdiction and what you plan to do with the '
      + 'container. The factors below commonly affect requirements \u2014 they are general examples, not '
      + 'a determination for your property. Always confirm with your local zoning or building '
      + 'authority before you buy.',
  },
  {
    id: 'C3',
    where: 'src/pages/permits/index.astro:62-64, "many don\'t" plus five deferrals',
    text:
      "Some municipalities require a zoning permit for a storage container; many don't. "
      + 'Agricultural and unincorporated properties are often treated differently from residential '
      + 'lots inside city limits. Residential lots inside city limits are the most likely to need a '
      + 'permit, and the rules differ from one town to the next \u2014 some set a size threshold, some '
      + 'require a setback from the property line, some have no rule at all. These are general '
      + 'references, not a determination for your property. The reliable answer comes from your '
      + "county auditor or zoning office, and confirming it before you purchase is the buyer's "
      + 'responsibility. We do not determine, advise on, or guarantee permit requirements.',
  },
  {
    id: 'C4',
    where: 'src/pages/for/farmers/index.astro:17 (faqs index 0, JSON-LD bound)',
    text:
      "It depends on your property and county, and confirming the answer is the buyer's "
      + 'responsibility before purchasing. Many states provide agricultural zoning exemptions for '
      + "farm storage \u2014 for example, Ohio's exemption (ORC 519.21) addresses zoning certificates "
      + 'for buildings used in agriculture, and Indiana and Kentucky have their own provisions '
      + "(Kentucky's generally applies to tracts of five or more contiguous acres). These rules "
      + 'vary by county and sometimes by township and are not automatic, so contact your county '
      + 'auditor or zoning office to confirm what applies to your property and intended use. We do '
      + 'not determine, advise on, or guarantee permit requirements.',
  },
  {
    id: 'C5',
    where: 'src/pages/for/farmers/index.astro:116, names three states and a statute',
    text:
      'Many states provide agricultural zoning exemptions that treat farm storage differently from '
      + 'residential or commercial structures. In Ohio, the agricultural zoning exemption (ORC '
      + '519.21) addresses zoning certificates for buildings used in agriculture; Indiana and '
      + 'Kentucky have their own provisions. These are general references, not legal advice or a '
      + 'determination for your land.',
  },
  {
    id: 'C6',
    where: 'src/pages/for/farmers/index.astro:117',
    text:
      "Rules vary by county and sometimes by township and are not automatic \u2014 and Kentucky's "
      + 'exemption generally applies to tracts of five or more contiguous acres. Confirming what '
      + "applies to your property and intended use is the buyer's responsibility: a quick call to "
      + 'your county auditor or zoning office before you commit is the reliable way to find out. We '
      + 'do not determine, advise on, or guarantee permit requirements.',
  },
  {
    id: 'C7',
    where: 'src/pages/for/homeowners/index.astro:27 (faqs index 0, JSON-LD bound)',
    text:
      'It depends on your location and intended use, and confirming it is the buyer\'s '
      + 'responsibility before purchasing. Rules differ widely from one jurisdiction to the next '
      + '\u2014 some municipalities require a permit, some set a size threshold, some have setback '
      + 'rules, and some have no restriction at all; agricultural and unincorporated properties are '
      + 'often treated differently from residential lots inside city limits. The reliable way to '
      + 'find out is to call your county auditor or zoning office and confirm what applies to your '
      + 'property. We do not determine, advise on, or guarantee permit requirements.',
  },
  {
    id: 'C8',
    where: 'src/pages/for/homeowners/index.astro:59, the hardest negative: prohibition in both directions',
    text:
      "That varies widely, and confirming it is the buyer's responsibility before purchasing. Some "
      + 'municipalities allow residential containers outright, some set a size threshold or a '
      + 'setback from the property line, some require a permit, and some prohibit them on '
      + 'residential lots \u2014 and an HOA can add its own rules on top of local zoning. Agricultural '
      + 'and unincorporated properties are often treated differently from lots inside city limits. '
      + 'The reliable way to know is to check with your county or city zoning office and your HOA '
      + 'before you buy. We do not determine, advise on, or guarantee permit or HOA requirements.',
  },
  {
    id: 'C9',
    where: 'src/pages/for/homeowners/index.astro:149',
    text:
      "Some municipalities require a zoning permit for a storage container; many don't. "
      + 'Agricultural and unincorporated properties are often treated differently from residential '
      + 'lots inside city limits. These are general references, not a determination for your '
      + 'property. The reliable answer comes from your county auditor or zoning office, and '
      + "confirming it before you purchase is the buyer's responsibility. We do not determine, "
      + 'advise on, or guarantee permit requirements.',
  },
  {
    id: 'C10',
    where: 'src/pages/shipping-containers-for-sale/index.astro:38, the model for a structural question',
    text:
      'Yes. Shipping containers are engineered to stack via their reinforced corner castings \u2014 '
      + "it's how they're stored at depots and on ships. For on-site storage we deliver and place a "
      + 'single unit; stacking on your property is possible but needs proper equipment, and any '
      + "zoning or permit requirements are the buyer's responsibility to confirm.",
  },
  {
    id: 'C11',
    where: 'src/data/homeFaq.ts:21-22, the homepage permit FAQ',
    text:
      "It depends on your county and how you'll use the container, and rules vary widely. "
      + 'Confirming permit and zoning requirements with your local authority before you buy is the '
      + "buyer's responsibility \u2014 we don't determine or guarantee them.",
  },
  {
    id: 'C12',
    where: 'src/content/blog/contractor-who-stopped-losing-tools.md:23-25, a model answer',
    text:
      "Maybe. Rules change by city and county. It's the buyer's job to check with the local "
      + "building office first. We don't make that call for you.",
  },
  {
    id: 'C13',
    where: 'src/pages/for/businesses/index.astro:126 as rewritten by the 2026-08-10 cleanup',
    text:
      'The doors open at ground level onto a plank floor, typically marine-grade hardwood plywood, '
      + 'with steel decking in some units. It is the same deck the unit carried freight on, which '
      + 'is why a pallet jack or a forklift drives straight in through the doors with no dock, no '
      + 'lift gate, and no ramp. What that floor is rated to carry is a number from the unit\'s '
      + 'manufacturer, not from us, and any load close to a limit is a question for the '
      + "manufacturer's specification or a licensed engineer. We do not issue load ratings.",
  },
  {
    id: 'C14',
    where: 'src/pages/for/businesses/index.astro:143 as rewritten by the cleanup (insurance, STRICT class)',
    text:
      'A weathering (Cor-Ten) steel body has no soft aluminum skin, no roofline gap, and no plastic '
      + 'panel to cut through, and the recessed lockbox sits over the lock shackle so a bolt cutter '
      + 'has very little to grab. That is the construction. What your policy does with it is a '
      + 'different question, and it belongs to your carrier and your agent rather than to us.',
  },
  {
    id: 'C15',
    where: 'src/data/cities.ts zoning array entries (13 cities, every one names a county)',
    text: 'Madison County Building & Zoning Department',
    atomic: true,
  },
  {
    id: 'C16',
    where: 'src/data/cities.ts zoning array entries, the longest county label in the dataset',
    text:
      'Union County Building Department (township zoning inspectors administer zoning in '
      + 'unincorporated areas)',
    atomic: true,
  },
  {
    id: 'C17',
    where: 'src/pages/for/farmers/index.astro:322, a Sources link label naming a statute',
    text: 'Ohio agricultural zoning exemption \u2014 Ohio Revised Code §519.21 · OSU Extension explainer',
    atomic: true,
  },
];

/* ------------------------------------------------------------------ tests */

describe('PROJECT_HS_003 content guard: detector correctness', () => {
  for (const fx of [...KNOWN_VIOLATIONS, ...JURISDICTION_FIXTURES, ...LIVE_UNFIXED_FIXTURES]) {
    it(`flags ${fx.id} (${fx.where})`, () => {
      const hits = scanUnit(fx.text, { atomic: fx.atomic });
      expect(hits.length, `expected at least one hit for ${fx.id}`).toBeGreaterThan(0);
      const classes = new Set(hits.map((h) => h.classId));
      for (const c of fx.expectClasses) {
        expect(
          classes.has(c),
          `${fx.id} should trip PROJECT_HS_003 class ${c}; got classes [${[...classes].join(', ')}]`,
        ).toBe(true);
      }
    });
  }

  it('flags all 12 known HARD VIOLATIONS with zero misses', () => {
    const missed = KNOWN_VIOLATIONS.filter((fx) => scanUnit(fx.text, { atomic: fx.atomic }).length === 0);
    expect(missed.map((m) => m.id)).toEqual([]);
    // 14 fixtures for the 12 counted claims: V6/V6b are the two cells of one table row, and V8b is
    // V8's own H3, which the inventory counts inside item :143.
    expect(KNOWN_VIOLATIONS.length).toBe(14);
  });

  it('catches the paraphrases a banned-phrase list provably missed, with the phrase list DISABLED', () => {
    // This is the whole reason the guard is shape-based. With `useAbsolute: false` there is no
    // blacklist at all, only topic + determination - deferral.
    const shapeOnly = [...KNOWN_VIOLATIONS, ...JURISDICTION_FIXTURES, ...LIVE_UNFIXED_FIXTURES].filter((f) => f.shapeAlone);
    expect(shapeOnly.length).toBeGreaterThanOrEqual(9);
    for (const fx of shapeOnly) {
      const hits = scanUnit(fx.text, { atomic: fx.atomic, useAbsolute: false });
      expect(hits.length, `shape layer alone missed ${fx.id}: ${fx.where}`).toBeGreaterThan(0);
    }
  });

  for (const fx of COMPLIANT_FIXTURES) {
    it(`stays silent on compliant copy ${fx.id} (${fx.where})`, () => {
      const hits = scanUnit(fx.text, { atomic: fx.atomic });
      expect(
        hits.map((h) => `class ${h.classId} via ${h.layer}: "${h.matched}" in "${h.sentence.slice(0, 160)}"`),
      ).toEqual([]);
    });
  }
});

describe('PROJECT_HS_003 content guard: allowlist hygiene', () => {
  it('every allowlist entry states a reason', () => {
    for (const e of ALLOWLIST) {
      expect(e.reason.trim().length, `allowlist entry "${e.contains}" needs a reason`).toBeGreaterThan(40);
      expect(e.classes.length).toBeGreaterThan(0);
    }
  });

  it('every allowlist entry is still needed (no stale exemptions widening the hole)', () => {
    const used = new Set<string>();
    for (const file of collectFiles()) {
      const src = readFileSync(file, 'utf8');
      const r = rel(file);
      for (const unit of extractUnits(file, src)) {
        for (const hit of scanUnit(unit.text, { atomic: unit.atomic })) {
          const entry = allowlisted(r, hit);
          if (entry) used.add(entry.contains);
        }
      }
    }
    const stale = ALLOWLIST.filter((e) => !used.has(e.contains)).map((e) => `${e.file} :: ${e.contains}`);
    expect(stale, 'these allowlist entries no longer match anything; delete them').toEqual([]);
  });
});

describe('PROJECT_HS_003 content guard: live content surfaces', () => {
  const files = collectFiles();

  it('scans the surfaces the rule actually applies to', () => {
    const scanned = files.map(rel);
    for (const required of [
      'src/pages/for/farmers/index.astro',
      'src/pages/for/homeowners/index.astro',
      'src/pages/for/businesses/index.astro',
      'src/pages/for/contractors/index.astro',
      'src/data/containers.ts',
      'src/data/cities.ts',
      'src/data/homeFaq.ts',
      'src/pages/permits/index.astro',
      'src/components/home/HeroSection.astro',
    ]) {
      expect(scanned, `guard must cover ${required}`).toContain(required);
    }
    expect(scanned.filter((f) => f.startsWith('src/content/blog/')).length).toBeGreaterThan(0);
  });

  it('contains NO prohibited permit / classification / zoning / tax / insurance / structural determinations', () => {
    const findings: string[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      const r = rel(file);
      if (!SCAN_DRAFT_POSTS && r.startsWith('src/content/blog/') && isDraftPost(src)) continue;
      const srcLines = src.split('\n');
      for (const unit of extractUnits(file, src)) {
        for (const hit of scanUnit(unit.text, { atomic: unit.atomic })) {
          if (allowlisted(r, hit)) continue;
          if (inlineAllowed(srcLines, unit)) continue;
          // One sentence can trip both layers, and nested markup yields overlapping units.
          // Report each (file, line, class, sentence) once.
          const key = `${r}:${unit.line}:${hit.classId}:${hit.sentence}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push(formatFinding(r, unit, hit));
        }
      }
    }
    expect(findings.length, failureMessage(findings)).toBe(0);
  });
});

/* ------------------------------------------------------------------ T-146 comment stripping */

/**
 * Regression suite for the T-146 parity defect. The shared literal lines are deliberately the shape
 * that got hurt: a compliant, properly hedged permit FAQ (a class-1 trigger topic that must NOT
 * fire) plus a literal carrying a URL, so the tests prove both that comment quotes no longer
 * re-pair the literals and that comment markers inside strings still survive.
 */
const T146_LITERAL_LINES = [
  "const q = 'Do I need a permit for a storage container?';",
  'const a = "Whether a permit is required depends on your jurisdiction, and confirming it with your local zoning office is the buyer\'s responsibility. We do not determine permit requirements.";',
  "const source = 'See the county fee schedule at https://example.com/permits before you call.';",
];

const T146_EXPECTED_TEXTS = [
  'Do I need a permit for a storage container?',
  "Whether a permit is required depends on your jurisdiction, and confirming it with your local zoning office is the buyer's responsibility. We do not determine permit requirements.",
  'See the county fee schedule at https://example.com/permits before you call.',
];

/** Builds a minimal .astro source: fence, the given frontmatter lines, fence, inert body. */
const t146Fixture = (...frontmatterLines: string[]): string =>
  ['---', ...frontmatterLines, '---', '<main>{a}</main>', ''].join('\n');

const t146Units = (src: string): Unit[] => extractUnits('src/pages/t146-fixture.astro', src);
const t146Texts = (src: string): string[] => t146Units(src).map((u) => u.text);

describe('PROJECT_HS_003 content guard: frontmatter comment stripping (T-146)', () => {
  it('extracts the correct units from comment-free frontmatter (control fixture)', () => {
    expect(t146Texts(t146Fixture(...T146_LITERAL_LINES))).toEqual(T146_EXPECTED_TEXTS);
  });

  it('one apostrophe in a // comment (odd parity) no longer re-pairs the literals below it', () => {
    const withComment = t146Fixture(
      "// Doug's routing notes live in the CRM, not in this file.",
      ...T146_LITERAL_LINES,
    );
    const units = t146Units(withComment);
    // Exactly the real literals, correctly bounded, identical to the comment-free extraction.
    expect(units.map((u) => u.text)).toEqual(T146_EXPECTED_TEXTS);
    expect(units.map((u) => u.text)).toEqual(t146Texts(t146Fixture(...T146_LITERAL_LINES)));
    // Line numbers still point at the original source: fence 1, comment 2, literals 3 to 5.
    expect(units.map((u) => u.line)).toEqual([3, 4, 5]);
    // And the properly hedged class-1 topic produces NO phantom finding.
    expect(units.flatMap((u) => scanUnit(u.text, { atomic: u.atomic }))).toEqual([]);
  });

  it('a string literal containing https:// survives stripping intact and is extracted whole', () => {
    const texts = t146Texts(t146Fixture(...T146_LITERAL_LINES));
    expect(texts[2]).toBe('See the county fee schedule at https://example.com/permits before you call.');
  });

  it('a block comment carrying apostrophes does not disturb extraction or line numbers', () => {
    const withBlock = t146Fixture(
      '/*',
      " * Owner's note: don't edit Doug's copy without asking first.",
      ' */',
      ...T146_LITERAL_LINES,
    );
    const units = t146Units(withBlock);
    expect(units.map((u) => u.text)).toEqual(T146_EXPECTED_TEXTS);
    // Comment chars become spaces, newlines stay, so the literals still report lines 5 to 7.
    expect(units.map((u) => u.line)).toEqual([5, 6, 7]);
    expect(units.flatMap((u) => scanUnit(u.text, { atomic: u.atomic }))).toEqual([]);
  });

  it('parity sanity: three (odd) and four (even) comment apostrophes extract the identical correct unit list', () => {
    const even = t146Fixture("// it's here, it's Doug's yard, and it's fine", ...T146_LITERAL_LINES);
    const odd = t146Fixture("// don't edit Doug's copy, per Eli's request", ...T146_LITERAL_LINES);
    expect(t146Texts(even)).toEqual(T146_EXPECTED_TEXTS);
    expect(t146Texts(odd)).toEqual(T146_EXPECTED_TEXTS);
    expect(t146Texts(odd)).toEqual(t146Texts(even));
  });

  it('stripJsComments is string-aware, honors escapes, and preserves length exactly', () => {
    const code = 'const u = \'https://a.b/c\'; // gone\n'
      + 'const v = "say \\"hi\\" // not a comment"; /* x */ const w = `tpl ${\'//\'} ok`;';
    const stripped = stripJsComments(code);
    expect(stripped.length).toBe(code.length);
    expect(stripped.split('\n').length).toBe(code.split('\n').length);
    expect(stripped).toContain("'https://a.b/c'");
    expect(stripped).toContain('\\"hi\\" // not a comment');
    expect(stripped).toContain("`tpl ${'//'} ok`");
    expect(stripped).not.toContain('// gone');
    expect(stripped).not.toContain('/* x */');
  });
});

/* ------------------------------------------------------------------ FAQ override invariant */

/**
 * Persona pages render most FAQ answers as `<p>{f.a}</p>`, but a few indices take an index-based
 * copy-override branch (`{i === 3 ? (<p>hardcoded copy</p>)`) that hardcodes a SECOND copy of a
 * string which also lives in the `faqs` array. Only the array copy reaches the FAQPage JSON-LD
 * (`buildPageSchema.ts` case 'useCase' line 141 -> `faqNode` -> `acceptedAnswer.text`), so when the
 * two drift, the page ships one claim to humans and a different one to answer engines.
 *
 * This is the exact failure the 2026-08-10 inventory called out as the CHANGE-ORDER HAZARD:
 * businesses lines 32 and 291 are separately hardcoded, and "any fix must name BOTH line numbers or
 * the page ships contradicting its own structured data". A compliance guard that only checks the
 * text cannot see that hazard, so it is checked structurally here instead.
 *
 * Entity trap, which is why the comparison is normalized rather than literal: the JS string carries
 * a bare `&` and a straight apostrophe, while the rendered markup carries `&amp;` and `&#39;`. A
 * naive string compare fails spuriously and teaches the maintainer to delete the test.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', times: 'x',
  mdash: '\u2014', ndash: '\u2013', hellip: '...', middot: '\u00b7', sect: '\u00a7',
  rsquo: '\u2019', lsquo: '\u2018', ldquo: '\u201c', rdquo: '\u201d', deg: '\u00b0',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/** Strips anchor markup and all other tags, decodes entities, collapses whitespace. */
function normalizeCopy(s: string): string {
  return decodeEntities(
    s.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '').replace(/<[^>]+>/g, ''),
  ).replace(/\s+/g, ' ').trim();
}

/** The `a:` values of the frontmatter `const faqs = [...]` array, in declaration order. */
function faqAnswers(src: string): string[] {
  const decl = src.indexOf('const faqs = [');
  if (decl < 0) return [];
  const open = src.indexOf('[', decl);
  let depth = 0;
  let close = -1;
  let quote = '';
  for (let i = open; i < src.length; i++) {
    const ch = src[i] ?? '';
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close < 0) return [];
  const block = src.slice(open, close);
  const out: string[] = [];
  for (const m of block.matchAll(/^\s*a:\s*(["'`])((?:\\.|(?!\1)[^\n])*)\1\s*,?\s*$/gm)) {
    out.push((m[2] ?? '').replace(/\\(["'`\\])/g, '$1'));
  }
  return out;
}

interface Override { index: number; html: string; line: number }

/** `{i === N ? (<p>...</p>` and `) : i === N ? (<p>...</p>` branches. Image-only branches have no <p>. */
function copyOverrides(src: string): Override[] {
  const out: Override[] = [];
  const re = /i === (\d+)\s*(?:\?|&&)\s*\(\s*(?:\/\*[\s\S]*?\*\/\s*)?(<p\b[\s\S]*?<\/p>)/g;
  for (const m of src.matchAll(re)) {
    out.push({
      index: Number(m[1]),
      html: m[2] ?? '',
      line: lineAt(src, m.index ?? 0),
    });
  }
  return out;
}

describe('PROJECT_HS_003 content guard: persona FAQ copy-override invariant', () => {
  const personaPages = existsSync(join(REPO_ROOT, 'src/pages/for'))
    ? walk(join(REPO_ROOT, 'src/pages/for')).filter((f) => f.endsWith('.astro'))
    : [];

  it('finds the persona pages and at least one copy-override branch to check', () => {
    expect(personaPages.length).toBeGreaterThanOrEqual(4);
    const total = personaPages.reduce(
      (n, f) => n + copyOverrides(readFileSync(f, 'utf8')).length,
      0,
    );
    // If this drops to 0, either the overrides were removed (good, delete this suite) or the branch
    // syntax changed and the invariant is no longer being checked (bad, fix the matcher).
    expect(total, 'no i === N copy-override branches matched; the matcher is stale').toBeGreaterThanOrEqual(2);
  });

  for (const file of personaPages) {
    const src = readFileSync(file, 'utf8');
    const r = rel(file);
    const answers = faqAnswers(src);
    for (const ov of copyOverrides(src)) {
      it(`${r}:${ov.line} override for faqs[${ov.index}] matches the JSON-LD-bound string`, () => {
        expect(answers.length, `could not parse the faqs array in ${r}`).toBeGreaterThan(0);
        expect(
          ov.index,
          `${r}:${ov.line} overrides faqs[${ov.index}] but the array has only ${answers.length} entries`,
        ).toBeLessThan(answers.length);

        const rendered = normalizeCopy(ov.html);
        const schemaBound = normalizeCopy(answers[ov.index] ?? '');
        let firstDiff = -1;
        for (let i = 0; i < Math.max(rendered.length, schemaBound.length); i++) {
          if (rendered[i] !== schemaBound[i]) { firstDiff = i; break; }
        }
        expect(
          rendered,
          [
            '',
            `FAQ COPY DRIFT: ${r}:${ov.line}`,
            `The i === ${ov.index} branch hardcodes a second copy of faqs[${ov.index}].a. They no longer match,`,
            'so this page ships one answer in the DOM and a different one in the FAQPage JSON-LD',
            '(src/lib/schema/buildPageSchema.ts case "useCase" -> faqNode -> acceptedAnswer.text).',
            'Fix BOTH places, in the same edit. This is the CHANGE-ORDER HAZARD from the 2026-08-10',
            'violation inventory, item 1: businesses lines 32 and 291.',
            `  rendered length    : ${rendered.length}`,
            `  schema-bound length: ${schemaBound.length}`,
            firstDiff >= 0
              ? `  first divergence at char ${firstDiff}:\n    rendered: ...${rendered.slice(Math.max(0, firstDiff - 60), firstDiff + 60)}...\n    schema  : ...${schemaBound.slice(Math.max(0, firstDiff - 60), firstDiff + 60)}...`
              : '  strings differ only in length',
            '',
          ].join('\n'),
        ).toBe(schemaBound);
      });
    }
  }
});

/**
 * KNOWN LIMITATIONS, stated honestly so the next maintainer does not over-trust this
 * ---------------------------------------------------------------------------------
 * 1. It reads source, so text composed at runtime (template interpolation, props threaded through
 *    components, `${}` fragments) is scanned in pieces. A determination split across an
 *    interpolation boundary can slip through. `${...}` spans are blanked before scanning.
 * 2. The BLOCK window is the paragraph or data string. A determination in paragraph A hedged only
 *    in paragraph B is caught, which is intended, but it also means an author can clear a real
 *    determination by appending a deferral sentence to the same paragraph without fixing the
 *    claim. The ABSOLUTE class exists because of exactly that failure mode, but it only covers the
 *    phrases HS_003 enumerates.
 * 3. Deferral markers are lexical. "Ask your county whether the container stays personal property"
 *    would clear the shape layer; only the ABSOLUTE layer catches it. Sarcasm, rhetorical
 *    questions, and quoted third-party claims are not understood.
 * 4. `isBareCitationLabel` clears any statute-citing text with no reader or container reference.
 *    A determination phrased entirely in the third person inside a citation label would slip.
 * 5. It does not scan `dist/`, so JSON-LD assembled by `buildPageSchema.ts`, sitemap output,
 *    `llms.txt`, and anything generated at build time are covered only via their source strings.
 * 6. It does not scan `.bak` files, `UDO Project/` docs, or anything outside SCAN_TARGETS. The
 *    audit found five severe determinations in a tracked `.bak` file; that is an owner decision
 *    (delete or accept), not a guard target, because the file does not build.
 * 7. Jurisdiction detection uses a fixed state list plus "X County / X Township / City of X". A
 *    bare municipality name outside the site's 13 cities is not recognized.
 */
