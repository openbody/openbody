# OpenBody Governance

This document describes how OpenBody is stewarded and how decisions are made. It
mirrors the normative governance commitments in `SPEC.md` §9.4–§9.5.

## Stewardship

OpenBody is **community-extensible** and stewarded by **Thabit Labs**. The standard is
vendor-neutral: no single vendor — including the steward — should permanently control
the format, and the steward is not the brand on the wire.

## Phased Incubation (v0.2 → v1.0)

During the incubation phase:

- The **Project Lead (Yasir Ahmad)** retains final merge authority over the GitHub
  repository (a BDFL model) to keep the standard coherent while it stabilizes.
- Specification changes are reviewed and approved by a public **Technical Steering
  Committee (TSC)** via **asynchronous GitHub RFCs**.
- All contributions require **Developer Certificate of Origin (DCO)** sign-off
  (`CONTRIBUTING.md`).

## Transition to a foundation

To secure ecosystem trust, stewardship and ownership of the "OpenBody" trademark are
intended to transfer to an independent, neutral **foundation** (e.g. the Joint
Development Foundation, the Linux Foundation, or a dedicated non-profit) once a formal
Working Group with corporate sponsors is established, or upon demonstrated adoption by
major platforms. If foundation transfer is delayed, the project operates under a
permanent open-governance charter on GitHub.

## Versioning & change management

- The specification follows **semantic versioning** (`CHANGELOG.md`): additive
  minor / breaking major / editorial patch; **deprecate-not-remove** within a major.
- **Vocabulary growth** for open registry-backed fields happens via the independently
  versioned **registries**, not the spec (SPEC §9.1–§9.2).
- New values of a genuinely *closed* enum are rare and assessed case-by-case for
  graceful degradation, with lossless passthrough as the backstop.
- Widely-adopted namespaced extensions may be **promoted** into the canon as
  backward-compatible additions (SPEC §9.3).

## Trademark

The "OpenBody" trademark remains the property of the steward (and later the
foundation). A free, royalty-free **Trademark License Policy** grants any implementer
the right to use an **"OpenBody Compatible"** mark provided their implementation
validates against the official conformance test suite (`conformance/`).

## Licensing

Standard documents: **OWFa 1.0**. Reference code: **Apache-2.0**. Registry data:
**CC0**. See `LICENSING.md`.
