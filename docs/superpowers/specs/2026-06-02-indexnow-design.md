# IndexNow Integration — Design Spec
**Date:** 2026-06-02  
**Status:** Approved  
**Project:** Steel Box Direct (steelboxdirect.com)

---

## Goal

Automatically notify Bing (via IndexNow) of all site URLs on every Cloudflare Pages deploy, so newly published or updated pages are crawled faster.

---

## Scope

- Submit all public URLs from the generated sitemap to IndexNow on every build
- Self-contained within the Cloudflare Pages build pipeline — no GitHub Actions, no external cron
- No new npm dependencies

Out of scope:
- Google Search Console submission (Google does not support IndexNow)
- Partial/incremental submission (changed pages only)
- Webhook-based triggers

---

## Components

### 1. Key verification file — `public/{key}.txt`

IndexNow requires a key verification file hosted at `https://steelboxdirect.com/{key}.txt`. The file content is exactly the key string (a UUID). This file is committed to the repo and served statically by Cloudflare Pages.

The key is not a secret — it is intentionally public. It is hardcoded in both the key file and the submission script.

### 2. Submission script — `scripts/indexnow.mjs`

A standalone Node.js ESM script with no external dependencies. Responsibilities:

1. Read `dist/sitemap-0.xml` (written by `@astrojs/sitemap` during `npm run build`)
2. Extract all `<loc>` URL values via regex
3. POST the URL list to `https://api.indexnow.org/indexnow` with the key and host
4. Log the HTTP response status to stdout (visible in Cloudflare Pages build logs)
5. Exit with code `1` on network error or non-2xx response, so the build is marked failed

Request payload shape:
```json
{
  "host": "steelboxdirect.com",
  "key": "{key}",
  "keyLocation": "https://steelboxdirect.com/{key}.txt",
  "urlList": ["https://steelboxdirect.com/", "https://steelboxdirect.com/locations/", "..."]
}
```

### 3. Build command — `package.json`

Add a new npm script:
```json
"indexnow": "node scripts/indexnow.mjs"
```

The `package.json` `build` script stays unchanged (`astro build`). The Cloudflare Pages dashboard build command is updated from `npm run build` to:
```
npm run build && npm run indexnow
```

This is configured under **Cloudflare Pages → Settings → Builds & deployments → Build command**.

---

## Data Flow

```
git push → Cloudflare Pages build
  npm run build
    → Astro compiles all pages
    → @astrojs/sitemap writes dist/sitemap-0.xml
  npm run indexnow
    → reads dist/sitemap-0.xml
    → extracts ~20 <loc> URLs
    → POST api.indexnow.org/indexnow
    → logs 200 OK or error
  → build success/failure recorded
→ Cloudflare deploys dist/ to CDN
→ key file live at https://steelboxdirect.com/{key}.txt
→ Bing queues submitted URLs for crawl
```

---

## Key decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| URL source | `dist/sitemap-0.xml` | Canonical, auto-generated, always in sync |
| Key storage | Committed to repo (not env var) | Key is public by design |
| XML parsing | Regex on raw file string | No dependency needed for simple `<loc>` extraction |
| Failure behavior | Exit code 1 | Makes build failures visible in Cloudflare dashboard |
| Target endpoint | `api.indexnow.org` | Routes to Bing; single call covers all IndexNow participants |

---

## Files changed

| File | Action |
|------|--------|
| `public/{key}.txt` | Create — key verification file |
| `scripts/indexnow.mjs` | Create — submission script |
| `package.json` | Update — add `indexnow` script |
| Cloudflare Pages dashboard | Update — build command to `npm run build && npm run indexnow` |
