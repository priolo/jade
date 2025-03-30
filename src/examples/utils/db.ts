import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
import { getEmbedding } from "../../tools/embedding/embedding.js";
import { NodeDoc } from "../types.js";



const dbPath = "./vectorsDB/lancedb";

export async function vectorDBCreateAndStore(nodes: NodeDoc[], tableName: string) {
	const db = await lancedb.connect(dbPath);

	// Check if table exists before creating it
	const tableExists = (await db.tableNames()).includes(tableName);
	let table;

	if (tableExists) {
		// Use existing table
		console.log(`Table ${tableName} already exists. Using existing table.`);
		table = await db.openTable(tableName);
	} else {
		// Create new table if it doesn't exist
		const schema = new arrow.Schema([
			new arrow.Field("uuid", new arrow.Utf8(), false),
			new arrow.Field("parent", new arrow.Utf8(), true), // Set nullable to true
			new arrow.Field("text", new arrow.Utf8()),
			new arrow.Field("ref", new arrow.Utf8(), true),
			new arrow.Field("vector", new arrow.FixedSizeList(768, new arrow.Field("item", new arrow.Float32()))),
		]);
		table = await db.createEmptyTable(
			tableName,
			schema,
			{ existOk: true }
		);
		await table.createIndex("uuid");
	}

	// ADD ITEMS
	await table.add(nodes.map(node => ({
		uuid: node.uuid,
		parent: node.parent,
		text: node.text,
		ref: node.ref,
		vector: node.vector,
	})));
}

export async function vectorDBSearch(text: string, tableName: string) {
	const db = await lancedb.connect(dbPath);
	const table = await db.openTable(tableName);
	const vector = await getEmbedding(text);
	const results: NodeDoc[] = await table.search(vector).limit(15).toArray();
	return results;
}

export async function getAllUuid(tableName: string): Promise<string[]> {
	try {
		const db = await lancedb.connect(dbPath);
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

export async function getItemById(uuid: string, tableName: string): Promise<NodeDoc | null> {
	try {
		const db = await lancedb.connect(dbPath);
		const table = await db.openTable(tableName);
		// Use filter() instead of search() with a string query
		const results: NodeDoc[] = await table.query()
			.where(`uuid = '${uuid}'`)
			//.select(["uuid"])
			.limit(1)
			.toArray();

		return results?.[0];
	} catch (error) {
		console.error("Error retrieving item by ID:", error);
		return null;
	}
}
