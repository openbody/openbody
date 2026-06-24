# OpenBody Conformance

Conformance is **testable**: an implementation demonstrates it by **round-tripping**
the published test vectors for the profile and tier it claims, comparing against the
normalized canonical form defined in `SPEC.md` §8.3 (parse → canonicalize → serialize,
RFC 8785). The per-element tier assignments in §§4–7 are normative for *what* is tested.

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
- `CORPUS.md` — the **extended activity-coverage corpus** (coverage validation, *not* a
  conformance bar): the executable form of the "never inferior to prior art" gate.

## Status

**Stub.** The vectors and corpus are authored once a reference implementation exists to
run the round-trip assertions against (they encode behavior the implementation must
reproduce). Until then this directory documents the intended structure.
