# The Field

An offline networking study app and a stateful field-troubleshooting simulator. Built from scratch for GitHub and Cloudflare Pages, with no runtime dependencies, subscriptions, paid APIs, external fonts, analytics, or cloud requirement for the implemented solo work.

**Status: 0.1.0 — initial owner-review build. This is not the complete version-1 release. Do not invite the study group yet.**

## Run

Use Node.js 22 or later. No package installation is required.

```sh
npm test
npm run check
npm run build
npm run preview
```

Open `http://localhost:4173`. The first screen is black with a blinking block cursor. Type `enable` and press Enter. Create a local profile and complete the prerequisite check. Do not open `index.html` with `file://`; browser storage and service workers need a web origin.

`npm run dev` serves the editable source. `npm run preview` serves the built, installable offline app. The preview server is a local development tool, not a production server.

## What works in this build

- Exact terminal-style opening, initialization sequence, and optional post-onboarding skip setting.
- Local profile, prerequisite knowledge/practical check, 70% combined gate, black failure screen, and owner-signed offline reassessment-code verification.
- Today plan length and focus, six study domains, 30 original introductory lessons, 60 original questions, explanations for all four options, flashcards, typed recall, and word banks.
- Ordinary immediate feedback or session-end review. Fresh timed knowledge checks reject an exhausted unseen-item bank.
- Seeded access-network missions across three environments and seven underlying fault categories. Difficulty introduces one, two, or three faults.
- Customer conversations with suggested or typed questions, physical equipment inspection, optical reading, Ethernet connection sequence, Windows/Linux workstation settings, and supported device/workstation commands.
- CLI privilege and configuration modes, selected abbreviations, persistent device configuration, startup-config saving, career restrictions on the edge router, and correctly specified coworker change requests.
- Traffic-path teaching view, automatic evidence, selected findings, typed ticket documentation, post-change verification, customer confirmation, replay, and debrief.
- Timed independent practical checks, cumulative five-minute pause allowance, and failure after an additional outage.
- Assistance deductions, capped at 50% before exact-seed/version repeat credit of 100%, 50%, 25%, then zero. Guided practice has no assistance deduction.
- A provided-network sandbox, local history and recovery snapshots, personal lesson notes/cards/bookmarks, basic technician accents, and local JSON progress export/restore.
- IndexedDB saves, service-worker installation, versioned app assets, an update prompt, relative paths for GitHub project sites, mobile/tablet layouts, reduced-motion support, and a single-writer browser-tab lock where supported.

## What is still being built

The full agreed product is preserved in [docs/MASTER_SPEC.md](docs/MASTER_SPEC.md). The ordered work is in [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).

This starter is **not a complete CCNA curriculum**, an exam-readiness predictor, full Cisco IOS, Packet Tracer, an arbitrary packet simulator, or an authenticated multiplayer service. Knowledge/practical checks in this pack do not establish full skill mastery. Unsupported commands are identified when encountered.

Local profiles are not online accounts. Email OTP, invitation enforcement, account recovery, encrypted account-bound backups, synchronization, crews, competitions, an in-app content editor, full prerequisite validation, promotion shifts, and engineering projects remain release gates. The crew screen states that its service is not connected; no fake group results are shown. The local JSON export is unencrypted and includes progress rather than a full encrypted content backup.

All customer names, devices, requests, command responses, optical readings, and networks are simulated. The command terminals do not execute shell commands or contact real devices. Illustrative public test ranges are reserved documentation ranges; `status.northline.test` is a fictional lab name.

## Free GitHub → Cloudflare Pages deployment

Source repository: `fknaccuser/Network-Field-Technician-Trainer`.

1. In Cloudflare, open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and choose `Network-Field-Technician-Trainer`.
3. Use these build settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (`.nvmrc` is included) |
| Environment secrets | None for this local-only build |

Cloudflare provides a `pages.dev` URL. A purchased domain is not necessary. This static implementation is designed for the free Pages plan. **Do not enable a paid plan or paid add-on automatically.** Free usage limits and service terms can change; check the current dashboard before adding the online backend. No cloud database or email service is provisioned by this repository.

For manual review, `npm run build` produces a static `dist` folder suitable for direct upload. For future automatic Git deployments, start with the Git integration workflow above.

Official documentation checked during the build: [Cloudflare static HTML deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/), and [MDN service-worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Offline use

Visit the built HTTPS site while connected. Wait for the complete app to download, then install it from the browser menu. On iPhone/iPad, use Share → Add to Home Screen. Settings indicates whether a service worker controls the page. Lessons, questions, the simulator, and current local progress then work without network calls. Browser storage can still be removed by the user or evicted under storage pressure; export important local progress.

The service worker caches the entire released starter pack. Code URLs contain a content-derived release hash. An update waits for user activation and saving; old release caches are retained so existing clients can finish loading their assets. Automatic storage budgeting and old-version cleanup are a later task, not silently approximated by deleting progress.

## Owner reassessment codes

Before using the prerequisite lock with learners, initialize an owner signing key on a private computer:

```sh
npm run owner:setup
```

This writes an ignored `.owner/private.json` signing key and the public verification key in `public/deployment.json`. Back up the private key securely; **never commit or upload `.owner`**. Commit only the public deployment file and redeploy. A locked learner’s UUID was displayed before their check. Generate their authorization:

```sh
npm run owner:authorize -- <learner-id>
```

On a fresh launch the learner types `enable`, sees the permission message, and enters the code. Codes have no expiry, are bound to the learner UUID, and are consumed at redemption in this installation. A redeemed grant survives closing the app before starting the reassessment. Offline codes cannot enforce global anti-replay against copied or modified local state. This first build does not provide the future account/owner admin-panel service.

## Contribute

Keep networking behavior in `src/core`, original content in `src/data`, and presentation in `src/ui` plus `src/app.js`. Add behavior-based regression tests for simulator changes. Do not use leaked/recalled exam questions, insert private credentials, replace offline functionality with a paid AI API, or mark planned features complete merely because a screen exists. The entire version-1 checklist must pass before group testing.

Copyright remains with the respective authors. No open-source license has been selected yet.

