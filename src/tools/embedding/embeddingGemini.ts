import { EmbedContentRequest, GenerativeModel, GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config()



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
let model: GenerativeModel = null


/** su un array di stringhe restituisce un blocco di embedding */
export async function getEmbeddings(txt: string[]): Promise<number[][]> {
	if (model === null) await setupEmbedding();
	return embeddingsForStore(txt);
}

/** su una stringa restituisce un embedding */
export async function getEmbedding(txt: string): Promise<number[]> {
	if (model === null) await setupEmbedding();
	return embeddingForQuery(txt);
}

async function setupEmbedding() {
	model = genAI.getGenerativeModel({ model: "text-embedding-004" })
}

async function embeddingsForStore(text: string[], title?: string): Promise<number[][]> {
	try {
		const requests: EmbedContentRequest[] = text.map(t => ({
			content: { role: "user", parts: [{ text: t }] },
			taskType: TaskType.RETRIEVAL_DOCUMENT,
			title,
		}))

		let results = []
		while (requests.length > 0) {
			const batch = requests.splice(0, 99)
			const embeddings = await model.batchEmbedContents({ requests: batch })
			results.push(...embeddings.embeddings)
		}
		return results.map(e => e.values)
	} catch (error) {
		console.error("Error generating embedding:", error)
		throw error
	}
}

async function embeddingForQuery(text: string): Promise<number[]> {
	try {
		const request: EmbedContentRequest = {
			content: { role: "user", parts: [{ text }] },
			taskType: TaskType.RETRIEVAL_QUERY,
			///title: 
		}
		const result = await model.embedContent(request)
		return result.embedding.values
	} catch (error) {
		console.error("Error generating embedding:", error)
		throw error
	}
}

