function check(domain,canonical,searchresult,rules){
	if(domain!='flipkart.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.flipkart\.com\/([^\/]+\/)+([^~]+)~BRAND/i)
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
	// region FLIPKART
	if(domain=='flipkart.com'){
		matches=url.match(/^https:\/\/www\.flipkart\.com\/([^\/]+\/)+([^~]+)~BRAND/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
*/
