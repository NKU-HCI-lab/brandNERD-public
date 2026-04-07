function check(domain,canonical,searchresult,rules){
	if(!['macys.com','staples.com','walgreens.com','medplusmart.com','bedbathandbeyond.com'].includes(domain)) return null
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
	// region OTHERS
	if(['macys.com','staples.com','walgreens.com','medplusmart.com','bedbathandbeyond.com'].includes(domain)){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
*/
