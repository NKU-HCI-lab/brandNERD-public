const fs=require('fs')

function stats(mod=true){
	const folders=fs.readdirSync('./',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name)
	let results=[]
	
	for(const folder of folders){
		const count=fs.readdirSync(`./${folder}`).length
		if(!mod) console.log(`./${folder} contains ${count} query results`)
		results.push({folder:folder,count:count})
	}
	return results
}
module.exports={stats}
if(require.main===module) stats(false)