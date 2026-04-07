function check(domain,canonical,searchresult,rules){
	if(domain!='alibaba.com') return null
	let matches=searchresult.u.match(/^https:\/\/www\.alibaba\.com\/product-detail\/([^\.]+)\.html/i)
	if(matches && matches.length>0){
		/*
		saveAnalyzeLater(domain,`${canonical}\t${searchresult.t}\t${searchresult.u}`);
		*/
		return null
	}
	return null
}
module.exports={check}

/*
ORIGINAL
	// region ALIBABA
	if(domain=='alibaba.com'){
		matches=url.match(/^https:\/\/www\.alibaba\.com\/product-detail\/([^\.]+)\.html/i);
		if(matches && matches.length>0){
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
*/
