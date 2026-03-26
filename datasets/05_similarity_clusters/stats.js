// region SETTINGS
const filePath='./similar_oneway.csv'
// endregion

const fs=require('fs')

function stats(mod=true){
	const lines=fs.readFileSync(filePath,'utf-8').split(/[\r\n]+/)
	let uniqueValues=[]
	for(const line of lines){
		if(!line.trim()) continue
		const columns=line.split('\t')
		const firstColumn=columns[0].trim()
		if(firstColumn && !uniqueValues.includes(firstColumn)) uniqueValues.push(firstColumn)
	}
	uniqueValues=uniqueValues.length
	if(!mod) console.log(`./${filePath} contains ${uniqueValues} values`)
	return {
		file:filePath,
		count:uniqueValues
	}
}
module.exports={stats}
if(require.main===module) stats(false)