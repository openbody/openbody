# OpenBody Licensing

OpenBody uses three licenses, one per artifact kind, so the interop core stays
maximally unencumbered while the steward retains a royalty-free patent posture.

| Artifact | License | Why |
|---|---|---|
| **Specification documents** (this repo: `SPEC.md` and the prose docs) | **Open Web Foundation Agreement 1.0 (OWFa 1.0)** | Reciprocal royalty-free patent licensing with defensive termination — the standard-body norm for an open spec. |
| **Reference code** (SDKs, mappers, conformance tooling — separate repos) | **Apache-2.0** | Permissive, with an explicit patent grant. |
| **Registry data** (the exercise & measurement-type registries — separate repos) | **CC0** | Public domain; the interop registries must be completely unencumbered (no copyleft contamination). |

Official license texts:

- OWFa 1.0 — https://www.openwebfoundation.org/the-agreements/the-owf-1-0-agreements-granted-claims/owfa-1-0
- Apache-2.0 — https://www.apache.org/licenses/LICENSE-2.0
- CC0 1.0 — https://creativecommons.org/publicdomain/zero/1.0/legalcode

Verbatim license texts vendored into the repos:

- **Reference code** (`openbody-ts/LICENSE`) — Apache-2.0, full text. ✅
- **Registry data** (`openbody-registry/LICENSE`) — CC0 1.0 legal code, full text. ✅
- **Specification docs** (this repo, `LICENSE`) — OWFa 1.0 (Granted Claims) — i.e. the
  Open Web Foundation **Final Specification Agreement (OWFa 1.0), Patent and Copyright
  Grants** (the title the vendored `LICENSE` carries; same variant, not the Patent-Only or
  CLA variants). Full verbatim text vendored from the official agreement, with the
  Specification identified as `OpenBody 0.6.0` and an individual grant executed. ✅

(Recorded in the project decision log: licensing was OWFa-1.0 / Apache-2.0 / CC0 as of
2026-06-24, superseding an earlier CC-BY-4.0 docs license. The OWFa grant was re-executed
for `OpenBody 0.6.0` on 2026-07-01, superseding the initial execution for `OpenBody 0.3.1`.)
