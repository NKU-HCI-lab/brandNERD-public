const fs = require('fs');
const readline = require('readline');
const path = require('path');

// File path
const csvPath = '../../../datasets/02_similarity-clusters/similar_oneway.csv';

// Parse CSV into similarity map
function parseCSV(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
    const similarityMap = new Map();

    data.forEach(line => {
        const [brand1, brand2, scoreStr] = line.split(/\s+/);
        const score = parseFloat(scoreStr);

        if (!similarityMap.has(brand1)) similarityMap.set(brand1, []);
        similarityMap.get(brand1).push({ brand: brand2, score });
    });

    // Sort each list by similarity score descending
    for (const [brand, similarList] of similarityMap) {
        similarList.sort((a, b) => b.score - a.score);
    }

    return similarityMap;
}

// Recursive function to build and display the similarity tree
function displayTree(brand, similarityMap, level = 0, visited = new Set()) {
    if (visited.has(brand) || level>2) return;
    visited.add(brand);

    const prefix = ' '.repeat(level);
    const similarBrands = similarityMap.get(brand) || [];

    for (const { brand: similarBrand, score } of similarBrands) {
        console.log(`${prefix}- ${similarBrand} (score: ${score})`);
        displayTree(similarBrand, similarityMap, level + 1, visited);
    }
}

// Main function to run the prompt and tree generation
function main() {
    const similarityMap = parseCSV(csvPath);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter a brand name: ', (inputBrand) => {
        if (!similarityMap.has(inputBrand)) {
            console.log(`Brand "${inputBrand}" not found in the data.`);
        } else {
            console.log(`Similar brands for "${inputBrand}":`);
            displayTree(inputBrand, similarityMap);
        }
        rl.close();
    });
}

main();