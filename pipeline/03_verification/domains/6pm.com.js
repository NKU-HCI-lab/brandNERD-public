function check(domain,canonical,searchresult,rules){
	if(domain!='6pm.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.6pm\.com\/b\/([^\/]+)\/brand/i)
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
	// region 6PM
	if(domain=='6pm.com'){
		matches=url.match(/^https:\/\/www\.6pm\.com\/b\/([^\/]+)\/brand/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
