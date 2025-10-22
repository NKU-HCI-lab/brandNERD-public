/*
*
*	This function receives a brand and applies a series of rules that filter it for further processing
*
* 	"CAT & JACK, INC." - simplify-> CAT & JACK  -canonicalize-> CATJACK
*/
const rules={
	simplify:function(brand){
		// Remove (R) (e.g., "SAMSUNG(R)" -> "SAMSUNG")
		brand=brand.replace(/\(R\)/g,'').trim();
		
		// Remove all non-ASCII, non-alphanumeric characters, leaving spaces (e.g., "SAMSUNG, INC." -> "SAMSUNG INC")
		brand=brand.replace(/&#\d+;/g,'').replace(/[^a-zA-Z0-9\s]/g,'').trim();
		
		// Remove all instances of "BRAND INC" and "BRAND LLC" (e.g., "SAMSUNG LLC" -> "SAMSUNG")
		brand=brand.replace(/[^a-zA-Z0-9]?(INC|LLC|CO)[^a-zA-Z0-9]?$/,'').trim();
		
		// Replaces all instances of brands starting with "BY" (e.g., "BY SAMSUNG" -> "SAMSUNG")
		brand=brand.replace(/^BY[^a-zA-Z0-9]+/,'').trim();
		
		// Removes all instances of "VISIT THE X STORE" (e.g., "VISIT THE SAMSUNG STORE" -> "SAMSUNG")
		const match=brand.match(/^VISIT THE (.+?) STORE$/i);
		if(match && match[1]) brand=match[1];
		
		// Removes one or more non alphanumeric characters before brand name (e.g., "?SAMSUNG" -> "SAMSUNG")
		brand=brand.replace(/^[^a-zA-Z0-9]+/g,'');
		
		// Removes one or more non alphanumeric characters at the end of brand name (e.g., "SAMSUNG" -> "SAMSUNG?")
		brand=brand.replace(/[^a-zA-Z0-9]+$/g,'');
		
		// Removes all only numeric brands (e.g., "1241241")
		brand=brand.replace(/^([0-9 ]+\s?)+$/g,'').trim();
		
		// Removes brands having only one letter or containing only one letter and numbers (e.g., "N1241241" or "N")
		brand=brand.replace(/^(A|B)[^a-zA-Z]*$/g,'');
		
		// Removes double spaces
		brand=brand.replace(/\s+/g,' ');
		
		return brand;
	},
	canonicalize:function(brand){
		const _=this;
		brand=_.simplify(brand);
		
		// Removes all non-ASCII, non-alphanumeric characters, including spaces (e.g., "BLACK DECKER" -> "BLACKDECKER")
		brand=brand.replace(/[^a-zA-Z0-9]/g,'').trim();
		
		
		
		
		return brand.trim();
	},
	preprocess:function(brand){
		// Removes brands beginning with BLU/YEL/ORG/RED/WEB + number (these are label numbers)
		brand=brand.replace(/^(BLU|ORG|RED|YEL|WEB|GRN|EXS)[^a-zA-Z0-9]*\d+$/g,'').trim();
		
		return brand;
	}
}

module.exports=rules;