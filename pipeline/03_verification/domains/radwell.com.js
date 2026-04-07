function check(domain,canonical,searchresult,rules){
	if(domain!='radwell.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.radwell\.com\/(en-us\/)?buy\/([^\/]+)/i)
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
	// region RADWELL
	if(domain=='radwell.com'){
		matches=url.match(/^https:\/\/www\.radwell\.com\/(en-us\/)?buy\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
*/
