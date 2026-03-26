

	// region FLIPKART
	if(domain=='flipkart.com'){
		matches=url.match(/^https:\/\/www\.flipkart\.com\/([^\/]+\/)+([^~]+)~BRAND/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// region OFFICEDEPOT
	if(domain=='officedepot.com'){
		matches=url.match(/^https:\/\/www\.officedepot\.com\/b\/([^\/]+\/)+BRAND([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
	
	// region CVS
	if(domain=='cvs.com'){
		matches=url.match(/^https:\/\/www\.cvs\.com\/shop\/brand\-shop\/[^\/+]\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region 1MG
	if(domain=='1mg.com'){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
	
	// region SEARS
	if(domain=='sears.com'){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
	
	// region OTHERS
	if(['macys.com','staples.com','walgreens.com','medplusmart.com','bedbathandbeyond.com'].includes(domain)){
		saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
		return;
	}
	// endregion
	
	// region CHEWY
	if(domain=='chewy.com'){
		matches=url.match(/^https:\/\/www\.chewy\.com\/brands\/([^\/]+)/i);
		if(matches && matches.length>0){
			matches[1]=matches[1].split('-');
			matches[1].pop();
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}
		return;
	}
	// endregion
	
	// region WHIZZCART
	if(domain=='whizzcart.com'){
		matches=url.match(/^https:\/\/www\.whizzcart\.com\/brand\/([^\/]+)\//i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region WHOLEFOODSMARKET
	if(domain=='wholefoodsmarket.com'){
		matches=url.match(/^https:\/\/www\.wholefoodsmarket\.com\/products\/brands\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region 6PM
	if(domain=='6pm.com'){
		matches=url.match(/^https:\/\/www\.6pm\.com\/b\/([^\/]+)\/brand/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region RETAILMENOT
	if(domain=='retailmenot.com'){
		matches=url.match(/^https:\/\/www\.retailmenot\.com\/view\/([^\.]+)\./i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region ACEHARDWARE
	if(domain=='acehardware.com'){
		matches=url.match(/^https:\/\/www\.acehardware\.com\/brands\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region WAYFAIR
	if(domain=='wayfair.com'){
		matches=url.match(/^https:\/\/www\.wayfair\.com\/brand\/bnd\/([^\.]+)\.html/i);
		if(matches && matches.length>0){
			matches[1]=matches[1].split('-');
			matches[1].pop();
			saveCanonical(canonical,rules.canonicalize(matches[1].join('-')));
		}else{
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
	
	// region DNB
	if(domain=='dnb.com'){
		matches=url.match(/^https:\/\/www\.dnb\.com\/business-directory\/company-profiles\.([^\.]+)\./i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	// region FINDTHISBEST
	if(domain=='findthisbest.com'){
		matches=url.match(/^https:\/\/www\.findthisbest\.com\/brand\/\d+-([^\/]+)$/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[1]));
		return;
	}
	// endregion
	
	
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
	
	// region RADWELL
	if(domain=='radwell.com'){
		matches=url.match(/^https:\/\/www\.radwell\.com\/(en-us\/)?buy\/([^\/]+)/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
	
	// region GOSUPPS
	if(domain=='gosupps.com'){
		matches=url.match(/^https:\/\/www\.gosupps\.com\/(beauty-)?brands\/([^\.]+)\.html/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[2]));
		return;
	}
	// endregion
	
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
	
	// region LOWES
	if(domain=='lowes.com'){
		matches=url.match(/^https:\/\/www\.lowes\.com\/b\/([^\/]+)$/i);
		if(matches && matches.length>0){
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}else{
			saveAnalyzeLater(domain,`${canonical}\t${title}\t${url}`);
			return;
		}
		return;
	}
	// endregion
	
	
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
								title=title.replace(/AMAZON\.COM\s*:\s*/g,'');
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
	
	// region HOME DEPOT
	if(domain=='homedepot.com'){
		matches=url.match(/^https:\/\/www\.homedepot\.com\/b\/([^\/]+)/i);
		if(matches && matches.length>0){
			let title_canonical=rules.canonicalize(title.split(' - ')[0]);
			if(canonical==title_canonical) saveCanonical(canonical,canonical);
			else{
				if(title.includes(' - THE HOME DEPOT')){
					// save for later console.log(`${canonical}\t${title.split(' - ')[0]}\t${url}`);
				}
				
			} 
		}
		return;
	}
	// endregion
	
	
	// region TARGET
	if(domain=='target.com'){
		matches=url.match(/^https:\/\/www\.target\.com\/b\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[1]==canonical) saveCanonical(canonical,canonical);
			else{
				if(title.includes(` PRODUCTS AT TARGET`)){
					let brand=title.replace(` PRODUCTS AT TARGET`,'').trim();
					saveSurface(brand);
					saveCanonical(canonical,rules.canonicalize(brand));
				}else{
					if(title.includes(` : TARGET`)){
						let brand=title.replace(` : TARGET`,'').split(':');
						saveSurface(brand[0]);
						saveCanonical(canonical,rules.canonicalize(brand[0]));
					}else{
						saveCanonical(canonical,rules.canonicalize(matches[1]));
					}
				} 
			}
		}
		return;
	}
	// endregion
	
	// region PETCO
	if(domain=='petco.com'){
		matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/brand\/([^\/]+)/i);
		if(matches && matches.length>0){
			saveCanonical(canonical,rules.canonicalize(matches[1]));
		}else{
			matches=url.match(/^https:\/\/www\.petco\.com\/shop\/en\/petcostore\/product\/([^\/]+)/i);
			if(matches && matches.length>0){
				if(rules.canonicalize(matches[1]).indexOf(canonical)==0) saveCanonical(canonical,canonical);
			}
		} 
		return;
	}
	// endregion
	
	
	// region BESTBUY.COM
	if(domain=='bestbuy.com'){
		matches=url.match(/^http(s?):\/\/(www\.)?bestbuy\.com\/site\/brands\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0) saveCanonical(canonical,rules.canonicalize(matches[3])); 
		return;
	}
	
	// region MANUALS.PLUS
	if(domain=='manuals.plus'){
		matches=url.match(/^http(s?):\/\/(www\.)?manuals\.plus(\/category)?\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[4]==canonical) saveCanonical(canonical,canonical);
			else{
				if(!['M','TAG','QA','ASIN','VIDEO'].includes(matches[4])){
					saveSurface(matches[4]);
					saveCanonical(canonical,rules.canonicalize(matches[4]));
				}
			}
		}
		return;
	}
	
	
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
	
	// region CHERRYPICKSREVIEWS.COM
	if(domain=='cherrypicksreviews.com'){
		matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/brand\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[3]==canonical) saveCanonical(canonical,canonical);
		}
		matches=url.match(/^http(s?):\/\/(www\.)?cherrypicksreviews\.com\/sellers\/amazon\/([^\/]+)(\/.*)?$/i);
		if(matches && matches.length>0){
			if(matches[3]==canonical) saveCanonical(canonical,canonical);
		}
		if(title.includes(' PRODUCT GUIDE: ')){
			let brand=title.split(' PRODUCT GUIDE: ');
			brand=brand[0].trim();
			saveSurface(brand);
			saveCanonical(canonical,rules.canonicalize(brand));
		}else{
			if(title.includes(' REVIEW 20')){
				let brand=title.split(' REVIEW 20');
				brand=brand[0].trim();
				saveSurface(brand);
				saveCanonical(canonical,rules.canonicalize(brand));
			}
		}
		return;
	}
	// endregion
	