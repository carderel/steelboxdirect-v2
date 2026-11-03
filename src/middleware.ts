// Sends the pages.dev duplicate host to steelboxdirect.com for server rendered routes. Static pages
// never reach the worker; they get noindex from public/_headers instead. Full reasoning and scope:
// src/lib/seo/pagesDevRedirect.ts.
import { defineMiddleware } from 'astro:middleware';
import { pagesDevRedirectTarget } from './lib/seo/pagesDevRedirect';

export const onRequest = defineMiddleware((context, next) => {
  const target = pagesDevRedirectTarget(context.url, context.request.method);
  if (target) {
    return new Response(null, { status: 301, headers: { Location: target } });
  }
  return next();
});
