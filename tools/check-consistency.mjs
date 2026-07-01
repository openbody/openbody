// Consistency gate for the OpenBody standard repo.
// Validates that EVERY worked example in SPEC.md and EVERY conformance vector record
// validates against schema/openbody.schema.json. Spec and schema are co-equal; a
// mismatch is a bug in one of them. Run: `npm run check`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(fs.readFileSync(path.join(root, "schema/openbody.schema.json"), "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

let total = 0;
let fails = 0;
const asRecords = (x) => (Array.isArray(x) ? x : [x]);

function check(label, doc) {
  for (const r of asRecords(doc)) {
    total++;
    if (!validate(r)) {
      fails++;
      console.error(`  FAIL ${label} (id=${r?.id ?? "?"}): ${ajv.errorsText(validate.errors, { separator: "; " }).slice(0, 220)}`);
    }
  }
}

// 1. SPEC.md worked examples
const spec = fs.readFileSync(path.join(root, "SPEC.md"), "utf8");
const blocks = [...spec.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => m[1]);
for (const b of blocks) check("spec-example", JSON.parse(b));
const specCount = total;

// 2. Conformance vectors + 3. the extended activity-coverage corpus.
// Both use the same vector file format; the corpus is coverage validation, not a
// conformance bar (§8.3), but its records must still be schema-valid.
function checkVectorDir(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return 0;
  const before = total;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".json") || f === "index.json") continue;
    const v = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (v.kind === "valid") check(f, v.record);
    else if (v.kind === "equivalent" || v.kind === "inequivalent") { check(`${f}#a`, v.a); check(`${f}#b`, v.b); }
    else if (v.kind === "normalization") check(`${f}#input`, v.input);
    // "invalid" vectors are expected to fail the schema — skipped here.
  }
  return total - before;
}

const vectorCount = checkVectorDir("conformance/vectors");
const corpusCount = checkVectorDir("conformance/corpus");

console.log(`OpenBody consistency: ${total - fails}/${total} records validate (${specCount} from SPEC.md, ${vectorCount} from vectors, ${corpusCount} from corpus).`);
if (fails) {
  console.error(`\n${fails} record(s) failed — spec/schema/vectors are out of sync.`);
  process.exit(1);
}

// 4. Version consistency (see VERSIONING.md). SPEC.md's "Draft vX.Y.Z" heading is the single
// source of truth; every file that MUST track the spec version is asserted to match it here.
// Deliberate/legal files (LICENSE, LICENSING.md — a conscious OWFa re-execution) are NOT
// checked; they follow the manual checklist in VERSIONING.md.
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const canonical = read("SPEC.md").match(/Draft\s+v?(\d+\.\d+\.\d+)/i)?.[1];
const versionErrors = [];
if (!canonical) {
  versionErrors.push('SPEC.md: could not find the canonical "Draft vX.Y.Z" version heading.');
} else {
  const [maj, min] = canonical.split(".");
  const expect = (label, actual) => {
    if (actual !== canonical) versionErrors.push(`${label}: found ${actual ?? "none"}, expected ${canonical} (matches SPEC.md).`);
  };
  expect("CHANGELOG.md top entry", read("CHANGELOG.md").match(/^##\s*\[(\d+\.\d+\.\d+)\]/m)?.[1]);
  expect("README.md status line", read("README.md").match(/Status:\s*DRAFT\s*[—-]\s*v?(\d+\.\d+\.\d+)/i)?.[1]);
  expect("schema title", JSON.parse(read("schema/openbody.schema.json")).title?.match(/(\d+\.\d+\.\d+)/)?.[1]);
  // schema $id carries only the major.minor line (bumped when the schema changes shape).
  const idMinor = JSON.parse(read("schema/openbody.schema.json")).$id?.match(/schema\/v(\d+\.\d+)\//)?.[1];
  if (idMinor !== `${maj}.${min}`) versionErrors.push(`schema $id: found v${idMinor ?? "?"}, expected v${maj}.${min} (major.minor of ${canonical}).`);
}
if (versionErrors.length) {
  console.error(`\nVersion drift (SPEC.md says ${canonical ?? "?"}):`);
  for (const e of versionErrors) console.error(`  FAIL ${e}`);
  console.error(`See VERSIONING.md for the source of truth and the bump checklist.`);
  process.exit(1);
}
console.log(`OpenBody version: v${canonical} consistent across SPEC.md, CHANGELOG.md, README.md, schema title + $id.`);

// The OWFa 1.0 grant (LICENSE) identifies the specification version it was executed for.
// Re-executing it is a deliberate legal act by the grantor (VERSIONING.md §3), NOT auto-sync,
// so a lag is *not* a build failure. But it must not be silent: surface it as a NON-FAILING
// note so it's reconciled before a version is published. The hard gate lives at release /
// go-public (see VERSIONING.md §3 and the go-public checklist), not on every bump.
const grantVersion = read("LICENSE").match(/Identify the Specification[^\n]*\n+\s*OpenBody\s+(\d+\.\d+\.\d+)/i)?.[1];
if (canonical && grantVersion && grantVersion !== canonical) {
  console.warn(
    `\nNOTE: the OWFa grant (LICENSE) identifies OpenBody ${grantVersion}, but SPEC.md is ${canonical}.\n` +
    `      This is fine mid-draft, but re-execute the grant before publishing ${canonical}\n` +
    `      (VERSIONING.md §3). Not a failure — informational.`,
  );
}
