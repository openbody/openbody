# Changelog

All notable changes to the OpenBody **standard** are documented here. The standard
follows [semantic versioning](https://semver.org/): additive = minor, breaking =
major (deprecate-not-remove within a major), editorial = patch.

## [0.3.1] — 2026-06-26 (private draft)

**Normative (patch): relax `provenance.algorithm` requirement on `derivedFrom`.**
Previously `algorithm` was required whenever a record carried a `derivedFrom` link.
Incumbents emit derived values (max HR, estimated 1RM, calories) without disclosing
the algorithm, which forced a faithful mapper to either drop the lineage link or
fabricate an algorithm (A3 / OB-8).

- `provenance.algorithm` is now **required only when `method` is `algorithm`**, and
  **recommended** (not required) when the sole trigger is a `derivedFrom` link
  (§7.2 / §7.4).
- Backward-compatible: every v0.3.0 document remains valid — this only widens what
  conforms. No schema-structure change (the rule was implementation-enforced, never
  schema-encoded; the schema NOTE is updated for accuracy).

## [0.3.0] — 2026-06-25 (private draft)

**Additive (minor): human-readable labels.** Real-data dogfooding (Hevy/Strong/Strava)
showed every app has a workout title with nowhere interoperable to live.

- Added optional **`name`** (string) on `Program`, `Session`, `Block`.
- Added optional **`notes`** (string) on `Session`, `Block`, `Exercise`, `WorkUnit`.
- An exercise's name remains its identity (`exerciseRef`, §6); app cosmetics
  (color/icon/UI state) stay in namespaced extensions, not core.
- Backward-compatible: all v0.2.x records remain valid. Schema `$id` → v0.3.
- **Tooling shipped in the 0.3.x line:** the **JSON Schema**
  (`schema/openbody.schema.json`, Draft 2020-12) as the primary binding for §§4–7 (all
  `SPEC.md` examples + conformance vectors validate against it), and the **conformance
  vectors** (`conformance/vectors/`) — valid / equivalence / normalization cases with a
  manifest and format doc.

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
