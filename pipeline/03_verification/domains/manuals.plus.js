function check(domain,canonical,searchresult,rules){
	if(domain!='manuals.plus') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^http(s?):\/\/(www\.)?manuals\.plus(\/category)?\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[4]==canonical) saveCanonical(canonical,canonical);
		else{
			if(!['M','TAG','QA','ASIN','VIDEO'].includes(matches[4])){
				saveSurface(matches[4]);
				saveCanonical(canonical,rules.canonicalize(matches[4]));
			}
		}
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region MANUALS.PLUS
	if(domain=='manuals.plus'){
		matches=url.match(/^http(s?):\/\/(www\.)?manuals\.plus(\/category)?\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[4]==canonical) saveCanonical(canonical,canonical);
			else{
				if(!['M','TAG','QA','ASIN','VIDEO'].includes(matches[4])){
					saveSurface(matches[4]);
					saveCanonical(canonical,rules.canonicalize(matches[4]));
				}
			}
		}
		return;
	}
*/
