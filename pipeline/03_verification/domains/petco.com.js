function check(domain,canonical,searchresult,rules){
	if(domain!='petco.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/brand\/([^\/]+)/i);
	if(matches && matches.length>0){
		saveCanonical(canonical,rules.canonicalize(matches[1]));
	}else{
		matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/product\/([^\/]+)/i);
		if(matches && matches.length>0){
			if(rules.canonicalize(matches[1]).indexOf(canonical)==0) saveCanonical(canonical,canonical);
		}
	} 
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region PETCO
	if(domain=='petco.com'){
		matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/brand\/([^\/]+)/i);
		if(matches && matches.length>0){
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}else{
			matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/product\/([^\/]+)/i);
			if(matches && matches.length>0){
				if(rules.canonicalize(matches[1]).indexOf(canonical)==0) saveCanonical(canonical,canonical);
			}
		} 
		return;
	}
	// endregion
*/
