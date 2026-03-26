/* BEGIN SETTINGS */
const SIMILARITY_THRESHOLD=0.9; // Adjust this to expected similarity

const FILE_JAROWINKLER='./_lib.jarowinkler.js'; // Location of file containing the similarity calculation script

const FOLDER_DATASETS='../../datasets';
const FOLDER_DATASETS_CANONICAL=`${FOLDER_DATASETS}/01_canonical`;
const FILE_CANONICAL=`${FOLDER_DATASETS_CANONICAL}/brands_canonical.csv`;  // Location of file containing the canonical brands (input)

const FOLDER_CANONICAL_VALIDATED=`${FOLDER_DATASETS}/04_validated`
const FILE_CANONICAL_VALIDATED=`${FOLDER_CANONICAL_VALIDATED}/validated.csv`;  // Location of file containing the canonical brands (input)

const FOLDER_SIMILARITY=`${FOLDER_DATASETS}/05_similarity_clusters`
const FILE_SIMILAR_VALIDATED_ONEWAY=`${FOLDER_SIMILARITY}/similar_validated_oneway.csv`; // Location of file containing two-way similar strings (output) 
const FILE_SIMILAR_ALL_ONEWAY=`${FOLDER_SIMILARITY}/similar_all_oneway.csv`; // Location of file containing two-way similar strings (output) 
/* END SETTINGS */

const fs=require('fs');
const jaroWinkler=require(FILE_JAROWINKLER); // Load the rules from rules.js

// Convert brands into array and make sure it contains unique values
let brands=fs.readFileSync(FILE_CANONICAL,'utf8').split(/[\r\n]+/);
let brands_validated=fs.readFileSync(FILE_CANONICAL_VALIDATED,'utf8').split(/[\r\n]+/);


fs.writeFileSync(FILE_SIMILAR_VALIDATED_ONEWAY,'');

// Compute similarity for each unique pair
for(let i=0;i<brands.length;i++){
	let similar_oneway=[] // Create an array to store similarity scores 
	console.log(`Processing ${i+1}/${brands.length} - ${brands[i]} (${Math.round(((i+1)/brands.length).toFixed(4)*100,2)}%)`);
	for(let j=0;j<brands_validated.length;j++){
		if(brands[i]==brands_validated[j]){
			similar_oneway=[];
			break;
		}
		// Compare strings using Jaro Winkler
		let similarity_score=jaroWinkler(brands[i],brands_validated[j]);
		if(similarity_score>SIMILARITY_THRESHOLD) similar_oneway.push(`${brands[i]}\t${brands_validated[j]}\t${similarity_score.toFixed(2)}`);
	}
	if(similar_oneway.length>0) fs.appendFileSync(FILE_SIMILAR_VALIDATED_ONEWAY,similar_oneway.join('\n')+'\n');
}

fs.writeFileSync(FILE_SIMILAR_ALL_ONEWAY,'');
for(let i=0;i<brands.length;i++){
	let similar_oneway=[] // Create an array to store similarity scores 
	console.log(`Processing ${i+1}/${brands.length} - ${brands[i]} (${Math.round(((i+1)/brands.length).toFixed(4)*100,2)}%)`);
	for(let j=i+1;j<brands.length;j++){
		if(brands[i]==brands[j]) continue
		// Compare strings using Jaro Winkler
		let similarity_score=jaroWinkler(brands[i],brands[j]);
		if(similarity_score>SIMILARITY_THRESHOLD) similar_oneway.push(`${brands[i]}\t${brands[j]}\t${similarity_score.toFixed(2)}`);
	}
	if(similar_oneway.length>0) fs.appendFileSync(FILE_SIMILAR_ALL_ONEWAY,similar_oneway.join('\n')+'\n');
}