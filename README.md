# OpenBody

**An open, vendor-neutral, language-agnostic standard for health & fitness data
interoperability** — a canonical data model plus mapping semantics that anyone can
implement in any language. Its mission: that **individuals own and port their health
and fitness data without platform lock-in**.

> **Status: DRAFT — v0.9.0, pre-v1.0. In private review.**
> This repository is not yet public. The standard has passed an independent
> implementability review (see `CHANGELOG.md`) but is being dogfooded before a public
> pre-v1.0 draft release. Breaking changes are still possible before v1.0.

## What it is

OpenBody is organized around **two co-equal pillars**:

- **Pillar A — Observation (telemetry):** heart rate, HRV, sleep, power, speed, GPS —
  the canonical `Measurement` (SPEC §4).
- **Pillar B — Structured Training (exercise):** the prescription and execution of
  training — programs, sessions, blocks, exercises, work units, reps, targets, effort,
  equipment (SPEC §5–§6). This is what no incumbent provides.

Both are first-class. A shared **record envelope** (§7) gives every record identity,
typed links, provenance, and an immutable-plus-supersession lifecycle. The model is
serialization-independent; **JSON (with a published JSON Schema) is the primary
binding**.

## Implementing against it

- The normative standard is **`SPEC.md` §§3–10** (§§1–2 are introductory).
- Build a parser + validator against the JSON binding.
- Conformance is demonstrated by **round-tripping the test vectors** for the profile
  and tier you claim — see `conformance/`. Equivalence between documents is judged
  by the suite's **normalized-equivalence method**
  (`conformance/EQUIVALENCE.md`, grounded on RFC 8785), implemented by the test
  tooling and the reference implementation — **you do not need to implement it
  yourself** (§8.3).
- Two named core profiles (Observation core, Training core) let a single-pillar
  implementation be fully conformant (§8.2).

## Contributing

See `CONTRIBUTING.md` (changes go through GitHub RFCs; commits require **DCO**
sign-off) and `GOVERNANCE.md`. The exercise & measurement-type **registries** are
separate, independently-versioned artifacts (CC0) — not in this repo.

## Licensing

- Standard documents: **OWFa 1.0** · Reference code: **Apache-2.0** · Registry data:
  **CC0**. See `LICENSING.md`.

## Stewardship

OpenBody is stewarded by **Thabit Labs** under a Phased-Incubation model, with intent
to transfer to a neutral foundation as adoption warrants (`GOVERNANCE.md`). "OpenBody"
is vendor-neutral: the steward is not the brand on the wire.
