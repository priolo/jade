import { tool, Tool, ToolExecutionOptions, ToolSet } from 'ai';
import { z } from "zod";
import { queryDBChapter } from '../examples/queryDB.js';
import { DOC_TYPE, NodeDoc } from '../types.js';
import { getAllIndex, getItemById, vectorDBSearch, wordDBSearch } from '../examples/utils/db.js';
import Agent, { AgentOptions } from './Agent.js';



interface AgentFinderOptions extends AgentOptions {
	docs?: string[]
	tableName?: string
}

class AgentFinder extends Agent {

	constructor(
		public name: string,
		options: AgentFinderOptions,
	) {
		super(name, options)
		this.docs = options.docs ?? []
		this.tableName = options.tableName ?? "kb_pizza"

		// estraggo tutti i doc INDEX
		getAllIndex(this.tableName).then((docs) => {
			if (docs.length == 0) return
			const indexPrompt = `I am aware of the following topics:\n`+docs.map(doc => `- ${doc.text}`).join("\n")
			this.systemPompt += indexPrompt
		})
		
	}

	docs: string[] = []
	tableName: string

	protected getOptions(): AgentFinderOptions {

		// const tools = { search_chapter, search_block_of_text, search_single_word, get_specific_chapter }
		// Object.entries(tools).forEach(([name, tool]) => {
		// 	const fn = tool.execute as any
		// 	tool.execute = (arg, options) => fn(arg, options, this)
		// })

		return {
			descriptionPrompt: "",
			systemPrompt: 
`Per avere informazioni devi usare i tool:
- "search_block_of_text": per cercare un "blocco di testo" specifico che compone un "capitolo".
- "search_single_word": per cercare un "blocco di testo" che contiene esattamente la singola parola o frase.
- "search_chapter": per cercare un "capitolo" che contiene informazioni generali su un argomento.
- "get_specific_chapter": per cercare un capitolo specifico attraverso il suo ID.
Una buona strategia potrebbe essere:
1. Se la "query" è una frase generica, una domanda o una descrizione 
allora usa il tool "search_block_of_text" per cercare "blocchi di testo" semanticamente simili alla "query" e per avere informazioni utili.
2. Se hai una parola o frase precisa (come per esempio un nome) 
allora usa il tool "search_single_word" per recuperare i "blocchi di testo". 
3. Se non hai trovato informazioni utili 
allora puoi usare "search_chapter" per avere un contesto piu' ampio.
5. Se conosci #ID_CHAPTER 
allora puoi usare "get_specific_chapter" per avere un intero "capitolo" cioè un contesto più ampio dove cercre informazioni utili.
6. Usa la stessa linguaggio del tuo interlocutore.
`,
			tools: this.getTools(),
		}
	}

	getTools(): ToolSet {

		const search_chapter: Tool = tool({
			description: 
`Attraverso la frase di "query" recupera dei "capitoli" 
I "capitoli" sono un testo abbastanza lungo che riguarda un argomento. 
I "capitoli" sono composti da "blocchi di testo".
`,
			parameters: z.object({
				query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
			}),
			execute: async ({ query }) => {
				//const results: NodeDoc[] = (await queryDBChapter(query, "kb_pizza")).slice(0, 3)
				const results: NodeDoc[] = await vectorDBSearch(query, this.tableName, 10, DOC_TYPE.CHAPTER, this.docs)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			}
		})

		const search_block_of_text: Tool = tool({
			description: 
`Attraverso la frase di "query" recupera un breve "blocco di testo".
Da sapere: i "blocchi di testo" compongono un "capitolo".
`,
			parameters: z.object({
				query: z.string().describe("Il testo che permette la ricerca di informazioni per similitudine su un vector db"),
			}),
			execute: async ({ query }, options: ToolExecutionOptions) => {
				const results: NodeDoc[] = await vectorDBSearch(query, this.tableName, 10, DOC_TYPE.PARAGRAPH, this.docs)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			},
		})

		const search_single_word: Tool = tool({
			description: 
`Cerca puntualmente una singola parola o una frase 
e restituisce il "blocco di testo" che la contiene.
`,
			parameters: z.object({
				query: z.string().describe("Il testo da cercare su tutti i 'blocchi di testo'"),
			}),
			execute: async ({ query }) => {
				const results: NodeDoc[] = await wordDBSearch(query, "kb_pizza", 20)
				if (results.length == 0) return "Nessun risultato"
				let response = ""
				for (const result of results) {
					response += nodeToString(result)
				}
				return response
			}
		})

		const get_specific_chapter: Tool = tool({
			description: 
`Restituisce uno specifico capitolo cercando il suo ID.
`,
			parameters: z.object({
				id: z.string().describe("l'id di tipo uuid del capitolo"),
			}),
			execute: async ({ id }) => {
				const result: NodeDoc = await getItemById(id, "kb_pizza")
				if (!result) return "Nessun risultato"
				return nodeToString(result)
			}
		})

		return { search_chapter, search_block_of_text, search_single_word, get_specific_chapter }
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