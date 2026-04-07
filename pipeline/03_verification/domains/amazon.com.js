function check(domain,canonical,searchresult,rules){
	if(!['amazon.com','amazon.co.uk','amazon.com.au','amazon.in','amazon.ae','amazon.ca','amazon.sa'].includes(domain)) return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	if(url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(-\/(es|zh)\/)?(music|prime-video)/)) return null; // mapped false to null
	
	let foundBrand=null;
	let matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(-\/(en|es|ar|hi|fr|zh|zh_tw)\/)?(\/gp)?(stores|shop|shops)\/([^\/]+?)\/([^\/]+)(\/.*)?$/i);
	let brand=null;
	if(matches && matches.length>0){
		if(matches[8]==canonical) saveCanonical(canonical,canonical);
		else{
			if(!url.split(/\//).includes('LIST')){
				if(title.match(/^AMAZON\.(COM\.AU|CO\.UK|COM\.MX|ES|COM|CA|CO.UK|IN|DE|CO\.JP)\s*:/)){
					let titleSplit=title.replace(/^AMAZON\.(COM\.AU|CO\.UK|COM\.MX|ES|COM|CA|CO.UK|IN|DE|CO\.JP)/,'').trim().split(/:/);
					brand=titleSplit[0].trim();
					foundBrand=brand;
				}else{
					if(title.includes(`'S AMAZON PAGE`)){
						let titleSplit=title.replace(`'S AMAZON PAGE`,'').trim().split(/:/);
						brand=titleSplit[0].trim();
						foundBrand=brand;
					}else{
						if(rules.canonicalize(title)==canonical) saveCanonical(canonical,canonical);
						else{
							if(matches[8]!='PAGE') saveCanonical(canonical,canonical);
						}
					}
				}
			}
		}
		if(foundBrand){
			//console.log(`${canonical}\t${foundBrand}\t${title}\t${url}`);
			saveSurface(foundBrand);
			saveCanonical(canonical,rules.canonicalize(foundBrand));
		}
		return resultMatch;
	}
	foundBrand=null;
	matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[4]==canonical) saveCanonical(canonical,canonical);
		else{
			if(!url.match(/\/S\?(K=)?/)){
				let canonicalized=rules.canonicalize(matches[4]);
				if(canonicalized==canonical){
					saveSurface(matches[4]);
					saveCanonical(canonical,canonicalized);
				}else{
					if(matches[4].split(/-/).includes(canonical)) saveCanonical(canonical,canonical);
					else{
						if(canonicalized.includes(canonical)) saveAnalyzeLater(domain,`${canonical}\t${matches[4]}\t${url}`);
						else{
							title=title.replace(/AMAZON\.COM\s*:\s*/g,'');
							if(title.indexOf(canonical)==0) saveCanonical(canonical,canonical);
							//else console.log(`${canonical}\t${title}\t${url}`);
						}
					} 
				}
			}
		}
		return resultMatch;
	}else{
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return resultMatch;
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region AMAZON
	// Not a brand
	if(['amazon.com','amazon.co.uk','amazon.com.au','amazon.in','amazon.ae','amazon.ca','amazon.sa'].includes(domain)){
		if(url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(-\/(es|zh)\/)?(music|prime-video)/)) return false;
		
		foundBrand=null;
		matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/(-\/(en|es|ar|hi|fr|zh|zh_tw)\/)?(\/gp)?(stores|shop|shops)\/([^\/]+?)\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[8]==canonical) saveCanonical(canonical,canonical);
			else{
				if(!url.split(/\//).includes('LIST')){
					if(title.match(/^AMAZON\.(COM\.AU|CO\.UK|COM\.MX|ES|COM|CA|CO.UK|IN|DE|CO\.JP)\s*:/)){
						let titleSplit=title.replace(/^AMAZON\.(COM\.AU|CO\.UK|COM\.MX|ES|COM|CA|CO.UK|IN|DE|CO\.JP)/,'').trim().split(/:/);
						brand=titleSplit[0].trim();
						foundBrand=brand;
					}else{
						if(title.includes(`'S AMAZON PAGE`)){
							let titleSplit=title.replace(`'S AMAZON PAGE`,'').trim().split(/:/);
							brand=titleSplit[0].trim();
							foundBrand=brand;
						}else{
							if(rules.canonicalize(title)==canonical) saveCanonical(canonical,canonical);
							else{
								if(matches[8]!='PAGE') saveCanonical(canonical,canonical);
							}
						}
					}
				}
			}
			if(foundBrand){
				//console.log(`${canonical}\t${foundBrand}\t${title}\t${url}`);
				saveSurface(foundBrand);
				saveCanonical(canonical,rules.canonicalize(foundBrand));
			}
			return;
		}
		foundBrand=null;
		matches=url.match(/^https:\/\/(www\.)?amazon\.(com|zh|se|nl|es|br|in|it|ca|fr|co\.uk|de|au|pl|ae|co\.jp|com\.au|com\.br|com\.mx|sa|com\.be|sg|com\.tr|cn|co\.nz|eg)(:443)?\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[4]==canonical) saveCanonical(canonical,canonical);
			else{
				if(!url.match(/\/S\?(K=)?/)){
					let canonicalized=rules.canonicalize(matches[4]);
					if(canonicalized==canonical){
						saveSurface(matches[4]);
						saveCanonical(canonical,canonicalized);
					}else{
						if(matches[4].split(/-/).includes(canonical)) saveCanonical(canonical,canonical);
						else{
							if(canonicalized.includes(canonical)) saveAnalyzeLater(domain,`${canonical}\t${matches[4]}\t${url}`);
							else{
								title=title.replace(/AMAZON\.COM\s*:\s* /g,'');
								if(title.indexOf(canonical)==0) saveCanonical(canonical,canonical);
								//else console.log(`${canonical}\t${title}\t${url}`);
							}
						} 
					}
				}
			}
			return;
		}else{
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
*/
