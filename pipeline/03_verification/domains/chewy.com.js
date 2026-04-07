function check(domain,canonical,searchresult,rules){
	if(domain!='chewy.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.chewy\.com\/brands\/([^\/]+)/i)
	if(matches && matches.length>0){
		matches[1]=matches[1].split('-')
		matches[1].pop()
		let result={
			type:'match',
			c:rules.canonicalize(matches[1])
		}
		return result
	}
	return null
}
module.exports={check}

/*
ORIGINAL
	// region CHEWY
	if(domain=='chewy.com'){
		matches=url.match(/^https:\/\/www\.chewy\.com\/brands\/([^\/]+)/i);
		if(matches && matches.length>0){
			matches[1]=matches[1].split('-');
			matches[1].pop();
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}
		return;
	}
	// endregion
*/
