# Ordered implementation handoff

Read MASTER_SPEC.md first. Preserve accepted decisions; complete each stage’s acceptance gates before marking it ready. The initial source drop begins implementation; it does not replace the complete version-1 scope.

| Order | Task | Status in 0.1.0 |
| --- | --- | --- |
| 01 | [Static offline foundation](tasks/01-foundation.md) | Implemented starter; target-device verification still required |
| 02 | [Simulator and initial mission](tasks/02-simulator.md) | Stateful access-lab slice implemented; broader simulation pending |
| 03 | [Curriculum and mastery](tasks/03-learning.md) | Four modes and introductory pack implemented; comprehensive content/mastery pending |
| 04 | [Accounts and synchronized storage](tasks/04-online.md) | Architecture only; no production identity or sync |
| 05 | [Career and engineering](tasks/05-career.md) | Initial ticket, evidence, debrief, and credit implemented; career progression pending |
| 06 | [Crews and competition](tasks/06-crews.md) | Planned; disconnected service explicitly shown |
| 07 | [Authoring and personal content](tasks/07-content.md) | Notes, bookmarks, basic cards/export implemented; remainder pending |
| 08 | [Complete version-1 release](tasks/08-release.md) | Blocked until all prior acceptance criteria pass |

## Current file map

- `src/app.js`: application lifecycle, navigation, forms, prerequisite workflow, local orchestration.
- `src/ui/views.js`, `icons.js`, `src/styles.css`: responsive UI and illustrations.
- `src/core/network.js`: deterministic scenario state, supported command parser, tests, evidence, outcome checks.
- `src/core/random.js`: stable seeds and versioned challenge identifiers.
- `src/core/scoring.js`, `clock.js`: independent scoring and timed-attempt rules.
- `src/core/study.js`: item selection, equivalent answers, study sessions, initial prerequisite tasks.
- `src/core/store.js`: IndexedDB persistence and local export validation.
- `src/core/authorization.js`: offline public-key verification and local redemption tracking.
- `src/data/curriculum.js`: original starter content, 30 lessons and 60 questions; not full coverage.
- `scripts/build.mjs`: dependency-free static build with release-versioned assets and precache generation.
- `scripts/owner.mjs`: private owner signing setup and authorization-code generation.
- `tests/engine.test.mjs`: behavioral regressions, including a 300-scenario seed/difficulty sweep.

## Architectural follow-through

Next, extract application orchestration into feature modules and introduce explicit schema migrations before growing the event log. The first app uses readable JavaScript ES modules and Node's built-in test runner. A framework migration is not required to add services. If a future maintainer adopts a framework or build system, preserve relative URL deployment, offline pinning, deterministic engine interfaces, and original behavior tests.

The initial topology is a fixed customer-access service, not a general-purpose virtual network. Supporting an arbitrary graph requires device capability schemas, per-interface links, learning/neighbor tables, forwarding rules and meaningful packet state before exposing a blank-canvas editor. Prefer correct bounded models to fake universal command support.

Do not publish production invitations while local-only profiles and an unvalidated prerequisite pack remain. Do not claim a mastery badge based on these short starter knowledge checks. The owner’s planned lock screen and authorization flow must be retained when production identity replaces the local profile.
