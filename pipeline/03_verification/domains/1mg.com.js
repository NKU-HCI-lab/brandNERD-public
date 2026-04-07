function check(domain,canonical,searchresult,rules){
	if(domain!='1mg.com') return null
	/*
	let result={
		type:'analyzelater',
		s:`${canonical}\t${searchresult.t}\t${searchresult.u}`
	}
	return result
	*/
	return null
}
module.exports={check}

/*
ORIGINAL
	// region 1MG
	if(domain=='1mg.com'){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
*/
