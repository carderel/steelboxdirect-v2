import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const KEY = '00a37f3071714d8fbd653e15611f3ad3';
const HOST = 'steelboxdirect.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export function extractUrls(xml) {
  return [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(m => m[1].trim());
}

async function main() {
  let xml;
  try {
    xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  } catch (err) {
    console.error(`IndexNow: failed to read dist/sitemap-0.xml — ${err.message}`);
    process.exit(1);
  }

  const urlList = extractUrls(xml);
  if (urlList.length === 0) {
    console.error('IndexNow: no URLs found in sitemap');
    process.exit(1);
  }

  console.log(`IndexNow: submitting ${urlList.length} URLs to ${ENDPOINT}`);

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  });

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    });
  } catch (err) {
    console.error(`IndexNow: network error — ${err.message}`);
    process.exit(1);
  }

  if (res.ok) {
    console.log(`IndexNow: success (HTTP ${res.status})`);
  } else {
    const text = await res.text().catch(() => '');
    console.error(`IndexNow: error (HTTP ${res.status}) ${text}`);
    process.exit(1);
  }
}

// Guard: only run when executed directly, not when imported by tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
