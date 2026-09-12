# 04 — Identity and synchronized storage

Prepare an authenticated backend compatible with Cloudflare Pages. Evaluate current free quotas before selecting the exact providers. Cloudflare Workers/D1 plus a transactional OTP provider are candidate components, not provisioned or promised free at arbitrary scale. Keep local solo operation independent from network availability. Do not enable a paid tier automatically.

Acceptance:

- Owner/admin invitations enforce one signup, seven-day default expiry; OTP sessions and mandatory recovery-code setup are real, rate-limited and authenticated.
- Account, owner, app admin, crew admin and career permissions are separate. All writes verify server-side authorization.
- Owner alone issues prerequisite grants and publishes official content. Offline signatures and key rotation are designed; global redemption reconciles without claiming offline tamper-proofing.
- Event IDs, attempt versions and edit leases make retries idempotent. Device takeover preserves stale local work as recovery copies.
- Encryption includes keys, logout, same-account unlock, recovery, full backup with content, previewed restore/merge, duplicate-credit protection, and a clear local trust boundary.
- Quota exhaustion leaves solo usable, queues eligible work, and supplies real administrator usage details. Secrets never enter frontend assets or GitHub.
- Initial 10-learner load and 2–4 live participants run inside the chosen free limits, verified with usage evidence.

0.1.0: not implemented. Local profiles and JSON exports must remain labeled as local development features.
