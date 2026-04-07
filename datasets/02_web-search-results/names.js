const fs=require('fs')
function stats(mod=true){
	const folders=fs.readdirSync('./',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name)
	const searchResults={}
	for(const folder of folders){
		const count=fs.readdirSync(`./${folder}`).length
		if(!mod) console.log(`./${folder} contains ${count} query results`)
		searchResults[folder]={}
		const files=fs.readdirSync(`./${folder}`)
		let countFiles=1
		for(const file of files){
			console.log(`${countFiles++}/${files.length}`)
			canonical=file.replace('_','').replace('.json','')
			searchResults[folder][canonical]=JSON.parse(fs.readFileSync(`./${folder}/${file}`,'utf8')).length
		}
		fs.writeFileSync('./02_search_results_summary.json',JSON.stringify(searchResults))
	}
}

module.exports={stats}
if(require.main===module) stats(false)