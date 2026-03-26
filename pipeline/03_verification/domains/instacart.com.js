function check(domain,canonical,searchresult,rules){
	if(domain!='instacart.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.instacart\.com\/[^\?]+\?brand=([^\/]+)/i)
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

if(domain=='instacart.com'){
	matches=url.match(/^https:\/\/www\.instacart\.com\/[^\?]+\?brand=([^\/]+)/i);
	if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
	return;
}
*/
