import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
import { embeddingForQuery } from '../embedding/embeddingGemini.js';



export type Item = {
	text: string
}

export async function connect ( dbPath: string) {
	return lancedb.connect(dbPath)
}

export async function createEmpty(db: lancedb.Connection, tableName: string, schema: arrow.Schema, indexes?: boolean) {

	// Create or open a table
	// let table = await db.createTable(
	// 	tableName,
	// 	[],
	// 	{ mode: "overwrite", schema }
	// )
	let table = await db.createEmptyTable(tableName, schema, { mode: "overwrite" })

	if (indexes) await table.createIndex("vector")

	return table
}

export async function openTable(db: lancedb.Connection, tableName: string) {
	const table = await db.openTable(tableName)
	return table
}

export async function addItem(table: lancedb.Table, item: Item): Promise<void> {	const vector = await embeddingForQuery(item.text);
	await table.add([{ text: item.text, vector }]);
}

export async function searchItem(table: lancedb.Table, query: string) {
	const queryEmbedding = await embeddingForQuery(query);
	const results = await table.search(queryEmbedding).limit(5).toArray();
	return results
}

export async function listTables(db: lancedb.Connection) {
	const tableNames = await db.tableNames();
	return tableNames
}

export async function dropTable(db: lancedb.Connection, tableName: string) {
	await db.dropTable(tableName)
}

export async function deleteItem (table: lancedb.Table, filter: string) {
	await table.delete(filter)
}