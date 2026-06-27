# Extended Activity-Coverage Corpus

A broad library of real-world activities, each asserted to **round-trip losslessly**
through canonical OpenBody (SPEC §8.3). This is the **executable form of the "never
inferior to prior art" gate** (§3.1) — **coverage validation, not a conformance bar**.

The vectors live in [`corpus/`](./corpus/) (manifest: [`corpus/index.json`](./corpus/index.json)),
in the same file format as the minimum-core vectors. Each is `kind: valid` — it must be
schema-valid **and** normalize idempotently (a round-trip proxy, §8.3). They are run by
`openbody-ts` alongside the conformance vectors (`npm run vectors`) and schema-checked by
this repo's `npm run check`.

The set is seeded from the v1 methodology-coverage validation
(`spec-library/openbody/adoption/METHODOLOGY-VALIDATION.md`), which stress-tested the model
against how named training communities actually train. **Coverage gaps found here feed back
into the standard's change process, not a pass/fail conformance claim.**

## Methodologies covered

| Vector | Methodology | What it exercises |
|---|---|---|
| `rest-pause` | Rest-pause sets | Block `grouping: rest_pause` + `setRole: rest_pause` + short `rest` (the Hevy motivating gap) |
| `cluster-set` | Cluster sets | `grouping: cluster` + intra-set `rest` + %1RM `relativeToThreshold` load |
| `myo-reps` | Myo-reps | activation `setRole: failure` + `setRole: myo` mini-sets |
| `drop-set` | Drop set | the canonical single encoding (§5.4): `grouping: drop_set` + `setRole: drop` |
| `mechanical-drop-set` | Mechanical drop set | collapsed Exercise — each WorkUnit carries its own `exerciseRef` |
| `rep-ladder-fran` | CrossFit 21-15-9 (Fran) | per-round varying reps enumerated under a `for_time` Block (the rep-ladder gap, G2) |
| `rep-ladder-roundscheme` | CrossFit 21-15-9 (Fran) — compact | `Block.roundScheme: [21,15,9]` (v0.4) expanding to the enumerated form (§8.3 step 5) |
| `swim-send-off` | Swim "on the 1:30" intervals | `scheme: send_off` + `intervalSec` + pace via `relativeToThreshold of: CSS` (G3) |
| `hyrox-race` | HYROX functional-fitness race | nested run/station blocks under `for_time`; sled = distance+Load; wall ball = reps+`target_height` |
| `oly-complex` | Olympic weightlifting complex | `grouping: complex`, shared %1RM load across movements |
| `kettlebell-sport-amrap` | Kettlebell sport (Girevoy) | `scheme: amrap` 10-min set, rep-count result |
| `hangboard-repeaters` | Climbing fingerboard repeaters | `phasePattern` 7-on/3-off + `edge_depth` modifier + added Load |
| `breathwork-wim-hof` | Wim Hof breathwork | recovery `scheme: rounds` + breath `phasePattern` + `stopCondition: to_breath` |
| `gymnastics-judged-score` | Judged gymnastics | `outcome.components` (Difficulty + Execution − deductions) |
| `powerlifting-attempts` | Powerlifting meet | three attempts, `outcome.success` good/no-lift, `intent: compete` |
| `lengthened-partials` | Lengthened partials | `ExerciseRef.facets.rangeOfMotion: lengthened-partial` (hypertrophy trend) |
| `combat-rounds-bjj` | BJJ rolling rounds | `scheme: rounds` time bouts + `participants.role: opponent` |

These exercise the open registry-backed token vocabularies shipped in
`openbody-registry/vocab/` — the recommended-canon tokens (rest_pause, send_off, complex,
edge_depth, target_height, opponent, lengthened-partial, …) that let independent
implementers encode the same methodology identically.

## Extending the corpus

Add a `<name>.<kind>.json` file under `corpus/` (same format as `../vectors/`), register
it in `corpus/index.json` with a `methodology` label, and confirm `npm run check` (this
repo) and `npm run vectors` (openbody-ts) stay green. Prefer the smallest record that
demonstrates the methodology, and reference the recommended-canon tokens from the registry
vocabularies so coverage and vocabulary stay in sync.
