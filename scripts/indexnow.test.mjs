import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractUrls } from './indexnow.mjs';

test('extractUrls returns all loc URLs from a typical sitemap', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://steelboxdirect.com/</loc></url>
  <url><loc>https://steelboxdirect.com/locations/</loc></url>
  <url><loc>https://steelboxdirect.com/shipping-containers-for-sale/</loc></url>
</urlset>`;
  assert.deepEqual(extractUrls(xml), [
    'https://steelboxdirect.com/',
    'https://steelboxdirect.com/locations/',
    'https://steelboxdirect.com/shipping-containers-for-sale/',
  ]);
});

test('extractUrls returns empty array when sitemap has no URLs', () => {
  assert.deepEqual(extractUrls('<urlset></urlset>'), []);
});

test('extractUrls ignores entries that are not http/https URLs', () => {
  const xml = `<urlset>
    <url><loc>https://steelboxdirect.com/good/</loc></url>
    <url><loc>not-a-url</loc></url>
  </urlset>`;
  assert.deepEqual(extractUrls(xml), ['https://steelboxdirect.com/good/']);
});
