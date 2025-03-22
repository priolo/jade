import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import Agent, { Response, RESPONSE_TYPE } from "./agent.js";
import readline from 'readline'



// Function declarations
const searchFunction: FunctionDeclaration = {
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

const calculateFunction: FunctionDeclaration = {
	name: "calculate",
	description: "Perform a mathematical calculation",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			expression: {
				type: SchemaType.STRING,
				description: "The mathematical expression to evaluate (e.g. '2 + 2', '5 * 3')"
			}
		},
		required: ["expression"]
	}
}

async function run() {

	const calculatorAgent = new Agent(
		"CALCULATOR",
		"Agent that can perform calculations and answer questions about mathematics.",
		[searchFunction, calculateFunction],
		{
			"search": async ({ query }): Promise<string> => {
				// In a real implementation, this would query an actual search API
				return `Mock search results for: ${query}. 
				This is a placeholder. In a real implementation, this would return actual search results.`;
			},
			"calculate": async ({ expression }): Promise<string> => {
				try {
					const result = eval(expression)
					return `Function result: ${result}`
				} catch (error) {
					return `Function result: Error calculating ${expression}: ${error}`;
				}
			}
		}
	)

	const leadAgent = new Agent(
		"LEADER",
		"Agent that can answer questions and interact with other agents.",
		undefined,
		undefined,
		[calculatorAgent],
	)

	let prompt = "What is 2 + 2 * X - 1?"
	let response: Response = null
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	while (true) {

		response = await leadAgent.ask(prompt)

		if (response.type == RESPONSE_TYPE.REQUEST) {
			prompt = await new Promise(resolve => rl.question('YOU: ', resolve))
			if (!prompt || prompt.toLowerCase() === 'exit') {
				console.log('Conversation ended');
				break;
			}
			continue
		}

		break
	}

	rl.close();
	console.log(response.text)

}
run()


