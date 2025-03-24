import * as path from 'path';
import { fileURLToPath } from 'url';
import { textCutterChapter } from '../tools/cutter/llm.js';
import { split } from '../tools/cutter/fix.js';
import { breakWords } from '../tools/cutter/utils.js';
import fromPDFToText from '../tools/textualize/pdf.js';
import { countWords, NodeDoc, nodesDocsBuild } from './utils/utils.js';
import { vectorDBCreateAndStore } from "./utils/db.js";
import { Document } from './mock/document.js';
import { chapterDesc } from './mock/chapterDesc.js';
import { chapterTxt } from './mock/chapterTxt.js';
import { getEmbeddings } from '../tools/embedding/embeddingGemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function storeInDb(relativePath:string, tableName:string) {

	// FETCHING DOCUMENT
	//const absolutePath = path.resolve(__dirname, relativePath);
	//const text = await fromPDFToText(absolutePath);
	const text = Document

	

	// CUTTING
	const chaptersDesc = await textCutterChapter(text)
	//const chaptersDesc = chapterDesc
	let chaptersTxt: string[] = breakWords(text, chaptersDesc.map(c => c.opening_words))

	//raffino la spezzettatura se necessario
	const refinedChaptersTxt: string[] = []
	let carryOver: string = ""
	for (let i = 0; i < chaptersTxt.length; i++) {
		const text = carryOver + chaptersTxt[i]
		carryOver = ""
		const wordsNum = countWords(text)
		if (wordsNum > 800) {
			const splittedDesc = await textCutterChapter(text)
			const splittedTxt = breakWords(text, splittedDesc.map(c => c.opening_words))
			refinedChaptersTxt.push(...splittedTxt)
		} else if (wordsNum < 10) {
			carryOver = text
		} else {
			refinedChaptersTxt.push(text)
		}
	}
	chaptersTxt = refinedChaptersTxt



	// SPLITTING CHAPTERS
	const chapters = await nodesDocsBuild(chaptersTxt, null, relativePath)
	// SPLITTING PARAGRAPHS
	const paragraps: NodeDoc[] = []
	for (const chapter of chapters) {
		const ps = await split(chapter.text)
		const paragrap = await nodesDocsBuild(ps, chapter.uuid, relativePath)
		paragraps.push(...paragrap)
	}



	// EMBEDDING
	const allDocs = [...chapters, ...paragraps];
	(await getEmbeddings(allDocs.map(doc => doc.text))).forEach((vector, i) => {
		allDocs[i].vector = vector
	})



	// CONNECT/CREATE VECTOR DB
	vectorDBCreateAndStore(allDocs, tableName)
}
