import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { split } from '../tools/cutter/fix.js';
import { textCutterChapter } from '../tools/cutter/llm.js';
import { breakWords } from '../tools/cutter/utils.js';
import { getEmbeddings } from '../tools/embedding/embedding.js';
import fromHTMLToText from '../tools/textualize/html.js';
import fromPDFToText from '../tools/textualize/pdf.js';
import { vectorDBCreateAndStore } from "./utils/db.js";
import { countWords, uuidv4 } from './utils/utils.js';
import { NodeDoc } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export async function importPDFToText(relativePath: string): Promise<string> {
	const absolutePath = path.resolve(__dirname, relativePath)
	const text = await fromPDFToText(absolutePath)
	return text
}

export async function importHTMLToText(relativePath: string): Promise<string> {
	const absolutePath = path.resolve(__dirname, relativePath);
	const html = await fs.readFile(absolutePath, 'utf-8');
	const text = fromHTMLToText(html);
	return text;
}

export function normalizeString(text: string): string {
	const tokens = text.split(/\s{2,}/);
	const normalizedTokens = tokens.map(t => t.replace(/\s+/g, ""));
	return normalizedTokens.join(" ");
}

export async function storeInDb(relativePath: string, tableName: string) {
	const text = await importPDFToText(relativePath)
	storeTextInDb(text, tableName, relativePath)
}

export async function storeTextInDb(text: string, tableName: string, ref?: string) {

	// CUTTING
	let chaptersDesc = await textCutterChapter(text)
	//const chaptersDesc = chapterDesc
	const chaptersTxt: string[] = breakWords(text, chaptersDesc.map(c => c.opening_words))
	// [OPTIONAL] merge CHARAPTER with lower words count
	for (let i = 0; i < chaptersDesc.length; i++) {
		const chapterDesc = chaptersDesc[i]
		chapterDesc.text = (chapterDesc.text ?? "") + chaptersTxt[i]
		const wordsNum = countWords(chapterDesc.text)
		if (wordsNum < 10) {
			const chapterDescNext = chaptersDesc[i + 1]
			if (!chapterDescNext) continue
			chapterDescNext.text = chapterDesc.text
			chapterDesc.text = null
		}
	}
	chaptersDesc = chaptersDesc.filter(c => !!c.text)



	// //raffino la spezzettatura se necessario
	// const refinedChaptersTxt: string[] = []
	// let carryOver: string = ""
	// for (let i = 0; i < chaptersTxt.length; i++) {
	// 	const text = carryOver + chaptersTxt[i]
	// 	carryOver = ""
	// 	const wordsNum = countWords(text)
	// 	if (wordsNum > 800) {
	// 		const splittedDesc = await textCutterChapter(text)
	// 		const splittedTxt = breakWords(text, splittedDesc.map(c => c.opening_words))
	// 		refinedChaptersTxt.push(...splittedTxt)
	// 	} else if (wordsNum < 10) {
	// 		carryOver = text
	// 	} else {
	// 		refinedChaptersTxt.push(text)
	// 	}
	// }
	// chaptersTxt = refinedChaptersTxt



	// CREATE CHAPTERS DOCS
	const chaptersDoc: NodeDoc[] = chaptersDesc.map(c => ({
		uuid: uuidv4(),
		parent: null,
		title: c.title,
		text: c.text,
		ref,
		vector: null,
	}))

	// CREATE PARAGRAPHS DOCS SPILTTING CHAPTERS DOCS
	const paragrapsDoc: NodeDoc[] = []
	for (const chapter of chaptersDoc) {
		const paragraphsText = await split(chapter.text)
		const paragraph = paragraphsText.map(p => ({
			uuid: uuidv4(),
			parent: chapter.uuid,
			title: chapter.title,
			text: p,
			ref,
			vector: null,
		}))
		paragrapsDoc.push(...paragraph)
	}



	// EMBEDDING
	const allDocs = [...chaptersDoc, ...paragrapsDoc]
	const txtEmbedding = allDocs.map(doc => {
		const txt = !!doc.title 
			? `${doc.title} : ${doc.text}`
			: `${doc.text}`
		return txt
	})
	const vectors = await getEmbeddings(txtEmbedding)
	vectors.forEach((vector, i) => allDocs[i].vector = vector)



	// CONNECT/CREATE VECTOR DB
	vectorDBCreateAndStore(allDocs, tableName)
}
