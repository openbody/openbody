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
