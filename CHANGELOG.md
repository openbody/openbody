# Changelog

All notable changes to the OpenBody **standard** are documented here. The standard
follows [semantic versioning](https://semver.org/): additive = minor, breaking =
major (deprecate-not-remove within a major), editorial = patch.

## [0.8.0] — 2026-07-03 (private draft)

**Minor (pre-1.0): §8.3 restructured — the canonicalization algorithm demoted from a
normative implementer requirement to the conformance suite's companion testing method
(OB-67).** Rationale: **implementer-burden reduction; no change to document semantics
or the model.** The 9-step canonical-byte-string algorithm (RFC 8785 + exact-decimal
fixed-point + set-array total ordering + deterministic ids) was the spec's single
biggest implementer deterrent — no comparable format requires implementers to build
one. The algorithm itself is unchanged; it remains what makes the test vectors
checkable.

- **The normalized-equivalence method now lives in `conformance/EQUIVALENCE.md`**,
  moved out of §8.3 verbatim in substance (steps 1–9 plus the scope-of-
  canonicalization rules). It is normative **for the conformance suite**: test
  tooling and the reference implementation (`openbody-ts`) implement it and act as
  the **equivalence oracle**. **A conformant implementation is no longer required to
  implement canonicalization** — it is judged by its inputs/outputs against the
  published vectors.
- **§8.3 rewritten short**: what the vector suite is; "lossless round-trip" defined
  at the semantic level; the minimum-core vector list and corpus paragraph kept. The
  **shorthand equivalences remain normative model facts in-spec** (they define what
  a document *means*): scalar ↔ `absolute` `Target`, `sets: N` ↔ N `WorkUnit`s,
  nested ↔ flat+`partOf`, bare-string ↔ `{id}` `ExerciseRef`, absent `status` ↔
  `active`, and `roundScheme` ↔ its enumerated expansion.
- Cross-references to the moved algorithm swept throughout (§5.1, §5.3, §5.4, §5.5,
  §5.10, §5.13, §7.1, §7.2, §7.6, §10.1; plus `README.md`, `conformance/README.md`,
  `conformance/CORPUS.md`) — semantic-equivalence references still point at §8.3;
  byte-level/step references now point at `conformance/EQUIVALENCE.md`.
- **§4.5 repo pointer updated (OB-66, folded in):** measurement-type registry
  content now ships from the `openbody-registry` repo (the formerly-separate
  `openbody-measurements` repo was folded into it). Mechanism text unchanged; the
  registry stays independently versioned (§9.2).

## [0.7.0] — 2026-07-01 (private draft)

**Additive (minor): a post-v0.6.0 competitive/critical review round** — a fresh
comparison against OpenWeight and a newly-surveyed competitor, OpenSet, plus a
self-directed pre-public red-team pass, surfaced real capability gaps and one
documentation gap. Each item below is additive/non-breaking:

- **`Intensity.value.range` unit-folding fixed (§8.3 step 2; OB-33).** A sibling of the
  `Load.value.range` gap (OB-27, fixed below): the normative unit-fold rule named `Load`
  but not `Intensity`, even though §5.10 states they're normalized identically.
- **`ramp` Target variant (§5.10, §5.13; OB-34).** A fifth `Target` variant for directional
  linear progressions (`{ramp: {from, to, unit?}}` or threshold-relative), e.g. a
  Zwift-style warmup/cooldown ramping 50→75% FTP. `range`'s `min`/`max` are unordered and
  can't distinguish a ramp from its reverse; `ramp` fixes that — normalization preserves
  `from`/`to` exactly as authored, never reordered.
- **`phasePattern` phase `name` classified as open, registry-backed (§5.9; OB-36).** The
  one token-shaped field the spec's own open/closed classification rule never covered.
- **Nutrition/hydration and reproductive-health scope boundary documented (§3.2; OB-37).**
  Both are in scope today via the generic `Measurement` mechanism — no model change — but
  this was undocumented. Reproductive-health types also get a SHOULD-level note on
  elevated legal sensitivity in some jurisdictions.
- **`WorkUnit.sides` — per-side sub-structure (§5.5, §6.3; OB-41).** Lets one scored atom
  (one `effortLoad`, one `notes`) carry internal per-side structure (e.g. a per-side plank
  hold), as an alternative to the two-`WorkUnit`-plus-`laterality` decomposition.
- **`Program.phases` — periodization mid-tier (§5.1, §5.2; OB-42).** Optional named
  macro/meso/microcycle grouping over a program's sessions (e.g. "Hypertrophy,"
  "Strength," "Peaking," "Deload"), additive over the existing flat `Program.sessions`.
- **`media` — envelope-level attachments (§7.6, §8.3; OB-43).** URL-referenced photo/video/
  audio/document attachments, available on **any** addressable record kind since it lives
  on the shared envelope rather than one record type. Closed `type` enum; reference-by-URL
  only (no embedded binary); per-node, not inherited by nested children. Note: inserting
  this section as the new §7.6 renumbers the pre-existing §7.6 (correction lineage worked
  example) to §7.7; SPEC.md's internal cross-references reflect this, but external
  citations elsewhere may not.
- **Registry** (independently versioned per §9.2, not itself part of this spec-version
  bump, but shipped alongside it): `vocab/grip.json`/`stance.json`/`bar-position.json`
  (OB-35), `vocab/phase-name.json` (OB-36), and `vocab/equipment.json` (OB-30, closing the
  one open, ungoverned facet the sibling fix (OB-35) didn't cover) controlled
  vocabularies; `progressions`/`regressions`/`variations` relationship fields on
  `registry-entry.schema.json` (OB-44).
- **`Load.value.range` unit-folding fixed (§8.3 step 2; OB-27).** The `Load` half of the
  `Intensity`/`Load` sibling pair above (OB-33) — landed after this entry's initial cut;
  folded in here rather than as a separate version bump (draft, pre-1.0; VERSIONING.md's
  mutability tolerance applies).
- **A v0.7.0 panel review (2026-07-02) closed follow-on gaps found in this round's own
  content, folded into this entry for the same reason:** `media.url` restricted to the
  `http`/`https` scheme with a negative conformance vector, plus a SHOULD-level SSRF
  advisory for consumers that fetch it (§7.6; OB-51, OB-52); §10.3 crosswalk rows added
  for this round's four additions — Zwift `.zwo` ramp, TrainingPeaks/TrainerRoad
  periodization, Hevy/Strong-style per-side sets, TrainHeroic-style video attachments
  (OB-53).
- **`ThresholdProfileEntry.estimationFormula`/`estimatedFrom` (§5.11; OB-32).** A second
  OpenWeight comparison finding, closed after this entry's initial cut and folded in here
  for the same reason as OB-27 above: OpenWeight's `Estimated1RM` records which regression
  formula produced an estimate and the submaximal reps/load it came from; OpenBody's
  `ThresholdProfileEntry` had `source: tested|estimated` but no derivation. Both new fields
  are optional and **MUST NOT** be present when `source` is `tested`. Registry:
  `vocab/estimation-formula.json` (brzycki/epley/lombardi/mayhew/oconner/wathan).
- **Competition-coefficient scoring scope boundary documented (§3.2; OB-31).** The other
  OpenWeight comparison finding: bodyweight-normalized competition scores (Wilks, DOTS,
  IPF GL, Glossbrenner) are in scope today via the generic `Measurement` mechanism, not a
  named model — no schema change, since `links`/`provenance.algorithm` already generalize
  to any derived value with lineage. Sex/bodyweight-class inputs stay out-of-band in the
  producing app; OpenBody never represents subject demographics. Registry:
  `vocab/competition-score.json` (wilks-score/dots-score/ipf-gl-score/glossbrenner-score).
- **The measurement-type registry (§4.5; OB-13) now has content**, in a new repo,
  `openbody-measurements` — separate from `openbody-registry` since measurement types
  (Pillar A) are a different domain than the exercise taxonomy (Pillar B). v1 seeds a
  narrow, hand-curated high-frequency wedge across cardiovascular, respiratory, sleep,
  body composition, activity, and power/pace (22 `Measurement.type` tokens), plus the
  location `sampleArray` channel-naming convention (`lat`/`lon`/`alt`/`speed`/`course`,
  5 tokens). Scoping this surfaced a real collision already present in this repo's own
  conformance vectors — three different spellings of body mass (`body_weight`,
  `body_mass`, `body.mass`) across three vectors — now fixed to the canonical
  `body_mass` everywhere.

**Pre-1.0, private, not a final shape:** this is a review-driven batch, not a single
design axis like R17–R20; each item above is independently revisable as model iteration
continues.

## [0.6.0] — 2026-06-27 (private draft)

**Additive (minor): the trained-quality axis — `qualities` (R20).** Methodology
validation pass 3 probed the model along the **components of fitness** (endurance,
mobility, flexibility, stability, balance, agility, speed, coordination, muscular
endurance) rather than by training *domain*. The activities all represent cleanly
(holds → `time`, ROM targets → `rom_target` modifier, balance → `time`, agility/sprint
tests → timed `distance`/`outcome`), but the model had **no first-class way to say
which physical quality a piece of work develops** — it could only be inferred from
exercise identity + prescription shape (lossy) or stuffed into notes/`disciplines`.

- **New optional `qualities` field on `Session` (§5.3) and `Block` (§5.4):** an array
  of open registry-backed tokens (`endurance｜strength｜power｜mobility｜flexibility｜
  stability｜balance｜agility｜speed｜coordination｜…`). A descriptive classification axis
  **orthogonal** to `disciplines` (the activity) and `intent` (the purpose). Block-level
  tags add to, not override, session-level ones.
- **`qualities` is a set-valued array** (ordered by token value in §8.3 step 9). Listed
  in the §5.9 open-token inventory. Registry ships a `physical-quality` vocabulary.
- Vocab: `unstable_surface` modifier token (BOSU/wobble-board balance work). Corpus:
  mobility/CARs, static-stretch flexibility, stability/balance, and an agility-speed
  test vector added — rebalancing the corpus toward the non-strength fitness qualities.
- **Pre-1.0, private, not a final shape:** `qualities` is the one design call of pass 3
  (a new descriptive axis); open to revision as model iteration continues.

## [0.5.0] — 2026-06-27 (private draft)

**Additive + re-scoping: the intensity axis — `Intensity`, relative bands, effort
re-scope (R18).** Methodology validation pass 2 (non-strength) found that the model's
"how hard" axis was strength-shaped and scattered: endurance/cardio intensity (power,
pace, HR, **zones**) had no clean home, `relativeToThreshold` couldn't express a band,
and `effortLoad` conflated subjective effort with relative load/intensity.

- **Three crisp homes for "how hard" (§5.13):** `load` = external **resistance**
  (weight/band/%1RM); new **`intensity`** = non-resistance **targets** (power/pace/HR/
  speed/grade, incl. zones); `effortLoad` = **perceived/derived effort** (RPE/RIR/sRPE/
  TRIMP/TSS), re-scoped — relative load (%1RM) → `load`, %FTP/%maxHR/zones → `intensity`.
- **New `Intensity` value object**, plural on `prescription`/`performance`:
  `{ dimension, value | zone, unit? }` — `value` is scalar-or-`Target` (absolute,
  range, or relative-to-threshold incl. a band); `zone` is a registry-named zone.
- **`Target.relativeToThreshold` gains a relative band:** `{ min, max, of }` alongside
  the single `{ percent, of }` (e.g. Zone 2 = 60–70% maxHR, sweet-spot 88–94% FTP).
- **`intensity` is a set-valued array** (ordered by `dimension` in §8.3 step 9, like
  `effortLoad`). Schema `$id` → v0.5; reference normalizer expands `intensity.value`.
- **Result capture (R19), the rest of the non-strength bundle:** added optional
  **`Session.outcome`** (a match/race/game result for sports whose contest *is* the
  session) and **`Rep.outcome`** (per-attempt results — arrow scores, made/missed) —
  both the §5.18 `outcome` object. Closes pass-2 gaps N5 and N2.
- Corpus: structured cycling intervals + zone run + archery (per-attempt) + a match
  result added; `swim-send-off` now carries pace as an `intensity` (was hacked onto
  `time`). Zone/intensity vocab in the registry.
- **Pre-1.0, private:** breaking re-scope of `effortLoad` is acceptable; not a final
  shape — non-strength model iteration continues.

## [0.4.0] — 2026-06-27 (private draft)

**Additive (minor): laddered rounds — `Block.roundScheme` (R17).** The v1
methodology-coverage validation found that per-round-varying rep schemes — 21-15-9
(CrossFit's most iconic format; the spec even names "Fran"), ascending/descending
ladders, pyramids, "Death by", and calorie ladders — had no compact representation:
`Block.repetitions` only expresses *identical* rounds, so every laddered workout had to
be fully enumerated (verbose and non-canonical to author).

- Added optional **`Block.roundScheme`** (`array<integer>`): per-round counts, e.g.
  `[21,15,9]`. The block runs `length(roundScheme)` rounds; in round *r* each descendant
  `WorkUnit` whose **primary metric is absent** (the metric named by its `scoring` —
  `reps｜time｜distance｜energy`; `continuous` is skipped) takes `roundScheme[r-1]`. So one
  array covers rep-ladders *and* calorie-ladders, while fixed-metric accessories inside a
  laddered block are untouched (§5.4, §5.8).
- **Mutually exclusive with `repetitions`** (schema-enforced via a Block `not` constraint).
  Round structure (`repetitions`/`roundScheme`) and scoring (`scoring.scheme`) are
  orthogonal and compose: Fran = `scheme: for_time` + `roundScheme: [21,15,9]`.
- **Planned shorthand**, like `sets`: it expands during normalization (§8.3 step 5) to the
  same fully-enumerated `children` a producer could write by hand — so the compact and
  enumerated forms are provably equivalent, and the canonical (normalized) form is
  unchanged. `roundScheme` with `repetitions`, or with a `performance`, is invalid.
- Schema `$id` → v0.4. Reference normalizer (`openbody-ts`) implements the expansion;
  a `rep-ladder-roundscheme` normalization vector pins the expansion to the enumerated
  Fran canonical bytes (`conformance/corpus/`).
- **Pre-1.0 status:** this is one of several model changes still being iterated before a
  1.0-readiness pass — not a final/ratified shape. v0.3.x documents that used enumeration
  remain valid (enumeration is always valid; `roundScheme` is optional compression).

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
