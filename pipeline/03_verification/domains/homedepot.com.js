function check(domain,canonical,searchresult,rules){
	if(domain!='homedepot.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^https:\/\/www\.homedepot\.com\/b\/([^\/]+)/i);
	if(matches && matches.length>0){
		let title_canonical=rules.canonicalize(title.split(' - ')[0]);
		if(canonical==title_canonical) saveCanonical(canonical,canonical);
		else{
			if(title.includes(' - THE HOME DEPOT')){
				// save for later console.log(`${canonical}\t${title.split(' - ')[0]}\t${url}`);
			}
			
		} 
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region HOME DEPOT
	if(domain=='homedepot.com'){
		matches=url.match(/^https:\/\/www\.homedepot\.com\/b\/([^\/]+)/i);
		if(matches && matches.length>0){
			let title_canonical=rules.canonicalize(title.split(' - ')[0]);
			if(canonical==title_canonical) saveCanonical(canonical,canonical);
			else{
				if(title.includes(' - THE HOME DEPOT')){
					// save for later console.log(`${canonical}\t${title.split(' - ')[0]}\t${url}`);
				}
				
			} 
		}
		return;
	}
	// endregion
*/
