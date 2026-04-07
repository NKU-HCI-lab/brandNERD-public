function check(domain,canonical,searchresult,rules){
	if(domain!='sellerratings.com') return null
	
	let url = searchresult.u
	let title = searchresult.t
	let resultMatch = null
	
	function saveCanonical(c1, c2) { resultMatch = { ...resultMatch, type:'match', c:c2 } }
	function saveSurface(s) { resultMatch = { ...resultMatch, type:'match', s:s } }
	function saveAnalyzeLater(d, e) { }
	
	let matches=url.match(/^http(s?):\/\/(www\.)?sellerratings\.com\/amazon\/[a-zA-Z]+\/([^\/]+)(\/.*)?$/i);
	if(matches && matches.length>0){
		if(matches[3]==canonical) saveCanonical(canonical,canonical);
		else{
			if(title.includes(' STORE ON AMAZON.COM ')){
				let brand=title.split(' STORE ON AMAZON.COM ');
				brand=brand[0].trim();
				saveSurface(brand);
				saveCanonical(canonical,rules.canonicalize(brand));
			}else{
				if(title.includes(' PRODUCTS ON AMAZON.COM MARKETPLACE')){
					let brand=title.split(' PRODUCTS ON AMAZON.COM MARKETPLACE');
					brand=brand[0].trim();
					saveSurface(brand);
					saveCanonical(canonical,rules.canonicalize(brand));
				}else{
					if(title.includes(' ON AMAZON.COM MARKETPLACE')){
						let brand=title.split(' ON AMAZON.COM MARKETPLACE');
						brand=brand[0].trim();
						saveSurface(brand);
						saveCanonical(canonical,rules.canonicalize(brand));
					}
				}
			}
		}
	}
	return resultMatch;
}
module.exports={check}

/*
ORIGINAL
	// region SELLERRATINGS.COM
	if(domain=='sellerratings.com'){
		matches=url.match(/^http(s?):\/\/(www\.)?sellerratings\.com\/amazon\/[a-zA-Z]+\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[3]==canonical) saveCanonical(canonical,canonical);
			else{
				if(title.includes(' STORE ON AMAZON.COM ')){
					let brand=title.split(' STORE ON AMAZON.COM ');
					brand=brand[0].trim();
					saveSurface(brand);
					saveCanonical(canonical,rules.canonicalize(brand));
				}else{
					if(title.includes(' PRODUCTS ON AMAZON.COM MARKETPLACE')){
						let brand=title.split(' PRODUCTS ON AMAZON.COM MARKETPLACE');
						brand=brand[0].trim();
						saveSurface(brand);
						saveCanonical(canonical,rules.canonicalize(brand));
					}else{
						if(title.includes(' ON AMAZON.COM MARKETPLACE')){
							let brand=title.split(' ON AMAZON.COM MARKETPLACE');
							brand=brand[0].trim();
							saveSurface(brand);
							saveCanonical(canonical,rules.canonicalize(brand));
						}
					}
				}
			}
		}
		return;
	}
*/
