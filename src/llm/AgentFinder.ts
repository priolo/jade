import { tool, Tool, ToolExecutionOptions, ToolSet } from 'ai';
import { z } from "zod";
import { getAllIndex, getItemById, vectorDBSearch, wordDBSearch } from '../examples/utils/db.js';
import { DOC_TYPE, NodeDoc } from '../types.js';
import Agent, { AgentOptions } from './Agent.js';



interface AgentFinderOptions extends AgentOptions {
	refs?: string[]
	tableName?: string
}

class AgentFinder extends Agent {

	constructor(
		public name: string,
		options: AgentFinderOptions,
	) {
		super(name, options)
		this.refs = options.refs ?? []
		this.tableName = options.tableName ?? "kb_pizza"
	}

	refs: string[] = []
	tableName: string

	protected getOptions(): AgentFinderOptions {
		return {
			descriptionPrompt: "",
			systemPrompt: `Per avere informazioni devi usare i tool:
- "search_block_of_text": per cercare un "blocco di testo" specifico che compone un "capitolo".
- "search_single_word": per cercare un "blocco di testo" che contiene esattamente la singola parola o frase.
- "search_chapter": per cercare un "capitolo" che contiene informazioni generali su un argomento.
- "get_specific_chapter": per cercare un capitolo specifico attraverso il suo ID.

Una buona strategia potrebbe essere:
1. Se vuoi avere una lista degli argomenti conosciuti 
allora puoi usare "get_all_index" per avere un indice generico delle fonti e dei loro capitoli.
2. Se vuoi informazioni attrverso una domanda, descrizione o frase generica che restituisca "blocchi di testo" semanticamente simili
allora usa il tool "search_block_of_text" per cercare "blocchi di testo" semanticamente simili alla "query" e per avere informazioni utili.
3. In alcuni casi è utile cercare direttamente una parola o frase precisa per ricavare i "blocchi di testo" che la contengono (come per esempio un nome, un soggetto, un argomento, un concetto, etc) 
allora usa il tool "search_single_word" per recuperare i "blocchi di testo". 
4. Se vuoi informazioni più ampie su un "blocco di testo" e conosci #ID_CHAPTER da dove è stato estratto
allora puoi usare "get_specific_chapter" per avere l'intero "capitolo" cioè un contesto più ampio dove cercre informazioni utili.
5. Se vuoi informazioni e vuoi una risposta con un contesto più ampio attraverso una domanda, frase, descrizione 
allora puoi usare "search_chapter" per avere un contesto piu' ampio.
6. Usa la stessa linguaggio del tuo interlocutore.
`,
			tools: this.getTools(),
		}
	}
	// 2. Se vuoi informazioni e la "query" è una frase generica, una domanda o una descrizione 
	// allora usa il tool "search_block_of_text" per cercare "blocchi di testo" semanticamente simili alla "query" e per avere informazioni utili.
	
	getTools(): ToolSet {

		const search_chapter: Tool = tool({
			description: `Attraverso la frase di "query" recupera dei "capitoli" 
I "capitoli" sono un testo abbastanza lungo che riguarda un argomento. 
I "capitoli" sono composti da "blocchi di testo".
`,
			parameters: z.object({
				query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
			}),
			execute: async ({ query }) => {
				//const results: NodeDoc[] = (await queryDBChapter(query, "kb_pizza")).slice(0, 3)
				const results: NodeDoc[] = await vectorDBSearch(query, this.tableName, 10, DOC_TYPE.CHAPTER, this.refs)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			}
		})

		const search_block_of_text: Tool = tool({
			description: `Attraverso la frase di "query" recupera un breve "blocco di testo".
Da sapere: i "blocchi di testo" compongono un "capitolo".
`,
			parameters: z.object({
				query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
			}),
			execute: async ({ query }, options: ToolExecutionOptions) => {
				const results: NodeDoc[] = await vectorDBSearch(query, this.tableName, 10, DOC_TYPE.PARAGRAPH, this.refs)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			},
		})

		const search_single_word: Tool = tool({
			description: `Cerca puntualmente una singola parola o una frase 
e restituisce il "blocco di testo" che la contiene.
`,
			parameters: z.object({
				query: z.string().describe("Il testo da cercare su tutti i 'blocchi di testo'"),
			}),
			execute: async ({ query }) => {
				const results: NodeDoc[] = await wordDBSearch(query, this.tableName, 20, DOC_TYPE.PARAGRAPH)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			}
		})

		const get_specific_chapter: Tool = tool({
			description: `Restituisce uno specifico capitolo cercando il suo ID.`,
			parameters: z.object({
				id: z.string().describe("l'id di tipo uuid del capitolo"),
			}),
			execute: async ({ id }) => {
				const result: NodeDoc = await getItemById(id, this.tableName)
				if (!result) return "Nessun risultato"
				return nodeToString(result)
			}
		})

		const get_all_index: Tool = tool({
			description:
				`Restituisce una lista dei documenti memorizzati e, per ogni documento, un indice dei titoli dei capitoli.`,
			parameters: z.object({}),
			execute: async () => {
				const docs = await getAllIndex(this.tableName)
				if (docs.length == 0) return
				const recordsIndex = docs.map(doc => {
					const title = doc.ref
					const records = doc.text.split("\n").reduce((acc, line) => {
						if (!line || (line = line.trim()).length == 0) return acc
						return `${acc} - ${line}\n`
					}, "")
					return `### ${title}:\n${records}`
				})
				return recordsIndex.join("")
			}
		})

		return { search_chapter, search_block_of_text, search_single_word, get_specific_chapter, get_all_index }
	}
}

export default AgentFinder



function nodeToString(node: NodeDoc): string {
	if (!node) return ""
	return (node.uuid ? `#ID:${node.uuid}\n` : "")
		+ (node.parent ? `#ID_CHAPTER:${node.parent}\n` : "")
		+ (node.text ?? "")
		+ "\n---\n"
}