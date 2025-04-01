import { tool, Tool } from "ai"
import { z } from "zod"
import Agent from "../../llm/Agent.js"
import { queryDB } from "../queryDB.js"
import { NodeDoc } from "../types.js"



export function buildManualeAgent() {
	const agent = new Agent(
		"MANUALE",
		`Agente che risponde a domande sul Manuale di Cucina. Contiene le metodologie, ricette, licenze per poter preparare i piatti.
- Per avere informazioni sul Manuale di Cucina devi usare il tool "search" fornendo la frase che permette il recupero delle informazioni.
`,
		{ search },
	)
	return agent
}

const search: Tool = tool({
	description: "Ricerca delle informazioni sul Manuale di Cucina",
	parameters: z.object({
		query: z.string().describe("Il testo che permette la ricerca di informazioni su un vector db"),
	}),
	execute: async ({ query }) => {
		const results: NodeDoc[] = (await queryDB(query, "kb_pizza")).slice(0, 3)
		if (results.length == 0) return "Nessun risultato"
		let response = ""
		for (const result of results) {
			response += `${result.text}\n---\n`
		}
		return response
	}
})

