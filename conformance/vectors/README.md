# Minimum core vectors

The conformance bar (SPEC §8.3). Each vector is a `*.json` file with a `kind` and the
data for that kind. A conformance runner (built with the first reference
implementation) discovers them via `index.json` and checks each assertion.

## Vector kinds

| `kind` | Fields | Assertion |
|---|---|---|
| `valid` | `record` (a record or array of records) | Validates against the JSON Schema **and** round-trips losslessly (`normalize(record)` succeeds; re-serialize → re-normalize is identical). |
| `invalid` | `record`, `reason` | MUST be rejected by a conformant validator (the `reason` says why). |
| `equivalent` | `a`, `b` (each a record or array of records) | `normalize(a) == normalize(b)` — the two encodings are semantically identical (§8.3). |
| `normalization` | `input`, `expectedNote` (and, once a reference normalizer exists, `expected`) | `normalize(input)` produces the described canonical form. |

Common fields: `name`, `description`, `specRefs` (array of `§` pointers).

## Status / how these get "verified"

These vectors encode the **assertions** a conformant implementation must satisfy.
The `equivalent` / `invalid` / `valid` kinds are fully checkable today against the
schema + a normalizer. The exact byte-level `expected` canonical form for
`normalization` vectors is filled in once the reference normalizer exists (it is the
authority that pins the bytes — §8.3). Until then `expectedNote` states the intended
outcome in prose. Authoring them now is deliberate: it dogfoods §8.3 by hand and
catches spec bugs before an implementation exists.

This is a starter batch covering the highest-value §8.3 cases; it will grow to the
full §8.3 minimum-core list.
