/* BEGIN SETTINGS */
const FILE_RULES='../01_canonicalization/rules.js'; // Location of file containing the rules (input)
const FILE_CANONICAL='../../datasets/01_canonicalizated/brands_canonical.json';  // Location of file containing the canonical brands (input)
const FILE_VALIDATED_CANONICAL='../../datasets/03_search-results/validator_validated_canonical.csv';  // Location of file containing the validated brands (output)
const FILE_PROCESSED_CANONICAL='../../datasets/03_search-results/validator_processed_canonical.csv';  // Location of file containing the processed brands (output)
const FOLDER_RESULTS='../../datasets/03_search-results/results'; // Location of folder containing the search results
const FOLDER_BACKUP='../../datasets/03_search-results/backup'; // Location of folder containing the search results
const COORDINATE_CAPTCHA_X=655; // Coordinates of the "I am a human" button
const COORDINATE_CAPTCHA_Y=272; // Coordinates of the "I am a human" button
const START_INDEX_CANONICAL=0; // index to start from
/* END SETTINGS */

const fs=require('fs');
const path=require('path');
const {Builder,By,until}=require('selenium-webdriver');
const cheerio=require('cheerio');
const robot=require('robotjs');
const rules=require(FILE_RULES); // Load the rules function from rules.js

if(!fs.existsSync(FILE_CANONICAL)){
	console.log('Canonical file is missing');
	process.exit();
}

// Create backups
console.log('Creating backups');
if(!fs.existsSync(FOLDER_BACKUP)) fs.mkdirSync(FOLDER_BACKUP);
if(fs.existsSync(FILE_VALIDATED_CANONICAL)) fs.copyFileSync(FILE_VALIDATED_CANONICAL,`${FOLDER_BACKUP}/${path.basename(FILE_VALIDATED_CANONICAL)}`);
if(fs.existsSync(FILE_PROCESSED_CANONICAL)) fs.copyFileSync(FILE_PROCESSED_CANONICAL,`${FOLDER_BACKUP}/${path.basename(FILE_PROCESSED_CANONICAL)}`);

// Create the folder for storing the results
if(!fs.existsSync(FOLDER_RESULTS)) fs.mkdirSync(FOLDER_RESULTS);

// Load brands as a unique array
const brands_canonical=JSON.parse(fs.readFileSync(FILE_CANONICAL,'utf8'));
const brands_canonical_keys=Object.keys(brands_canonical);
console.log(`${brands_canonical_keys.length} canonical brands found.`); 

// Load brands that have been already validated or processed
console.log('Calculating brands to be processed (this might take a while)');
var validated_brands_canonical=[];
if(fs.existsSync(FILE_VALIDATED_CANONICAL)){
	let lines=fs.readFileSync(FILE_VALIDATED_CANONICAL,'utf8').split(/[\r\n]+/);
	for(let i=0;i<lines.length;i++){
		let l=lines[i].split(/\t/g);
		if(l.length==3 && validated_brands_canonical.indexOf(l[0])<0) validated_brands_canonical.push(l[0]);
	}
	fs.writeFileSync(FILE_VALIDATED_CANONICAL,[...new Set(lines)].join('\n')+'\n')
}
var processed_brands_canonical=fs.existsSync(FILE_PROCESSED_CANONICAL) ? fs.readFileSync(FILE_PROCESSED_CANONICAL,'utf8').split(/[\r\n]+/).concat(validated_brands_canonical) : [];
let files=fs.readdirSync(FOLDER_RESULTS);
for(let i=0;i<files.length;i++) processed_brands_canonical.push(files[i].replace('.json',''));
processed_brands_canonical=[...new Set(processed_brands_canonical)];
fs.writeFileSync(FILE_PROCESSED_CANONICAL,processed_brands_canonical.join('\n')+'\n');
console.log(`${processed_brands_canonical.length} brands processed (${Math.round((processed_brands_canonical.length/brands_canonical_keys.length).toFixed(4)*100,2)}%)`);

// Browser automation timeoutss
var captchaTimeout=null; // Timeout for the "I am a human" button
var captchaClickInterval=null;
var shutdownTimeout=null;
var driver;

runValidator();

// Stops processing for X milliseconds
function wait(ms){
	return new Promise(resolve=>setTimeout(resolve,ms));
}

// Main browser automation function
async function runValidator(){
	// Create a new instance of the browser
	driver=await new Builder().forBrowser('chrome').build();
	
	// loop through canonical brands
	for(let i=START_INDEX_CANONICAL;i<brands_canonical_keys.length;i++){
		let brand_canonical=brands_canonical_keys[i]; // Canonical brand currently under observation
		
		process.stdout.write(`Processing ${i} - ${brand_canonical} (${Math.round((i/brands_canonical_keys.length).toFixed(4)*100,2)}%)`);
		
		// Do not process the brand if it has been processed already
		if(processed_brands_canonical.indexOf(brand_canonical)>-1 || brand_canonical.length==0){
			process.stdout.write(' already processed.\n');
			continue;
		}
		
		let result=await searchBrandCanonical(brand_canonical);
		// Add brands to processed brands
		processed_brands_canonical.push(brand_canonical);
		fs.appendFileSync(FILE_PROCESSED_CANONICAL,brand_canonical+'\n');
	}
	await driver.quit();
}

// Process canonical brand
async function searchBrandCanonical(brand_canonical){
	let canonical_found=false;
	// Process each of the brands within the canonical group
	for(let i=0;i<brands_canonical[brand_canonical].length;i++){
		let brand=brands_canonical[brand_canonical][i]; // Brand currently under observation
		process.stdout.write('.');
		
		if(brand.length==0) continue;
		
		let pageContent=await searchBrand(brand,brand_canonical);
		if(pageContent.length==0) continue;

		// Process and save the results 
		let results=processResults(brand_canonical,brand,pageContent);
		await wait(2000); // Wait before next 

		// brand not found, try next brand within canonical
		if(results>0){
			validated_brands_canonical.push(brand_canonical);
			process.stdout.write(`${brand} validated`);
			break;
		}
	}
	process.stdout.write('\n');
}

async function searchBrand(brand,brand_canonical){
	try{
		// Load URL
		const url='https://search.brave.com/search?q=brand+amazon+'+encodeURIComponent(brand);
		await driver.get(url);
		setCaptchaTimeout(); // Take care of the "I am a human" captcha
		
		// Prevent the browser from crashing without handling 
		shutdownGracefully();
		
		// Find the query results
		await driver.wait(until.elementLocated(By.css('#results')),1000000);
		
		// The results were loaded, stop the timers 
		clearTimeout(shutdownTimeout);
		clearInterval(captchaClickInterval);
		clearTimeout(captchaTimeout);
		
		// Retrieve the full page source (HTML)
		let pageContent=await driver.getPageSource();
				
		return pageContent;
	}catch (error) {
		console.error('Error fetching page content:', error);
		await driver.quit();
		process.exit();
	}
}

function processResults(brand_canonical,brand,pageContent){
	// Handle CSS selectors
	const $=cheerio.load(pageContent);
	
	// Handle results
	let results=[];
	$('#results .snippet').each((j,elem) =>{
		let title=$(elem).find('.title').first().text().trim();
		let url=$(elem).find('a').attr('href');
		if(url) url=url.trim();
		const snippet=$(elem).find('.snippet-description.desktop-default-regular').text().trim();
		if(title && url && title.length>0 && url.length>0) results.push({t:title,u:url,s:snippet})
	});
	if(results.length==0) return 0; // No results

	// Store the results
	fs.writeFileSync(`${FOLDER_RESULTS}/${brand_canonical}.json`,JSON.stringify(results));

	for(let i=0;i<results.length;i++){
		// Capitalize the title
		results[i].t=results[i].t.toUpperCase();
		
		// Check if the brand appears as is on Amazon, Poshmark, Target, Walmart
		let title=results[i].t.replace(/[^a-zA-Z0-9]+(POSHMARK|TARGET|WALMART BUSINESS)/g,'').replace(/(SHOP THE BRAND|AMAZON\.COM|WALMART\.COM|AMAZON\.CO\.UK|THE HOME DEPOT)[^a-zA-Z0-9]+/g,'').trim();
		
		let simplified=rules.simplify(title).trim();
		if(title.trim()==brand || simplified==brand || rules.canonicalize(title)==brand_canonical && results[i].u){
			fs.appendFileSync(FILE_VALIDATED_CANONICAL,`${brand_canonical}\t${brand}\t${results[i].u}\n`);
			return 2; // The brand name was found
		}
	}
	for(let i=0;i<results.length;i++){
		let matches=[];
		// Amazon
		matches=results[i].u.match(/"https:\/\/www.amazon.com\/stores\/([^\/]+)[^"]+"/i);
		if(matches && matches[1] && rules.canonicalize(matches[1].toUpperCase())==brand_canonical){
			fs.appendFileSync(FILE_VALIDATED_CANONICAL,`${brand_canonical}\t${brand}\t${results[i].u}\n`);
			return 1;
		}
		
		// Walmart
		matches=results[i].u.match(/"https:\/\/www.walmart.com\/cp\/([^\/]+)[^"]+"/i);
		if(matches && matches[1] && rules.canonicalize(matches[1].toUpperCase())==brand_canonical){
			fs.appendFileSync(FILE_VALIDATED_CANONICAL,`${brand_canonical}\t${brand}\t${results[i].u}\n`);
			return 1;
		}
		
		matches=results[i].u.match(/"https:\/\/www.walmart.com\/brand\/([^\/]+)[^"]+"/i);
		if(matches && matches[1] && rules.canonicalize(matches[1].toUpperCase())==brand_canonical){
			fs.appendFileSync(FILE_VALIDATED_CANONICAL,`${brand_canonical}\t${brand}\t${results[i].u}\n`);
			return 1;
		}
		
		// Home Depot
		matches=results[i].u.match(/"https:\/\/www.homedepot.com\/b\/([^\/]+)[^"]+"/i);
		if(matches && matches[1] && rules.canonicalize(matches[1].toUpperCase())==brand_canonical){
			fs.appendFileSync(FILE_VALIDATED_CANONICAL,`${brand_canonical}\t${brand}\t${results[i].u}\n`);
			return 1;
		}
	}
	return -1; // No results after all the checks
}

// Take care of the "I am a human" captcha
function setCaptchaTimeout(){
	clearTimeout(captchaTimeout);
	clearInterval(captchaClickInterval);
	captchaTimeout=setTimeout(()=>{
		process.stdout.write('\x07'); // beep
		robot.moveMouse(COORDINATE_CAPTCHA_X,COORDINATE_CAPTCHA_Y);
		wait(500);
		robot.mouseClick('left');
		captchaClickInterval=setInterval(()=>{
			process.stdout.write('\x07'); // beep
			robot.moveMouse(COORDINATE_CAPTCHA_X,COORDINATE_CAPTCHA_Y);
			wait(500);
			robot.mouseClick('left');
		},1000);
	},5000);
}

function shutdownGracefully(){
	// Prevent the browser from crashing without handling
	shutdownTimeout=setTimeout(async()=>{
		console.log('error - quitting.\n');
		await driver.quit();
		process.exit();
	},300000);
}