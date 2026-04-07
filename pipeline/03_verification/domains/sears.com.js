function check(domain,canonical,searchresult,rules){
	if(domain!='sears.com') return null
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
	// region SEARS
	if(domain=='sears.com'){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
*/
