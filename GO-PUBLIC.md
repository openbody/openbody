# Going public — release checklist

The master checklist for taking OpenBody from **private review** to a **public draft
release**. It spans all five repos (`openbody`, `openbody-ts`, `openbody-registry`,
`openbody-measurements`, `openbody-docs`) — **released together, as one synchronized
event**, not staggered per-repo. Nothing here is automated — going public is a
deliberate, one-time event.

> Tracked by the go-public issue in `openbody/openbody-docs` (label `go-public`), which
> points back here. Detail for individual items lives in `DEPLOY.md` (docs/CI) and
> `VERSIONING.md` (the OWFa grant).

## 1. Pre-flight — the standard is ready to publish

- [ ] The version being published has a cut `CHANGELOG.md` entry and the `SPEC.md` heading
      matches (`npm run check` is green).
- [ ] **Reconcile the OWFa grant** to the published version — `LICENSE` must identify the
      released `SPEC.md` version; re-execute if it lags (`VERSIONING.md` §3). `npm run check`
      prints a note while it lags.
- [ ] Conformance vectors + corpus green against the reference implementation
      (`openbody-ts`: `npm test`).

## 2. Governance artifacts that were deferred to the public release

These are referenced by `GOVERNANCE.md` / `CONTRIBUTING.md` as taking effect at the public
draft release, but are not yet authored. They must exist before (or at) go-public:

- [ ] **TSC charter / membership** — the Technical Steering Committee that reviews spec RFCs
      (`GOVERNANCE.md`).
- [ ] **RFC template** — the issue/PR template spec changes are proposed through
      (`CONTRIBUTING.md`).
- [ ] **Trademark License Policy** — the standalone document granting the "OpenBody
      Compatible" mark on passing the conformance suite (`GOVERNANCE.md` / `SPEC.md` §9.4).
- [ ] **DCO check** enabled on the repo (merges require `Signed-off-by`, per
      `CONTRIBUTING.md`).
- [ ] Confirm **Code of Conduct** reporting (`conduct@openbody.dev`) and **contact**
      (`contact@openbody.dev`) inboxes are live.

## 3. Flip "private review" wording → public

Update the status/availability language (the CHANGELOG's historical "(private draft)" tags
stay — they're history):

- [ ] `openbody/README.md` — status line "In private review" and "This repository is not yet
      public."
- [ ] `openbody/CONTRIBUTING.md` — the "While in private review, contribution is limited"
      note.
- [ ] `openbody-docs` site — landing page "in private review" aside (`index.mdx`), the
      governance page notes (`governance/index.mdx`), and the getting-started notes
      (`getting-started/index.mdx`, incl. the `openbody-ts` npm-publish status).

## 4. Repository visibility

- [ ] Make public, **all five, together**: **`openbody`**, **`openbody-ts`**,
      **`openbody-registry`**, **`openbody-measurements`**, **`openbody-docs`**.
- [ ] Verify the docs site's GitHub links resolve once public — `editLink`, the GitHub
      social link, and the `blob/main/...` source links in `astro.config.mjs` and pages
      (they 404 while private).

## 5. Retire private-access CI tokens

Two secrets exist **only** to read the currently-private `openbody/openbody`:

- [ ] **`openbody-docs` → `STANDARD_REPO_TOKEN`** — code change: delete the `token:` line from
      the *Checkout openbody standard* step in `.github/workflows/deploy.yml`, then delete the
      repo secret (`DEPLOY.md`).
- [ ] **`openbody-ts` → `STANDARD_REPO_TOKEN`** — delete the secret only; `conformance.yml`
      already falls back to `github.token`.
- [ ] **Keep `DOCS_DISPATCH_TOKEN`** (in `openbody/openbody`) — permanent cross-repo
      dispatch infra, unrelated to visibility. Do **not** remove it.

## 6. Reference implementation & registries

Not an independent readiness gate — these follow §4's repo-visibility flip, not their
own separate timing. `npm publish` in particular only makes sense once
`openbody-ts`'s own repo is public: the package's `repository`/`homepage`/`bugs`
fields resolve to `github.com/openbody/openbody-ts`, so publishing while that repo
is still private means anyone who clicks through from npm hits a 404, regardless of
whether the *spec* is public. Given §4 makes all five repos public in the same
event, "spec is public" and "`openbody-ts` is public" are the same moment in
practice — so sequence this step **right after §4**, same event, not later:

- [ ] **`openbody-ts`** — packaging is done (`OB-11`: build/vendor-schema/pack all
      verified, see commit `538de78`) — nothing left to block this once §4 lands.
      `npm publish`, then update the docs install steps (the getting-started page
      currently says "not yet published to npm").
- [ ] **`openbody-registry`** — confirm the CC0 `LICENSE`, `SOURCES.md` provenance, and
      id-stability note are release-ready.
- [ ] **`openbody-measurements`** — confirm the CC0 `LICENSE` and token-stability note
      (`README.md` "Status") are release-ready (added 2026-07-02, `OB-13`).

## 7. Post-publish smoke test

- [ ] `https://openbody.dev` live and consistent; `SPEC.md`, schema download, and mapping
      guides render.
- [ ] A spec change on `openbody/openbody` main triggers `notify-docs` → a docs redeploy.
- [ ] The public "OpenBody Compatible" path (conformance suite + trademark policy) is
      reachable from the docs Conformance page.
