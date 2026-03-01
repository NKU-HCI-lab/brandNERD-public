// group-brands.js (CommonJS, synchronous)
// Usage:
//   node group-brands.js --threshold=0.95 --brands=brands.csv --validated=validated.csv --similar=similar_twoway.tsv --out=grouped.json
//
// Notes:
// - brands.csv / validated.csv are assumed to contain one canonical per line (optionally with a header row).
// - similar_twoway.tsv lines look like: CANONICAL1<TAB>CANONICAL2<TAB>SCORE
// - If a non-validated brand has no validated neighbor >= threshold, it is placed under "__unmatched__".


// region SETTINGS

const threshold = 0.92;
const FOLDER_DATASETS='../../datasets';
const FOLDER_CANONICALIZED=`${FOLDER_DATASETS}/01_canonical`;
const FILE_CANONICAL_CSV=`${FOLDER_DATASETS}/01_canonical/brands_canonical.csv`;
const FILE_VALIDATED_CSV=`${FOLDER_DATASETS}/04_validated/validated.csv`;
const FILE_SIMILARITY_TWOWAY_TSV=`${FOLDER_DATASETS}/02_similarity-clusters/similar_twoway.csv`;

const brandsPath = FILE_CANONICAL_CSV;
const validatedPath = FILE_VALIDATED_CSV;
const similarPath = FILE_SIMILARITY_TWOWAY_TSV;
const outPath = `${FOLDER_DATASETS}/05_aggregated/aggregated_${threshold.toString().replace('0.','')}.json`;
const fs = require('fs');


function readLines(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSingleColumnCSV(filePath) {
  const lines = readLines(filePath);
  const startIdx = lines.length && /canonical/i.test(lines[0]) ? 1 : 0;

  const values = [];
  for (const line of lines.slice(startIdx)) {
    const first = line.split(",")[0].trim();
    if (first) values.push(first);
  }
  return values;
}

function main() {
  if (!Number.isFinite(threshold)) {
    console.error("Invalid threshold value");
    process.exit(1);
  }

  const brands = parseSingleColumnCSV(brandsPath);
  const brandsSet = new Set(brands);

  const validated = new Set(parseSingleColumnCSV(validatedPath));

  // UNVALIDATED_BRAND -> { validated: VALIDATED_BRAND, score }
  const bestMatch = new Map();

  const simLines = readLines(similarPath);

  for (const line of simLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;

    const a = parts[0].trim();
    const b = parts[1].trim();
    const score = Number(parts[2]);

    if (!a || !b || !Number.isFinite(score)) continue;
    if (score < threshold) continue;

    const aInBrands = brandsSet.has(a);
    const bInBrands = brandsSet.has(b);

    // a validated -> candidate for b
    if (validated.has(a) && bInBrands && !validated.has(b)) {
      const prev = bestMatch.get(b);
      if (!prev || score > prev.score) {
        bestMatch.set(b, { validated: a, score });
      }
    }

    // b validated -> candidate for a
    if (validated.has(b) && aInBrands && !validated.has(a)) {
      const prev = bestMatch.get(a);
      if (!prev || score > prev.score) {
        bestMatch.set(a, { validated: b, score });
      }
    }
  }

  // Build grouped object
  const grouped = {};
  for (const v of validated) grouped[v] = [];

  for (const [unvalidatedBrand, { validated: validatedBrand }] of bestMatch.entries()) {
    grouped[validatedBrand].push(unvalidatedBrand);
  }

  // Remove empty groups
  for (const [k, v] of Object.entries(grouped)) {
    if (v.length === 0) delete grouped[k];
  }

  fs.writeFileSync(outPath, JSON.stringify(grouped, null, 2) + "\n", "utf8");

  // ---- Statistics ----
  const totalBrandCount = brands.length;
  const validatedCount = validated.size;
  const aggregatedBrandCount = bestMatch.size;
  const aggregatedGroupCount = Object.keys(grouped).length;

  const totalUnvalidated = totalBrandCount - validatedCount;
  const unvalidatedNotAggregated = totalUnvalidated - aggregatedBrandCount;

  console.log(`Wrote ${outPath}`);
  console.log(`Threshold: ${threshold}`);
  console.log("----- STATS -----");
  console.log(`Total brands: ${totalBrandCount}`);
  console.log(`Validated brands: ${validatedCount}`);
  console.log(`Aggregated groups: ${aggregatedGroupCount}`);
  console.log(`Aggregated brands: ${aggregatedBrandCount}`);
  console.log(`Unvalidated brands not aggregated: ${unvalidatedNotAggregated}`);
}

main();