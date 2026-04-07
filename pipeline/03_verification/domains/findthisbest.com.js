function check(domain,canonical,searchresult,rules){
	if(domain!='findthisbest.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.findthisbest\.com\/brand\/\d+-([^\/]+)$/i)
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
	// region FINDTHISBEST
	if(domain=='findthisbest.com'){
		matches=url.match(/^https:\/\/www\.findthisbest\.com\/brand\/\d+-([^\/]+)$/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
*/
