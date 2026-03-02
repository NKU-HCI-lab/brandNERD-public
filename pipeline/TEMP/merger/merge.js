const fs = require('fs');
const path = require('path');

const folderPath = path.resolve(__dirname); // change if needed
const outputFile = path.join(folderPath, 'merged.json');

function mergeObjects(target, source) {
  for (const key of Object.keys(source)) {
    if (!target[key]) {
      // If property doesn't exist, add it
      target[key] = source[key];
    } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
      // Merge arrays without duplicates
      const merged = new Set([...target[key], ...source[key]]);
      target[key] = Array.from(merged);
    } else if (
      typeof target[key] === 'object' &&
      typeof source[key] === 'object'
    ) {
      // Deep merge nested objects (if ever needed)
      target[key] = mergeObjects(target[key], source[key]);
    } else {
      // Overwrite in any other case (shouldn't happen in your structure)
      target[key] = source[key];
    }
  }

  return target;
}

function mergeJsonFiles() {
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.json') && file !== 'merged.json');

  let mergedData = {};

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    mergedData = mergeObjects(mergedData, fileContent);
  }

  fs.writeFileSync(outputFile, JSON.stringify(mergedData, null, 2), 'utf8');
  console.log(`Merged ${files.length} files into ${outputFile}`);
}

mergeJsonFiles();