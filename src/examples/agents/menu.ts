import { tool, Tool } from "ai"
import { z } from "zod"
import Agent from "../../llm/Agent.js"
import { queryDB } from "../queryDB.js"
import { NodeDoc } from "../types.js"



export function buildMenuAgent() {
	const agent = new Agent(
		"MENU",
		`Sei un agente che risponde a domande sui menu dei vari ristoranti. Gli chef, i posti, le abitudini, gli ingredienti, le ricette , le preparazioni tipiche di tutti i ristoranti.
- Per avere informazioni devi usare i tool di ricerca "search" fornendo la frase che permette il recupero delle informazioni.
`,
		{ search_chapter, search_block_of_text, search_single_word },
	)
	return agent
}

const search_chapter: Tool = tool({
	description: `
	Attraverso la frase di "query" recupera dei "capitoli" 
	cioè un testo abbastanza lungo e che riguarda un argomento. 
	I "capitoli" sono composti da "blocchi di testo".
	`,
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

const search_block_of_text: Tool = tool({
	description: `
	Attraverso la frase di "query" recupera un breve "pezzo di testo".
	Questi a loro volta compongono un "capitolo".
	`,
	parameters: z.object({
		query: z.string().describe("Il testo che permette la ricerca di informazioni su un vector db"),
	}),
	execute: async ({ query }) => {
		
	}
})

const search_single_word: Tool = tool({
	description: `
	Cerca puntualmente una singola parola 
	e restituisce il "pezzo di testo" che la contiene.
	`,
	parameters: z.object({
		query: z.string().describe("Il testo che permette la ricerca di informazioni su un vector db"),
	}),
	execute: async ({ query }) => {
		
	}
})
