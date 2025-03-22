import * as path from 'path';
import { fileURLToPath } from 'url';
import { textCutterChapter } from './tools/cutter/chapterLLM.js';
import { split } from './tools/cutter/fix.js';
import { breakWords } from './tools/cutter/utils.js';
import fromPDFToText from './tools/textualize/pdf.js';
import { textTest1 } from './mock/text_test_1.js';
import { embeddingForQuery, embeddingsForStore, model, setupEmbedding } from './tools/embedding/embeddingGemini.js';
import { connect } from './tools/vectorDB/vectorDb.js';
import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
import { groupBy, uuidv4 } from './utils.js';
import { basilica_vectors } from './mock/basilica_vectors.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





async function vectorDBCreateAndStore(nodes: NodeDoc[], tableName: string) {
	const db = await lancedb.connect("./vectorsDB/lancedb")

	// Check if table exists before creating it
	const tableExists = (await db.tableNames()).includes(tableName)
	let table;

	if (tableExists) {
		// Use existing table
		console.log(`Table ${tableName} already exists. Using existing table.`)
		table = await db.openTable(tableName)
	} else {
		// Create new table if it doesn't exist
		const schema = new arrow.Schema([
			new arrow.Field("uuid", new arrow.Utf8(), false),
			new arrow.Field("parent", new arrow.Utf8(), true), // Set nullable to true
			new arrow.Field("text", new arrow.Utf8()),
			new arrow.Field("ref", new arrow.Utf8(), true),
			new arrow.Field("vector", new arrow.FixedSizeList(768, new arrow.Field("item", new arrow.Float32()))),
		])
		table = await db.createEmptyTable(
			tableName,
			schema,
			{ existOk: true }
		)
		await table.createIndex("uuid");
	}

	// ADD ITEMS
	await table.add(nodes)
}

async function vectorDBSearch(text: string, tableName: string) {
	const db = await lancedb.connect("./vectorsDB/lancedb")
	const table = await db.openTable(tableName)
	const vector = await getEmbedding(text)
	const results: NodeDoc[] = await table.search(vector).limit(15).toArray()
	return results
}

async function nodesDocsBuild(sentences: string[], parentId?: string, ref?: string): Promise<NodeDoc[]> {
	const vectors = await getEmbeddings(sentences)
	const nodes: NodeDoc[] = vectors.map((vector, i) => ({
		uuid: uuidv4(),
		parent: parentId,
		text: sentences[i],
		ref: ref ?? "",
		vector
	}))
	return nodes
}

async function getAllUuid(tableName: string): Promise<string[]> {
	try {
		const db = await lancedb.connect("./vectorsDB/lancedb");
		const table = await db.openTable(tableName);
		const allUuids: NodeDoc[] = await table.query()
			.select(["uuid"])
			.toArray();
		return allUuids.map(item => item.uuid);
	} catch (error) {
		console.error("Error retrieving all uuids:", error);
		return [];
	}
}

async function getItemById(uuid: string, tableName: string): Promise<NodeDoc | null> {
	try {
		const db = await lancedb.connect("./vectorsDB/lancedb");
		const table = await db.openTable(tableName);
		// Use filter() instead of search() with a string query
		const results: NodeDoc[] = await table.query()
			.where(`uuid = '${uuid}'`)
			//.select(["uuid"])
			.limit(1)
			.toArray()

		return results?.[0]
	} catch (error) {
		console.error("Error retrieving item by ID:", error);
		return null;
	}
}






async function runInsert() {

	// FETCHING
	//const relativePath = "../data/rome_guide2.pdf"
	const relativePath = "../data/rome_guide.pdf"
	//const relativePath = "../data/legge_maltrattamento_animali.pdf"
	const absolutePath = path.resolve(__dirname, relativePath);
	const text = await fromPDFToText(absolutePath);
	//const text = textTest1

	// CUTTING
	const chaptersDesc = await textCutterChapter(text)
	//const chaptersDesc = mockChaptersDesc
	let chaptersTxt: string[] = breakWords(text, chaptersDesc.map(c => c.opening_words))


	//raffino la spezzettatura se necessario
	const refinedChaptersTxt: string[] = []
	let carryOver: string = ""
	for ( let i=0; i<chaptersTxt.length; i++ ) {
		const text = carryOver + chaptersTxt[i] 
		carryOver = ""
		const wordsNum = countWords( text)
		if ( wordsNum > 800 ) {
			const splittedDesc = await textCutterChapter(text)
			const splittedTxt = breakWords(text, splittedDesc.map(c => c.opening_words))
			refinedChaptersTxt.push( ...splittedTxt )
		} else if ( wordsNum < 10) {
			carryOver = text
		} else {
			refinedChaptersTxt.push( text )
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

	// CONNECT/CREATE VECTOR DB
	vectorDBCreateAndStore([...chapters, ...paragraps], TableName)
}

async function run() {
	const nodes = await nodesDocsBuild([
		"La basilica di San Magno è il principale luogo di culto cattolico di Legnano.",
		"Intitolata a Magno di Milano, arcivescovo ambrosiano dal 518 al 530,",
		"e costruita con uno stile architettonico rinascimentale lombardo di scuola bramantesca,",
		"è stata edificata dal 1504 al 1513.",
		"Si può ragionevolmente ritenere che il progetto della basilica sia stato realizzato sulla base di un disegno tracciato personalmente da Donato Bramante.",
	])
	//const nodes = basilica_vectors

	await vectorDBCreateAndStore(nodes, TableName)

	const results = await vectorDBSearch("La basilica di San Magno è il principale luogo di culto cattolico di Legnano.", TableName)
	console.log(results)
}

async function runSearch() {
	let results = await vectorDBSearch("typical recipes", TableName)
	//let results: NodeDoc[] = await vectorDBSearch("Kitchen vampire", TableName)
	//let results: NodeDoc[] = await vectorDBSearch("where can i eat?", TableName)
	//let results: NodeDoc[] = await vectorDBSearch("quando non è reato?", TableName)
	//let results: NodeDoc[] = await vectorDBSearch("research on design", TableName)


	results = results.map<NodeDoc>(item => ({ ...item, _distance: item._distance, paragraphs: [] }))

	// CANDIDATE CHAPTERS
	let chapters = results.filter(item => item.parent == null)
	// ALL PARAGRAPHS
	const paragraphs = results.filter(item => item.parent != null)

	for (const paragraph of paragraphs) {
		// lo cerco tra i chapters se non c'e' lo cerco nel vectorDB
		let chapter = chapters.find(c => c.uuid == paragraph.parent)
		if (!chapter) {
			const result = await getItemById(paragraph.parent, TableName)
			chapter = { ...result, _distance: paragraph._distance, paragraphs: [paragraph] }
			chapters.push(chapter)
			continue
		}
		chapter.paragraphs.push(paragraph)
		chapter._distance = Math.min(chapter._distance, paragraph._distance)
	}
	chapters = chapters.sort((a, b) => a._distance - b._distance)

	// PRINT
	for (const chapter of chapters) {
		console.log("-------------------------------")
		console.log(chapter?.text ?? "<void>")
	}
}



const TableName = "kb_general2";
//runInsert()
runSearch()
// (async () => {
// 	console.log(await getAllUuid(TableName))
// })()
//getItemById("25a0398b-a9e0-46c2-9e88-5d6d89a3e614", TableName)



type NodeDoc = {
	uuid?: string
	parent?: string
	text: string,
	ref?: string
	vector: number[]
	_distance?: number
	paragraphs?: NodeDoc[]
}

async function getEmbeddings(txt: string[]): Promise<number[][]> {
	if (model === null) await setupEmbedding()
	//return Array.from({ length: 768 }, () => Math.random())
	return embeddingsForStore(txt)
}
async function getEmbedding(txt: string): Promise<number[]> {
	if (model === null) await setupEmbedding()
	return embeddingForQuery(txt)
}

function mitiga(value: number, k: number): number {
	return k + value * (1 - k)
}

function countWords(sentence: string): number {
	if (!sentence.trim()) return 0;
	return sentence.trim().split(/\s+/).length;
  }
  

  const mockChaptersDesc = [
	{
	  opening_words: "When folding the sheet, we",
	},
	{
	  opening_words: "Suggestions how to print and",
	},
	{
	  opening_words: "The founding of Rome is",
	},
	{
	  opening_words: "With   the   passing   of",
	},
	{
	  opening_words: "The most spectacular churches in",
	},
	{
	  opening_words: "A   huge   sanctuary   of",
	},
	{
	  opening_words: "This chapel owes its name",
	},
	{
	  opening_words: "This group of museums is",
	},
	{
	  opening_words: "This museum, founded in 1471",
	},
	{
	  opening_words: "This is one of the",
	},
	{
	  opening_words: "This   is   the   Cathedral",
	},
	{
	  opening_words: "This   church   is   in",
	},
	{
	  opening_words: "This church stands on the",
	},
	{
	  opening_words: "This   is   the   most",
	},
	{
	  opening_words: "The greatest historical architecture from",
	},
	{
	  opening_words: "This   is   the   most",
	},
	{
	  opening_words: "The Roman Forum was built",
	},
	{
	  opening_words: "This   enormous   structure   was",
	},
	{
	  opening_words: "This structure was built on",
	},
	{
	  opening_words: "This is one of the",
	},
	{
	  opening_words: "The   original   building,   dating",
	},
	{
	  opening_words: "The catacombs were the places",
	},
	{
	  opening_words: "These   were   the   most",
	},
	{
	  opening_words: "All the city’s squares to",
	},
	{
	  opening_words: "This is maybe the most",
	},
	{
	  opening_words: "This is a truly wonderful",
	},
	{
	  opening_words: "This   square   was   named",
	},
	{
	  opening_words: "This   square   is   located",
	},
	{
	  opening_words: "This   hill   next   to   Piazza",
	},
	{
	  opening_words: "The most majestic in Rome",
	},
	{
	  opening_words: "Built   by   Bernini,   this",
	},
	{
	  opening_words: "This fountain is in Piazza",
	},
	{
	  opening_words: "This fountain is in the",
	},
	{
	  opening_words: "The magnificent Palaces of the",
	},
	{
	  opening_words: "This has been the President",
	},
	{
	  opening_words: "Around 1600, Pope Innocent X",
	},
	{
	  opening_words: "This palace was bought by",
	},
	{
	  opening_words: "This palace dates back to",
	},
	{
	  opening_words: "The wonderful Villas and luxuriant",
	},
	{
	  opening_words: "This is the largest public",
	},
	{
	  opening_words: "Due   to   its   position",
	},
	{
	  opening_words: "This garden stretches out above",
	},
	{
	  opening_words: "Passeggiata   del   Gianicolo   is",
	},
	{
	  opening_words: "Simple,   with   strong   flavors",
	},
	{
	  opening_words: "Every morning in the picturesque",
	},
	{
	  opening_words: "The   historical coffee shops   in",
	},
	{
	  opening_words: "If you plan   sleeping in",
	},
	{
	  opening_words: "Many   international   musical   events",
	},
	{
	  opening_words: "This has been an annual",
	},
	{
	  opening_words: "The Comics and Cartoon Festival",
	},
	{
	  opening_words: "This annual festival totally dedicated",
	},
	{
	  opening_words: "If   you   walk   along   Via",
	},
	{
	  opening_words: "This   is   a   self-gratifying",
	},
	{
	  opening_words: "Trastevere is an   extremely   lively",
	},
	{
	  opening_words: "If you are busy and",
	},
	{
	  opening_words: "Try to wake up early",
	},
	{
	  opening_words: "It is often said that",
	},
	{
	  opening_words: "Before   you   start,   choose",
	},
	{
	  opening_words: "Marguerite   Yourcenar   wrote   the",
	},
	{
	  opening_words: "In 1829,   Stendhal   wrote",
	},
	{
	  opening_words: "In   1889   Gabriele   D’Annunzio",
	},
	{
	  opening_words: "Pier Paolo Pasolini   lived in",
	},
	{
	  opening_words: "In   1945,   immediately   after",
	},
	{
	  opening_words: "Rome,   two   Hollywood   actors",
	},
	{
	  opening_words: "In   “Un americano a Roma”",
	},
	{
	  opening_words: "“La   Dolce   Vita” ,   an",
	},
	{
	  opening_words: "The area around the city",
	},
	{
	  opening_words: "Ostia Antica was founded in",
	},
	{
	  opening_words: "Tivoli   (about   20   km",
	},
	{
	  opening_words: "Lying   amongst   the   Colli",
	},
	{
	  opening_words: "This short compendium of Roman",
	},
	{
	  opening_words: "Many famous names in Made",
	},
	{
	  opening_words: "Capucci   - Capucci   opened",
	},
	{
	  opening_words: "Fernanda Gattinoni   – She",
	},
	{
	  opening_words: "Lancetti   – Roman by adoption",
	},
	{
	  opening_words: "Valentino   - Valentino opened his",
	},
	{
	  opening_words: "Laura   Biagiotti   –   Renamed",
	},
	{
	  opening_words: "Fendi   - This maison was",
	},
	{
	  opening_words: "Brioni   –   Male   tailored   elegance",
	},
	{
	  opening_words: "Let’s   ignore   the   single-label",
	},
	{
	  opening_words: "For the more alternative consumers",
	},
	{
	  opening_words: "Porta   Portese   that   veiled",
	},
	{
	  opening_words: "Rome web sites Servizi",
	},
	{
	  opening_words: "Travel Plan Italy Guide",
	},
	{
	  opening_words: "You're going to love the",
	},
  ]