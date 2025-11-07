// region SETTINGS

const FOLDER_DATASETS='../../datasets';
const FOLDER_CANONICALIZED=`${FOLDER_DATASETS}/01_canonicalized`;
const FILE_CANONICAL_JSON=`${FOLDER_CANONICALIZED}/brands_canonical.json`;  // Location of JSON file containing the canonical brands (output)
const FILE_CANONICAL_CSV=`${FOLDER_CANONICALIZED}/brands_canonical.csv`;  // Location of CSV file containing the canonical brands (output)
const FOLDER_SEARCHRESULTS=`${FOLDER_DATASETS}/03_search-results`;
const FOLDER_VALIDATED=`${FOLDER_DATASETS}/04_validated`;
const FILE_VALIDATED=`${FOLDER_VALIDATED}/validated.csv`;
// endregion
console.log(FOLDER_SEARCHRESULTS);

const fs=require('fs');
/*
const canonicals=fs.readFileSync(FILE_CANONICAL_CSV,'utf8').split(/[\r\n]+/g);
console.log(canonicals);
for(canonical of canonicals){
	if(fs.existsSync(`./results/${canonical}.json`)) fs.copyFileSync(`./results/${canonical}.json`,`./results2/_${canonical}.json`);
}
process.exit();
*/


const validated=fs.existsSync(FILE_VALIDATED) ? fs.readFileSync(FILE_VALIDATED,'utf8').split(/[\r\n]+/g) : [];
const files=fs.readdirSync(FOLDER_SEARCHRESULTS);
for(file of files){
	let canonical=file.replace('.json','').replace(/^_/g,'');
	if(validated.includes(canonical)) continue;
	let content=fs.readFileSync(`${FOLDER_SEARCHRESULTS}/${file}`,'utf8');
	content=JSON.parse(content);
	for(result of content){
		let isValid=checkURL(result.u,canonical);
		if(isValid){
			fs.appendFileSync(FILE_VALIDATED,canonical+'\n');
			validated.push(canonical);
			console.log(canonical);
			break;
		}
	}
}


function checkURL(url,canonical){
	url=url.toLowerCase();
	let canonicalLowerCase=canonical.toLowerCase();
	let urlSplit=url.split(/\//g);
	let matches=[];
	
	// region WALMART
	matches=url.match(/^https:\/\/www\.walmart\.ca\/(en|fr)\/c\/brand\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[2].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/www\.walmart\.(com|ca)\/brand\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[2].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www|business)\.walmart\.com\/c\/brand\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[2].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/walmart\.com\/c\/brand\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[1].toLowerCase()==canonicalLowerCase){
		fs.appendFileSync(FILE_VALIDATED,canonical+'\n');
		validated.push(canonical);
		return true;
	}
	matches=url.match(/^https:\/\/(www|business)\.walmart\.com\/c\/(brand|kp)\/([^\/]+)\?.*/i);
	if(matches && matches.length>0 && matches[3].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/www\.walmart\.com\/(tp|cp|ip)\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[2].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www\.)?walmart\.com\/browse\//i);
	if(matches && matches.length>0){
		if(urlSplit.includes(canonicalLowerCase)){
			return true;
		}
	}
	// endregion
	
	// region AMAZON
	// Not a brand
	if(url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(music|prime-video)/)) return false;
	
	// Not a brand
	if(url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/-\/(es|zh)\/(music|prime-video)/)) return false;
	
	// Not a brand
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(stores|shop|shops)\/[^\/]+\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[5].toLowerCase()==canonicalLowerCase){
		return false;
	}
	
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/-\/(en|es|ar|hi|fr|zh|zh_tw)\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[5].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/-\/(en|es|ar|hi|fr|zh|zh_tw)\/stores\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[5].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(stores|shop|shops)\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[5].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/gp\/shops\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[4].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[4].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	// region HOME DEPOT
	matches=url.match(/^https:\/\/www\.homedepot\.com\/b\/([^\/]+)/i);
	if(matches && matches.length>0 && matches[1].toLowerCase()==canonicalLowerCase){
		return true;
	}
	matches=url.match(/^https:\/\/www\.homedepot\.com\/b\/[^\/]+\/([^\/]+)/i);
	if(matches && matches.length>0 && matches[1].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	
	// region TARGET
	matches=url.match(/^https:\/\/www\.target\.com\/b\/([^\/]+)\/.*/i);
	if(matches && matches.length>0 && matches[1].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	
	// region CYBERDEALS
	matches=url.match(/^https:\/\/(www\.)?cyberdeals\.[a-z]{2,3}\/brand\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[2].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	// region PETCO
	matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/brand\/([^\/]+)/i);
	if(matches && matches.length>0 && matches[1].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	// region POSHMARK
	matches=url.match(/^https:\/\/(www\.)?poshmark\.(com|ca)\/brand(s?)\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[4].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	
	// region TRUSTED .COM WEBSITES
	matches=url.match(/^https:\/\/(www\.)?trueshotammo\.(com|ca)\/brand(s?)\/([^\/]+)(\/.*)?/i);
	matches=url.match(/^https:\/\/(www\.)?convenienza\.com\/brand(s?)\/([^\/]+)(\/.*)?/i);
	matches=url.match(/^https:\/\/(www\.)?petadd\.com\.au\/brand(s?)\/([^\/]+)(\/.*)?/i);
	matches=url.match(/^https:\/\/(www\.)?shopabunda\.com\/brand(s?)\/([^\/]+)(\/.*)?/i);
	if(matches && matches.length>0 && matches[3].toLowerCase()==canonicalLowerCase){
		return true;
	}
	// endregion
	
	// region NOT TRUSTED WEBSITES
	if(url.match(/https:\/\/(www\.)?((nepal|guinea|algeria|kosovo|barbados|guam|macao|barbabos|liberia)\.)?(u-buy|ubuy)/i)) return false;
	if(url.match(/https:\/\/([a-z]+\.)?(reviewmeta|desertcart)\./i)) return false;
	// endregion
	
	
	// url.toLowerCase().split(/\//g).includes('brand') &&  url.toLowerCase().match(/^https:\/\/(www\.)?convenienza\./i) &&false
	if(url.toLowerCase().split(/\//g).includes(canonicalLowerCase)) console.log(`${canonical}\t${url}`);
	return false;
}