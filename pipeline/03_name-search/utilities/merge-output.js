const fs = require('fs');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt function wrapped in a promise for use with async/await
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// Main function
async function main() {
  try {
    // Ask for file paths
    const file1Path = await ask('Enter the path to file1: ');
    const file2Path = await ask('Enter the path to file2: ');

    // Read files synchronously
    const file1Data = fs.readFileSync(file1Path, 'utf-8');
    const file2Data = fs.readFileSync(file2Path, 'utf-8');

    // Split into lines and merge without duplicates
    const lines1 = file1Data.split(/\r?\n/).filter(Boolean);
    const lines2 = file2Data.split(/\r?\n/).filter(Boolean);
    const uniqueLines = Array.from(new Set([...lines1, ...lines2]));

    // Write to output.csv
    fs.writeFileSync('output.csv', uniqueLines.join('\n'), 'utf-8');
    console.log('Merged output saved to output.csv');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
