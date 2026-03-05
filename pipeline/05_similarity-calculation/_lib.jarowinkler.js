
// Jaro-Winkler similarity extends Jaro by giving extra weight to common prefixes.
function jaroWinkler(s1,s2){
	const jaroDist=jaro(s1,s2);
	let prefix=0;
	const maxPrefix=4; // Maximum prefix length to use.
	for(let i=0;i<Math.min(maxPrefix,s1.length,s2.length);i++){
		if(s1[i]===s2[i]) prefix++;
		else break;
	}
	const scalingFactor=0.1; // Commonly used scaling factor.
	return jaroDist+prefix*scalingFactor*(1-jaroDist);
}

function jaro(s1,s2){
	if(s1===s2) return 1;
	const len1=s1.length;
	const len2=s2.length;
	if(len1===0 || len2===0) return 0;

	// The matching window is defined as floor(max(len1, len2) / 2) - 1.
	const matchDistance=Math.floor(Math.max(len1,len2)/2)-1;
	const s1Matches=new Array(len1).fill(false);
	const s2Matches=new Array(len2).fill(false);
	let matches=0;
	let transpositions=0;

	// Find matching characters.
	for(let i=0;i<len1;i++){
		const start=Math.max(0,i-matchDistance);
		const end=Math.min(i+matchDistance+1,len2);
		for(let j=start;j<end;j++){
			if(s2Matches[j]) continue;
			if(s1[i]!==s2[j]) continue;
			s1Matches[i]=true;
			s2Matches[j]=true;
			matches++;
			break;
		}
	}

	if(matches===0) return 0;

	// Count transpositions.
	let k=0;
	for(let i=0;i<len1;i++){
		if(!s1Matches[i]) continue;
		while(!s2Matches[k]) k++;
		if(s1[i]!==s2[k]) transpositions++;
		k++;
	}
	transpositions=transpositions/2;
	return ((matches/len1)+(matches/len2)+((matches-transpositions)/matches))/3;
}

module.exports=jaroWinkler;