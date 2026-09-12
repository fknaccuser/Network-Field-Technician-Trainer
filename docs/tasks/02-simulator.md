# 02 — Simulator and field experience

Expand the fixed access-lab engine into versioned device capabilities and a general network graph. Preserve realistic state transitions and explicit limitations. Implement VLAN/trunk/STP/EtherChannel, IPv4/IPv6 routing and OSPF scope, services/security, Windows/Linux, customer management, monitoring, packet capture, and requested physical tasks to the depth needed by validated missions.

Acceptance:

- Meaningful seeded changes affect environments and faults; deterministic seeds/version/state reproduce all operational evidence.
- Independently solve each fault and representative interacting combinations; reject impossible generated scenarios before release.
- Commands obey modes, privilege, syntax, abbreviation ambiguity, device support, forwarding state and save semantics. Errors do not accidentally mutate state.
- A repair changes the network; outputs, diagrams, packet tests, monitoring and physical indicators agree. Stale verification cannot close an updated ticket.
- Guided and independent tools progressively change while real behavior stays consistent. Physical mistakes have plausible effects, with recovery and reset.
- Arbitrary sandbox linking, packet playback/step inspection and supported external capture import work before those controls are advertised.
- Store snapshots and action replay efficiently. Evidence is never silently removed when terminal scrollback is bounded.

0.1.0: seven fault categories, three environments, three difficulty tiers, fixed graph, IOS-style access/edge CLI, workstation tools, physical power/Ethernet, evidence/debrief implemented. Broader protocols, capture tooling, arbitrary graph editor, full model variation, and detailed safety/tool inventory pending.
