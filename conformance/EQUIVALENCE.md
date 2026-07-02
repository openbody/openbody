# OpenBody Normalized Equivalence — the conformance suite's judging method

**What this is.** This companion document defines the **normalized-equivalence
method** the OpenBody conformance suite uses to judge whether two documents are
equivalent (SPEC.md §8.3). It is **normative for conformance testing**: the
published test vectors' `equivalent`/`inequivalent`/`normalization` assertions are
defined and checked in terms of this method, and conformance test tooling and the
reference implementation (`openbody-ts`) implement it, acting as the **equivalence
oracle**.

**A conformant implementation is NOT required to implement this method.** Per
SPEC.md §8.3, an implementation demonstrates conformance by its **inputs and
outputs against the published vectors** — not by reproducing canonical bytes. The
shorthand equivalences this method mechanizes (scalar ↔ `absolute` `Target`,
`sets: N` ↔ N `WorkUnit`s, nested ↔ flat+`partOf`, bare-string ↔ `{id}`
`ExerciseRef`, absent `status` ↔ `active`, `roundScheme` expansion) are
**normative facts of the model**, stated in SPEC.md §8.3 and in each element's home
section; this document specifies only the mechanical, byte-level judging method. An
implementation **MAY** implement the method (e.g. to self-test); test tooling and
reference implementations **MUST** follow it exactly.

Section references (§*n.m*) below are to `SPEC.md`. This document ships with the
spec and changes only via the spec's change process (`GOVERNANCE.md`).

## The method

Equivalence is decided by reducing each record to a **canonical byte string** via the
ordered algorithm below and comparing those strings: two records are equivalent
**iff** their canonical byte strings are identical. The algorithm is deterministic —
two implementations *of this method* **MUST** produce the same bytes for
semantically-equal input, regardless of JSON key order, whitespace, number spelling,
or the permitted shorthands.

1. **Canonicalize every number to exact-decimal fixed-point.** A JSON number **MUST**
   be interpreted from its **decimal text**, never via binary floating point (so
   `37.4220` is the exact decimal `37422 × 10⁻³`, not its `float64` approximation).
   Every numeric value anywhere in the record — whether written as a JSON number or as
   a fixed-point `{coefficient, exponent}` (§4.2), and including non-metric numbers
   (`percent`, `revision`, `frequencyHz`, `confidence`, `dataPoints`, `timeCapSec`,
   `EffortLoad.value`, …) — is replaced, **in the canonical form**, by its **lowest-terms
   fixed-point object** whose `coefficient` and `exponent` are **canonical decimal-integer
   strings** (trailing factors of 10 removed from the coefficient, incrementing the
   exponent; no leading zeros; `"0"` for zero; a leading `-` only when negative). Thus
   `72`, `72.0`, `{coefficient: 720, exponent: -1}` → `{"coefficient":"72","exponent":"0"}`;
   `80.5` and `{coefficient: 8050, exponent: -2}` → `{"coefficient":"805","exponent":"-1"}`.
   Because the coefficient/exponent are **strings, not JSON numbers**, JCS (step 9) never
   applies its `float64` number formatting to *any* value: there is **no 2⁵³ precision
   ceiling** and arbitrary-precision decimals compare exactly. Zero canonicalizes to
   `{"coefficient":"0","exponent":"0"}`. (`EffortLoad.value` being a "plain number," §5.13,
   means it is not a `Target`; it is still canonicalized here.) A `{coefficient, exponent}`
   object is read as a fixed-point *number* only in fields the spec types as numeric
   (§4.2 `quantity`, metric values, `load.value`, …); an identically-shaped object that
   appears inside an opaque `extension`/`script` is a plain object, canonicalized
   structurally (step 9), **not** re-read as a number. **Timestamps** (RFC 3339
   strings — `startTime`/`endTime`/`asOf`/…) are likewise canonicalized to a single
   spelling: uppercase `T` and `Z`; a zero UTC offset written `Z` (never `+00:00`); a
   non-zero offset `±HH:MM`; trailing-zero fractional seconds removed (and the `.` dropped
   if none remain). Same-instant-same-offset timestamps then compare equal; a *different*
   offset is a real, preserved difference (local-time context is meaningful).
2. **Canonicalize units.** For every metric `Target`, a `unit` equal to the field's
   §5.10 default is **removed** (so `time: 120` and `time: {absolute:{value:120,
   unit:"s"}}` converge to the same unit-less `absolute`). A `unit` written inside
   `load.value` is moved to `Load.unit` (its one canonical home, §5.12) — this applies
   identically whether `load.value` is `absolute` or `range`: a unit nested inside
   `load.value.range` folds to `Load.unit` exactly as it does from `load.value.absolute`.
   Likewise, a `unit` written inside `Intensity.value` is moved to `Intensity.unit` (its
   one canonical home, §5.13). This unit handling applies uniformly to whichever `Target`
   variant is present, including `ramp`. A `ramp`'s `from`/`to` are **never**
   canonicalized by value — they are preserved exactly as authored, with **no**
   reordering (contrast `range`'s `min`/`max`, which this step also leaves untouched
   but which carry no order to preserve in the first place, being unordered by
   definition; §5.10).
3. **Expand scalar metrics.** A bare scalar → `{ "absolute": { "value": … } }` for
   every metric-value field **and for `load.value`** (§5.10).
4. **Expand & fold `ExerciseRef`.** A bare-string ref → `{ "id": … }` (§6.1); and a
   canonical `id` carrying an explicit `openbody:` prefix is folded to its unprefixed
   form (§6.2), so the two permitted synonyms canonicalize identically.
5. **Expand `roundScheme`, then `sets`.**
   - **`roundScheme`** (§5.4). A `Block` with `roundScheme: [v₁,…,vₙ]` has its `children`
     replaced by **n** consecutive copies of the source `children`, in order, and
     `roundScheme` removed. In the *r*-th copy, every descendant `WorkUnit` whose
     **primary metric** — the metric named by its `scoring` (`reps｜time｜distance｜
     energy`; a `continuous` unit is **skipped**) — is **absent** has that metric set to
     `vᵣ` (a bare scalar, expanded by step 3); a `WorkUnit` that already carries its
     primary metric is copied unchanged. The **1st** copy keeps the source children's
     `id`s and positions; in copies 2…n every record (the copied children **and their
     descendants**) is treated as **id-less** for step 6, so it receives a fresh
     deterministic id and never collides. A `Block` carrying `roundScheme` together with
     `repetitions`, or with a `performance`, is invalid (§5.4) and is not normalizable.
   - **`sets`.** A `prescription` with `sets: N` is replaced by **N** sibling
     `WorkUnit`s, `sets` removed from each. The **1st** keeps the source `WorkUnit`'s
     `id` and array position; the other N−1 follow **immediately after, in order**. A
     `WorkUnit` carrying both `sets` and `performance` is invalid (§5.5) and is not
     normalizable.
6. **Assign deterministic ids (root-down).** Any record still lacking an `id` is
   assigned `<nearestAncestorId>#<containerField>#<index>`, `<index>` being its 1-based
   position in the parent's container array as it stands after step 5 and before
   flattening (the 3rd element of an `Exercise`'s `workUnits` → `ex-1#workUnits#3`;
   chained for id-less ancestors → `sess-1#exercises#1#workUnits#3`). Assigned
   parent-before-child. `#` is **reserved** in record ids (§7.1), so an assigned id
   never collides with a producer id. Records with an `id` keep it.
7. **Flatten containment.** Each inlined child becomes a standalone record with an
   explicit `partOf` link to its parent; the parent's containment arrays (`blocks`,
   `exercises`, `workUnits`, `children`) are removed (containment carried solely by
   `partOf`). `subject`, and **each of `startTime`/`endTime` that is present** on the
   nearest enclosing record, is propagated onto every descendant (when several
   ancestors are timed, the **nearest** wins; an explicit value already on the child
   wins over all, §5.5). If a child **already** carries an explicit `partOf`
   to that same container, flattening does **not** add a duplicate.
8. **Default `status`.** Absent `status` → `active` (§7.5).
9. **Serialize canonically (final).** Order the **set-valued arrays** — `links` by
   `(type, ref)`, `effortLoad` by `(kind, method)`, `intensity` by `(dimension)`,
   `modifiers` by `(type)`, `media` by `(url)` (§7.6 — an unordered set of
   attachments, like the other set-valued arrays), and `qualities` (an array of
   plain tokens) by **token value**,
   **with any tie broken by the element's own canonical byte
   string** (step 9 applied recursively), giving a total order. These six (`links`,
   `effortLoad`, `intensity`, `modifiers`, `media`, `qualities`) are the **only** set-valued arrays; **all
   other** arrays (`children`, `repDetail`, `phasePattern` phases,
   `dataPoints`/`offsets`, `Program.sessions`) are order-significant and keep their
   semantic order. Then
   serialize each record per **RFC 8785 (JSON Canonicalization Scheme)** — lexicographic
   key sort, canonical string
   escaping, no insignificant whitespace. Because step 1 left no bare numbers, JCS's
   `float64` number formatting is never invoked. The resulting bytes are the canonical
   form.

The set of canonical record byte strings (one per flattened record) is compared as an
unordered set.

**Scope of canonicalization.** Steps 1–9 descend into **all** JSON structure,
**including** namespaced `extension` objects and the opaque `script` (§5.14): every
value is canonicalized **identically** (numbers → string fixed-point per step 1, then
JCS key-sort), so two byte-different encodings of the *same* content compare equal.
There is **no "verbatim / received-bytes" exception** — it would be both unnecessary
and unimplementable (received bytes are not recoverable after parsing, and a
non-canonical fragment cannot be spliced into an otherwise-JCS record). JCS
canonicalizes any JSON deterministically, and an opaque string is simply a string JCS
leaves intact. This canonical-form procedure is distinct from the §8.1 wire-passthrough
rule: §8.1 guarantees unknown content is never *dropped*; this method defines how it is
*compared*. The two are consistent — canonicalization reorders and re-spells, never
discards.
