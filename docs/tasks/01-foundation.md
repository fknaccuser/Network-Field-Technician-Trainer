# 01 — Offline foundation

Implement complete released solo content installation, atomic schema migration, durable event/state writes, save failure reporting, release pinning, storage limits, network-aware update consent, and cross-tab/device editing ownership.

Acceptance:

- Fresh launch shows only black/cursor; `enable` leads through initialization; post-onboarding skip cannot bypass access state. Brief resume preserves position.
- First installation completes before showing offline-ready. Airplane-mode cold launch can open every included lesson, question mode, reference, solo scene, seed generator, and in-progress attempt.
- Interruption, crash, migration, quota failure, and denied persistent storage preserve a recoverable last committed state. An update cannot silently change an active attempt’s version.
- Storage budget never removes unsynced work or required core content. Browser network-type limitations are accurately surfaced.
- Actual iPhone/iPad/Android portrait/landscape, keyboard, safe-area, enlarged-text, screen-reader, and reduced-motion checks pass.

0.1.0: static build, cache, relative deployment paths, local saves, basic migration version, update prompt, tab lock, and responsive UI implemented. Custom storage budget, sophisticated migrations, account-bound encryption, complete device checks pending.
