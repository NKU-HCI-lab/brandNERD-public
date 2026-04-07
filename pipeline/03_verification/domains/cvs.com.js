function check(domain,canonical,searchresult,rules){
	if(domain!='cvs.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.cvs\.com\/shop\/brand\-shop\/[^\/+]\/([^\/]+)/i)
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
	// region CVS
	if(domain=='cvs.com'){
		matches=url.match(/^https:\/\/www\.cvs\.com\/shop\/brand\-shop\/[^\/+]\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
