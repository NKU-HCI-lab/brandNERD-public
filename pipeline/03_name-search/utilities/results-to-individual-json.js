const fs=require('fs');
const FILE_RULES='../01_canonicalization/rules.js'; // Location of file containing the rules (input)
const rules=require(FILE_RULES);
let files=fs.readdirSync('./results_OLD_no_snippet');
if(!fs.existsSync('./output')) fs.mkdirSync('./output');
for(let i=0;i<files.length;i++){
	let data=JSON.parse(fs.readFileSync(`./results_OLD_no_snippet/${files[i]}`,'utf8'));
	let data_keys=Object.keys(data);
	for(let j=0;j<data_keys.length;j++){
		let canonicalkey=rules.canonicalize(data_keys[j]);
		console.log(canonicalkey);
		if(fs.existsSync(`./output/${canonicalkey}.json`)) continue;
		fs.writeFileSync(`./output/${canonicalkey}.json`,JSON.stringify(data[data_keys[j]]));
	}
}