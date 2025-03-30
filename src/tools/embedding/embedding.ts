import { google } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';
import dotenv from 'dotenv';
dotenv.config()






/** su un array di stringhe restituisce un blocco di embedding */
export async function getEmbeddings(values: string[]): Promise<number[][]> {
	try {
		const model = google.textEmbeddingModel('text-embedding-004');
		const v = [...values]
		let results = []
		while (v.length > 0) {
			const batch = v.splice(0, 99)
			const r = await embedMany({
				model,
				values: batch,
			})
			results.push(...r.embeddings)
		}
		return results
	} catch (error) {
		console.error("Error generating embedding:", error)
		throw error
	}
}

/** su una stringa restituisce un embedding */
export async function getEmbedding(value: string): Promise<number[]> {
	const model = google.textEmbeddingModel('text-embedding-004');
	const r = await embed({
		model,
		value,
	})
	return r.embedding

}
