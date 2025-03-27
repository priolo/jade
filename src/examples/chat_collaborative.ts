import { SchemaType } from "@google/generative-ai"
import Agent from "../llm/Agent.js"
import { NodeDoc } from "./utils/utils.js"
import readline from 'readline';
import { queryDB } from "./queryDB.js";



export async function chat(tableName: string) {
		
	const kbAgent = new Agent(
		"KB",
		`Agent that can answer questions. If specific information is requested, use the "search" tools to receive pieces of information to interpret in order to respond correctly.`,
		[
			{
				name: "search",
				description: "Search for information on a given topic",
				parameters: {
					type: SchemaType.OBJECT,
					properties: {
						query: {
							type: SchemaType.STRING,
							description: "The search query"
						}
					},
					required: ["query"]
				}
			}
		],
		{
			"search": async ({ query }): Promise<string> => {
				const results: NodeDoc[] = await (await queryDB(query, tableName)).slice(0, 3)
				if (results.length == 0) {
					return "No results"
				}
				let response = ""
				for (const result of results) {
					response += `Please note that:\n`
					response += result.text + "\n" + "-----------------"
				}
				return response
			},
		},
	)

	const leadAgent = new Agent(
		"LEAD",
		`Agent that assist the user and can call help from other agents.`,
		null,
		null,
		[kbAgent]
	)

	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	while (true) {
		const prompt: string = await new Promise(resolve => rl.question('YOU: ', resolve))
		if (!prompt || prompt.toLowerCase() === 'exit') {
			console.log('Conversation ended');
			break;
		}
		const response = await kbAgent.ask(prompt)
		console.log(response)
	}
}
