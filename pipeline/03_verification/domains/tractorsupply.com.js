function check(domain,canonical,searchresult,rules){
	if(domain!='tractorsupply.com') return null
	matches=searchresult.u.match(/^https:\/\/www\.tractorsupply\.com\/tsc\/brand\/([^\/]+)/i)
	if(!matches || matches.length==0) return null
	let result={
		type:'match',
		c:rules.canonicalize(matches[1].split('?')[0]),
		s:matches[1].split('?')[0].replaceAll('+',' ')
	}
	return result
}
module.exports={}

/*
ORIGINAL
// region TRACTORSUPPLY
if(domain=='tractorsupply.com'){
	matches=url.match(/^https:\/\/www\.tractorsupply\.com\/tsc\/brand\/([^\/]+)/i);
	if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]).split('CMRESHOPBYBRANDBRANDLINK')[0]);
	return;
}
// endregion
*/