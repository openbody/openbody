# Keeping version numbers in sync

The OpenBody version appears in several places across several repos. This document is the
map: where the version lives, which copies are kept correct **automatically**, which are
**guarded by CI**, and which need a **deliberate manual step**. The goal is one rule:

> **A version literal must be one of: (a) derived from the source of truth at build time,
> (b) CI-guarded to equal it, or (c) deliberately version-less prose.** An unguarded
> hardcoded version number is drift waiting to happen — don't add one.

## Source of truth

The canonical spec version is the **`## Draft vX.Y.Z` heading in `SPEC.md`**, together with
the matching top **`## [X.Y.Z]` entry in `CHANGELOG.md`**. Cutting a new version means
editing these (a normative release — see `GOVERNANCE.md` § Versioning). Everything else
below either derives from, or is checked against, this.

## 1. CI-guarded — must equal the spec version

`tools/check-consistency.mjs` (run by `npm run check`, gated in CI by
`.github/workflows/consistency.yml`) parses the `SPEC.md` version and **fails the build** if
any of these disagree:

| Location | Rule |
|---|---|
| `CHANGELOG.md` top `[X.Y.Z]` entry | exact match |
| `README.md` `Status: DRAFT — vX.Y.Z` line | exact match |
| `schema/openbody.schema.json` `title` | exact match |
| `schema/openbody.schema.json` `$id` (`…/schema/vX.Y/…`) | major.minor match (see §4) |

So when you bump the spec, update these four and run `npm run check` — you can't forget one
silently.

## 2. Auto-derived downstream — no manual step

The **docs site** (`openbody-docs`) never hardcodes the version. Its build runs
`scripts/sync-spec.mjs`, which parses the same `SPEC.md` heading into
`src/generated/spec-meta.json`; every page (and the site config) reads `specVersion` from
there. A spec change reaches the live site via the docs site's daily rebuild or the
`notify-docs` dispatch (see `openbody-docs/DEPLOY.md`). **Nothing to update by hand.**

## 3. Deliberate / legal — manual, tracks *releases* not every bump

The **OWFa 1.0 grant** identifies a specific specification version, and re-identifying it is
a conscious **re-execution** by the grantor (it re-dates a signature — a legal act), not a
string bump. So it is **not** CI-**gated**.

**When it must match — and when it needn't.** The grant covers the version it names; that
version stays covered forever. You do **not** re-execute on every intermediate draft bump
(`0.6.1`, `0.7.0-dev`, …) — a temporary lag behind `SPEC.md` is expected and harmless while
no one is implementing the newer text. The grant **MUST** match the spec version **at the
moments you publish a version people implement**:

- the **public draft release**, and
- **each subsequently released version** (and **v1.0**).

Two safety nets stop this being forgotten:

- **Non-failing CI note.** `tools/check-consistency.mjs` prints a note (not a failure)
  whenever the LICENSE-identified version differs from `SPEC.md`, so the lag is visible on
  every `npm run check` — never silent.
- **Release gate.** Reconciling the grant is a checklist item at public-release / go-public
  (see the go-public tracking issue) and at every release, where it *is* a hard requirement.

**To re-execute** (do all three together):

- [ ] `LICENSE` — update `Identify the Specification and version number here: OpenBody X.Y.Z`
      and re-date the signature block.
- [ ] `LICENSING.md` — update the identified version and add a line to the decision log
      recording the re-execution (keep the prior one as history).
- [ ] `openbody-docs` licensing page (`src/content/docs/licensing/index.mdx`) — mirror the
      identified version and the re-execution note.

## 4. Independent versioning — do NOT track the spec version

These have their **own** version lines and must not be bumped to match the spec:

- **`schema/openbody.schema.json` `$id`** carries only **`vMAJOR.MINOR`**, bumped when the
  schema's *shape* changes (a new minor), not on every patch. CI checks it equals the spec's
  major.minor — loosen that check if you deliberately decouple them.
- **Exercise registry** and **measurement-type registry** — independently versioned on their
  own semver cadence (`SPEC.md` §9.2). A new spec version does not imply a registry bump.
- **`openbody-ts`** — the reference implementation has its own version (`0.1.0`) and tracks a
  spec *line*, not a pinned patch. Its README should name the line loosely (or link the
  CHANGELOG), not hardcode a patch it will drift from.

## 5. Historical — never edit

Past `CHANGELOG.md` entries, decision-log lines, prior grant-execution records, and prose
like "relaxed in v0.3.1" are **history**. They correctly name old versions; leave them.

## Bump checklist (cutting a new spec version)

1. Edit the `SPEC.md` heading and add the `CHANGELOG.md` entry (the release).
2. Update `README.md` status, `schema` `title`, and `schema` `$id` (if the minor changed).
   Run `npm run check` — it gates §1.
3. Docs update themselves (§2) — no action.
4. **Optionally** re-execute the OWFa grant for the new version (§3) — a deliberate choice.
5. Registries / `openbody-ts` (§4) — only if their own release warrants it.
