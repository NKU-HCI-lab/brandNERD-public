function check(domain,canonical,searchresult,rules){
	if(domain!='target.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^https:\/\/www\.target\.com\/b\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[1]==canonical) saveCanonical(canonical,canonical);
		else{
			if(title.includes(` PRODUCTS AT TARGET`)){
				let brand=title.replace(` PRODUCTS AT TARGET`,'').trim();
				saveSurface(brand);
				saveCanonical(canonical,rules.canonicalize(brand));
			}else{
				if(title.includes(` : TARGET`)){
					let brand=title.replace(` : TARGET`,'').split(':');
					saveSurface(brand[0]);
					saveCanonical(canonical,rules.canonicalize(brand[0]));
				}else{
					saveCanonical(canonical,rules.canonicalize(matches[1]));
				}
			} 
		}
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region TARGET
	if(domain=='target.com'){
		matches=url.match(/^https:\/\/www\.target\.com\/b\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[1]==canonical) saveCanonical(canonical,canonical);
			else{
				if(title.includes(` PRODUCTS AT TARGET`)){
					let brand=title.replace(` PRODUCTS AT TARGET`,'').trim();
					saveSurface(brand);
					saveCanonical(canonical,rules.canonicalize(brand));
				}else{
					if(title.includes(` : TARGET`)){
						let brand=title.replace(` : TARGET`,'').split(':');
						saveSurface(brand[0]);
						saveCanonical(canonical,rules.canonicalize(brand[0]));
					}else{
						saveCanonical(canonical,rules.canonicalize(matches[1]));
					}
				} 
			}
		}
		return;
	}
	// endregion
*/
