function check(domain,canonical,searchresult,rules){
	if(domain!='walmart.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^https:\/\/((www|business)\.)?walmart\.(com|ca)(\/(en|fr))?(\/c)?\/brand\/([^\/]+)(\/.*)?$/i);
	let foundBrand=null;
	if(matches && matches.length>0){
		if(matches[7]==canonical) saveCanonical(canonical,canonical); 
		else{
			if(title.includes('BRAND: ')){
				let brand=title.replace('BRAND: ','').trim();
				brand=brand.replace(' - WALMART.COM','');
				brand=brand.trim();
				foundBrand=brand;
			}else{
				if(title.includes(' COLLECTION')){
					let brand=title.replace(' COLLECTION','').trim();
					brand=brand.replace(' - WALMART.COM','');
					brand=brand.trim();
					foundBrand=brand;
				}else{
					let brand=title.replace(' - WALMART.COM','').trim();
					foundBrand=brand;
				}
			}
		}
		if(foundBrand){
			saveSurface(foundBrand);
			saveCanonical(canonical,rules.canonicalize(foundBrand));
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
	// region WALMART
	if(domain=='walmart.com'){
		matches=url.match(/^https:\/\/((www|business)\.)?walmart\.(com|ca)(\/(en|fr))?(\/c)?\/brand\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[7]==canonical) saveCanonical(canonical,canonical); 
			else{
				if(title.includes('BRAND: ')){
					let brand=title.replace('BRAND: ','').trim();
					brand=brand.replace(' - WALMART.COM','');
					brand=brand.trim();
					foundBrand=brand;
				}else{
					if(title.includes(' COLLECTION')){
						let brand=title.replace(' COLLECTION','').trim();
						brand=brand.replace(' - WALMART.COM','');
						brand=brand.trim();
						foundBrand=brand;
					}else{
						let brand=title.replace(' - WALMART.COM','').trim();
						foundBrand=brand;
					}
				}
			}
			if(foundBrand){
				saveSurface(foundBrand);
				saveCanonical(canonical,rules.canonicalize(foundBrand));
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
