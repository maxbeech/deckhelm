# Search indexing remediation

Status: in progress. Last reviewed: 2026-09-20.

- [x] Confirm the live canonical-host behaviour and inspect the sitemap, robots and response headers.
- [x] Identify the source of the reported ledger-flashing 404 and the broken legacy post collection.
- [x] Move every canonical, structured-data URL, sitemap URL and robots host declaration to `https://www.deckhelm.com`.
- [x] Remove unsupported, thin state variants from the indexable sitemap while retaining the calculator presets for visitors.
- [x] Replace the reported 404 with a permanent, relevant redirect.
- [x] Add regression coverage for the canonical host, sitemap, robots declaration and retired-state policy.
- [x] Run lint, unit tests, a production build and a browser crawl; deploy and verify the live routes. Production deployment `dpl_9NE3i59wdDAFqqk4uxJKESeDTgXr` was verified on 2026-09-20.
