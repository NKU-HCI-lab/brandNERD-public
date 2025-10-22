const fs = require('fs');
const readline = require('readline');
const path = require('path');

const filePath = '../../../datasets/02_similarity-clusters/similar_oneway.csv';
const outputCsvPath = './similarity_stats.csv'; // Output CSV file path

(async () => {
  const brandMap = new Map();
  const seenPairs = new Set();
  const seenBrands= new Set();
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const parts = line.split(/\t/);
    if (parts.length < 3) continue;

    let [brand1, brand2] = parts.slice(0, 2).map(x => x.trim().toUpperCase());
    if (!brand1 || !brand2 || brand1 === brand2) continue;

    const pairKey = [brand1, brand2].sort().join('::');
	
    if (!seenBrands.has(brand1)) seenBrands.add(brand1);
    if (!seenBrands.has(brand2)) seenBrands.add(brand2);
    if (seenPairs.has(pairKey)) continue;
	//console.log(pairKey);
    seenPairs.add(pairKey);

    if (!brandMap.has(brand1)) brandMap.set(brand1, new Set());
    if (!brandMap.has(brand2)) brandMap.set(brand2, new Set());

    brandMap.get(brand1).add(brand2);
    brandMap.get(brand2).add(brand1);
  }

  // Calculate statistics
  const similarityCounts = Array.from(brandMap.values()).map(set => set.size);
  const totalBrands = brandMap.size;
  const avgSimilar = similarityCounts.reduce((a, b) => a + b, 0) / totalBrands;
  const stdDev = Math.sqrt(
    similarityCounts.reduce((acc, val) => acc + Math.pow(val - avgSimilar, 2), 0) / totalBrands
  );

  // Grouped counts
  const groupedCounts = {};
  for (const count of similarityCounts) {
    groupedCounts[count] = (groupedCounts[count] || 0) + 1;
  }

  // Format for console.table and CSV
  const tableData = Object.entries(groupedCounts)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([count, numBrands]) => ({
      'Similar Brand Count': parseInt(count),
      'Number of Brands': numBrands,
    }));

  // Output
  console.log(`Total unique brands with similarities: ${seenBrands.size}`);
  console.log(`Total unique brands with similarities: ${totalBrands}`);
  console.log(`Average number of similar brands: ${avgSimilar.toFixed(2)}`);
  console.log(`Standard deviation: ${stdDev.toFixed(2)}\n`);

  console.log('Ranked Similarity Counts (Grouped):');
  console.table(tableData);

  // Save table to CSV
  const csvHeader = 'Similar Brand Count,Number of Brands\n';
  const csvContent = tableData.map(row =>
    `${row['Similar Brand Count']},${row['Number of Brands']}`
  ).join('\n');

  fs.writeFileSync(outputCsvPath, csvHeader + csvContent, 'utf8');
  console.log(`CSV file saved to ${outputCsvPath}`);
})();
