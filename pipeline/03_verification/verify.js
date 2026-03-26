// region SETTINGS
const RESTART=true
const WRITE_REPORTS=true
const WRITEFILE_AT_EACH_ENTRY=true
const FOLDER_DATASETS='../../datasets' // Folder containing the datasets
const FOLDER_INPUT_SEARCHRESULTS=`${FOLDER_DATASETS}/02_web-search-results` // Folder containing the search results
const FOLDER_OUTPUT_SEARCHRESULTS_VERIFIED=`${FOLDER_DATASETS}/03_verified` // Folder containing verified brands
const FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES=`${FOLDER_OUTPUT_SEARCHRESULTS_VERIFIED}/verified_surface.csv` // File with the verified surface names
const FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS=`${FOLDER_OUTPUT_SEARCHRESULTS_VERIFIED}/verified_canonicals.csv` // File with the verified canonical names
const FILE_OUTPUT_VERIFIED_CONFIDENCE=`${FOLDER_OUTPUT_SEARCHRESULTS_VERIFIED}/verified_confidence.json` // File with the confidence scores

const FILE_INPUT_NODOMAINS=`../02_web-search/nodomains.tsv` // File containing the domain blocklist
const FILE_OUTPUT_ANALYZE_LATER='./analyze_later.json';
const FILE_OUTPUT_PATTERNS='./patterns.json';
const FILE_RULES='../01_canonicalization/_lib.canonicalization-rules.js' // File containing the canonicalization rules 
const FOLDER_DOMAINFILTERS='./domains'
const FOLDER_REPORTS='./reports'
 
// endregion
const fs=require('fs')

// Load the canonicalization rules
const rules=require(FILE_RULES) 

// Load all domain filters
const domainFiltersFiles=fs.readdirSync(FOLDER_DOMAINFILTERS)
const domainFilters=[]
for(const domainFilterFile of domainFiltersFiles) domainFilters.push(require(`${FOLDER_DOMAINFILTERS}/${domainFilterFile}`))

// Load blocklisted domains
let DOMAINS_DONTUSE=fs.existsSync(FILE_INPUT_NODOMAINS) ? fs.readFileSync(FILE_INPUT_NODOMAINS,'utf8').split(/[\r\n]+/g) : []
DOMAINS_DONTUSE=[...new Set(DOMAINS_DONTUSE)].sort((a,b)=>a.localeCompare(b))
fs.writeFileSync(FILE_INPUT_NODOMAINS,DOMAINS_DONTUSE.join('\n'), 'utf8')


// Initialize files
if(RESTART){
	fs.writeFileSync(FILE_OUTPUT_PATTERNS,'{}')
	fs.writeFileSync(FILE_OUTPUT_ANALYZE_LATER,'{}')
	fs.writeFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS,'')
	fs.writeFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES,'')
}

// Create the reports folder
if(WRITE_REPORTS && !fs.existsSync(FOLDER_REPORTS)) fs.mkdirSync(FOLDER_REPORTS)
const reportFiles=fs.readdirSync(FOLDER_REPORTS)
for(const reportFile of reportFiles) fs.unlinkSync(`${FOLDER_REPORTS}/${reportFile}`)

// Load data
let verified_canonicals=fs.existsSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS) ? fs.readFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS,'utf8').split(/[\r\n]+/) : []
let verified_surfacenames=fs.existsSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES) ? fs.readFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES,'utf8').split(/[\r\n]+/) : []

fs.writeFileSync(FILE_OUTPUT_VERIFIED_CONFIDENCE,'{}')
let validatedConfidence={}

let saveforlater=fs.existsSync(FILE_OUTPUT_ANALYZE_LATER) ? JSON.parse(fs.readFileSync(FILE_OUTPUT_ANALYZE_LATER,'utf8')) : {}
let patterns=fs.existsSync(FILE_OUTPUT_PATTERNS) ? JSON.parse(fs.readFileSync(FILE_OUTPUT_PATTERNS,'utf8')) : {}

// Loop over folders
const folders=fs.readdirSync(FOLDER_INPUT_SEARCHRESULTS,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name)
for(const folder of folders){
	// Loop over files
	const files=fs.readdirSync(`${FOLDER_INPUT_SEARCHRESULTS}/${folder}`)
	for(const file of files){
		const canonical=file.replace('.json','').replace(/^_/g,'')
		// Loop over the search resuls
		const results=JSON.parse(fs.readFileSync(`${FOLDER_INPUT_SEARCHRESULTS}/${folder}/${file}`,'utf8'))
		if(!validatedConfidence[canonical]) validatedConfidence[canonical]={t:results.length,c:{}}
		for(const result of results){
			const domain=domainFromUrl(result.u)
			if(!domain) continue
			// Do not process blocklisted domains
			if(DOMAINS_DONTUSE.includes(domain)) continue
			
			const output=checkURL(domain,canonical,result)
		}
	}
	if(!WRITEFILE_AT_EACH_ENTRY){
		fs.appendFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS,verified_canonicals.join('\n')+'\n')
		fs.appendFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES,verified_surfacenames.join('\n')+'\n')
		fs.writeFileSync(FILE_OUTPUT_VERIFIED_CONFIDENCE,JSON.stringify(validatedConfidence))
	}
}

function domainFromUrl(url){
	if(url.match(/^\/a\/redirect/)) return null
	let domainURL=url.replace(/^https?:\/\//,'')
	domainURL=domainURL.split(/\//g)[0]
	return domainURL.split('.').length==2 ? domainURL : domainURL.replace(/^[a-zA-Z0-9]+\./,'')
}

function saveConfidence(originalcanonical,foundcanonical,domain){
	if(!validatedConfidence[originalcanonical]) validatedConfidence[originalcanonical]={t:0,c:{}}
	validatedConfidence[originalcanonical].t++
	if(originalcanonical==foundcanonical){
		if(!validatedConfidence[originalcanonical].c[domain]) validatedConfidence[originalcanonical].c[domain]=0
		validatedConfidence[originalcanonical].c[domain]++
	}else{
		if(!validatedConfidence[originalcanonical].alt) validatedConfidence[originalcanonical].alt={}
		if(!validatedConfidence[originalcanonical].alt[foundcanonical]) validatedConfidence[originalcanonical].alt[foundcanonical]=0
		validatedConfidence[originalcanonical].alt[foundcanonical]++
	}
	if(WRITEFILE_AT_EACH_ENTRY) fs.writeFileSync(FILE_OUTPUT_VERIFIED_CONFIDENCE,JSON.stringify(validatedConfidence))
}

function saveSurface(surface){
	surface=decodeURIComponent(surface)
	if(verified_surfacenames.includes(surface)) return
	verified_surfacenames.push(surface)
	if(WRITEFILE_AT_EACH_ENTRY) fs.appendFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_SURFACENAMES,`${surface}\n`)
}

function saveCanonical(canonical){
	if(verified_canonicals.includes(canonical)) return
	verified_canonicals.push(canonical)
	if(WRITEFILE_AT_EACH_ENTRY) fs.appendFileSync(FILE_OUTPUT_SEARCHRESULTS_VERIFIED_CANONICALS,`${canonical}\n`)
}

function saveAnalyzeLater(domain,entry){
	return;
	if(!saveforlater[domain]) saveforlater[domain]=[];
	if(saveforlater[domain].includes(entry)) return;
	saveforlater[domain].push(entry);
	fs.writeFileSync(FILE_OUTPUT_ANALYZE_LATER,JSON.stringify(saveforlater));
}

function checkURL(domain,canonical,result){
	result.u=result.u.toUpperCase()
	result.t=result.t.toUpperCase()
	let matches=[]
	
	for(const domainFilter of domainFilters){
		if(!Object.hasOwn(domainFilter,'check')) continue
		const filterResult=domainFilter.check(domain,canonical,result,rules)
		if(filterResult) matches.push(filterResult)
	}
	if(matches.length>0){
		for(const match of matches){
			if(match.s) saveSurface(match.s)
			if(match.c){
				saveCanonical(match.c)
				saveConfidence(canonical,match.c,domain)
			}
			console.log(`${canonical}\t${match.c}\t${domain}\t${result.u}`)
			if(WRITE_REPORTS) fs.appendFileSync(`${FOLDER_REPORTS}/${domain}.tsv`,`${canonical}\t${match.c}\t${domain}\t${result.u}\n`)
		}
		return matches
	}
	
	/*
	if(!patterns[domain]) patterns[domain]=[];
	let replacedURL=url.replace(/^http(s?):\/\/[^\/]+\//i,'');
	if(replacedURL.length>0 && !patterns[domain].includes(replacedURL)){
		patterns[domain].push(replacedURL);
		fs.writeFileSync(FILE_OUTPUT_PATTERNS,JSON.stringify(Object.fromEntries(Object.entries(patterns).sort(([, arrA], [, arrB]) => arrB.length - arrA.length))));
	}*/
	return;
}