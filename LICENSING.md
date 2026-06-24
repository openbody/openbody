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

> **TODO before public release:** drop the verbatim license files into the repo —
> `LICENSE` (OWFa 1.0 full text for the spec docs) and, in each code/registry repo,
> the Apache-2.0 / CC0 texts respectively. They are intentionally referenced (not
> inlined) during private review to avoid shipping unverified legal text.

(Recorded in the project decision log: licensing was OWFa-1.0 / Apache-2.0 / CC0 as of
2026-06-24, superseding an earlier CC-BY-4.0 docs license.)
