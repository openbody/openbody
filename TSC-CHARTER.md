# OpenBody Technical Steering Committee — Charter

This charter defines the **Technical Steering Committee (TSC)** referenced by
`GOVERNANCE.md` and `SPEC.md` §9.4. It governs the incubation phase (v0.2 → v1.0) and
is itself a living document, amendable under §8 below.

## 1. Purpose

The TSC is the technical authority for the OpenBody standard. Its job is to keep the
standard **coherent, neutral, and portable** as it stabilizes toward v1.0 — accepting
changes that improve real-world interop and rejecting those that bake in a single
vendor, platform, or serialization.

## 2. Scope

The TSC has authority over:

- The normative specification (`SPEC.md` §§3–10) and its versioning (`CHANGELOG.md`).
- The conformance test suite (`conformance/`) that defines what "OpenBody Compatible"
  means (`TRADEMARK-POLICY.md`).
- The registry governance model (SPEC §9.1–§9.2) — though individual vocabulary tokens
  are approved in the registry repos, not here.
- This charter and the other governance documents (`GOVERNANCE.md`, `CONTRIBUTING.md`).

Out of scope: reference implementations (e.g. `openbody-ts`) and product decisions of
any adopter. Those are governed in their own repositories.

## 3. Composition

During incubation the TSC is deliberately small:

- The **Project Lead (Yasir Ahmad)** chairs the TSC and, per the Phased Incubation
  (BDFL) model in `GOVERNANCE.md`, retains **final merge authority** over the
  repository while the standard stabilizes.
- Additional **voting members** are invited on the basis of sustained, substantive
  contribution or their representation of a significant independent implementation.
  There is no fixed seat count during incubation; the aim is a working quorum, not a
  parliament.

As of the public draft (v0.2.x), the TSC comprises the Project Lead as chair; no
additional voting members are yet seated. This is expected for an incubating standard —
seats are filled as contributors earn them (§6), and the vendor-neutrality guardrail
below takes effect from the first external member onward.

**Vendor-neutrality guardrail.** No single organization (including the steward, Thabit
Labs) may hold a majority of TSC votes. If contributions would put one organization
over half the seats, the TSC expands with independent members before admitting more
from that organization. This mirrors the neutrality commitment in `GOVERNANCE.md`.

## 4. How decisions are made

OpenBody runs on **asynchronous, RFC-driven, rough consensus** — not scheduled votes.

1. A specification change is proposed as a **GitHub RFC** (an issue using the RFC
   template; see `CONTRIBUTING.md`).
2. The TSC reviews in the open on the issue/PR. The default is **lazy consensus**: a
   proposal with clear support and no unresolved substantive objection after a
   **review window of at least 10 calendar days** may be accepted.
3. A **substantive objection** (a concrete technical or neutrality concern, not a bare
   -1) blocks lazy consensus and must be worked through or explicitly overruled.
4. If consensus cannot be reached, the Chair calls a **vote of voting members**; a
   simple majority decides, with the Chair breaking ties. During incubation the Chair
   may also exercise final merge authority, but is expected to record the rationale
   when overriding rough consensus.
5. **Editorial changes** (typos, clarifications with no normative effect) and
   **registry token** additions do not require an RFC or a review window.

Every accepted normative change follows the change-management ritual in
`GOVERNANCE.md`: record the decision with rationale → ratify → edit → bump the version.
Released normative text is immutable.

## 5. Operating model

- **Async-first.** Work happens on GitHub issues and pull requests. There are no
  mandatory synchronous meetings; if the TSC holds a call, decisions are still ratified
  in writing on the relevant issue so the record is public and complete.
- **Review responsiveness.** The TSC aims to give every RFC an initial response within
  **14 calendar days**. Silence is not consent for substantive changes — an RFC needs
  affirmative support to proceed, not merely an absence of objection from an unread thread.
- **Transparency.** All decisions of record live in public GitHub artifacts (issues,
  PRs, `CHANGELOG.md`). Private discussion may inform a decision but never constitutes one.

## 6. Membership changes

- **Adding** a voting member: nominated by any existing member and confirmed by rough
  consensus of the current TSC (Chair confirms).
- **Stepping down:** a member may resign at any time by written notice on the repo.
- **Inactivity:** a voting member unreachable or inactive for **6 months** may be moved
  to emeritus (non-voting) by the Chair, preserving quorum. Emeritus members may be
  reinstated on renewed participation.

## 7. Conduct & conflicts of interest

- All participation is bound by the `CODE_OF_CONDUCT.md`.
- Members disclose material conflicts of interest (e.g. steering a decision toward an
  employer's product) and recuse where a reasonable observer would expect it. The
  vendor-neutrality guardrail (§3) is the backstop.

## 8. Amending this charter

Changes to this charter are themselves proposed as an RFC (§4) and require rough
consensus of the TSC. Amendments are recorded in `CHANGELOG.md`.

## 9. Transition to a foundation

This charter governs the incubation phase. As set out in `GOVERNANCE.md`, stewardship
and the "OpenBody" trademark are intended to transfer to an independent, neutral
**foundation** once a formal Working Group with sponsors is established or major-platform
adoption is demonstrated. On transfer, the foundation's governance supersedes this
charter; until then — or permanently, if transfer is delayed — the project operates
under this open-governance charter on GitHub.
