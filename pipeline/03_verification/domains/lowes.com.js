function check(domain,canonical,searchresult,rules){
	if(domain!='lowes.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.lowes\.com\/b\/([^\/]+)$/i)
	if(matches && matches.length>0){
		let result={
			type:'match',
			c:rules.canonicalize(matches[1])
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
	// region LOWES
	if(domain=='lowes.com'){
		matches=url.match(/^https:\/\/www\.lowes\.com\/b\/([^\/]+)$/i);
		if(matches && matches.length>0){
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}else{
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
*/
