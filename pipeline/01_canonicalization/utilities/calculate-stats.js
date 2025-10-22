const fs = require('fs');

// Load and parse the JSON data
const data = JSON.parse(fs.readFileSync('../brands_canonical.json', 'utf-8'));

// 1. Total number of canonical names
const totalCanonical = Object.keys(data).length;

// 2. Total number of surface names
const surfaceCounts = Object.values(data).map(arr => arr.length);
const totalSurface = surfaceCounts.reduce((sum, count) => sum + count, 0);

// 3. Average and standard deviation of surface names per canonical name
const mean = totalSurface / totalCanonical;

const variance = surfaceCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / totalCanonical;
const stdDev = Math.sqrt(variance);

// 4. Count of canonical names by surface name count
const countTable = {};
surfaceCounts.forEach(count => {
  countTable[count] = (countTable[count] || 0) + 1;
});

// Convert to sorted array
const sortedTable = Object.entries(countTable)
  .map(([count, freq]) => ({ surfaceNameCount: Number(count), canonicalCount: freq }))
  .sort((a, b) => b.surfaceNameCount - a.surfaceNameCount);

// Output results
console.log("Statistics:");
console.log(`1. Total canonical names: ${totalCanonical}`);
console.log(`2. Total surface names: ${totalSurface}`);
console.log(`3. Average surface names per canonical: ${mean.toFixed(2)}`);
console.log(`   Standard deviation: ${stdDev.toFixed(2)}`);
console.log("\n4. Canonical name counts by surface name count (descending):");
console.table(sortedTable);
