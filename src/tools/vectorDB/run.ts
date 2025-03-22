import * as arrow from "apache-arrow";
import { embeddingForQuery } from '../embedding/embeddingGemini.js';
import { addItem, connect, createEmpty, dropTable, openTable, searchItem } from './vectorDb.js';



async function createVectors() {

	const sampleText = "sample text";
	const sampleEmbedding = await embeddingForQuery(sampleText) // 768

	const db = await connect("./data")

	await dropTable(db, "my_table")

	const schema = new arrow.Schema([
		new arrow.Field("vector", new arrow.FixedSizeList(sampleEmbedding.length, new arrow.Field("item", new arrow.Float32()))),
		new arrow.Field("text", new arrow.Utf8())
	])
	const table = await createEmpty(db, "my_table", schema);

	await Promise.all([
		"qua si parla di uova!", 
		"cosa fa la gallina che non fa il gallo?", 
		"è nato prima l'uovo o la gallina?",
		"l'elettronica per tutti",
		"divertiti con i condenstori",
		"l'arte dello spionaggio con i microchip",
	].map((text) => addItem(table, { text })))
}

async function queryVectors() {
	const db = await connect("./data")
	const table = await openTable(db, "my_table")
	const results = await searchItem(table, "pollo maschio")
	console.log(results.map( item => item.text)) 
}


createVectors();
//queryVectors();
