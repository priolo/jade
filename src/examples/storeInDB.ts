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
import { DOC_TYPE, NodeDoc } from "../types.js";
import { ChapterStruct } from '../tools/cutter/types.js';
import { chapterTxt } from './mock/chapterTxt.js';

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
	const chaptersDescStart = await textCutterChapter(text)
	const chaptersTxt: string[] = breakWords(text, chaptersDescStart.map(c => c.opening_words))
	const chaptersDesc = chaptersTxt.map((c, i) => ({
		text: c,
	}))
	// [OPTIONAL] merge CHARAPTER with lower words count
	// for (let i = 0; i < chaptersDesc.length; i++) {
	// 	const chapterDesc = chaptersDesc[i]
	// 	chapterDesc.text = (chapterDesc.text ?? "") + chaptersTxt[i]
	// 	const wordsNum = countWords(chapterDesc.text)
	// 	if (wordsNum < 10) {
	// 		const chapterDescNext = chaptersDesc[i + 1]
	// 		if (!chapterDescNext) continue
	// 		chapterDescNext.text = chapterDesc.text
	// 		chapterDesc.text = null
	// 	}
	// }
	// chaptersDesc = chaptersDesc.filter(c => !!c.text)

	// CREATE INDEX DOC
	const indexDoc: NodeDoc = {
		uuid: uuidv4(),
		parent: null,
		text: chaptersDescStart.map(c => c.title).join("\n"),
		type: DOC_TYPE.INDEX,
		ref,
		vector: null,
	}

	// CREATE CHAPTERS DOCS
	const chaptersDoc: NodeDoc[] = chaptersDesc.map<NodeDoc>(c => ({
		uuid: uuidv4(),
		parent: null,
		text: c.text,
		type: DOC_TYPE.CHAPTER,
		ref,
		vector: null,
	}))

	// CREATE PARAGRAPHS DOCS SPILTTING CHAPTERS DOCS
	const paragrapsDoc: NodeDoc[] = []
	for (const chapter of chaptersDoc) {
		const paragraphsText = await split(chapter.text)
		const paragraph = paragraphsText.map<NodeDoc>(p => ({
			uuid: uuidv4(),
			parent: chapter.uuid,
			text: p,
			type: DOC_TYPE.PARAGRAPH,
			ref,
			vector: null,
		}))
		paragrapsDoc.push(...paragraph)
	}



	// EMBEDDING
	const allDocs = [...chaptersDoc, ...paragrapsDoc, indexDoc]
	const txtEmbedding = allDocs.map(doc => doc.text)
	const vectors = await getEmbeddings(txtEmbedding)
	vectors.forEach((vector, i) => allDocs[i].vector = vector)

	// CONNECT/CREATE VECTOR DB
	vectorDBCreateAndStore(allDocs, tableName)

	console.log(`Stored ${ref ?? "--"} in ${allDocs.length} documents in ${tableName} table`)
}
