// region SETTINGS
const validatedBrandsFile='./validated.csv'
const invalidatedBrandsFile='./invalidated.csv'
// endregion

const fs=require('fs')

function stats(mod=true){
	const validatedBrands=fs.readFileSync(validatedBrandsFile,'utf8').split(/[\r\n]+/)
	const invalidatedBrands=fs.readFileSync(invalidatedBrandsFile,'utf8').split(/[\r\n]+/)

	let countValidated=0
	let countInvalidated=0
	for(let i=1;i<validatedBrands.length;i++) if(validatedBrands[i].trim().length>0) countValidated++
	for(let i=1;i<invalidatedBrands.length;i++) if(invalidatedBrands[i].trim().length>0) countInvalidated++
	if(!mod){
		console.log(`${validatedBrandsFile} contains ${countValidated} validated brands`)
		console.log(`${invalidatedBrandsFile} contains ${countInvalidated} invalidated brands`)
	}
	return [
		{
			file:validatedBrands,
			count:countValidated
		},
		{
			file:invalidatedBrandsFile,
			count:countInvalidated
		}
	]
}
module.exports={stats}
if(require.main===module) stats(false)