// region SETTINGS
const brandsFile='./brands.csv'
//endregion

const fs=require('fs')

function stats(mod=true)
	const brands=fs.readFileSync(brandsFile,'utf8').split(/[\r\n]+/)
	let count=0
	for(let i=1;i<brands.length;i++) if(brands[i].trim().length>0) count++
	if(!mod) console.log(`${brandsFile} contains ${count} brands`)
	return {
		file:brandsFile,
		count:count
	}
}
module.exports={stats}
if(require.main===module) stats(false)