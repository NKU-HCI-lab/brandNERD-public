function check(domain,canonical,searchresult,rules){
	if(domain!='acehardware.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.acehardware\.com\/brands\/([^\/]+)/i)
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
	// region ACEHARDWARE
	if(domain=='acehardware.com'){
		matches=url.match(/^https:\/\/www\.acehardware\.com\/brands\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
