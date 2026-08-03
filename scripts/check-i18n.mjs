import { readFileSync } from "node:fs";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );

const en = flatten(JSON.parse(readFileSync("messages/en.json", "utf8")));
const ar = flatten(JSON.parse(readFileSync("messages/ar.json", "utf8")));

const missingInAr = en.filter((k) => !ar.includes(k));
const missingInEn = ar.filter((k) => !en.includes(k));

if (missingInAr.length || missingInEn.length) {
  console.error("i18n parity check failed");
  if (missingInAr.length) console.error("Missing in ar.json:", missingInAr);
  if (missingInEn.length) console.error("Missing in en.json:", missingInEn);
  process.exit(1);
}

console.log(`i18n parity OK — ${en.length} keys`);
