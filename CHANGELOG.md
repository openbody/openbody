# Changelog

All notable changes to the OpenBody **standard** are documented here. The standard
follows [semantic versioning](https://semver.org/): additive = minor, breaking =
major (deprecate-not-remove within a major), editorial = patch.

## [0.2.1] — 2026-06-24 (private draft)

Publication-prep editorial pass; **no normative change** from v0.2.

- Applied three editorial clarifications from the implementability review: fixed-point
  object scope vs `extension`/`script` (§8.3 step 1); nearest-ancestor timing
  precedence (§8.3 step 7); set-valued arrays are exhaustive — `links`/`effortLoad`/
  `modifiers` (§8.3 step 9).
- Scrubbed internal repository references so the document stands alone (§0, §8.3, §11).
- Named the Project Lead in full for governance transparency (§9.4).

## [0.2.0] — 2026-06-24 (frozen draft)

First complete two-pillar normative draft (§0–§11 + Appendix A).

- Passed an independent **cold-read implementability gate**: six fresh-agent reads
  (two harnesses), ending in two consecutive no-blocker verdicts.
- §8.3 normalization/equivalence grounded on **RFC 8785 (JSON Canonicalization
  Scheme)** with exact-decimal fixed-point numbers and total-ordered set arrays.
- Pillar A (Observation) + Pillar B (Structured Training), shared record envelope,
  exercise identity (hybrid registry + facets + coded + opaque), extensibility &
  conformance profiles, governance & versioning, incumbent mappings.

[0.2.1]: #
[0.2.0]: #
