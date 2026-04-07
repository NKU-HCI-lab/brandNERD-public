function check(domain,canonical,searchresult,rules){
	if(domain!='retailmenot.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.retailmenot\.com\/view\/([^\.]+)\./i)
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
	// region RETAILMENOT
	if(domain=='retailmenot.com'){
		matches=url.match(/^https:\/\/www\.retailmenot\.com\/view\/([^\.]+)\./i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
