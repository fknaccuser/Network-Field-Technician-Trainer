# Validation — initial build

The initial source was checked with Node.js 24.19.0; the deployment targets Node 22 or newer and has no runtime packages to install.

Completed:

- `npm run check`: JavaScript syntax across application, scripts and tests.
- `npm test`: 22 passing behavioral/build checks.
- Scenario sweep: 100 seeds × 3 difficulty settings, all initially faulted and independently repairable through the model; three customer environments and varied fault combinations.
- Coverage includes each root cause, CLI mode/permission checks, invalid VLAN handling, additional-outage failure, saved configuration, stale test invalidation, IP/DNS distinction, cumulative pause accounting, assistance/repeat arithmetic and fresh-bank exhaustion.
- Build integration checks verify referenced assets, PNG manifest icons, HTTP shell/module serving, escaped personal names, and rendering every major view and all four study modes.
- A service-worker harness installs the complete precache and simulates loss of network access for the root path and a GitHub project subpath. It verifies shell/module/content retrieval and excludes API requests. This is a code-level cache test, not a real browser installation test.
- Authorization tests cover public-key signature verification, wrong learner rejection, local one-time redemption and malformed token rejection.
- `npm run build` produces the static `dist` bundle with relative URLs and versioned code assets.

Not completed in this environment:

- Interactive browser screenshots or native phone/tablet UI testing. Playwright was available, but the browser executable was absent and its download timed out. No visual-QA pass is claimed.
- Real Safari/Chrome installed-PWA cold launch, IndexedDB eviction/recovery, screen-reader operation, mobile keyboard and operating-system interruption behavior.
- Cloudflare production deployment, real account authentication, online synchronization or multi-user load, because those services are not configured in this build.
- Complete curriculum accuracy/coverage review, prerequisite validity study, or certification-readiness calibration.

These remain explicit release gates. The source is an initial owner-review build, not a complete version-1 group release.
