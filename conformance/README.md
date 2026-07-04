# OpenBody Conformance

Conformance is **testable**: an implementation demonstrates it by **round-tripping**
the published test vectors for the profile and tier it claims (`SPEC.md` §8.3). The
per-element tier assignments in §§4–7 are normative for *what* is tested.

Equivalence between documents is judged by the suite's **normalized-equivalence
method** — parse → canonicalize → serialize, grounded on RFC 8785 — defined in
[`EQUIVALENCE.md`](./EQUIVALENCE.md). That method is implemented by the test tooling
and the reference implementation (`openbody-ts`), which act as the equivalence
oracle; **a conformant implementation is not required to implement it** — it is
judged by its inputs/outputs against the vectors.

## Profiles (SPEC §8.2)

- **Observation core** — `Measurement` with `type`, a value, conditional `unit`,
  `startTime`/`endTime`; envelope `id`/`recordType`/`subject`.
- **Training core** — `WorkUnit` with `scoring` (all five kinds readable); envelope
  `id`/`recordType`/`subject`.

An implementation declares the profile(s) it supports; producer and consumer
conformance may be asymmetric (§3.3). Lossless passthrough of unsupported elements is
mandatory at every tier.

## Layout

- `vectors/` — the **minimum core vectors** (the conformance bar). Per SPEC §8.3 these
  MUST cover: each `WorkUnit.scoring` kind; a resistance set; an interval/round scheme;
  continuous endurance; scalar-and-`Target` forms; nested vs flat+`partOf` equivalence;
  an unresolved `ExerciseRef`, an unknown extension, and an unknown open token (each
  round-tripping losslessly); a supersession lineage and a tombstone; a `sampleArray`
  in regular/irregular × scalar/multi-channel with a `null` sample; and a
  normalization-determinism vector (sets-expansion + id-less child + number
  canonicalization).
- `corpus/` + `CORPUS.md` — the **extended activity-coverage corpus** (coverage validation,
  *not* a conformance bar): the executable form of the "never inferior to prior art" gate.

## Status

The minimum-core `vectors/` and the activity-coverage `corpus/` are both **authored and
runnable**: `openbody-ts` (`npm run vectors`) checks each assertion against the reference
implementation, and this repo's `npm run check` schema-validates every record. The corpus
covers 30 real-world training methodologies across 31 vectors (see `CORPUS.md`); it grows as new activities
are stress-tested, and gaps it surfaces feed the standard's change process.
