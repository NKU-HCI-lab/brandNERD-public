/* BEGIN SETTINGS */
const FILE_RULES='./_lib.canonicalization-rules.js'; // Location of file containing the rules (input)

const FOLDER_DATASETS='../../datasets';
const FOLDER_DATASETS_ORIGINAL=`${FOLDER_DATASETS}/00_original`;
const FOLDER_DATASETS_CANONICAL=`${FOLDER_DATASETS}/01_00_canonical`;

const FILE_BRANDS_ORIGINAL=`${FOLDER_DATASETS_ORIGINAL}/brands.csv`;  // Location of file containing the brands (input)
const FILE_BRANDS_CANONICAL_JSON=`${FOLDER_DATASETS_CANONICAL}/brands_canonical.json`;  // Location of JSON file containing the canonical brands (output)
const FILE_BRANDS_CANONICAL_CSV=`${FOLDER_DATASETS_CANONICAL}/brands_canonical.csv`;  // Location of CSV file containing the canonical brands (output)
/* END SETTINGS */

const fs=require('fs');
const rules=require(FILE_RULES); // Load the rules from rules.js


if(!fs.existsSync(FOLDER_DATASETS_CANONICAL)) fs.mkdirSync(FOLDER_DATASETS_CANONICAL,{recursive:true});

// Convert brands into array and make sure it contains unique values
const brands=[...new Set(fs.readFileSync(FILE_BRANDS_ORIGINAL,'utf8').split(/[\r\n]+/))];
console.log(`${brands.length} unique brands found.`);

// Process surface name to extract canonical nmes
var brands_canonical={};
for(let i=0;i<brands.length;i++){
	if(i%5000==0) console.log(`${i} brands processed (${(i/brands.length).toFixed(2)}%)`);
	let brands_i_rules=rules.canonicalize(brands[i]); // Canonicalizes brand[i]
	if(brands_i_rules.length==0) continue;
	if(!brands_canonical[brands_i_rules]) brands_canonical[brands_i_rules]=[];
	if(brands_canonical[brands_i_rules].indexOf(brands[i])<0) brands_canonical[brands_i_rules].push(brands[i]);
}
// Save the output as CSV and JSON files
fs.writeFileSync(FILE_BRANDS_CANONICAL_JSON,JSON.stringify(brands_canonical));
fs.writeFileSync(FILE_BRANDS_CANONICAL_CSV,Object.keys(brands_canonical).join('\n'));
console.log(`${Object.keys(brands_canonical).length} unique canonical brands found.`);