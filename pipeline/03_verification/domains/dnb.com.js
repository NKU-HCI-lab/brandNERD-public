function check(domain,canonical,searchresult,rules){
	if(domain!='dnb.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.dnb\.com\/business-directory\/company-profiles\.([^\.]+)\./i)
	if(!matches || matches.length==0) return null
	let result={
		type:'match',
		c:rules.canonicalize(matches[1])
	}
	return result
}
module.exports={check}

/*
ORIGINAL
	// region DNB
	if(domain=='dnb.com'){
		matches=url.match(/^https:\/\/www\.dnb\.com\/business-directory\/company-profiles\.([^\.]+)\./i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
