/**
 * Regenerates `public/_headers` from `src/data/cities.ts` and `src/data/containers.ts`.
 *
 * Run: `npm run generate:headers`. Held honest by `src/lib/compliance/markdown-twin-guard.test.ts`,
 * which regenerates in memory and fails the suite when the committed file has drifted. The full
 * rationale for why this is a generator plus a committed file, rather than an Astro route, is in
 * the header of `renderHeadersFile` in `src/lib/aeo/markdownTwin.ts`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '../src/data/cities';
import { containers } from '../src/data/containers';
import { renderHeadersFile } from '../src/lib/aeo/markdownTwin';

const out = join(process.cwd(), 'public', '_headers');
writeFileSync(out, renderHeadersFile(cities, containers), 'utf-8');
console.log(`wrote ${out}: ${cities.length} cities + ${containers.length} containers`);
