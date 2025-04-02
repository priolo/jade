import { NodeDoc } from "./types.js"
import { getItemById, vectorDBSearch } from "./utils/db.js"



export async function queryDBChapter(query: string, tableName:string, ref?:string) {

	let results = await vectorDBSearch(query, tableName, ref)

	results = results.map<NodeDoc>(item => ({ ...item, paragraphs: [] }))

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

	return chapters
}
