# OpenBody — an open standard for health & fitness data interoperability
## Draft v0.7.0 (normative)

> **Change control.** This is the canonical spec. A released version's normative text is
> immutable — never edit it in place. Normative changes ship as a *new version* (record the
> decision → ratify → edit → new `CHANGELOG.md` entry), per `GOVERNANCE.md` § Versioning &
> change management. Copies elsewhere (e.g. a memory bank) are non-authoritative.

### 0. Status & Scope

OpenBody is an **open, vendor-neutral, language-agnostic standard**: a canonical
data model plus mapping semantics that anyone can implement in any language. Its
mission is that **individuals own and port their health and fitness data without
platform lock-in**; its adoption lever is the **apps and platforms that implement
it** to exchange that data losslessly. OpenBody is stewarded by Thabit Labs.

**Fully open, not open-core.** A standard has to be fully open to be adopted. The
entire model and its mapping rules are public; monetization, if any, comes from
services and products built on top, never from closing parts of the spec.

**What is normative.** §§3–10 are the normative standard, including the model and
the mapping *rules*; §§1–2 are introductory (problem framing and the prior-art
survey, whose only normative force is the forward-referenced design commitments). The normative model is defined **independently of any
serialization** (field names, types, cardinality, and semantics). **JSON (with a
published JSON Schema) is the primary, first-class binding** and the form used by
all worked examples and conformance test vectors. Protocol Buffers, FlatBuffers,
and other encodings are valid **non-normative alternate bindings** for
high-throughput implementations. The **Go reference library** is a separate,
deferred Phase-2 build and is **not specced here** (see §11); other-language
implementations are equally valid if they conform to §§3–10.

**Conformance language.** The key words **MUST**, **MUST NOT**, **SHOULD**,
**SHOULD NOT**, and **MAY** are to be interpreted as described in RFC 2119/RFC
8174 when, and only when, they appear in capitals. Conformance is **tiered**
(required / recommended / optional) and **testable** against the test-vector suite
(§3, §8).

**Provenance tags are non-normative.** Parenthetical tags such as `(R1)`, `(D3)`,
`(F7)` scattered through §§4–7 are **non-normative** provenance markers from the
standard's design history; they carry no normative force and may be ignored by an
implementer reading this document alone.

**Licensing.** The standard document is licensed under the **Open Web Foundation Agreement (OWFa 1.0)**, providing reciprocal royalty-free patent licensing; reference code is licensed **Apache-2.0**; the exercise registry data (§6) is licensed **CC0**. See `LICENSING.md`.

---

### 1. Problem & the Two Pillars

#### 1.1 The problem

Personal health and fitness data is trapped in silos. Every platform — Apple
HealthKit, Google Health Connect, Garmin, Fitbit, Oura, Whoop, and a long tail of
strength, endurance, and functional-fitness apps — defines its own proprietary
schema, units, identifiers, and aggregation rules. An individual who switches
platforms, or who simply uses more than one, cannot move their own history between
them without loss. There is no neutral, portable representation that all of these
can read and write.

This fragmentation has two distinct faces, and existing efforts address only the
first:

- **Telemetry is partially served, but not portably.** Clinical standards (HL7
  FHIR, IEEE 11073 PHD) and mobile-health schemas (Open mHealth / IEEE 1752.1)
  model vitals and observations, but each consumer platform still ships its own
  siloed dialect, and clinical formats are verbose and ill-suited to
  high-frequency consumer streams.
- **Structured exercise is barely served at all.** No widely-adopted standard
  represents the *prescription and execution* of training — programs, sessions,
  sets, reps, rounds, effort, targets, equipment, and the planned-versus-performed
  relationship — in an interoperable way. This is the gap that decides whether
  serious training communities can ever own and port their data.

**OpenBody** is an open standard for both. Its mission and adoption lever are
stated in §0.

#### 1.2 The two pillars

OpenBody is organized around two co-equal pillars:

- **Pillar A — Observation (telemetry).** Continuous or instantaneous
  *measurements*: heart rate, HRV, sleep, vitals, power, speed, cadence, GPS.
  Readiness, recovery, and similar derived states are Pillar A observations, not
  training attributes. This pillar is defined by the canonical `Measurement` (§4).
- **Pillar B — Structured Training (exercise).** The *prescription and execution*
  of exercise: programs, sessions, blocks, exercises, work units, and reps,
  together with targets, effort, equipment, modifiers, outcomes, and participants.
  This pillar is defined by the structured-training model (§5) and the
  exercise-identity registry (§6).

Both pillars are **first-class in v1**. Pillar A alone would make OpenBody just
another telemetry format; Pillar B is what no incumbent provides and is therefore
the standard's primary differentiator.

#### 1.3 Design rule: Pillar B references Pillar A

A structured-training record **MUST NOT** re-invent telemetry. Where a set,
segment, or session has associated time-series data — the heart-rate trace during
an interval, the barbell velocity of a rep, the GPS route of a run — Pillar B
**references** the corresponding Pillar A `Measurement` records through the typed
links of the record envelope (§7), rather than embedding or duplicating that data.
This keeps each kind of data modeled once, in the pillar that owns it.

#### 1.4 What carries across both pillars

Every OpenBody record, in either pillar, shares a common **record envelope** (§7):
a stable identifier, typed links to related records (including the
planned-versus-performed and same-activity relationships), provenance, and an
immutable-plus-supersession lifecycle. Conformance tiers and namespaced extensions
(§3, §8) apply uniformly to both pillars, so that the simplest record stays trivial
while niche and novel practices remain representable without breaking the core.

---

### 2. Prior Art & Interoperability Gaps

*(Informative. This section frames the design; its only normative force is the
design commitments in §2.3, each discharged by a normative section in §§3–10.)*

OpenBody is bound by a hard rule: **it must never be inadequate where a prior
solution already solved a problem.** This section surveys the landscape that bar is
measured against. The full capability-by-capability parity check lives in the
project's coverage matrix; what follows is the summary that shapes the design. The
survey separates the two pillars because their prior art is almost disjoint:
telemetry is partially standardized, structured training is not.

#### 2.1 Pillar A — Observation (telemetry)

Here standards exist, but none is a portable consumer interchange format.

- **HL7 FHIR** models clinical observations via the `Observation` resource [1],
  with codeable concepts and component hierarchies (e.g. systolic/diastolic); the
  Personal Health Device IG [2] maps device data using IEEE 11073-10101
  nomenclature. *Gap:* structurally verbose and tuned for low-frequency clinical
  encounters — serializing 1 Hz consumer streams causes resource bloat, and
  consumer abstractions (sleep stages, "Body Battery", "Strain") need non-standard
  extensions, producing semantic drift.
- **Open mHealth / IEEE 1752.1** define mobile-first JSON schemas for heart rate,
  activity, sleep, steps, with strong acquisition metadata [3–5]. *Gap:* lacks
  maintained native-language SDKs, has thin clinical-context hooks, and specifies
  no dedup or state-sync rules for overlapping device feeds.
- **IEEE 11073 PHD** governs device-to-gateway exchange via a Domain Information
  Model and ACOM [6, 7]. *Gap:* built for local BLE/ANT+ links, not web-scale
  cloud ingestion; consumer metrics (calories, VO₂max, active minutes) map
  awkwardly into the nomenclature.
- **Apple HealthKit** organizes data as `HKSample` subclasses — `HKQuantitySample`
  with strict `HKUnit`, `HKCategorySample` for states [8, 9]. *Gap:* locked to
  Apple's ecosystem, Apple-specific identifiers, timezone in non-standard
  metadata, and client-decided aggregate resolution.
- **Google Health Connect** models `Record` types with a shared `Metadata` class
  (platform id, source package, device, UTC instants) [10, 11]. *Gap:* on-device
  Android only, flat model, no clinical structures, and dedup is left to each
  app.

**Takeaway:** the physical measurement is well-understood but every incumbent
expresses it in a siloed dialect. OpenBody's canonical `Measurement` (§4) is a
neutral superset that maps losslessly to and from these, deferring clinical/FHIR
mapping as a first-class *future* target rather than a v1 optimization.

#### 2.2 Pillar B — Structured Training (exercise)

Here there is **no serious interoperable incumbent**. The relevant prior art is a
patchwork of platform-internal models and exercise science:

| Source | Models well | Gap / takeaway |
|---|---|---|
| Apple HealthKit | `HKWorkout` + `HKWorkoutActivity` (multisport), `workoutEffortScore`, HR zones | Weak on sets/reps for strength |
| Google Health Connect | `ExerciseSession→Segment/Lap`; planned `Plan→Block(reps)→Step→Goal+Targets`; planned↔performed link | Rest & strength targets under-documented; time-range association is fragile |
| Garmin FIT | `Session→Lap→Record` + `set` + `workout_step` | Most granular & extensible; binary/complex |
| OpenWeight (2026) | Open strength format: required-core + optional + `app:` extension namespaces; %1RM & rep-range templates; planned vs performed | Explicitly omits supersets, drop sets, rest |
| wger | Modular optional fields; `Slot` grouping; iteration-based progression | Self-flags over-normalization risk |
| SugarWOD / CrossFit | AMRAP/EMOM/for-time scoring; Rx vs Scaled; benchmark WODs (Fran/Murph) | Domain-specific; no general model |
| Load science | %1RM, RPE, RIR, sRPE, TRIMP, TSS, VBT | Effort is plural — no single metric |

#### 2.3 Conclusions that shape the design

The survey yields eight design commitments, each carried into the normative model:

1. A **containment hierarchy with repeatable blocks** is the universal backbone
   (§5).
2. **Planned-versus-performed is first-class** — model both and the link between
   them (§5, §7).
3. **Targets are polymorphic** — absolute, range, and relative-to-threshold (§5).
4. **Effort is plural** — carry several measures and tag the method and its source
   (§5).
5. **Required / recommended / optional tiers plus namespaced extensions** are the
   proven adoption pattern (§3, §8).
6. **Exercise identity is the unsolved interop problem** — it needs a dedicated
   mechanism (§6).
7. **Supersets, drop sets, circuits, tempo, and rest are under-modeled by
   everyone** — covering them cleanly is the differentiation bar (§5).
8. **Reference Pillar A, don't duplicate telemetry** (§1.3, §7).

---

### 3. Goals, Non-Goals & Conformance Levels

#### 3.1 Goals

- **Portability without loss (the mission).** An individual MUST be able to move
  their full history between any two conformant implementations without losing
  meaning. Lossless, deterministic, bidirectional mapping between incumbent
  schemas and the canonical model is the primary success measure.
- **Never inferior to prior art.** For every capability any surveyed prior
  solution supports, OpenBody MUST either express it or carry a logged, justified
  deferral. This is enforced by the coverage matrix and is a release gate, not an
  aspiration.
- **Structured-exercise expressiveness.** Pillar B MUST represent the core
  training structures — resistance sets×reps, interval/round scoring
  (AMRAP/EMOM/for-time), and continuous endurance — as first-class, each with
  worked examples and conformance test vectors.
- **Source agnosticism.** The model MUST NOT favor any single platform; it
  represents the physical measurement and the training event objectively, with no
  steward or vendor identifier required on the wire.
- **Simple stays simple (progressive disclosure).** A minimum-viable record MUST
  be trivial to produce; advanced and niche needs MUST be reachable through
  conformance tiers and extensions without breaking validation of the core.
- **Lossless ingestion.** An implementation MUST be able to preserve source
  meaning it does not natively model, via namespaced extensions and the opaque
  fallbacks defined in §6 and §8 — it MUST NOT silently drop data.
- **Independently implementable.** Two implementers MUST be able to build
  conformant, interoperating libraries from this specification and the test
  vectors alone.

#### 3.2 Non-Goals

- **Not a storage engine or database.** OpenBody dictates no storage layout, index
  strategy, or database technology.
- **Not an integration suite or EHR connector.** It is a data model and mapping
  layer, not an integration engine (e.g. not a Mirth Connect), and not an EHR
  write-back product.
- **Not device communication.** It does not speak BLE, ANT+, or any wire protocol
  to hardware; it assumes ingestion of platform SDK outputs (JSON/Protobuf
  payloads).
- **Not identity or authentication.** It does not manage user auth or subject
  identity matching; subject identity resolution happens at a higher layer.
- **Not a coaching or programming algorithm.** It *represents* training; it does
  not prescribe or generate it.
- **Not an exhaustive exercise enumeration in v1.** The long tail of
  exercises/disciplines is carried by the registry (§6) and extensions (§8), not
  by enumerating everything in the core. Exhaustive coverage is an AI-leveraged
  fast-follow; the v1 gate is that the model and extension mechanism guarantee any
  surveyed niche is addable *without breaking the core*.
- **Scope boundaries.** Non-physical "sports" (esports, sim racing) are out of
  scope. Low-exertion precision sports (darts, golf, curling) are in scope via
  `outcome` (§5); recovery/wellness modalities (sauna, cold, meditation) are
  optionally in scope as low-structure tagged sessions. Subjects are human-first;
  the model does not preclude non-human subjects (§5). Nutrition and hydration
  logging (e.g. meal composition, water intake) and reproductive-health tracking
  (e.g. menstrual-cycle phase, fertility signals) are in scope via the generic
  `Measurement` mechanism (§4.4) — a registered canonical `type` token or a
  namespaced source token — with no bespoke model required. Reproductive-health
  measurement types carry elevated legal sensitivity in some jurisdictions (e.g.
  treatment as special-category data under regimes such as GDPR Art. 9, and under
  some regional health-data statutes); producers and consumers SHOULD treat these
  types with commensurately greater care in storage, transmission, and access
  control. This spec does not itself provide legal guidance, and implementers
  remain responsible for applicable compliance.

> *Clinical/FHIR mapping is a first-class **future** extensibility target, not a v1
> optimization (§2.1). It is not a non-goal — it is deferred. FHIR informs
> OpenBody's **architecture** (serialization-neutral model + JSON binding, the
> Observation shape, coded crosswalks, extensions, conformance profiles), not its
> **domain**: OpenBody is a consumer health/fitness portability standard, and uses
> neutral vocabulary (`subject`, not `patient`) accordingly.*

#### 3.3 Conformance levels

OpenBody defines three **tiers** of model elements. A conformant implementation
declares the **profile** it supports (e.g. "Observation core", "Training core");
within a supported profile:

- **Required (core).** An implementation **MUST** correctly read and write every
  required element of the profiles it claims. These are the elements without which
  interoperation is meaningless (e.g. a `Measurement`'s type, value, unit, and
  time; a `WorkUnit`'s scoring kind).
- **Recommended.** An implementation **SHOULD** support recommended elements.
  Where it does not natively model one, it **MUST** preserve it losslessly
  (passthrough) rather than discard it.
- **Optional.** An implementation **MAY** support optional elements. As with
  recommended, unsupported optional elements that appear on input **MUST** be
  preserved losslessly, not dropped.

The per-element **Tier** columns in §§4–7 use these tokens, all reducible to the
three tiers above:

- **required** — required whenever the record is present.
- **recommended** / **optional** — as above.
- **conditional** (also written `required¹`, `required²`) — required only when a
  stated condition holds (the condition is given in the same row); otherwise absent.
- **required-in-X** (e.g. `required-in-Block`, `required-in-Exercise`) — required
  when a record of kind X is present, i.e. structural to that record.
- **required (core)** / **optional (ext)** — a core-required vs extension-optional
  pair within one value object (e.g. `Progression.rule` vs `Progression.script`).

Two further rules make tiering safe:

- **Lossless passthrough is mandatory at every tier.** Any element an
  implementation does not understand — recommended, optional, or a namespaced
  extension (§8) — **MUST** round-trip unchanged. "Not supported" never means "may
  be deleted."
- **Conformance is testable.** Each profile is accompanied by a published
  **test-vector suite** (§8). An implementation demonstrates conformance by
  round-tripping the vectors for the tier and profile it claims; the per-element
  tier assignments are normative and listed with each model element in §4–§7.

Producers and consumers may conform asymmetrically: a producer conforms if its
output validates against the profiles it emits; a consumer conforms if it
correctly reads required elements and preserves the rest.

---

### 4. Pillar A — Observation

Pillar A models telemetry: continuous or instantaneous measurements of a subject.
Its single atom is the **`Measurement`**. Every `Measurement` also carries the
shared **record envelope** of §7 (stable `id`, `subject` reference, typed `links`,
`provenance`, lifecycle); this section defines only the Observation-specific fields.

#### 4.1 The `Measurement` model

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `type` | required | string | Canonical measurement type, drawn from the measurement-type registry (§4.5), or a namespaced source token (§4.4). |
| `value` | required | one-of | Exactly one of `quantity`, `category`, or `sampleArray` (§4.2–§4.3). |
| `unit` | required¹ | string (UCUM) | UCUM unit for the value. Required for `quantity` and for a single-channel `sampleArray`; omitted for `category` and for multi-channel `sampleArray` (units live per channel). |
| `startTime` | required | timestamp | Start of the observation (RFC 3339, with offset). |
| `endTime` | required | timestamp | End of the observation; **equals `startTime`** for an instantaneous point, otherwise the interval end (§4.3). |
| `extension` | optional | object | Namespaced passthrough for source attributes with no canonical field (§8). |

¹ Conditionally required — see semantics.

#### 4.2 Value shapes

`value` is a **closed one-of**. **`value` is conceptual — there is no `value`
wrapper key on the wire.** Exactly one of the sibling keys `quantity`, `category`,
or `sampleArray` appears at the `Measurement` root:

| Shape | Type | Use |
|---|---|---|
| `quantity` | number, or fixed-point `{coefficient, exponent}` | A single numeric value (e.g. `72` /min; or a daily aggregate, §4.3). Fixed-point gives lossless decimal encoding (e.g. body mass). |
| `category` | string | A discrete categorical state (e.g. `sleep_deep`, `afib`). No `unit`. |
| `sampleArray` | object (§4.3) | A sampled series — scalar or vector, regular or irregular. |

A **fixed-point** `quantity` `{coefficient, exponent}` denotes the exact value
`coefficient × 10^exponent` (e.g. `{coefficient: 8050, exponent: -2}` = 80.50 kg).

#### 4.3 Series & intervals

**`sampleArray`** represents a series of samples sharing one metadata record — the
only form that scales to continuous sensor data. Point-by-point `quantity` records
remain valid for sparse data.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `frequencyHz` | required² | number | Uniform sampling rate; sample *i* is at `startTime + i/frequencyHz`. |
| `offsets` | required² | array&lt;number&gt; | Irregular timing: seconds from `startTime` for each sample (e.g. RR-intervals, event-triggered samples). |
| `channels` | optional | array&lt;{`name`, `unit`}&gt; | Declares a **multi-channel / vector** sample. Omit for a single scalar channel (which uses the Measurement's `unit`). |
| `dataPoints` | required | array | Single-channel: `array<number\|null>`. Multi-channel: `array<array<number\|null>>`, one row per sample, values ordered by `channels`. |

² **Exactly one** of `frequencyHz` or `offsets` MUST be present.

- **Vector telemetry** (GPS routes, 3-axis accelerometry) uses `channels`. A GPS
  route is a `sampleArray` with the **recommended canonical location channels**
  `lat` (deg), `lon` (deg), `alt` (m), typically with `offsets` (GPS fixes are
  irregular). These channel names are a registry-backed convention (§4.5), not a
  bespoke value shape.
- **Categorical series** — e.g. a night of sleep stages — are carried as multiple
  `category` Measurements over adjacent intervals, **not** as a `sampleArray`
  (which is numeric-only).
- **Dropped / missing samples** are encoded as `null` in `dataPoints` (a whole row
  may be `null` for a fully-missed multi-channel sample).
- For a regular series, `endTime` **SHOULD** equal `startTime + n/frequencyHz`
  (it is derivable); for an irregular series, `endTime` **SHOULD** equal
  `startTime +` the last offset.

**Aggregates are not a special shape.** A single statistic over an interval — a
daily step total, a lap's average heart rate — is a `quantity` whose `startTime`
and `endTime` bound the window; no special encoding is needed. The `derivedFrom`
link (§7) **MAY** point at an underlying series but **MUST NOT** be required:
vendors routinely emit aggregate-only data. A multi-statistic summary is carried
as separate typed Measurements (`heart_rate_min`, `heart_rate_mean`,
`heart_rate_max`), each with `derivedFrom` optional.

#### 4.4 Type vocabulary & terminology

OpenBody uses **source-native namespacing with lazy semantic resolution**:

- Ingestion **MUST NOT** fail because a `type` has no clinical/standard code. Any
  source token is accepted — a registered canonical token (§4.5) or a namespaced
  source token (`apple:…`, `garmin:…`).
- Mapping a `type` to external terminologies (LOINC, SNOMED-CT, UCUM, IEEE
  11073-10101) happens **on output**, in the mapping layer (§10), not at ingest.
  This guarantees zero loss for consumer metrics with no clinical equivalent
  ("Readiness", "Strain").

This rejects strict ingest-time clinical mapping (blocks consumer metrics) and a
hardcoded internal enum (needs a core release per new vendor metric).

#### 4.5 The measurement-type registry

Canonical `type` tokens and recommended channel conventions are defined in an
**OpenBody measurement-type registry** — a fetchable, independently-versioned
artifact, parallel in mechanism to the exercise registry (§6): one canonical
registry (the interop anchor) plus namespaced augmentation, with a matching ladder
of *registered token → namespaced source token → opaque string*. An opaque or
namespaced token **MUST** always round-trip losslessly. The spec defines the
mechanism; the registry ships content on its own cadence.

#### 4.6 JSON binding (primary, normative)

```json
{
  "id": "obs-9f2a1c",
  "recordType": "Measurement",
  "subject": "subj-001",
  "type": "heart_rate",
  "quantity": 72,
  "unit": "/min",
  "startTime": "2026-06-23T14:02:00Z",
  "endTime": "2026-06-23T14:02:00Z",
  "provenance": { "method": "sensor", "device": { "manufacturer": "apple", "model": "Watch Ultra 2" } }
}
```

A daily aggregate (interval window, no source series):

```json
{
  "id": "agg-steps-0623",
  "recordType": "Measurement",
  "subject": "subj-001",
  "type": "step_count",
  "quantity": 8421,
  "unit": "1",
  "startTime": "2026-06-23T00:00:00-07:00",
  "endTime": "2026-06-24T00:00:00-07:00"
}
```

A GPS route (multi-channel, irregular):

```json
{
  "id": "obs-route-77",
  "recordType": "Measurement",
  "subject": "subj-001",
  "type": "location",
  "sampleArray": {
    "offsets": [0, 1.0, 2.1],
    "channels": [
      { "name": "lat", "unit": "deg" },
      { "name": "lon", "unit": "deg" },
      { "name": "alt", "unit": "m" }
    ],
    "dataPoints": [[37.4220, -122.0841, 12.0], [37.4221, -122.0840, 12.1], [37.4223, -122.0839, null]]
  },
  "startTime": "2026-06-23T08:00:00Z",
  "endTime": "2026-06-23T08:00:02.1Z"
}
```

#### 4.7 Alternate bindings (non-normative)

Implementations needing maximum throughput **MAY** encode `Measurement` in Protocol
Buffers, FlatBuffers, or similar. These are non-normative: they **MUST** preserve
the normative field semantics above and round-trip losslessly to the JSON binding.
A reference Protobuf schema is provided as an informative appendix artifact.

#### 4.8 Design note (informative)

The canonical `Measurement` is a **custom neutral model**, chosen over anchoring on
FHIR `Observation` (verbose, clinical-frequency-oriented) or Open mHealth (no
maintained native SDKs, thin device context). It borrows FHIR's *shape* without its
clinical payload weight (§3.2).

---

### 5. Pillar B — Structured Training

Pillar B models the *prescription and execution* of exercise. This section defines
the containment hierarchy, the scoring model, and the planned-versus-performed
duality; §5.10–§5.20 define the shared value objects these levels reference, and §6
defines exercise identity (`ExerciseRef`). Every level is a record carrying the
shared envelope (§7), including its `recordType` discriminator.

#### 5.1 The hierarchy

```
Program / Plan        ordered sessions over time (e.g. 5/3/1, a marathon block)
  └─ Phase*           optional named mesocycle grouping over a subset of sessions (§5.2)
  └─ Session          one training occurrence; planned and/or performed
       └─ Block        a group; MAY repeat, MAY nest, MAY carry a scoring scheme
            └─ Exercise   an exercise occurrence (refs ExerciseRef §6 + Descriptors §5.16)
                 └─ WorkUnit   the atom (one set); scored by kind; carries prescription and/or performance
                      └─ Rep*  optional per-rep detail
```

**Every level above `WorkUnit` is OPTIONAL.** The model collapses gracefully: the
minimum viable training record is a single `WorkUnit`, or a `Session` holding one
`WorkUnit` directly with no intervening `Block` or `Exercise`. Producers **MUST
NOT** be required to emit intermediate levels they have no data for. `WorkUnit` is
the only required-tier element of the Training-core profile (§3.3).

**`Phase` is a grouping tier, not a containment tier.** It is drawn beside `Session`
in the diagram above (not strictly between `Program` and `Session`) because a
`Phase` is a sub-object inlined on `Program` (§5.2), not a separate record type —
it groups the *same* `Session` references `Program` already carries, it does not
introduce a new referenceable record or change how `Session` attaches to `Program`.

**Containment fields by record type** (the field that holds children at each level —
load-bearing for the §8.3 flatten/id rules). A parent inlines children under exactly
one of its listed arrays:

| Record | Child field(s) | Holds | Kind |
|---|---|---|---|
| `Program` | `sessions` | `Session` references (§5.2) | **reference list** — not inlined, not flattened |
| `Program` | `phases[].sessions` | `Session` references, grouped by named phase (§5.2) | **reference list** — not inlined, not flattened |
| `Session` | `blocks` \| `exercises` \| `workUnits` (at most one) | `Block` / `Exercise` / `WorkUnit` (§5.3) | inline container |
| `Block` | `children` | `Block` / `Exercise` / `WorkUnit` (§5.4) | inline container |
| `Exercise` | `workUnits` | `WorkUnit` (§5.5) | inline container |
| `WorkUnit` | `repDetail` | per-rep detail (§5.7) — sub-objects, not records | (not flattened) |

Only the **inline container** fields are subject to the §8.3 flatten/id rules;
`Program.sessions` and `Program.phases[].sessions` hold `id` references (the
Sessions are separate records) and `WorkUnit.repDetail` holds sub-objects, so none
of these are flattened.

**Human-readable labels.** A `name` (optional string) is carried on the records users
actually name — `Program`, `Session`, `Block` — and free-text `notes` (optional string)
on `Session`, `Block`, `Exercise`, and `WorkUnit`. These are first-class because a
workout title is ubiquitous and user-facing, so it must interoperate, not merely
survive in a vendor extension. App-specific **cosmetics** (color, icon, UI/sort state)
are *not* core — they belong in namespaced `extension` (§8.1). An exercise's name is its
identity (`exerciseRef`, §6), not a `name` field.

#### 5.2 Program / Plan

A **`Program`** is an optional ordered collection of sessions over time. ("Plan" is
an informal synonym used in prose only; **`Program` is the sole valid `recordType`
token** — `Plan` is not.)

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `name` | optional | string | Human-readable plan/routine name (e.g. "5/3/1"). |
| `sessions` | recommended | array&lt;ref&gt; | Ordered `Session` references (the planned sequence). |
| `recurrence` | optional | object | A recurrence/template description, when sessions are generated by rule rather than enumerated: `{ rule, count? }` (`rule` an open token, e.g. `weekly`). Mutually exclusive with an enumerated `sessions` list. |
| `iteration` | optional | integer | Iteration index for progression history (§5.14). |
| `progression` | optional | `Progression` | A whole-plan progression rule (§5.14), when advancement is defined at the Program level rather than per-`prescription`. |
| `phases` | optional | array&lt;`Phase`&gt; | Named macro/meso/microcycle grouping over the program's sessions (e.g. "Hypertrophy," "Strength," "Peaking," "Deload"). Each `Phase` is a sub-object (not a separate record): `name` (required string), `weekStart`/`weekEnd` (optional integers, 1-based, inclusive — the week-numbering convention already used by `recurrence`/other week-based fields in this spec), `goal` (optional string), `sessions` (optional array&lt;ref&gt; — ordered `Session` references belonging to that phase, same reference semantics as the top-level `sessions` field). |

A Program is typically a *planned* artifact that performed Sessions link back to
(§5.6, §7).

**`phases` is additive and does not replace `sessions`.** A `Program` may have
`sessions` only (today's flat shape, unchanged), `sessions` **and** `phases`, or
`phases` alone with no top-level `sessions` at all.

**Authority when both are present:** `Program.sessions`, when present, remains the
single authoritative ordered list of `Session` references for the whole program —
this is unchanged from today, and a consumer that does not understand `phases`
**MUST** still be able to read the complete, correctly-ordered session list from
`sessions` alone. Each `phases[].sessions` entry **MUST** also appear in the
top-level `sessions` list; a phase's `sessions` is a same-space grouping/view over
those references, not an independent list. Phases need not be exhaustive — a
program MAY have sessions that belong to no phase (e.g. a one-off session outside
the periodized block structure) — but a phase MUST NOT reference a session id
absent from `Program.sessions`. This was chosen over requiring the two lists to
mirror each other exactly (concatenation-equality) because that would forbid the
common case of unphased extra sessions, and over making `phases` sole authority
by default because it would silently break every existing consumer that reads
`Program.sessions` and has never heard of `phases`.

**`phases` without a top-level `sessions`:** when `Program` omits `sessions`
entirely, each `phases[].sessions` becomes the only place session references live,
and the program's effective full ordered session list is the concatenation of
`phases[].sessions` in phase order. This mode suits a producer that has no
unphased sessions and would otherwise be forced to duplicate every id across both
the flat list and its phase.

**Interaction with `recurrence`:** `recurrence` generates sessions by rule instead
of enumerating them, and is mutually exclusive with an enumerated `sessions` list.
Because a `Phase` groups sessions **by id reference**, `phases` presumes concrete,
addressable `Session` records exist to reference — a `Program` using `recurrence`
has no ids to group until/unless its sessions are materialized into an enumerated
list. A producer that wants both rule-based generation and named phases **MUST**
materialize the generated sessions as an explicit `sessions` list (optionally
organized under `phases`) rather than relying on `recurrence`; `recurrence` and
`phases` are not usable together on the same `Program`.

**Interaction with `progression`:** `progression` (§5.14) describes how the
*whole plan* advances across `iteration`s and applies uniformly regardless of
`phases` — it is not phase-scoped, so a `Program` with four phases and a
`progression` rule advances the entire iterated plan (all phases together) as one
unit. This spec does not define a *per-phase* progression rule; a phase's `goal`
is descriptive text, not a mechanism for varying advancement by block. Producers
needing different progression logic per phase must model each phase's sessions'
own per-`prescription` `progression` (§5.14) instead.

#### 5.3 Session

A **`Session`** is one training occurrence.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `name` | optional | string | Human-readable workout name (e.g. "Push Day", "Morning Run"). |
| `notes` | optional | string | Free-text notes for the session. |
| `startTime` | recommended | timestamp | When the session occurred (RFC 3339, with offset). The occurrence time of a Pillar B record is carried here, not borrowed from linked telemetry — a session with no associated `Measurement` must still be datable and chronologically orderable. |
| `endTime` | optional | timestamp | End of the session; omit for an open/ongoing or single-instant session. |
| `disciplines` | recommended | array&lt;token&gt; | One or more disciplines — open registry-backed tokens from a disciplines vocabulary (same mechanism as §4.5/§6); multiple ⇒ multisport/hybrid. |
| `intent` | optional | enum | `train｜test｜compete｜recover｜rehab` (R10). |
| `qualities` | optional | array&lt;token&gt; | The **physical quality/qualities** this session develops — open registry-backed tokens (§5.9): `endurance｜strength｜power｜mobility｜flexibility｜stability｜balance｜agility｜speed｜coordination｜…` (R20). A descriptive classification axis **orthogonal** to `disciplines` (the activity) and `intent` (the purpose); a single session MAY develop several. |
| `participants` | optional | array | Subjects involved (§5.19); default is the single envelope `subject`. |
| `accumulation` | optional | bool | Work gathered over a window rather than one contiguous bout (R8). |
| `blocks` | optional | array&lt;Block&gt; | Contained Blocks (the most-structured form). |
| `exercises` | optional | array&lt;Exercise&gt; | Contained Exercises directly (Block level collapsed). |
| `workUnits` | optional | array&lt;WorkUnit&gt; | Contained WorkUnits directly (Block **and** Exercise collapsed; each then carries its own `exerciseRef`). |
| `outcome` | optional | `outcome` | The **session-level result** (§5.18) — a match score, race placement, or game outcome, for sports whose contest *is* the session (R19). |

A Session structures its content **one way only**: **at most one** of `blocks`,
`exercises`, or `workUnits` is present (the choice fixes the granularity; to mix
loose and grouped work, wrap the loose work in a `Block` or `Exercise`). This keeps
flattening and id-assignment (§8.3) unambiguous.

`startTime`/`endTime` are the canonical occurrence-time fields for Pillar B. A
standalone `Block` or `WorkUnit` (one synced without an enclosing `Session`, §5.5)
**MAY** carry the same two fields; an inlined child **inherits** its timing context
from the nearest enclosing record that has it.

A Session **MAY** be planned, performed, or both; the relationship is carried by
the envelope link (§5.6).

#### 5.4 Block

A **`Block`** groups child elements and is the home of multi-exercise scoring and
grouping semantics.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `name` | optional | string | Human-readable block name (e.g. a named circuit or benchmark WOD "Fran"). |
| `notes` | optional | string | Free-text notes for the block. |
| `children` | required-in-Block | array | Child `Block`s and/or `Exercise`s — or, when the `Exercise` level is collapsed (§5.5), `WorkUnit`s directly (each then carrying its own `exerciseRef`). A Block's `children` array is heterogeneous but every element is one of `Block｜Exercise｜WorkUnit`. |
| `repetitions` | optional | integer | The block is performed N times — **identical** rounds/circuits. Mutually exclusive with `roundScheme`. |
| `roundScheme` | optional | array&lt;integer&gt; | **Laddered rounds** (R17): per-round counts, e.g. `[21,15,9]` (Fran), an ascending ladder, or a calorie ladder. The block is performed `length(roundScheme)` rounds; in round *r* each descendant `WorkUnit` whose **primary metric is absent** takes `roundScheme[r-1]` as that metric (§5.8). A *planned* shorthand that expands on normalization (§8.3); mutually exclusive with `repetitions`, and **MUST NOT** appear with a `performance`. |
| `scoring` | optional | object | A **block-level scoring scheme** (R1): `scheme` (open token: `amrap`, `for_time`, `emom`, `tabata`, `rounds`) plus the scheme parameters defined below. The registry holds display synonyms/casing. |
| `grouping` | optional | token | Open grouping semantic: `superset`, `giant_set`, `circuit`, `drop_set`, … (≈ wger Slot). |
| `qualities` | optional | array&lt;token&gt; | The **physical quality/qualities** this block develops (R20) — same open vocabulary and semantics as `Session.qualities` (§5.3), at block granularity (a strength session's mobility warmup, conditioning finisher, …). Block-level tags **add to**, and do not override, any session-level `qualities`. |
| `performance` | optional | object | The block-level **result** of a scoring scheme (fields below). |
| `rxStatus` | optional | enum | `rx｜scaled` for the block as performed (§5.5). |
| `synchronized` | optional | bool | Multi-participant coordination constraint — work counts only if met (R15, §5.19). |

**`scoring` parameters** (alongside `scheme`; all durations in seconds, UCUM `s`):

| Field | Type | Applies to | Semantics |
|---|---|---|---|
| `timeCapSec` | number | `amrap`, `for_time` | Time cap (AMRAP duration; for-time ceiling). |
| `intervalSec` | number | `emom`, `tabata` | Length of each work window (EMOM minute = 60). |
| `workSec` / `restSec` | number | `tabata`, interval schemes | Work and rest durations within an interval (Tabata = 20/10). |
| `rounds` | integer | `rounds`, `tabata` | Number of rounds/intervals. |

**`performance`** (block-level result) carries: `outcome` (§5.18, e.g. an `amrap`'s
rounds completed) and, optionally, the elapsed `time` (a `for_time` result) and
`rxStatus`. It does **not** repeat the per-atom metric fields of a `WorkUnit`.

**Collapsing.** Every level above `WorkUnit` is optional (§5.1); a `Block` **MAY**
hold `WorkUnit`s directly (skipping `Exercise`), and an `Exercise` **MAY** sit
directly under a `Session` (skipping `Block`). Where `Exercise` is skipped, the
`WorkUnit` carries `exerciseRef` (§5.5).

Blocks **MAY nest** (a superset inside a circuit; rounds of rounds). Block-level
`scoring` (R1) covers schemes that span *multiple exercises* — the case no
incumbent models cleanly. Per-atom scoring lives on the `WorkUnit` (§5.5).

A **drop set** is encoded canonically as a `Block` with `grouping: drop_set` whose
post-first `WorkUnit`s carry `setRole: drop` (§5.5); producers **MUST NOT** encode
the same structure two different ways.

**Round structure vs scoring are orthogonal** (R17). `repetitions` / `roundScheme`
describe *how the rounds are structured*; `scoring.scheme` (§5.8) describes *how the
work is measured*. They compose: a 21-15-9 "for time" couplet is
`scoring.scheme: for_time` **+** `roundScheme: [21,15,9]`; an ascending-rep AMRAP
ladder is `scheme: amrap` **+** `roundScheme`. `roundScheme` is the compact form of a
laddered block whose rounds differ only in their per-round count; it is **defined to
expand** (§8.3) to the same fully-enumerated `children` an producer could write by
hand — the two forms are equivalent. A `WorkUnit` that needs a different value than the
scheme supplies carries its own metric and is left untouched by the expansion (so a
fixed-rep accessory inside a laddered block is unaffected); a `continuous`-scored unit,
having no single primary metric, never participates. Where rounds differ in more than a
single count (e.g. the load also changes each round), enumerate the rounds explicitly
rather than using `roundScheme`.

#### 5.5 Exercise & WorkUnit

An **`Exercise`** is an occurrence of a movement.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `exerciseRef` | required-in-Exercise | string \| object | The movement reference (§6) — a bare canonical-id string or the full `ExerciseRef` object. |
| `descriptors` | optional | object | The occurrence's concrete realization (§5.16: equipment unit + `resistanceProfile`). |
| `notes` | optional | string | Free-text notes for this exercise occurrence. |
| `workUnits` | required-in-Exercise | array | One or more `WorkUnit`s. |

A **`WorkUnit`** is the atom of training — **strictly one set** — and the one
required-tier element.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `scoring` | required | enum | How the atom is measured: `reps｜time｜distance｜continuous｜energy`. |
| `exerciseRef` | optional | string \| object | The movement reference (§6). Carried here **only when the `Exercise` level is collapsed** (the `WorkUnit` sits directly under a `Block`/`Session`) and **MUST NOT** be present when an enclosing `Exercise` carries it. |
| `prescription` | optional | object | The *planned* target(s) — modular, individually-optional fields (§5.6, R4). |
| `performance` | optional | object | The *actual* result — the same modular fields (no `sets`), plus `outcome` (§5.18). |
| `setRole` | optional | token | Open: `warmup｜working｜drop｜failure｜backoff｜…` (R1/R6); has a tail (cluster/myo/primer). |
| `rxStatus` | optional | enum | `rx｜scaled` (R1/R6). |
| `by` | optional | ref | Attributing participant, when not the default subject (R7). |
| `synchronized` | optional | bool | Multi-participant coordination constraint — reps count only if met (R15, §5.19). |
| `repDetail` | optional | array | Per-rep detail array (§5.7) — distinct from the `reps` *count* metric. |
| `notes` | optional | string | Free-text notes for this set. |
| `startTime` / `endTime` | optional | timestamp | Occurrence time (§5.3). On a standalone/top-level `WorkUnit` this is its own time; on an **inlined** WorkUnit it is normally omitted (timing is inherited), but if present it **overrides** the inherited value (§8.3 step 7). |

**`prescription` / `performance` fields** (a `prescription` object; `performance`
takes the same fields minus `sets`, plus `outcome`):

| Field | Type | Semantics |
|---|---|---|
| `reps` / `time` / `distance` / `energy` | scalar or `Target` | The metric matching `scoring` (a `time`-scored unit carries `time`, etc.); §5.10. |
| `load` | `Load` | External **resistance** (§5.12) — weight, band, machine level, %1RM. |
| `intensity` | array&lt;`Intensity`&gt; | Prescribed/achieved **intensity targets** on dimensions other than resistance — power, pace, heart-rate, speed, grade — absolute, relative-to-threshold (incl. a band), or a named zone (§5.13). |
| `effortLoad` | array&lt;`EffortLoad`&gt; | Plural **perceived/derived effort** measures — RPE, RIR, sRPE, TRIMP, TSS (§5.13). |
| `rest` | scalar or `Target` | Inter-set rest; a duration, e.g. `{ absolute: { value: 120, unit: "s" } }`. |
| `sides` | object | Per-side sub-structure for a single scored atom performed once on each of two (or more) sides — e.g. a per-side plank hold or carry (§5.5 below). |
| `phasePattern` | `phasePattern` | Tempo / breath pattern (§5.15). |
| `modifiers` | array | Conditions (§5.17). |
| `progression` | `Progression` | *Planned `prescription` only* — how this prescription advances across iterations (§5.14). (A whole-plan progression instead lives on `Program`, §5.2.) |
| `sets` | integer | *Planned `prescription` only* — the shorthand below; **MUST NOT** appear in `performance`. |
| `outcome` | `outcome` | *`performance` only* — skill/sport result (§5.18). |

Each metric value (`reps`/`time`/`distance`/`energy`/`rest`, and per-rep
`velocity`/`rangeOfMotion`) is **scalar-or-`Target`** (§5.10); `load.value` and
`Intensity.value` are scalar-or-`Target` slots within their own objects
(`EffortLoad.value` is a plain number — §5.13).
Prescription/performance fields are **modular and individually optional** (R4): a
producer includes only what applies and **MUST NOT** be forced into relational
decomposition. A bare `WorkUnit` with only `scoring` is valid.

**`scoring` ↔ metric.** A `WorkUnit` **MUST NOT** carry a metric field that
contradicts its `scoring` kind: a `reps`-scored unit's primary metric is `reps`, a
`time`-scored unit's is `time`, `distance`→`distance`, `energy`→`energy`. The
`continuous` kind (a continuously-measured effort, e.g. a run; §5.8) is the
exception: it **MAY** carry any of `distance`, `time`, and `energy`, and **no**
specific metric is required. Other metric fields (e.g. `load`, `rest`, `effortLoad`)
**MAY** accompany any kind.

**Sets shorthand.** Because a `WorkUnit` is strictly one set, repeated identical
sets are expressed in a *planned* `prescription` with the shorthand `sets: N`,
which is **defined to expand to N identical `WorkUnit`s**. A conformant consumer
**MUST** treat `sets: 3, reps: 5` as three atomic WorkUnits. The *performed* form
**MUST** enumerate one `WorkUnit` per actual set, so per-set actuals (e.g. 5@RPE7,
5@RPE8, 5@RPE9) are capturable; `sets` **MUST NOT** appear in `performance`.
Consequently a `WorkUnit` that carries `sets` **MUST NOT** also carry `performance`
(a planned shorthand and an enumerated performed result are mutually exclusive on one
unit) — normalization treats such a record as invalid (§8.3 step 5).

**`sides` (per-side sub-structure).** A `WorkUnit` is still strictly one scored
atom — one `effortLoad`, one `notes` — but some atoms are performed once per side
with an internal transition (a per-side plank hold, a per-side carry). `sides` is a
modular `prescription`/`performance` field, a sibling of the other metric fields
above (not a replacement for any of them), that carries this structure without
splitting the atom into two `WorkUnit`s:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `sides.count` | required (when `sides` present) | integer ≥ 1 | The number of sides the atom is performed on (typically 2). |
| `sides.restBetween` | optional | scalar or `Target` | The transition between sides, e.g. `{ absolute: { value: 5, unit: "s" } }`. Same shape/handling as `rest` (§5.10, §8.3) — default unit `s` when a bare scalar is used. |

**The primary metric is per side, not split across sides.** When `sides` is
present, the `WorkUnit`'s primary metric (whichever of `reps`/`time`/`distance`/
`energy` matches `scoring`) is the amount performed **on each side**, not the total
split across sides. `time: { absolute: { value: 20, unit: "s" } }` with
`sides: { count: 2 }` means **20 s per side (40 s total elapsed)**, never "20 s
total, 10 s per side." A consumer computing total elapsed time or total volume
**MUST** multiply the primary metric by `sides.count` (and add
`sides.restBetween` between sides, if present) — it **MUST NOT** treat the primary
metric as already divided across sides.

`sides.restBetween` is semantically **distinct** from the `WorkUnit`'s own `rest`
field: `rest` is *inter-set* rest (after the whole atom, before the next
`WorkUnit`); `sides.restBetween` is the *mid-atom* transition between one side and
the next, within the same scored atom. The two **MAY** both be present on one
`WorkUnit` (e.g. a 5 s side-transition plus a 90 s rest before the next set).

Example — "Copenhagen plank: 20 s each side, 5 s transition, RPE 7 for the whole
thing":

```json
{
  "id": "wu-copenhagen-plank",
  "recordType": "WorkUnit",
  "subject": "subj-001",
  "exerciseRef": "plank.copenhagen",
  "scoring": "time",
  "performance": {
    "time": { "absolute": { "value": 20, "unit": "s" } },
    "sides": { "count": 2, "restBetween": { "absolute": { "value": 5, "unit": "s" } } },
    "effortLoad": [{ "kind": "internal", "method": "RPE", "value": 7 }]
  }
}
```

`sides` addresses only the case where one scored atom has internal per-side
structure; a producer who instead wants two **independently**-scored sides (each
with its own RPE/note) still uses the two-`WorkUnit` decomposition with
`facets.laterality` on each (§6.3) — the two mechanisms are complementary (§6.3).

#### 5.6 Planned vs Performed (the duality)

Planned and performed are **both first-class** (D3). A planned Session/Block/
WorkUnit carries `prescription`; a performed one carries `performance`; a record
**MAY** carry both (a logged set that also records what was prescribed). When they
are separate records, the performed record links to the planned one via the typed
`performedFrom` link in the envelope (§7); the link is **bidirectional** in intent
(a planned record can be resolved to its performances and vice versa). This is how
Programs (§5.2) connect to what actually happened.

#### 5.7 Rep

A **`Rep`** is optional per-repetition detail under a `WorkUnit`, carried in the
`WorkUnit.repDetail` array (one element per rep, in order). Each element:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `velocity` | optional | scalar or `Target` | Per-rep velocity (VBT), default unit `m/s` (§5.10). |
| `rangeOfMotion` | optional | scalar or `Target` | Per-rep ROM, default unit `deg` (§5.10). |
| `phasePattern` | optional | `phasePattern` | Per-rep phase timing (§5.15). |
| `outcome` | optional | `outcome` | Per-rep/per-attempt result (§5.18) — e.g. an arrow's score, a made/missed free throw, a per-attempt success (R19). |

Per-rep detail is an optional-tier elaboration; its absence never invalidates the
`WorkUnit`. (`repDetail` is the per-rep array; the rep *count* is the `reps` metric,
§5.5/§5.8.)

#### 5.8 Scoring model (summary)

Scoring lives at **two levels** (R1):

- **`WorkUnit.scoring`** — the single atom: `reps`, `time`, `distance`,
  `continuous` (e.g. a marathon), or `energy` (kcal).
- **`Block.scoring.scheme`** — over multiple exercises: `amrap`, `for_time`,
  `emom`, `tabata`, `rounds`.

#### 5.9 Controlled vocabularies (open vs closed)

The value objects in §5.10–§5.20 are referenced by the hierarchy levels above; the
tokens they carry are governed by one rule. Throughout Pillar B, every
token-typed field is one of two kinds, by the test *"could a vendor or a new
methodology need a value we didn't ship?"*:

- **Closed enum** — finite and structural; the full value set is listed inline and
  fixed by the spec version: `recordType`; `WorkUnit.scoring` kind
  (`reps｜time｜distance｜continuous｜energy`); `EffortLoad.kind`
  (`external｜internal`); `laterality`; `resistanceProfile`; `subjectType`;
  `Session.intent`; the `Target` variant key
  (`absolute｜range｜relativeToThreshold｜stopCondition`, §5.10); `outcome.kind`;
  `rxStatus` (`rx｜scaled`).
- **Open, registry-backed token** — has a demonstrated long tail; uses the §4.5/§6
  mechanism (recommended canonical token + namespaced fallback + **lossless opaque
  round-trip**): `disciplines`, `qualities`, `movementPattern`, `modality`, `EffortLoad.method`,
  `Intensity.dimension`, `Intensity.zone`, `modifier.type`, `Block.scoring.scheme`,
  `Block.grouping`, `Load.basis`, `Target.stopCondition.kind`,
  `Target.relativeToThreshold.of`, `ThresholdProfile.kind`, `Progression.rule`,
  `participants.role`, `StatusPeriod.type`, `phasePattern` phase `name`,
  `phasePattern` phase `qualifier`, `setRole`
  (canon `warmup｜working｜drop｜failure｜backoff`, with a tail — cluster/myo/primer roles).

Open tokens are what protect the "any surveyed niche is addable without a core
release" guarantee; unknown values **MUST** round-trip (§3.3, §8).

#### 5.10 Metric values & Target (R2, R9, R14)

A **metric value** **MAY** be either a **scalar** or a **`Target`** object. The
**exhaustive set of metric-value fields** (each scalar-or-`Target`) is: `reps`,
`time`, `distance`, `energy`, `rest` (§5.5), and per-rep `velocity` and
`rangeOfMotion` (§5.7). Two further slots are scalar-or-`Target` **inside their own
object**: `load.value` (§5.12) and `Intensity.value` (§5.13) — each wrapped/expanded
exactly like a metric value (including in normalization, §8.3). `EffortLoad.value`
(§5.13) is **not** a `Target`: it is a plain number, and a band is its sibling `range`
object — so an effort never has two encodings. No other field is scalar-or-`Target`.

`load` is the one structural exception to a metric being a `Target` *directly*: it
always uses the `Load` object (§5.12), whose `value` field is the scalar-or-`Target`
slot — so a relative load is `load.value = { "relativeToThreshold": … }` while
`load.basis`/`load.unit` stay attached (a `Target`-shaped `load` would otherwise drop
`basis`).

**JSON encoding (normative).** `Target` is a closed one-of encoded as a **single-key
object whose key names the variant** — this key is the discriminator (§5.9). There
is exactly **one** encoding; an implementer never guesses by shape:

| Variant | Encoding | Meaning |
|---|---|---|
| `absolute` | `{ "absolute": { "value": n, "unit"?: u } }` | A fixed value. |
| `range` | `{ "range": { "min": a, "max": b, "unit"?: u } }` | A min–max band (e.g. 8–12 reps). |
| `relativeToThreshold` | `{ "relativeToThreshold": { "percent": p, "of": t, "ref"?: r } }` **or** `{ "relativeToThreshold": { "min": a, "max": b, "of": t, "ref"?: r } }` | Relative to a `ThresholdProfile` entry (§5.11): `of` is an open threshold token (`1RM｜FTP｜maxHR｜pace｜…`). A **single** relative value uses `percent` (e.g. 80); a **relative band** (a training zone, e.g. 60–70% maxHR, sweet-spot 88–94% FTP) uses `min`/`max`. Exactly one of `percent` or (`min`+`max`) is present. |
| `stopCondition` | `{ "stopCondition": { "kind": k, "value"?: v } }` | Open-ended/autoregulated: `kind` open token (`to_failure｜to_rpe｜amrap｜work_up_to｜max｜to_breath｜…`); `value` parameterizes (e.g. `to_rpe` 8). |
| `ramp` | `{ "ramp": { "from": a, "to": b, "unit"?: u } }` **or** `{ "ramp": { "from": a, "to": b, "of": t, "ref"?: r } }` | A **directional** linear progression from `from` (the value at the start of the enclosing step) to `to` (the value at its end) — e.g. a warmup ramping 50→75 %FTP, or 150→200 W. Unlike `range`, order is significant and **MUST NOT** be normalized/sorted; `from` may be greater than `to` (a descending ramp, e.g. a cooldown). Exactly one of `unit` or (`of`, `ref`?) applies, mirroring the `absolute`/`relativeToThreshold` split. |

**Scalar shorthand.** A bare scalar `n` (number or fixed-point, §4.2) is shorthand
for `{ "absolute": { "value": n } }`, used when the unit is implied by the field or
registry, or carried by an enclosing `Load`. Normalization (§8.3) expands every
bare scalar to its `absolute` form before comparison. (Maps to a `oneof` in the
Protobuf alt binding; test vectors **MUST** cover both the scalar and the `Target`
form of a field.)

**`ramp` order is preserved.** `ramp` is the only `Target` variant where value order
carries meaning: normalization (§8.3) **MUST** preserve `from`/`to` exactly as
authored and **MUST NOT** apply any min/max canonicalization to it (contrast `range`,
whose `min`/`max` are unordered by definition).

A `Target` (and any other discriminated value object — `Load`, `outcome`, a
`phasePattern` phase) has **exactly one variant/discriminator key**; it **MAY**
additionally carry an `extension` key (§8.1), which is **ignored when determining the
variant**. The discriminator is "the single key that is not `extension`."

**Implied units of bare scalars.** When a metric is a bare scalar, its unit is the
field's normative default below (or, for `reps`, dimensionless). To use any other
unit, encode the explicit `absolute` `Target` with a `unit`.

| Field | Default unit |
|---|---|
| `reps` | count (dimensionless) |
| `time`, `rest` | `s` (seconds) |
| `distance` | `m` (metres) |
| `energy` | `kcal` |
| `velocity` | `m/s` |
| `rangeOfMotion` | `deg` |

(`load` carries its unit on the enclosing `Load.unit`, §5.12, so a bare `load.value`
scalar is never unit-ambiguous.)

**Threshold resolution.** When `relativeToThreshold.ref` is **present**, it is the
`id` of a `ThresholdProfile` record (§5.11), and the entry within it is matched by
`kind` (= `of`) and scope (`for`). When `ref` is **omitted**, the target resolves
against the **most recent** entry — across the subject's `ThresholdProfile`
records — whose `kind` (= `of`) and scope (`for`) match, ordered by `asOf` (latest
wins). If none matches, the target is **unresolved** and consumers **MUST** preserve
it as-is rather than guessing. The scope (`for`) used for matching is taken from the
**enclosing `Exercise`'s movement identity** (the lift/movement the threshold pertains
to, e.g. a per-lift 1RM); when that scope cannot be determined, matching falls back to
`of` alone, and if still ambiguous the target is left unresolved.

#### 5.11 ThresholdProfile (R12, R16)

A **`ThresholdProfile`** is a subject-level record (`recordType: ThresholdProfile`)
of reference capacities that `relativeToThreshold` targets resolve against. It holds
one field, **`entries`** (required, `array<ThresholdProfileEntry>`); each entry
carries freshness and provenance:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `kind` | required | token | Open token from the **same threshold vocabulary as `Target.relativeToThreshold.of`** (§5.10), so the two match by equality: `1RM｜FTP｜maxHR｜pace｜anthropometric｜…`. |
| `value` | required | number | The capacity value. |
| `unit` | required | string (UCUM) | Unit for `value`. |
| `for` | optional | string | Scope: e.g. the lift + equipment a 1RM applies to (R11); the anthropometric measured — limb length, height, wingspan (R16). |
| `asOf` | recommended | timestamp | When it was established (freshness — a 1RM goes stale after a layoff). |
| `source` | recommended | enum | `tested｜estimated`. |
| `confidence` | optional | number | Confidence in the value. |

#### 5.12 Load (R11)

A **`Load`** describes external resistance:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `value` | required | scalar or `Target` | Magnitude — a scalar (number; MAY be fixed-point, §4.2) **or** a `Target` (§5.10), so loads can be absolute, range, or relative-to-threshold (%1RM) while `basis`/`unit` stay attached. |
| `unit` | conditional | string | UCUM unit, **or** a machine-specific scale token when `basis` is non-physical. **Required** when `value` is a scalar or an `absolute`/`range` `Target`; **omitted** when `value` is `relativeToThreshold` (the unit derives from the resolved threshold) or `stopCondition`. |
| `basis` | recommended | token | Open token for how the value is interpreted: `marked_weight｜stack｜machine_level｜band｜spring｜incline｜assist｜bodyweight_relative｜effective_force｜animal_traction｜rotational｜fluid_flow｜…`. |

`basis` lets a machine "level 7" or a band color round-trip without pretending to
be kilograms; `bodyweight_relative` carries loads as a multiple of bodyweight.
(Isokinetic resistance is not a `basis`; it is a `resistanceProfile: accommodating`
with a velocity target — §5.16.)

#### 5.13 Effort & Intensity (F7, R18)

The "how hard" axis has **three distinct homes**, each with a crisp role so a value never
has two encodings (R18):

| Concept | Home | What it carries | Examples |
|---|---|---|---|
| **Resistance** | `load` (§5.12) | external resistance being moved | 100 kg, 80 %1RM, a band, machine level 7 |
| **Intensity** | `intensity` (below) | a prescribed/achieved target on a non-resistance dimension | 250 W, 4:00/km, HR Zone 2, 88–94 %FTP |
| **Perceived/derived effort** | `effortLoad` (below) | how hard it *felt* or a derived load index | RPE 8, RIR 2, sRPE, TRIMP, TSS |

A relative *resistance* (%1RM) is a `load`; a relative *intensity* (%FTP, %maxHR, a zone)
is an `intensity`; a *perception* (RPE/RIR) or *derived load* (TRIMP/TSS) is an
`effortLoad`. (Velocity-based training is a velocity target → an `intensity` of dimension
`speed`, or per-rep `velocity` §5.7.)

**`EffortLoad`** — perceived/derived effort is **plural**: a `WorkUnit` (or Block/Session)
**MAY** carry an array of `EffortLoad` entries:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `kind` | required | enum | Closed: `external｜internal`. |
| `method` | required | token | Open token: `RPE｜RIR｜sRPE｜TRIMP｜TSS｜…` (perceived/derived effort only). |
| `value` | required¹ | number | The measure (e.g. RPE 8). A plain number — **not** a `Target` — so an effort has exactly one encoding. Exactly one of `value` or `range`. |
| `range` | required¹ | `{ min, max }` | A band (e.g. RPE 7–8); `min`/`max` are numbers. |
| `unit` | optional | string | Unit for `value`/`range` where applicable (the band's unit lives here, not inside `range`). |
| `source` | recommended | enum | `manual｜estimated`. |

¹ Exactly one of `value` or `range` is present.

**`Intensity`** — non-resistance intensity targets are **plural** (a session may target
power *and* a HR cap): a `WorkUnit` (or Block/Session) **MAY** carry an array of `Intensity`
entries:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `dimension` | required | token | Open token for the intensity dimension: `power｜pace｜hr｜speed｜grade｜…`. |
| `value` | required² | scalar or `Target` | The target on that dimension — `absolute` (e.g. 250, `unit: W`), `range` (an absolute band), `relativeToThreshold` (a single % or a relative **band**, e.g. 88–94 %FTP; §5.10/§5.11), or `ramp` (a directional progression, e.g. a warmup/cooldown; §5.10). |
| `zone` | required² | token | Shorthand: a **named zone** (e.g. `z2｜tempo｜sweet_spot`) resolved by the zone registry to a band on `dimension`. |
| `unit` | conditional | string | UCUM unit when `value` is a scalar or `absolute`/`range` `Target`; omitted for `relativeToThreshold`/`stopCondition` (derived from the threshold) and for `zone`. |

² Exactly one of `value` or `zone` is present.

#### 5.14 Progression (R3)

A **`Progression`** describes how a prescription advances across iterations. The
core is a declarative rule; an opaque script is an optional non-normative escape
hatch:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `rule` | required (core) | token | Open token naming the progression: `linear｜double｜percent｜custom｜…`. |
| `params` | optional | object | Parameters for `rule` (e.g. `{ "stepKg": 2.5, "per": "session" }`; a double-progression rep window). |
| `script` | optional (ext) | object | A **namespaced, non-normative** opaque program (§8). Consumers that don't understand it **MUST** preserve it and **MAY** ignore it; a declarative `rule` SHOULD accompany it where possible. |

A scripting *language* is deliberately not standardized (security + interop).

#### 5.15 phasePattern (R14)

A **`phasePattern`** is an ordered list of named phases with durations or ratios,
generalizing lifting tempo and breath work. Each phase is
`{ name, durationSec?, ratio?, qualifier? }`:

- A phase with no fixed duration (e.g. tempo "X" = explosive) omits `durationSec`
  and carries an open `qualifier` token (`explosive｜max｜controlled｜…`). Lifting
  tempo "30X1" → `eccentric:3s, pause:0s, concentric:{qualifier:explosive},
  pause:1s`.
- Breath work → phases `inhale:4, hold:4, exhale:4, hold:4` (ratios), pairing with
  the `to_breath` stop-condition (§5.10).

#### 5.16 Descriptors (R11, F10)

**`Descriptors`** carry the **occurrence's concrete physical realization** — what a
registry id cannot know. Movement *classification* and *variation* are part of
identity and live on the `ExerciseRef` (§6.3); Descriptors **MUST NOT** duplicate
them. Each such field has exactly one home (§6.3).

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `equipment` | optional | object | The concrete unit used: `{ manufacturer, model, settings{} }` (R11). The equipment *class* (barbell vs dumbbell) is an `ExerciseRef` variation facet (§6.3); this is the specific machine and its settings. |
| `resistanceProfile` | optional | enum | Closed: `constant｜variable｜accommodating` (isokinetic = `accommodating` + a velocity target). |

#### 5.17 modifiers (R5)

An **open, typed list** of conditions altering a WorkUnit/Block:
`modifiers: [ { type, value?, unit? }, … ]` (`value` is a number or string; `unit` a
string). `type` is an open registry-backed
token — e.g. `bfr` (cuff pressure), `ems`, `altitude`, `heat`, `terrain`,
`incline`, `accommodating_band`. Unknown types **MUST** round-trip (§3.3, §8). This
open list absorbs much of the long tail without model changes.

#### 5.18 outcome (R6)

An optional **`outcome`** on a WorkUnit/Block/Session result captures
skill/sport/game results:

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `kind` | required | enum | Closed: `score｜points｜placement｜success｜grade`. |
| `value` | required | number \| bool \| string | The result, typed by `kind`: **number** for `score`/`points`/`placement`; **bool** for `success`; **string** (grade token) for `grade`. |
| `unit` | optional | string | e.g. `rounds`, points unit. |
| `attempts` | optional | `{ made, attempted }` | For send/attempt/flash (climbing): integers made and attempted. |
| `components` | optional | array&lt;`{ name, value, weight? }`&gt; | Judged/composite scoring parts (e.g. difficulty × execution − deductions); each `{ name: string, value: number, weight?: number }`. |

#### 5.19 participants (R7, R15)

A `Session` **MAY** carry **`participants[]`**; absent it, the single envelope
`subject` is the participant.

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `ref` | required | ref | The subject reference. |
| `subjectType` | recommended | enum | Closed: `human｜animal｜team`. |
| `species` / `breed` | optional | string | For animal subjects. |
| `role` | optional | token | Open token: `athlete｜partner｜pacer｜spotter｜guide｜…`. |

Per-`Block`/`WorkUnit` attribution uses `by` (§5.5). A contribution or modifier
**MAY** be `by` *another* participant (collaborative: sweep, spot, pace, guide). A
Block/WorkUnit **MAY** carry a `synchronized` constraint (reps count only if a
coordination condition is met). Cross-record grouping is expressed solely by the
`groupActivity` typed link in the envelope (§7.2) — there is no separate
`groupActivityId` scalar field.

#### 5.20 StatusPeriod (R13)

An optional subject-timeline context record (`recordType: StatusPeriod`) that
explains gaps and modifies interpretation: `{ type, from, to?, note? }` where
`type` is an open token (`injury｜illness｜layoff｜pregnancy｜taper｜
return_to_play｜…`). It is context, not a training event; consumers SHOULD use it
to interpret threshold staleness (§5.11) and load changes but **MUST NOT** treat it
as a Session.

#### 5.21 Worked examples

A minimal strength set (collapsed — Session → WorkUnit, planned + performed
together):

```json
{
  "id": "wu-squat-1",
  "recordType": "WorkUnit",
  "subject": "subj-001",
  "exerciseRef": "squat.barbell.high-bar",
  "scoring": "reps",
  "setRole": "working",
  "prescription": { "reps": 5, "load": { "value": 100, "unit": "kg", "basis": "marked_weight" } },
  "performance": { "reps": 5, "load": { "value": 100, "unit": "kg", "basis": "marked_weight" },
                   "effortLoad": [{ "kind": "internal", "method": "RPE", "value": 8 }] }
}
```

An `amrap` block (block-level scoring over two exercises):

```json
{
  "id": "blk-amrap-12",
  "recordType": "Block",
  "subject": "subj-001",
  "scoring": { "scheme": "amrap", "timeCapSec": 1200 },
  "children": [
    { "recordType": "Exercise", "exerciseRef": "pull-up",
      "workUnits": [{ "recordType": "WorkUnit", "scoring": "reps", "prescription": { "reps": 5 } }] },
    { "recordType": "Exercise", "exerciseRef": "push-up",
      "workUnits": [{ "recordType": "WorkUnit", "scoring": "reps", "prescription": { "reps": 10 } }] }
  ],
  "performance": { "outcome": { "kind": "score", "value": 14, "unit": "rounds" } }
}
```

(More end-to-end examples — endurance, planned-vs-performed — are in Appendix A.)

---

### 6. Exercise Identity

Exercise identity is the **unsolved interop problem** (§2.3 #6): every platform
names movements differently, variations explode combinatorially, and novel
exercises appear constantly. OpenBody resolves this with a **hybrid** model (D6): a
stable base-movement **registry**, structured **facets** for variations, a **coded
crosswalk** to incumbents, a **namespaced extension** for novel movements, and a
**lossless opaque fallback** that always round-trips.

#### 6.1 `ExerciseRef`

An `Exercise` (§5.5) references a movement via an **`ExerciseRef`**. The shorthand
form is a bare string — a canonical registry id (e.g. `"squat.barbell.high-bar"`);
the full form is an object:

| Field | Tier | Semantics |
|---|---|---|
| `id` | recommended | Canonical base-movement id from a registry (§6.2), stable and namespaced. A bare-string `ExerciseRef` is shorthand for `{ id }` against the canonical registry. |
| `registry` | optional | The registry + version the `id` is drawn from: `{ name, version }`. Default = the canonical OpenBody registry. |
| `facets` | optional | Structured classification + variation (§6.3). |
| `coded` | optional | Crosswalk to incumbent codings (§6.4). |
| `opaque` | optional | The original source string when no `id` resolves; **MUST** be preserved and round-trip losslessly. |
| `extension` | optional | Namespaced fields for genuinely novel movements (§8). |

An `ExerciseRef` **MUST** carry at least one of `id` or `opaque` — a movement with
no identity at all is invalid, and `opaque` is the floor that guarantees nothing is
lost. A producer **SHOULD** resolve to a canonical `id` where one exists; if it
cannot, it **MUST** carry `opaque`.

#### 6.2 The registry (separate, fetchable, versioned)

The exercise registry is a **separate, independently-versioned, fetchable
artifact** (package-like), **decoupled from this specification**. The spec defines
the *mechanism* — id format, facet model, matching ladder, and how an `ExerciseRef`
names a registry+version; the registry ships *content* on its own semver cadence
(§9).

- There is **one canonical registry** (the interop anchor). Additional
  **namespaced registries** (private, regional, vendor) **MAY** augment it but
  **MUST NOT** replace or redefine canonical ids — they only add.
- **Canonical ids are unprefixed.** `openbody:` is at most an explicit-namespace
  synonym and **MUST** be normalized to the unprefixed form, so there is exactly
  one string per canonical id. Augmenting registries use their own namespace
  (`acme:…`).
- **Id format.** A canonical id is one or more lowercase dot-separated segments,
  each matching `[a-z0-9]+(?:-[a-z0-9]+)*` — i.e. `base[.variation…]`
  (`squat`, `squat.barbell`, `squat.barbell.high-bar`). The regex is
  `^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$`. A namespaced id from
  an augmenting registry is `prefix:id` (`acme:squat.kettlebell`). Producers minting
  ids beyond the canonical registry **SHOULD** follow this shape; consumers **MUST
  NOT** assume semantics from segment structure (the registry, not the string, is
  authoritative — segments are a readability convention, not a parse target).
- An id that resolves in no known registry is treated as opaque (§6.5).
- Movement **attributes** that are not identity — e.g. a movement's MET intensity —
  are **registry-provided attributes of the base movement**, not identity codes;
  they are not part of `ExerciseRef` (see §6.4).
- Registry **data is licensed CC0** (§9); the v1 seed is `free-exercise-db`
  (public domain), supplemented for non-strength gaps (Compendium of Physical
  Activities MET values for cardio/endurance; curated functional and
  mobility/flexibility sets), normalized to base movement + facets.

#### 6.3 Facet model

Facets decompose a movement into a stable base plus structured variation, avoiding
a combinatorial registry. Every facet has **exactly one home** — facets are on the
`ExerciseRef`; the occurrence's concrete realization is in `Descriptors` (§5.16).
Two groups:

- **Classification** (what kind of movement — *intrinsic to the movement*):
  `modality`, `movementPattern`, `anatomy` (primary/secondary muscles), `mechanic`
  (compound/isolation). These are **registry-derived from the `id`** and are
  carried explicitly **only when there is no `id`** (to enable facet-matching). A
  bare `id` already implies them, so they are rarely set by hand.
- **Variation** (which movement this is — *distinguishes one movement from a
  sibling*): `equipment` class (barbell vs dumbbell vs machine), `grip`,
  `laterality` (`bilateral｜unilateral_left｜unilateral_right｜alternating`),
  `stance`/`barPosition`, `rangeOfMotion`.

The `facets` object (all fields optional):

| Field | Group | Type | Semantics |
|---|---|---|---|
| `modality` | classification | token | Open (§5.9). |
| `movementPattern` | classification | token | Open (§5.9). |
| `anatomy` | classification | `{ primary: array<token>, secondary?: array<token> }` | Targeted muscles. |
| `mechanic` | classification | enum | `compound｜isolation`. |
| `equipment` | variation | token | Equipment *class* (barbell/dumbbell/machine/…). |
| `grip` | variation | token | Open grip token. |
| `laterality` | variation | enum | Closed: `bilateral｜unilateral_left｜unilateral_right｜alternating`. |
| `stance` / `barPosition` | variation | token | Open positional tokens. |
| `rangeOfMotion` | variation | token | Open ROM token (e.g. `full｜partial｜deficit`). |

Classification and variation tokens reuse the controlled vocabularies of §5.9
(`modality`, `movementPattern` open; `laterality` closed) — one vocabulary, not a
parallel set. `Descriptors` (§5.16) hold only the concrete equipment unit
(`{manufacturer, model, settings}`) and `resistanceProfile`; they do **not** repeat
any classification or variation facet.

**`laterality` vs. `WorkUnit.sides` (§5.5).** These are complementary, not
competing. `WorkUnit.sides` is the *within-one-set* mechanism: it lets a single
scored atom (one `effortLoad`, one `notes`) carry internal per-side structure —
e.g. a per-side plank hold. `laterality` remains the way to describe *which
movement variant* an `ExerciseRef` denotes (`unilateral_left`/`unilateral_right`/
`alternating`/`bilateral`) when a producer instead chooses the two-`WorkUnit`
decomposition — still valid, and still the right choice whenever two
independently-scored sides (each with its own RPE/note) make more sense than one
atom.

#### 6.4 Coded crosswalk

`coded` carries **identity-equivalence** codes in incumbent systems, enabling
lossless mapping (§10): keys are source systems, values their codes — e.g.
`{ "wger": 615, "healthkit": "functionalStrengthTraining", "healthconnect": "...", "snomed": "..." }`.
Codes are advisory crosswalk hints, not the identity; the canonical `id` (or
`opaque`) remains the identity. A movement's MET/intensity is **not** a `coded`
entry — it is a registry attribute of the movement (§6.2), because it is an
attribute, not an equivalence code.

#### 6.5 Matching ladder

To resolve an incoming `ExerciseRef`, a consumer applies, in order:

1. **Exact id** — match the canonical (or known-namespaced) `id`.
2. **Facet match** — if no id, match/group by `facets`.
3. **Coded crosswalk** — if no facets, resolve via a `coded` entry.
4. **Opaque** — otherwise treat as an opaque movement.

A producer **SHOULD** climb as high as it can (prefer `id`); a consumer **MUST**
preserve whatever it receives. Because every ref carries an `id` or `opaque` floor
(§6.1), even a ref resolvable only via `coded` still round-trips when a consumer
does not know that crosswalk. An unresolved `ExerciseRef` **MUST** round-trip
losslessly — "couldn't resolve" never means "drop."

#### 6.6 Governance

The registry is versioned and **community-extensible** (contributions by PR);
vendors and regions extend through their own namespaces rather than forking the
canon. Registry versioning, the augmentation rules, and the CC0 license are part of
§9 governance.

---

### 7. The Record Envelope

Every OpenBody record — in either pillar — shares a common **envelope**: identity,
typed links, provenance, and lifecycle. This is what lets records from different
sources reference, deduplicate, correct, and relate to one another (D9/D10). The
addressable record kinds are `Measurement`, `Program`, `Session`, `Block`,
`Exercise`, `WorkUnit`, `ThresholdProfile`, and `StatusPeriod`; nested elements
(`Rep`, and value objects like `Target`/`Load`) are sub-objects, not standalone
records.

#### 7.1 Identity

| Field | Tier | Semantics |
|---|---|---|
| `id` | required | Globally-unique, **producer-assigned**, stable identifier for the record. **MUST NOT** contain `#` (reserved for normalization-assigned ids, §8.3). |
| `recordType` | required | Closed discriminator: the record kind (list above). |
| `subject` | required | Reference to the subject the record is about. |
| `clientRecordId` | optional | The source app's own key for this record, preserved for round-trip and within-source dedup. |

**Required fields when inlined.** On a **top-level (standalone)** record, `id`,
`recordType`, and `subject` are all required. On an **inlined** child (§7.2):
`recordType` is required; `subject` is **inherited** from the nearest enclosing
record and **MAY** be omitted; `id` **MAY** be omitted, in which case normalization
assigns a deterministic id (§8.3). A **tombstone** (a record with `status: deleted`,
§7.5) is exempt from **all** otherwise-required payload and envelope fields **except**
`id`, `recordType`, and `status`: a validator **MUST NOT** reject a `status: deleted`
record for missing `subject`, `type`, `scoring`, `value`, `unit`, `startTime`,
`endTime`, or any other otherwise-required field.

#### 7.2 Typed links

Records relate through a `links` array; each link is `{ type, ref }` where `ref` is
a target record `id` and `type` is a **closed** core relation:

| `type` | Meaning |
|---|---|
| `partOf` | This record is contained by another (e.g. a WorkUnit `partOf` a Session). |
| `sameActivityAs` | This record and the target are two sources' versions of the **same whole activity** (Apple's run + Strava's run) — the dedup relation (§7.3). |
| `derivedFrom` | This record was computed from the target (e.g. an aggregate from a series; §4.3). When present, `provenance.algorithm` is **recommended** (§7.4). |
| `peerSensor` | A **parallel sensor stream** of one event (two HR straps on one run) — distinct from `sameActivityAs`, which relates whole-activity records, not raw co-streams. |
| `measuredBy` | A Pillar B record's associated **Pillar A telemetry** — a `WorkUnit`/`Session` → the HR trace, power, velocity, or GPS-route `Measurement`s recorded during it. This is the cross-pillar reference of §1.3 (Pillar B references Pillar A, never duplicates it). |
| `performedFrom` | A performed record realizes a planned one (the planned↔performed link, §5.6). |
| `groupActivity` | This record is part of a multi-participant group activity (§5.19). |

Novel relations are expressed as **namespaced extension links** (§8), never by
overloading a core type.

**Containment: nesting ≡ `partOf`.** The §5 hierarchy may be encoded two
semantically-equivalent ways, and they MUST be treated as equivalent:

- **Nested document** — a child inlined in its parent (`Session.blocks[]` →
  `children[]` → `workUnits[]`). This is the **recommended, primary transmission
  form** (per the document-first-JSON principle, §0).
- **Flat + `partOf`** — a child as a standalone record linking to its container by
  `partOf`. Use this for independently-synced or cross-source records (a lone
  "grease the groove" WorkUnit; a performed Session referencing a planned one).

An inlined child is **implicitly `partOf`** its container; it carries its own
`recordType`, **MAY** carry its own `id` (so it stays addressable and linkable; when
omitted, normalization assigns a deterministic one, §8.3), and **inherits** `subject`
from its container (§7.1) — nesting merely makes the `partOf` link implicit. A
consumer **MUST NOT** treat the nested and flat encodings of the same structure as
different activities.

#### 7.3 Deduplication — preserve-all-and-link

OpenBody is **lossless** about duplicates: when multiple sources report the same
activity, an implementation **MUST NOT** silently discard or overwrite any record.
The canonical resolution is **preserve-all-and-link**: keep every record and
relate the duplicates with `sameActivityAs`.

- A recommended detection heuristic is *same `subject` + compatible `recordType`
  (and `discipline`/measurement `type`) + overlapping time + distinct source*; this
  is advisory, not normative.
- Whether to present a single merged view is the **application's** choice and a
  read-time concern; the standard neither performs nor mandates destructive merge.
- `clientRecordId` supports within-source dedup (the same app re-sending a record).

#### 7.4 Provenance

Provenance is carried in a single envelope field **`provenance`** (optional object);
the fields below are its members (the JSON examples in §4.6/§7.7 show this nesting):

| Field | Tier | Type | Semantics |
|---|---|---|---|
| `method` | recommended | enum | Closed: `manual｜sensor｜estimated｜algorithm`. |
| `device` | optional | `{ manufacturer, model }` | `manufacturer` is an **open registry-backed token** (recommended canon `apple｜garmin｜…` + namespaced fallback). |
| `sourceApp` | recommended | token | The producing app/platform, an **open registry-backed token** (recommended canon `google_health_connect｜strava｜…` + namespaced fallback). |
| `algorithm` | conditional | `{ name, version }` | **Required** when `method` is `algorithm`; **recommended** when the record carries a `derivedFrom` link (§7.2) — derived values are more reproducible/traceable with it, but producers that compute from third-party/firmware logic often cannot name the algorithm, and forcing it would push mappers to drop the lineage link or fabricate a value. |
| `confidence` | optional | number | Producer confidence in the value. |

Defining `device.manufacturer`/`sourceApp` as registry-backed tokens (rather than a
hardcoded platform enum) keeps platform identifiers consistent and comparable
without forcing a core release per new vendor — the same mechanism as §4.5/§6, and
the resolution of the dropped v0.1 `Platform` enum (the hardcoded-enum rejection,
§4.4).

#### 7.5 Lifecycle — immutable + supersession

Records are **immutable**. A record is never edited in place; instead:

| Field | Tier | Semantics |
|---|---|---|
| `status` | optional | Closed: `active｜superseded｜deleted`. **Absent ⇒ `active`.** |
| `supersedes` | conditional | The `id` of the record this one replaces (present on a correction). |
| `revision` | recommended | Monotonic revision number within a supersession lineage. |

`status` defaults to `active`, so the overwhelming majority of records — plain,
never-superseded ones — carry no lifecycle machinery at all (§3.1, "simple stays
simple"); the lifecycle fields surface only when they are doing work.

- **Correction:** emit a **new** record with a new `id`, `supersedes` pointing at
  the prior record, and an incremented `revision`. The prior record's `status`
  becomes `superseded`. The lineage is preserved.
- **Deletion / redaction:** represented by a **tombstone** — a record with
  `status: deleted` — not a physical removal, so that references and sync lineage
  remain intact. To comply with GDPR Article 17 (Right to Erasure) without breaking
  sync loops, a tombstone record **MUST** strip the `subject` field and all payload
  metric and link fields upon serialization (§7.1 exempts a tombstone from **all**
otherwise-required fields except `id`/`recordType`/`status`). An on-the-wire tombstone contains
  strictly the `id`, `recordType`, and `status: deleted` fields, containing zero PII
  and making it fully anonymous. The association to the user is maintained internally
  within the database session index, not exposed on the wire.

This gives deterministic, auditable history without mutable state, and lets sync
between systems converge on the latest `active` revision of each lineage.

#### 7.6 Media attachments

`media` is a shared **envelope** field (§7): because it lives on the envelope
rather than on any one record type, it is available to **every** addressable
record kind — `Measurement`, `Program`, `Session`, `Block`, `Exercise`,
`WorkUnit`, `ThresholdProfile`, and `StatusPeriod` — with no per-record-type
extension needed. This closes the gap where a producer has a photo or video to
attach to a record (a coaching app's form-check video for a specific logged
`WorkUnit`; a photo of a scale reading on a `Measurement`) but no core field to
carry the reference.

| Field | Tier | Semantics |
|---|---|---|
| `media` | optional | array of `{ url, type, label }` — URL-referenced attachments (below). |

Each element of `media`:

| Field | Tier | Semantics |
|---|---|---|
| `url` | required | The location of the attachment. |
| `type` | recommended | **Closed**: `photo｜video｜audio｜document`. Unlike `sourceApp`/`device.manufacturer`/`disciplines` (§4.5/§5.9/§6/§7.4), which need an **open**, registry-backed vocabulary because their long tail is unbounded and grows continuously as new vendors and activities appear, the *kinds of thing a producer attaches* are few and do not accrue new categories over time — a closed enum is simpler and avoids registry machinery (namespace allocation, growth process, §6.2) for what is fundamentally a small, stable set. |
| `label` | optional | Free-text description (e.g. `"Set 3 form check"`). |

**Reference by URL only.** A `media` entry **MUST** reference its content by
`url`; embedding binary (e.g. base64-encoded image or video data) directly in the
JSON document is disallowed. OpenBody documents are human-readable and
lightweight by design (§0/§3.1); embedding binary defeats that goal and would
bloat every record carrying an attachment.

**Not inherited.** Unlike `subject`, which an inlined child inherits from its
nearest enclosing record when absent (§7.1), or `startTime`/`endTime`, which
propagate the same way during flattening (§8.3 step 7), `media` is **never**
inherited. A `media` array on a `Session` describes that `Session` record alone
— it does **not** implicitly apply to the `Block`s, `Exercise`s, or `WorkUnit`s
nested inside it. A producer that wants a video attached to one specific
`WorkUnit` puts `media` directly on that `WorkUnit`; a `Session`-level `media`
array is for material about the session as a whole (e.g. a post-workout photo).
This is deliberate per-node semantics, not an oversight, and is called out here
because it is the one place a future implementer could plausibly — and
wrongly — assume envelope-style inheritance.

#### 7.7 Worked example (correction lineage)

```json
{
  "id": "obs-hr-002",
  "recordType": "Measurement",
  "subject": "subj-001",
  "type": "heart_rate",
  "quantity": 71,
  "unit": "/min",
  "startTime": "2026-06-23T14:02:00Z",
  "endTime": "2026-06-23T14:02:00Z",
  "status": "active",
  "supersedes": "obs-hr-001",
  "revision": 2,
  "provenance": { "method": "manual", "sourceApp": "acme:myfitapp" }
}
```

---

### 8. Extensibility, Conformance & Test Vectors

#### 8.1 Namespaced extensions

OpenBody is extended by **adding under a namespace, never by modifying the core**
(the "extend, don't modify" tenet). Every extension point uses the same rules:

- **Namespaces** are reverse-DNS (`com.acme.metric`) or a short registry-allocated
  prefix (`acme:`) — the same namespacing used by augmenting registries (§6.2) and
  source-token fallbacks (§4.5).
- The extension surfaces already defined are: extension **fields** (`extension` on
  `Measurement` §4.1, on `ExerciseRef` §6.1, and permitted on any record/value
  object), extension **vocabulary tokens** (the open registry-backed fields,
  §4.5/§5.9/§6), extension **links** (§7.2), and the opaque **`script`** progression
  (§5.14).
- **`extension` field shape.** An `extension` value is an object **keyed by
  namespace**, each value an arbitrary object of that namespace's fields:
  `"extension": { "com.acme.metric": { … }, "acme": { … } }`. Each key is a
  namespace (reverse-DNS or a registry-allocated prefix); a consumer that does not
  recognize a key preserves the whole entry verbatim. This per-namespace nesting
  prevents key collisions between independent extenders.
- **Invariants.** An extension **MUST NOT** change the meaning of any core field. A
  consumer that does not understand an extension **MUST** preserve it losslessly
  (round-trip) and **MAY** ignore it (§3.3). Extensions therefore never break
  validation of the core and never cause data loss.

This is the mechanism that discharges the "any surveyed niche is addable without a
core release / no structural dead-ends" guarantee.

#### 8.2 Conformance profiles

A **profile** is a named set of record kinds and required elements an
implementation can claim (§3.3). v1 defines two **core profiles**, one per pillar,
so a single-pillar implementation can be fully conformant.

**Profile: Observation core.**
- *Required:* `Measurement` with `type`, a `value` (one of
  `quantity｜category｜sampleArray`), conditional `unit`, `startTime`, `endTime`;
  envelope `id` + `recordType` + `subject`.
- *Recommended:* `provenance`; `sampleArray` multi-channel + `offsets`;
  `derivedFrom`.

**Profile: Training core.**
- *Required:* `WorkUnit` with `scoring`; envelope `id` + `recordType` + `subject`.
  All five `WorkUnit.scoring` kinds (`reps｜time｜distance｜continuous｜energy`)
  MUST be readable.
- *Recommended:* containment (`Session`/`Block`/`Exercise`, nested and
  flat+`partOf`); `Block.scoring` schemes; the `prescription`/`performance` duality
  + `performedFrom`; the `ExerciseRef` resolution ladder; `EffortLoad`, `Load`,
  `Target`.

Beyond a profile's required tier: recommended elements **SHOULD** be supported and
**MUST** be preserved if not (§3.3); optional elements **MAY** be supported and
**MUST** be preserved if not. Implementations **MAY** claim both profiles and **MAY**
declare support for recommended/optional supersets. Producer and consumer
conformance may be asymmetric (§3.3).

#### 8.3 Test vectors

Each profile ships a **published test-vector suite**; an implementation
demonstrates conformance by **round-tripping** the vectors for the profile and tier
it claims. The suite is normative for conformance; the per-element tier assignments
in §§4–7 are normative for *what* is tested.

**What "lossless round-trip" means.** Round-trip is parse → canonical → serialize.
Equivalence is decided by reducing each record to a **canonical byte string** via the
ordered algorithm below and comparing those strings: two records are equivalent
**iff** their canonical byte strings are identical. The algorithm is deterministic —
two conformant implementations **MUST** produce the same bytes for semantically-equal
input, regardless of JSON key order, whitespace, number spelling, or the permitted
shorthands.

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
rule: §8.1 guarantees unknown content is never *dropped*; §8.3 defines how it is
*compared*. The two are consistent — canonicalization reorders and re-spells, never
discards.

**Minimum core vectors** (required for a conformance claim) **MUST** cover:

- Each of the five `WorkUnit.scoring` kinds, plus a resistance set, an
  interval/round scheme (AMRAP/EMOM/for-time), and a continuous-endurance record
  (the §3.1 core structures).
- Both the **scalar and `Target`** forms of a metric value (§5.10).
- Both the **nested and flat+`partOf`** encodings of one containment structure,
  asserted equivalent (§7.2).
- A **normalization-determinism** vector: a multi-`WorkUnit` `Exercise` with a
  `sets: N` shorthand **and** an id-less inlined child, with its exact post-`§8.3`
  ids and `partOf` links asserted — so two implementers' normalized output must
  match byte-for-byte. Plus a number-canonicalization case (`72`, `72.0`, and the
  fixed-point encoding asserted equal).
- An unresolved `ExerciseRef` (`opaque` only), an unknown extension, and an unknown
  open-vocabulary token — each asserted to **round-trip losslessly**.
- A supersession lineage (correction) and a tombstone (§7.5).
- A `sampleArray` in both regular (`frequencyHz`) and irregular (`offsets`),
  scalar and multi-channel, including a `null` dropped sample (§4.3).

**Extended activity-coverage corpus** (`conformance/CORPUS.md`) — a broad library
seeded from the project's activity-coverage corpus (Highland games,
kabaddi, BFR, freediving, isokinetic, AMRAP, …), each asserted to round-trip
losslessly. This is the **executable form of the "never inferior to prior art"
gate** (§3.1) — coverage validation, **not** a conformance bar — filled out once a
reference implementation exists.

#### 8.4 Versioned artifacts

Conformance is stated against a spec version **and** the registry versions in use
(the measurement-type registry §4.5 and exercise registry §6 are independently
versioned, §9). An `ExerciseRef` names its `registry`+`version` (§6.1); a
conformance claim names the spec semver and the registry versions it was validated
against.

---

### 9. Governance & Versioning

#### 9.1 Specification versioning

The specification follows **semantic versioning**:

- **Major** (breaking): removing or renaming a core element, tightening a
  constraint, or changing a field's meaning. Permitted only at a major bump.
- **Minor** (additive, backward-compatible): adding optional elements, new
  recommended/optional fields, or new conformance profiles.
- **Patch:** clarifications and editorial fixes with no schema effect.

**Vocabulary growth is usually not a spec change.** Open registry-backed
vocabularies (§5.9) grow via *registry* versioning (§9.2), not spec versions — a new
`modality`, `Block.scoring.scheme`, or `Load.basis` token is a registry minor, not
a spec release. New values of a genuinely *closed* enum are rare and **not**
uniformly safe: a new `WorkUnit.scoring` kind (an unknowing consumer cannot process
that `WorkUnit` at all) is far more impactful than, say, a new `provenance.method`
value (an unknowing consumer can still read the record). Each closed-enum addition
is therefore assessed case-by-case for whether unknowing consumers **degrade
gracefully**, with lossless passthrough (§3.3) as the backstop. This is the §5.9
closed-vs-open distinction governing change management.

**Deprecation policy:** an element is **deprecated, not removed**, within a major
line; deprecated elements **MUST** still validate and round-trip. Removal happens
only at the next major version, with the deprecation documented at least one minor
in advance. A conformance claim names the spec version it targets (§8.4).

#### 9.2 Independently-versioned registries

The registries are **decoupled from the spec** and versioned on their own semver
cadence: the **exercise registry** (§6) and the **measurement-type registry**
(§4.5). The spec defines the *mechanism* (id format, facets, matching ladder, how
an `ExerciseRef` names a `registry`+`version`); registries ship *content*
independently. Adding entries or augmenting vocabularies is a registry **minor**;
the canonical registry only **adds** (augmenting/regional/vendor registries extend
via their own namespaces and **MUST NOT** redefine canonical ids, §6.2). Because
unknown tokens always fall back to a lossless opaque form (§4.5/§6.5), a consumer
on an older registry version never loses data from a newer one.

#### 9.3 Extensions & the promotion path

Namespaced extensions (§8.1) need no central coordination: anyone may add fields,
vocabulary tokens, links, or scripts under their namespace, and they never break
the core. A widely-adopted extension or vocabulary token **MAY** be **promoted**
into the canon — into a registry (registry minor) or, for structural elements, into
the spec (spec minor) — always as a backward-compatible addition. This gives the
ecosystem a path from private experimentation to shared standard without forks (the
same lifecycle as HTML vendor prefixes or schema.org's pending→core track).

#### 9.4 Change process & stewardship

OpenBody is **community-extensible** and stewarded by Thabit Labs. During the
incubation phase (v0.2 to v1.0), the project follows a **Phased Incubation** model:
the Project Lead (Yasir Ahmad) retains final merge authority (BDFL model) over the GitHub
repository to ensure coherence, while specification changes are reviewed and approved
by a public **Technical Steering Committee (TSC)** via asynchronous GitHub RFCs. All
contributions require sign-off under the **Developer Certificate of Origin (DCO)**.

**Transition to Foundation.** To secure ecosystem trust, stewardship and ownership
of the "OpenBody" trademark will be transferred to an independent, neutral foundation
(such as the Joint Development Foundation, the Linux Foundation, or a dedicated non-profit
association) once a formal Working Group with corporate sponsors is established or upon
demonstrated adoption by major platforms. If foundation transfer is delayed, the project
will operate under a permanent open-governance charter on GitHub.

**Trademark Licensing.** The "OpenBody" trademark remains the property of the steward
or foundation. A free, royalty-free **Trademark License Policy** is published alongside
the spec, granting any implementer the right to use the "OpenBody Compatible" mark
provided their implementation validates against the official conformance test suite.

#### 9.5 Licensing

| Artifact | License | Rationale |
|---|---|---|
| Specification documents | **OWFa 1.0** | Open Web Foundation Agreement; royalty-free patent non-assertion with defensive termination. |
| Reference code | **Apache-2.0** | Permissive reference code license. |
| Registry data (§4.5, §6) | **CC0** | Public Domain; the interop registry must remain completely unencumbered. |

---

### 10. Incumbent Mappings

Bidirectional mapping to and from incumbent schemas is OpenBody's primary success
measure (§3.1) and its adoption wedge: the standard is a **universal adapter**.
"Bidirectional" means OpenBody both **ingests from** and **emits to** incumbents.
The **lossless guarantee is directional**:

- *incumbent → OpenBody* is **lossless** — OpenBody is the superset, with anything
  lacking a core home preserved via extensions/opaque (§10.4);
- the **source-anchored round-trip** *source → OpenBody → source* is **lossless**
  (§10.5);
- emitting OpenBody's full expressiveness *into* a **less-expressive target** (a
  %1RM target, RPE, or a superset into a schema that has no field for it) is
  necessarily **best-effort and bounded by that target's expressiveness** — a limit
  of the target, not a defect of OpenBody.

This section defines the **structural correspondences** and mapping *principles*
normatively; exhaustive per-incumbent field maps are maintained as **versioned
mapping profiles** (companion artifacts, normative when published) and exercised by
the test corpus (§8.3). The mapping *code* is deferred to the reference
implementation (§11); the *rules* here are part of the standard.

#### 10.1 Mapping principles

- **Canonical-plus-residue.** Map each source construct to its canonical OpenBody
  equivalent; carry anything with no canonical home in **namespaced extensions**
  (§8.1) or, for identity, the **opaque** fallback (§6.5). Nothing is dropped.
- **Lazy terminology.** Source type tokens are preserved source-namespaced on
  ingest and resolved to external codes (LOINC/SNOMED/UCUM/MET) only on output
  (§4.4); FHIR/clinical mapping is a *future* output target (§3.2).
- **Provenance preserved.** Source platform, app, and device become registry-backed
  provenance tokens (§7.4); the source's own key becomes `clientRecordId` (§7.1).
- **Round-trip.** Source → canonical → source **MUST** preserve meaning under the
  normalized-equivalence rule (§8.3).

#### 10.2 Pillar A — Observation crosswalk

| Incumbent construct | OpenBody |
|---|---|
| HealthKit `HKQuantitySample` | `Measurement` (`quantity`) |
| HealthKit `HKCategorySample` | `Measurement` (`category`) |
| HealthKit series / ECG / route | `Measurement` (`sampleArray`; multi-channel for route) |
| Health Connect `Record` (`StepsRecord`, `HeartRateRecord`, …) | `Measurement` (`quantity`; interval-window for aggregates, §4.3) |
| Garmin FIT `record` messages | `Measurement` (`sampleArray`/`quantity`; location channels) |
| Strava streams (HR/power/cadence/latlng) | `Measurement` (`sampleArray`; multi-channel route), referenced by Pillar B |
| FHIR `Observation` | `Measurement` (+ `coded` crosswalk on output) |
| Open mHealth schema | `Measurement` |

Vendor-specific scores (Whoop "Strain", Oura "Readiness", Garmin "Body Battery")
map to a source-namespaced `type` (§4.4) — preserved, not blocked.

#### 10.3 Pillar B — Structured Training crosswalk

| Incumbent construct | OpenBody |
|---|---|
| Health Connect `ExerciseSession` → `Segment`/`Lap` | `Session` → `Block`/`Exercise` → `WorkUnit` |
| Health Connect planned `Plan` → `Block` → `Step` → `Goal` | `Program`/planned `Session` → `Block` → `WorkUnit.prescription` (`Target`) |
| HealthKit `HKWorkout` + `HKWorkoutActivity` | `Session` with multiple disciplines/`Block`s |
| Garmin FIT `Session`→`Lap`→`Record` + `set` + `workout_step` | `Session`→`Block`→`Exercise`→`WorkUnit` (+ planned steps via `performedFrom`) |
| Strava activity + streams | `Session` (+ `WorkUnit` per discipline) with `sameActivityAs`/`peerSensor` to Pillar A streams (§10.2) |
| OpenWeight template / log | planned/performed `Session`; sets → `WorkUnit`s; %1RM → `relativeToThreshold`; `app:` → extension |
| wger `Slot` + iteration | `Block.grouping` + `Program` iteration + `Progression` |
| SugarWOD WOD + Rx + score | `Block.scoring` (AMRAP/for_time/EMOM) + `rxStatus` + `outcome` |

#### 10.4 Where the residue goes

The constructs incumbents model that have no *core* field map to OpenBody's open
mechanisms rather than being lost — validating the extensibility thesis:
vendor scores → source-namespaced `type` or `modifiers`; machine scales/levels →
`Load.basis`; equipment make/model/settings → `Descriptors.equipment`; unknown
movements → `ExerciseRef.opaque`; app-specific passthrough → namespaced
`extension`; transactional sync state → out of data-model scope (deferred, §3.2).

#### 10.5 Round-trip guarantee

The v1 bar (§3.1) is a demonstrated **source-anchored** lossless round-trip from
**at least two structurally-different incumbents** — e.g. a Google Health Connect
export (telemetry + sessions) and a strength app's export (templates + logged
sets/%1RM/RPE) — through canonical OpenBody and back to the *source* schema, with no
loss of meaning. (This is distinct from emitting OpenBody into a *different*,
less-expressive target, which is bounded by that target — see the opening.) The
round-trip vectors and the activity-coverage corpus (§8.3) are how this guarantee is
mechanically checked.

---

### 11. Reference Implementation — deferred (NON-normative)

The first reference implementation is **not specced here**. It is a **Phase-2 build
against the frozen standard**: once §§3–10 freeze, a reference implementation is
developed in its own repository, decomposing the standard into implementation specs
there.
Implementation-level concerns to carry into that build (none are standard
requirements): a >10,000 measurements/sec/container throughput target;
compile-time enforcement of the §3/§4 validation rules via generated types; the
serialization ergonomics behind the §0 binding choice (JSON primary; Protobuf /
FlatBuffers alternates, §4.7); and a GC/`sync.Pool` allocation question.
Other-language implementations are equally valid if they conform to §§3–10.

---

### Appendix A — Worked Examples (informative)

Examples are in the primary JSON binding (§0). They are illustrative; the normative
content is §§3–10 and the test vectors (§8.3).

**A.1 Strength session — nested document; relative load via `Load.value`, tempo,
effort, rest (superset).**

```json
{
  "id": "sess-001",
  "recordType": "Session",
  "subject": "subj-001",
  "intent": "train",
  "disciplines": ["strength"],
  "blocks": [{
    "id": "blk-001",
    "recordType": "Block",
    "grouping": "superset",
    "children": [
      {
        "id": "ex-001", "recordType": "Exercise", "exerciseRef": "bench-press.barbell",
        "workUnits": [{
          "id": "wu-001", "recordType": "WorkUnit", "scoring": "reps", "setRole": "working",
          "prescription": {
            "sets": 3, "reps": 5,
            "load": { "value": { "relativeToThreshold": { "percent": 80, "of": "1RM" } }, "basis": "marked_weight" },
            "phasePattern": [{ "name": "eccentric", "durationSec": 3 }, { "name": "concentric", "qualifier": "explosive" }],
            "rest": { "absolute": { "value": 120, "unit": "s" } }
          }
        }]
      },
      {
        "id": "ex-002", "recordType": "Exercise", "exerciseRef": "row.barbell.bent-over",
        "workUnits": [{
          "id": "wu-002", "recordType": "WorkUnit", "scoring": "reps",
          "prescription": { "sets": 3, "reps": 8, "effortLoad": [{ "kind": "internal", "method": "RIR", "value": 2 }] }
        }]
      }
    ]
  }]
}
```

**A.2 CrossFit AMRAP — block scoring, block-level performed outcome, Rx status.**

```json
{
  "id": "blk-amrap-12", "recordType": "Block", "subject": "subj-001",
  "scoring": { "scheme": "amrap", "timeCapSec": 1200 },
  "rxStatus": "rx",
  "children": [
    { "id": "ex-a", "recordType": "Exercise", "exerciseRef": "pull-up",
      "workUnits": [{ "id": "wu-a", "recordType": "WorkUnit", "scoring": "reps", "prescription": { "reps": 5 } }] },
    { "id": "ex-b", "recordType": "Exercise", "exerciseRef": "thruster.barbell",
      "workUnits": [{ "id": "wu-b", "recordType": "WorkUnit", "scoring": "reps", "prescription": { "reps": 10 } }] }
  ],
  "performance": { "outcome": { "kind": "score", "value": 14, "unit": "rounds" } }
}
```

**A.3 Continuous endurance run — collapsed Session→WorkUnit, cross-pillar
`measuredBy` links to Pillar A telemetry.**

```json
{
  "id": "sess-run-12", "recordType": "Session", "subject": "subj-001",
  "intent": "train", "disciplines": ["running"],
  "workUnits": [{
    "id": "wu-run", "recordType": "WorkUnit", "scoring": "continuous",
    "performance": { "distance": { "absolute": { "value": 10000, "unit": "m" } }, "time": { "absolute": { "value": 2520, "unit": "s" } } },
    "links": [
      { "type": "measuredBy", "ref": "obs-route-77" },
      { "type": "measuredBy", "ref": "obs-hr-stream-3" }
    ]
  }]
}
```

**A.4 Planned vs performed — standalone records linked by `performedFrom`.**

```json
[
  { "id": "plan-squat-mon", "recordType": "WorkUnit", "subject": "subj-001", "exerciseRef": "squat.barbell.high-bar",
    "scoring": "reps", "prescription": { "sets": 5, "reps": 5, "load": { "value": 100, "unit": "kg", "basis": "marked_weight" } } },

  { "id": "perf-squat-1", "recordType": "WorkUnit", "subject": "subj-001", "exerciseRef": "squat.barbell.high-bar",
    "scoring": "reps", "links": [{ "type": "performedFrom", "ref": "plan-squat-mon" }],
    "performance": { "reps": 5, "load": { "value": 100, "unit": "kg", "basis": "marked_weight" },
                     "effortLoad": [{ "kind": "internal", "method": "RPE", "value": 8 }] } }
]
```

*(A.4 shows the flat form — standalone `WorkUnit`s linked by `performedFrom`, with
no enclosing `Session`. The planned `sets: 5` shorthand expands to five WorkUnits
(§5.5); the performed side enumerates one record per actual set — here the first.)*

---

*References*
*   *[1] HL7 FHIR R4 Observation Resource: https://hl7.org/fhir/R4/observation.html*
*   *[2] HL7 FHIR Personal Health Device Implementation Guide: https://build.fhir.org/ig/HL7/PHD/*
*   *[3] Open mHealth Schemas: https://github.com/openmhealth/schemas*
*   *[4] Open mHealth Metadata Spec: http://www.openmhealth.org/documentation/#/schema-docs/schema-library/schemas/omh_metadata*
*   *[5] IEEE 1752.1 Standard for Mobile Health: https://standards.ieee.org/ieee/1752.1/7342/*
*   *[6] IEEE 11073 Personal Health Devices: https://standards.ieee.org/committee/11073.html*
*   *[7] Abstract Content Information Model (ACOM) - IEEE 11073-10206: https://ieeexplore.ieee.org/document/8357608*
*   *[8] Apple HealthKit HKSample: https://developer.apple.com/documentation/healthkit/hksample*
*   *[9] Apple HealthKit HKQuantitySample: https://developer.apple.com/documentation/healthkit/hkquantitysample*
*   *[10] Google Health Connect SDK Reference: https://developer.android.com/reference/android/health/connect/package-summary*
*   *[11] Android Jetpack Health Connect Record Types: https://developer.android.com/reference/android/health/connect/datatypes/Record*
*   *[12] RFC 8785 — JSON Canonicalization Scheme (JCS): https://www.rfc-editor.org/rfc/rfc8785*
