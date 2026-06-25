# OpenBody JSON Schema

`openbody.schema.json` is the **primary binding** for the OpenBody standard
(`SPEC.md` §0) — a [JSON Schema](https://json-schema.org/) (Draft 2020-12) for the
normative model (§§4–7). Validate any OpenBody record against it; the root accepts any
of the eight record kinds (discriminated by `recordType`) plus a tombstone.

## What it enforces vs. what an implementation enforces

The schema validates **structure**: field names, types, cardinality, the closed
enums, and the three discriminated unions (`recordType`, the Measurement value
one-of, and the `Target` variant key). Closed enums are constrained; **open
registry-backed tokens are typed `string`** (their canonical values live in the
registries, not the schema).

Some rules are **context-dependent or normalization-level** and are enforced by an
implementation, not the schema (this is normal — JSON Schema can't see context):

- top-level records carry `id`+`subject`; **inlined** children may inherit them
  (§7.1/§7.2) — so the schema leaves them optional;
- a **tombstone** (`status:deleted`) is exempt from all required fields except
  `id`/`recordType`/`status` (handled by a dedicated schema branch + code);
- a `Session` carries **at most one** of `blocks`/`exercises`/`workUnits` (§5.3);
- `scoring` ↔ metric agreement (§5.5); `sets` only in a planned `prescription` (§5.5);
- `Load.unit` required unless the value is relative/stop-condition (§5.12);
- `provenance.algorithm` required when `method:algorithm` or a `derivedFrom` link is
  present (§7.4);
- the **§8.3 canonicalization / equivalence** procedure (the conformance mechanism).

## Validate WIRE records, not the canonical form

This schema validates **wire records** — the JSON a producer emits/transmits. It does
**not** validate the §8.3 *normalized canonical form*, and that form deliberately will
**not** pass it: normalization re-encodes numbers as string fixed-point
(`{"coefficient":"21","exponent":"0"}`), propagates `subject`/`startTime` onto every
descendant, and flattens containment. The canonical form is an internal **comparison**
representation (for equivalence/round-trip), not the binding. Validate the wire record;
normalize separately for equivalence.

## Validation status

The schema is a valid Draft 2020-12 schema. As of this commit, **all worked examples
in `SPEC.md` and all `conformance/vectors/` records validate against it** (checked
with the `jsonschema` validator). Treat the schema and `SPEC.md` as co-equal: a
mismatch is a bug in one of them.

## Versioning

Tracks the spec's major.minor (`$id` carries the version). Generated/maintained
against `SPEC.md`; regenerate when the normative model changes.
