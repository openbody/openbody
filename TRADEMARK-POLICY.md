# OpenBody Trademark License Policy

This policy implements the trademark commitment in `SPEC.md` §9.4 and `GOVERNANCE.md`.
It grants a free, royalty-free right to describe conforming software as **"OpenBody
Compatible"**, and sets the limits that keep the mark meaningful.

It governs *trademark* use only. It does not affect the copyright/patent licenses on the
standard and code, which are separate: specification text under **OWFa 1.0**, reference
code under **Apache-2.0**, registry data under **CC0** (`LICENSING.md`).

## 1. Marks covered

- **OpenBody™** — the name of the standard and project.
- **OpenBody Compatible™** — the compatibility mark this policy grants.

The marks are owned by the steward, **Thabit Labs**, and are intended to transfer to a
neutral **foundation** as described in `GOVERNANCE.md`. On transfer, the foundation
administers this policy; the terms of the grant to implementers do not change as a
result of transfer.

## 2. The grant — "OpenBody Compatible"

You may state that a product, library, service, or file exporter is **"OpenBody
Compatible"**, free of charge and without seeking prior permission, provided **all** of
the following hold:

1. **It conforms.** The implementation validates against the official conformance test
   suite (`conformance/`) for the version of OpenBody you claim compatibility with, in
   the direction(s) you claim (import, export, or both — the lossless guarantee is
   directional; see SPEC §10).
2. **The claim is accurate and current.** You claim compatibility only for versions and
   capabilities that actually pass, and you correct or drop the claim if a change causes
   it to stop passing.
3. **The claim is specific where it matters.** If you support only part of the standard,
   say so plainly (e.g. "OpenBody Compatible — strength-training export"). Don't imply
   full compatibility you don't have.
4. **No implication of endorsement or origin.** Use of the mark must not suggest that
   OpenBody, the steward, or the foundation produces, sponsors, endorses, or is
   affiliated with your product.

No registration, fee, logo license, or signed agreement is required to make a truthful
"OpenBody Compatible" statement under this grant.

## 3. Permitted use

- Descriptive, adjectival use alongside your own product name:
  *"Acme Fitness is OpenBody Compatible"*, *"exports OpenBody"*, *"built on the OpenBody
  standard"*.
- Referring to the standard by name in documentation, articles, comparisons, and
  academic work (nominative reference — see §5).
- Stating the conformance version and direction, e.g. *"OpenBody Compatible (v0.9,
  import + export)"*.

## 4. Prohibited use

- **Don't use the marks in your product, company, or service name**, logo, or as a
  dominant brand element — e.g. naming a product "OpenBody Pro" or "OpenBodySync", or
  registering an "openbody" app/company/social handle. Use your own brand and describe
  compatibility.
- **Don't register** "OpenBody" (or a confusingly similar term) as a trademark, domain,
  package name, or username in a way that implies you are the project or its steward.
- **Don't alter the standard and still call the result "OpenBody."** A modified or
  extended format that no longer round-trips per SPEC §8.1 is not OpenBody; describe it
  as *"based on / derived from OpenBody"* instead.
- **Don't claim compatibility you can't back** with a passing conformance run, and don't
  imply endorsement, certification, or affiliation.
- **Don't modify the marks** (spelling, spacing, or a distributed logo) in a way that
  creates a new mark.

## 5. Nominative reference is always fine

Nothing here restricts truthful, non-confusing reference to OpenBody to identify the
standard — in prose, documentation, teaching, journalism, or interoperability claims.
Trademark law protects against confusion as to source, not against naming a thing to
talk about it.

## 6. Keeping the mark meaningful

"OpenBody Compatible" is only useful if it reliably means "passes the conformance
suite." Accordingly:

- The steward (or foundation) may **ask you to correct or stop** a use that is
  misleading, implies endorsement, or claims compatibility an implementation does not
  have. Good-faith corrections resolve the matter; the objective is accuracy, not
  enforcement for its own sake.
- Because self-attestation carries this policy, there is no certification fee and no
  gatekeeper — the conformance suite is the public, reproducible test of the claim.

## 7. No warranty

The marks and this policy are provided "as is." Use of the marks does not create any
warranty, agency, partnership, or joint venture, and confers no rights beyond those
stated here.

## 8. Changes to this policy

This policy may be updated through the governance process (`GOVERNANCE.md`,
`TSC-CHARTER.md`), with changes recorded in `CHANGELOG.md`. Truthful compatibility
statements already made in good faith under a prior version remain acceptable for the
version they describe.

## 9. Questions

Open an issue on the `openbody/openbody` repository, or contact the steward per
`GOVERNANCE.md`.
