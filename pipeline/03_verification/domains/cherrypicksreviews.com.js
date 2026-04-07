function check(domain,canonical,searchresult,rules){
	if(domain!='cherrypicksreviews.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/brand\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[3]==canonical) saveCanonical(canonical,canonical);
	}
	matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/sellers\/amazon\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[3]==canonical) saveCanonical(canonical,canonical);
	}
	if(title.includes(' PRODUCT GUIDE: ')){
		let brand=title.split(' PRODUCT GUIDE: ');
		brand=brand[0].trim();
		saveSurface(brand);
		saveCanonical(canonical,rules.canonicalize(brand));
	}else{
		if(title.includes(' REVIEW 20')){
			let brand=title.split(' REVIEW 20');
			brand=brand[0].trim();
			saveSurface(brand);
			saveCanonical(canonical,rules.canonicalize(brand));
		}
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region CHERRYPICKSREVIEWS.COM
	if(domain=='cherrypicksreviews.com'){
		matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/brand\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[3]==canonical) saveCanonical(canonical,canonical);
		}
		matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/sellers\/amazon\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[3]==canonical) saveCanonical(canonical,canonical);
		}
		if(title.includes(' PRODUCT GUIDE: ')){
			let brand=title.split(' PRODUCT GUIDE: ');
			brand=brand[0].trim();
			saveSurface(brand);
			saveCanonical(canonical,rules.canonicalize(brand));
		}else{
			if(title.includes(' REVIEW 20')){
				let brand=title.split(' REVIEW 20');
				brand=brand[0].trim();
				saveSurface(brand);
				saveCanonical(canonical,rules.canonicalize(brand));
			}
		}
		return;
	}
	// endregion
*/
