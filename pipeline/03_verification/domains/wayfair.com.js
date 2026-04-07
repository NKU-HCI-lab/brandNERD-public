function check(domain,canonical,searchresult,rules){
	if(domain!='wayfair.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.wayfair\.com\/brand\/bnd\/([^\.]+)\.html/i)
	if(matches && matches.length>0){
		matches[1]=matches[1].split('-')
		matches[1].pop()
		let result={
			type:'match',
			c:rules.canonicalize(matches[1].join('-'))
		}
		return result
	}else{
		/*
		saveAnalyzeLater(domain,`${canonical}\t${searchresult.t}\t${searchresult.u}`);
		*/
		return null
	}
	return null
}
module.exports={check}

/*
ORIGINAL
	// region WAYFAIR
	if(domain=='wayfair.com'){
		matches=url.match(/^https:\/\/www\.wayfair\.com\/brand\/bnd\/([^\.]+)\.html/i);
		if(matches && matches.length>0){
			matches[1]=matches[1].split('-');
			matches[1].pop();
			saveCanonical(canonical,rules.canonicalize(matches[1].join('-')));
		}else{
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
*/
