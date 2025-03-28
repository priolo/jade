import { NodeDoc } from "./utils/utils.js"
import { getItemById, vectorDBSearch } from "./utils/db.js"



export async function queryDB(query: string, tableName:string) {

	let results = await vectorDBSearch(query, tableName)

	results = results.map<NodeDoc>(item => ({ ...item, _distance: item._distance, paragraphs: [] }))

	// CANDIDATE CHAPTERS
	let chapters = results.filter(item => item.parent == null)
	// ALL PARAGRAPHS
	const paragraphs = results.filter(item => item.parent != null)

	for (const paragraph of paragraphs) {
		// lo cerco tra i chapters se non c'e' lo cerco nel vectorDB
		let chapter = chapters.find(c => c.uuid == paragraph.parent)
		if (!chapter) {
			const result = await getItemById(paragraph.parent, tableName)
			chapter = { ...result, _distance: paragraph._distance, paragraphs: [paragraph] }
			chapters.push(chapter)
			continue
		}
		chapter.paragraphs.push(paragraph)
		chapter._distance = Math.min(chapter._distance, paragraph._distance)
	}
	chapters = chapters.sort((a, b) => a._distance - b._distance)

	// PRINT
	// for (const chapter of chapters) {
	// 	console.log("-------------------------------")
	// 	console.log(chapter?.text ?? "<void>")
	// }

	return chapters
}
