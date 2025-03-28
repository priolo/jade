import { SchemaType } from "@google/generative-ai"
import Agent from "../../llm/Agent.js"
import { NodeDoc } from "../types.js"
import { queryDB } from "../queryDB.js"

export function buildLeadAgent() {
	const leadAgent = new Agent(
		"LEAD",
		`Sei un Agente che risponde a domande su ricette, ingredienti, ristoranti, cuochi di un mondo immaginario fantascientifico.
- Se un informazione specifica è richiesta o non sai rispondere alla domanda usa il tuo tool di ricerca "search" per ricevere informazioni utili per poter rispondere.
- Tra le cose che potresti dover cercare ci sono anche argomanti come: "Codice Galattico" o "Manuale di Cucina".
`,
		[
			{
				name: "search",
				description: "Ricerca delle informazioni su un argomento specifico",
				parameters: {
					type: SchemaType.OBJECT,
					properties: {
						query: {
							type: SchemaType.STRING,
							description: "Il testo che permette la ricerca di informazioni"
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
					response += `${result.text}\n`
					// response += `Please note that:\n`
					// response += `${result.text}\n-----------------\n`
				}
				return response
			},
			// "get_distance": (props: [string, string]): any => {
			// 	const [n1, n2] = props
			// 	const getIndex = (name: string): number => ["Tatooine", "Asgard", "Namecc", "Arrakis", "Krypton", "Pandora", "Cybertron", "Ego", "Montressosr", "Klyntar"].indexOf(name)
			// 	const matrix = [
			// 		[0, 695, 641, 109, 661, 1130, 344, 835, 731, 530],
			// 		[695, 0, 550, 781, 188, 473, 493, 156, 240, 479],
			// 		[641, 550, 0, 651, 367, 987, 728, 688, 767, 845],
			// 		[109, 781, 651, 0, 727, 1227, 454, 926, 834, 640],
			// 		[661, 188, 367, 727, 0, 626, 557, 321, 422, 599],
			// 		[1130, 473, 987, 1227, 626, 0, 847, 317, 413, 731],
			// 		[344, 493, 728, 454, 557, 847, 0, 594, 434, 186],
			// 		[835, 156, 688, 926, 321, 317, 594, 0, 215, 532],
			// 		[731, 240, 767, 834, 422, 413, 434, 215, 0, 331],
			// 		[530, 479, 845, 640, 599, 731, 186, 532, 331, 0],
			// 	]
			// 	return matrix[getIndex(n1)][getIndex(n2)]
			// },
			// "dish_mapping": (dish: string): any => DishMapping[dish],
		},
	)
	return leadAgent
}