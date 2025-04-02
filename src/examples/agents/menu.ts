import { tool, Tool } from "ai"
import { z } from "zod"
import Agent from "../../llm/Agent.js"
import { queryDBChapter } from "../queryDB.js"
import { NodeDoc } from "../types.js"
import { getItemById, vectorDBSearch, wordDBSearch } from "../utils/db.js"



export function buildMenuAgent() {
	const agent = new Agent(
		"MENU",
		`
Sei un agente che risponde a domande sui menu dei vari ristoranti. Gli chef, i posti, le abitudini, gli ingredienti, le ricette , le preparazioni tipiche di tutti i ristoranti.
Per avere informazioni devi usare i tool:
- "search_block_of_text": per cercare un "blocco di testo" specifico che compone un "capitolo".
- "search_single_word": per cercare un "blocco di testo" che contiene esattamente la singola parola o frase.
- "search_chapter": per cercare un "capitolo" che contiene informazioni generali su un argomento.
- "get_specific_chapter": per cercare un capitolo specifico attraverso il suo ID.
Una buona strategia potrebbe essere:
1. cercare i "blocchi di testo" semanticamente simili alla query con "search_block_of_text" e vedere se contengono informazioni utili.
2. se ci sono infrmazioni utili allora puoi caricare "search_chapter" per avere un contesto piu' ampio.
3. Se non hai trovato informazioni utili puoi usare "search_single_word" per cercare una singola parola o frase.
4. Se conosci l'ID e vuoi avere un contesto più ampio puoi caricare "get_specific_chapter".
5. usa la stessa linguaggio del tuo interlocutore.
		`,
		{ search_chapter, search_block_of_text, search_single_word, get_specific_chapter },
	)
	return agent
}

const search_chapter: Tool = tool({
	description: `
	Attraverso la frase di "query" recupera dei "capitoli" 
	I "capitoli" sono un testo abbastanza lungo che riguarda un argomento. 
	I "capitoli" sono composti da "blocchi di testo".
	`,
	parameters: z.object({
		query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
	}),
	execute: async ({ query }) => {
		const results: NodeDoc[] = (await queryDBChapter(query, "kb_pizza")).slice(0, 3)
		if (results.length == 0) return "Nessun risultato"
		let response = ""
		for (const result of results) {
			response += `#ID:${result.uuid}
${result.text}
---
`
		}
		return response
	}
})

const search_block_of_text: Tool = tool({
	description: `
	Attraverso la frase di "query" recupera un breve "blocco di testo".
	Da sapere: i "blocchi di testo" compongono un "capitolo".
	`,
	parameters: z.object({
		query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
	}),
	execute: async ({ query }) => {
		const results: NodeDoc[] = (await vectorDBSearch(query, "kb_pizza")).slice(0, 10)
		if (results.length == 0) return "Nessun risultato"
		let response = ""
		for (const result of results) {
			response += `#ID:${result.uuid}
#ID CHAPTER:${result.parent}
${result.text}
---
`
		}
		return response
	}
})

const search_single_word: Tool = tool({
	description: `
	Cerca puntualmente una singola parola o una frase 
	e restituisce il "blocco di testo" che la contiene.
	`,
	parameters: z.object({
		query: z.string().describe("Il testo da cercare su tutti i 'blocchi di testo'"),
	}),
	execute: async ({ query }) => {
		const results: NodeDoc[] = (await wordDBSearch(query, "kb_pizza")).slice(0, 10)
		if (results.length == 0) return "Nessun risultato"
		let response = ""
		for (const result of results) {
			response += `#ID:${result.uuid}
${result.text}
---
`
		}
		return response
	}
})

const get_specific_chapter: Tool = tool({
	description: `
	Restituisce uno specifico capitolo cercando il suo ID.
	`,
	parameters: z.object({
		id: z.string().describe("l'id di tipo uuid del capitolo"),
	}),
	execute: async ({ id }) => {
		const result: NodeDoc = await getItemById(id, "kb_pizza")
		if (!result) return "Nessun risultato"
		let response = `#ID:${result.uuid}
${result.text}
---
`
		return response}
})
