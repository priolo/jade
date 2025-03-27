import * as path from 'path';
import * as fs from 'fs/promises';
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
import fromHTMLToText from '../tools/textualize/html.js';

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
	const chapters = await nodesDocsBuild(chaptersTxt, null, ref)
	// SPLITTING PARAGRAPHS
	const paragraps: NodeDoc[] = []
	for (const chapter of chapters) {
		const ps = await split(chapter.text)
		const paragrap = await nodesDocsBuild(ps, chapter.uuid, ref)
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
