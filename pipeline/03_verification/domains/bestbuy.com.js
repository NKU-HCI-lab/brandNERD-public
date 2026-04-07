function check(domain,canonical,searchresult,rules){
	if(domain!='bestbuy.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^http(s?):\/\/(www\.)?bestbuy\.com\/site\/brands\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[3])); 
	
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region BESTBUY.COM
	if(domain=='bestbuy.com'){
		matches=url.match(/^http(s?):\/\/(www\.)?bestbuy\.com\/site\/brands\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[3])); 
		return;
	}
*/
