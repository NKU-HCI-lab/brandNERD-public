function check(domain,canonical,searchresult,rules){
	if(domain!='gosupps.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.gosupps\.com\/(beauty-)?brands\/([^\.]+)\.html/i)
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
	// region GOSUPPS
	if(domain=='gosupps.com'){
		matches=url.match(/^https:\/\/www\.gosupps\.com\/(beauty-)?brands\/([^\.]+)\.html/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
*/
