# Transcript: 2026-09-03

Continues `2026-09-02-session-transcript.md`. Two live outages, both found because the owner
noticed a symptom rather than because any alarm reached him.

## Cycle: Supabase (T-208)

Owner pasted the seller-email warning. **Invoked systematic-debugging rather than guessing**, and
the Iron Law paid off immediately: my first instinct was "env vars in Cloudflare", which would have
been wrong and would have wasted the session.

Phase 1 evidence, in order: found the message at `submit-quote.ts:229`; read the insert path and
found it correct; noticed `supabase-keepalive.yml` is UNTRACKED; parsed `.env` with Python (a
shell-sourcing error on line 16 blocked `. ./.env`, worth knowing) and probed the REST endpoint
without printing any secret. Connection failed instantly with `nodename nor servname provided`.

**Ran controls before concluding**, which is the step that made the diagnosis solid: `dig` on the
project host returns empty, `supabase.co` returns 76.76.21.21, `steelboxdirect.com` resolves. So not
local DNS, not a pause. The project is gone.

Then scoped the blast radius: 5 files, ~770 lines. Presented A/B with a recommendation.

**Two self-corrections in this cycle, both material.** I claimed D1 has "no auto-pause, ever" and had
to walk it back to what the docs actually support. And I initially framed Option B as "rebuild the
login", which under-scoped it badly: `AdminDashboard.tsx` queries the DB **from the browser** under
RLS, and D1 has no browser SDK, so it is a data-layer rebuild. Caught that by reading the component
instead of assuming.

## Cycle: the pricing harvest (T-209)

Owner said the harvest and watchdog had been failing since Aug 20. **Resisted the tempting unifying
theory** that both outages shared a Supabase root cause; checked, and the harvest does not touch
Supabase at all.

`gh run list` confirmed his date to the day. Then the useful move: instead of reading logs top to
bottom, pulled the STEP LIST, which showed `Harvest the feed` SUCCEEDED and `Gate, type check`
failed. So the harvest was never broken; the gate was.

`npx tsc --noEmit` passes locally with 0 errors, which is the discrepancy that pointed at the
runner. Pulled the 20 runner errors: every one is a missing-Astro-generated-type.

**Minimal test, per Phase 3:** deleted `.astro/` locally, got exactly 20 errors, ran `astro sync`,
got 0. Hypothesis confirmed in one shot with no fix attempts wasted.

**Then the finding that matters more than the fix.** Checked the Aug 19 "success" run's step list:
every gate SKIPPED, because gates are conditional on the feed having moved. Aug 20 was the first day
it moved and therefore the first execution of that step ever. **The gate has never passed once, and
its single green run tested nothing.** A skipped gate reads as green.

Also established the watchdog is not broken but is the alarm, and has been commenting on issue #1
daily since Aug 21.

**Quantified the harm rather than leaving it abstract:** ran the harvest locally. 99 changes, 15 of
15 metros, Louisville 40ft delivered 3000 on the site versus 2430 actual, 23.5% high. Prices fell and
the site kept the old ones. Also surfaced the compliance angle, which is the real severity driver:
CLAUDE.md's city-page price permission rests on "a daily-verified feed cures staleness", and that had
been false for 16 days while the page truthfully said "in effect since August 18".

Applied the one-line fix with the measurement written into the comment, ran all five gates green,
and **stopped short of pushing** because it changes live prices on 15 city pages. That is the owner's
authorization, not mine.

## Cycle: pricing shipped, a 403 that revealed three GitHub accounts, analytics installed

**T-209 shipped in 5291cab** on the owner's "By all means push it live", carrying both the one-line
workflow fix and the 99 fresh figures so prices corrected the same day. **Live-verified:** Louisville
40ft now reads 2,430 where it read 3,000, Lexington 2,350 where it read 2,910, and all three checked
city pages say "in effect since September 3". Checked before committing that geoPricing.ts is NOT in
routeLastmod.mjs, which is why the daily harvest never trips the freshness guard.

**Then the push 403'd, and the diagnosis was worth more than the fix (T-210).** An earlier push in
the same session had succeeded, so credentials had changed mid-session. `gh auth status` showed TWO
accounts logged in with `cardercreative-art` active and no write access here. Switched to `carderel`
and the push went through.

**Owner asked how to make it per folder, and testing beat assuming.** The credential helper is
`gh auth git-credential`, so pushes follow gh's single GLOBAL active account. I probed the helper
directly for each username: carderel (active) returned a token, cardercreative-art returned NOTHING.
**The helper serves only the active account and ignores the requested username**, which kills the
put-the-username-in-the-remote-URL trick I was one sentence from recommending.

**Then a third account surfaced, and it mattered.** `ssh -T git@github.com` authenticates as
**WowbrandsSeo**, the owner's WORK account, via the default `~/.ssh/id_ed25519`. So switching this
repo's remote to SSH without pinning an identity would have pushed SBD commits from his work account,
straight against the `sbd-automation-stays-off-work-accounts` rule. `IdentitiesOnly=yes` is the
load-bearing part of the setup, not a tidiness flag.

Checked the three existing keys before generating anything: `steelboxdirect_key`, `claude-deploy` and
`cftma_server` are not registered with GitHub at all, and `id_ed25519` is the work account. None was
reusable. Generated `~/.ssh/gh_carderel`, set this repo's `core.sshCommand`, and **deliberately left
the remote on HTTPS** so pushing keeps working until he adds the public key.

**Analytics installed and shipped in bdd5e45 (T-211).** One insertion in the single layout covered
69 of 69 built HTML files, exactly once each, before `</body>`, verified in the built output rather
than reasoned about. Gated on `isProd` for the same reason GTM is, since an ungated beacon would
report dev traffic into the numbers it exists to measure. Told the owner plainly that the token is
public by design and belongs in the repo, that a future CSP must allowlist
static.cloudflareinsights.com or this dies silently, and that his two analytics systems will not
agree because one is cookieless.
