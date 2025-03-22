import { EmbedContentRequest, GenerativeModel, GoogleGenerativeAI, TaskType } from '@google/generative-ai';



const API_KEY = "AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM";
const genAI = new GoogleGenerativeAI(API_KEY)
export let model: GenerativeModel = null
export const EMBEDDING_LENGTH = 768

export async function setupEmbedding() {
	model = genAI.getGenerativeModel({ model: "text-embedding-004" })
}

// Function to get embeddings from Gemini
export async function embeddingsForStore(text: string[], title?: string): Promise<number[][]> {
	try {
		const requests: EmbedContentRequest[] = text.map(t => ({
			content: { role: "user", parts: [{ text: t }] },
			taskType: TaskType.RETRIEVAL_DOCUMENT,
			title,
		}))

		let results = []
		while (requests.length > 0) {
			const batch = requests.splice(0, 99)
			results.push(... (await model.batchEmbedContents({ requests: batch })).embeddings)
		}
		return results.map(e => e.values)
	} catch (error) {
		console.error("Error generating embedding:", error)
		throw error
	}
}

export async function embeddingForQuery(text: string): Promise<number[]> {
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
