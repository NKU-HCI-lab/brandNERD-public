/* BEGIN SETTINGS */
const FILE_RULES='../01_canonicalization/rules.js'; // Location of file containing the rules (input)
const FILE_CANONICAL='../../datasets/01_canonical/brands_canonical.json';  // Location of file containing the canonical brands (input)
const FOLDER_RESULTS='../../datasets/03_search-results/results'; // Location of folder containing the search results
const FILE_FAILED='../../datasets/03_search-results/failed.tsv'; // Location of file containing failed results
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

var failed=[];
if(fs.existsSync(FILE_FAILED)){
	failed=fs.readFileSync(FILE_FAILED,'utf8').split(/[\r\n]+/g);
}
// Create the folder for storing the results
if(!fs.existsSync(FOLDER_RESULTS)) fs.mkdirSync(FOLDER_RESULTS,{recursive:true});

// Load brands as a unique array
const brands_canonical=JSON.parse(fs.readFileSync(FILE_CANONICAL,'utf8'));
const brands_canonical_keys=Object.keys(brands_canonical);
console.log(`${brands_canonical_keys.length} canonical brands found.`); 

let files=fs.readdirSync(FOLDER_RESULTS);

// Browser automation timeoutss
var captchaTimeout=null; // Timeout for the "I am a human" button
var captchaClickInterval=null;
var shutdownTimeout=null;
var driver;

var currentBrand=null;
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
		if(failed.includes(brand_canonical)) continue;
		process.stdout.write(`Processing ${i} - ${brand_canonical} (${Math.round((i/brands_canonical_keys.length).toFixed(4)*100,2)}%)`);
		
		if(fs.existsSync(`${FOLDER_RESULTS}/_${brand_canonical}.json`))continue;/*{
			// read file and check that every entry has title, url, and snippet
			const entries=JSON.parse(fs.readFileSync(`${FOLDER_RESULTS}/_${brand_canonical}.json`,'utf8'));
			let complete=entries.length>0;
			for(const entry of entries) if(!entry.t || !entry.u || entry.s){
				complete=false;
				break;
			}
			if(complete){
				process.stdout.write(`...already processed.\n`);
				continue;
			}
		}*/
		let result=await searchBrandCanonical(brand_canonical);
	}
	await driver.quit();
}

// Process canonical brand
async function searchBrandCanonical(brand_canonical){
	let canonical_found=false;
	let brandNames=[brand_canonical]//.concat(brands_canonical[brand_canonical]);
	
	let results=[];
	// Process each of the brands within the canonical group
	for(let brandName of brandNames){
		if(brandName.trim().length==0) continue;
		
		let pageContent=await searchBrand(brandName);
		if(pageContent.length==0) continue;

		// Process and save the results 
		results=results.concat(processResults(brandName,pageContent));
		if(results.length>0) fs.writeFileSync(`${FOLDER_RESULTS}/_${brand_canonical}.json`,JSON.stringify(results));
		await wait(2000); // Wait before next 

	}
	process.stdout.write(`${results.length}\n`);
}

async function searchBrand(brand){
	try{
		// Load URL
		const url='https://search.brave.com/search?q=buy+'+encodeURIComponent(brand);
		await driver.get(url);
		setCaptchaTimeout(); // Take care of the "I am a human" captcha
		
		currentBrand=brand;
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

function processResults(name,pageContent){
	// Handle CSS selectors
	const $=cheerio.load(pageContent);
	
	// Handle results
	let results=[];
	$('#results .snippet').each((j,elem) =>{
		let title=$(elem).find('.title').first().text().trim();
		let url=$(elem).find('a').attr('href');
		if(url) url=url.trim();
		const snippet=$(elem).find('.generic-snippet').text().trim();
		if(title && url && title.length>0 && url.length>0) results.push({k:name,t:title,u:url,s:snippet})
	});
	return results.length==0 ? [] : results; // No results
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
		fs.appendFileSync(FILE_FAILED,currentBrand+'\n');
		console.log(`error - quitting:${currentBrand}.\n`);
		await driver.quit();
		process.exit();
	},30000);
}