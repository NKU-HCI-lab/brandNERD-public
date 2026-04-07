function check(domain,canonical,searchresult,rules){
	if(domain!='officedepot.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.officedepot\.com\/b\/([^\/]+\/)+BRAND([^\/]+)/i)
	if(!matches || matches.length==0) return null
	let result={
		type:'match',
		c:rules.canonicalize(matches[2])
	}
	return result
}
module.exports={check}

/*
ORIGINAL
	// region OFFICEDEPOT
	if(domain=='officedepot.com'){
		matches=url.match(/^https:\/\/www\.officedepot\.com\/b\/([^\/]+\/)+BRAND([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
*/
