<!-- Thanks for contributing to OpenBody. Keep the standard neutral, portable, and coherent. -->

## What & why

<!-- What changes, and what problem it solves. Link the RFC issue for spec changes: "Closes #123". -->

## Type of change

- [ ] Editorial (typo/clarification, no normative meaning changes) — patch
- [ ] Additive (new capability, nothing existing breaks) — minor
- [ ] Breaking (changes an existing field's meaning/shape) — major, with a deprecation path
- [ ] Reference code / tooling / CI only (no `SPEC.md` change)

## Checklist

- [ ] Commits are **DCO-signed** (`git commit -s` → `Signed-off-by:` trailer). The DCO check gates merge (`CONTRIBUTING.md`).
- [ ] Spec changes went through an **RFC** and reflect TSC review (`GOVERNANCE.md`), or are editorial-only.
- [ ] Extends rather than reinterprets the core (SPEC §8.1); unknown extensions still round-trip losslessly.
- [ ] Conformance vectors stay green (or are updated with justification) — `conformance/`.
- [ ] `CHANGELOG.md` updated if the standard's version is affected (additive = minor, breaking = major, editorial = patch).
