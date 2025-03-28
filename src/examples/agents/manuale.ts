import { SchemaType } from "@google/generative-ai"
import Agent from "../../llm/Agent.js"
import { NodeDoc } from "../types.js"
import { queryDB } from "../queryDB.js"



export function buildManualeAgent() {
	const agent = new Agent(
		"MANUALE",
		`Agente che risponde a domande sul Manuale di Cucina. Contiene le metodologie, ricette, licenze per poter preparare i piatti.
- Per avere informazioni sul Manuale di Cucina devi usare il tool "search" fornendo la frase che permette il recupero delle informazioni.`,
		[
			{
				name: "search",
				description: "Ricerca delle informazioni sul Manuale di Cucina",
				parameters: {
					type: SchemaType.OBJECT,
					properties: {
						query: {
							type: SchemaType.STRING,
							description: "Il testo che permette la ricerca di informazioni su un vector db"
						}
					},
					required: ["query"]
				}
			}
		],
		{
			"search": async ({ query }): Promise<string> => {
				const results: NodeDoc[] = (await queryDB(query, "kb_pizza")).slice(0, 3)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += `${result.text}\n---\n`
				}
				return response
			},
		},
	)
	return agent
}