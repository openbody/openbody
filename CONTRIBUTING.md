# Contributing to OpenBody

OpenBody is community-extensible and stewarded by Thabit Labs. Thank you for helping
build a neutral, portable standard for health & fitness data.

> While in **private review** (pre-v1.0), contribution is limited; this document sets
> the process that takes effect at the public draft release.

## How changes are proposed

- **Specification changes** (anything in `SPEC.md` §§3–10) are proposed as a
  **GitHub RFC** (an issue/PR using the RFC template) and reviewed by the public
  **Technical Steering Committee (TSC)**. The Project Lead retains final merge
  authority during incubation (see `GOVERNANCE.md`).
- **Vocabulary growth** (new open registry-backed tokens — disciplines, schemes,
  `Load.basis`, etc.) is usually a **registry** change, not a spec change — open it
  against the relevant registry repo, not here (SPEC §9.1–§9.2).
- **Editorial fixes** (typos, clarifications with no schema effect) can be a direct PR.

## Developer Certificate of Origin (DCO)

All commits **must** be signed off under the [DCO](https://developercertificate.org/) —
add a `Signed-off-by: Name <email>` trailer via `git commit -s`. This certifies you
have the right to submit the contribution (it guards against copyright contamination,
which matters for an open standard and its CC0 registry data). A DCO check gates merges.

## Conventions

- **Extend, don't modify the core** (SPEC §8.1): new capability goes under a namespace
  (reverse-DNS or a registry-allocated prefix), never by changing a core field's
  meaning. Unknown extensions must round-trip losslessly.
- Keep the standard **serialization-neutral** and **vendor-neutral** — anything that
  bakes in one platform or one language belongs in a reference implementation, not the
  standard.
- Follow **semver** for the standard (`CHANGELOG.md`): additive = minor, breaking =
  major (deprecate-not-remove within a major), editorial = patch.

## Conformance

Changes that affect the model **must** keep the test vectors green (or update them
with justification) — `conformance/`. New core structures should arrive with a worked
example and a vector.
