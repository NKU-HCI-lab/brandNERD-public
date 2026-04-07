function check(domain,canonical,searchresult,rules){
	if(domain!='poshmark.com') return null
	let matches=searchresult.u.match(/^https:\/\/(www\.)?poshmark\.(com|ca)\/brand(s?)\/([^\/]+)(\/.*)?$/i)
	if(matches && matches.length>0){
		/*
		saveAnalyzeLater(domain,`${canonical}\t${matches[4]}\t${searchresult.u}`);
		*/
		return null
	}else{
		matches=searchresult.u.match(/^https:\/\/(www\.)?poshmark\.(com|ca)\/listing\/([^\/]+)(\/.*)?$/i)
		if(matches && matches.length>0){
			if(canonical==rules.canonicalize(searchresult.t.split(' | ')[0])){
				return {
					type:'match',
					s:searchresult.t.split(' | ')[0],
					c:canonical
				}
			}else{
				if(matches[3].split('-').includes(canonical)){
					return { type:'match', c:canonical }
				}else{
					if(rules.canonicalize(matches[3]).indexOf(canonical)==0){
						return { type:'match', c:canonical }
					}
				}
			}
		}
	}
	return null
}
module.exports={check}

/*
ORIGINAL
	// region POSHMARK
	if(domain=='poshmark.com'){
		matches=url.match(/^https:\/\/(www\.)?poshmark\.(com|ca)\/brand(s?)\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0) saveAnalyzeLater(domain,`${canonical}\t${matches[4]}\t${url}`);
		else{
			matches=url.match(/^https:\/\/(www\.)?poshmark\.(com|ca)\/listing\/([^\/]+)(\/.*)?$/i);
			if(matches && matches.length>0){
				if(canonical==rules.canonicalize(title.split(' | ')[0])){
					saveSurface(title.split(' | ')[0]);
					saveCanonical(canonical,canonical);
				}else{
					//console.log(canonical);
					if(matches[3].split('-').includes(canonical)) saveCanonical(canonical,canonical);
					else{
						if(rules.canonicalize(matches[3]).indexOf(canonical)==0) saveCanonical(canonical,canonical);
						//else console.log(`${canonical}\t${title}\t${url}`);
					}
				} //console.log(`${canonical}\t${title}\t${url}`);
			}
		}
		return;
	}
	// endregion
*/
