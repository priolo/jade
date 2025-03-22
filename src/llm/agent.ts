import { ChatSession, FunctionCallingMode, FunctionDeclaration, GenerativeModel, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

type FunctionsSets = { [key: string]: (args: any) => Promise<string> }

export enum RESPONSE_TYPE {
	SUCCESS,
	FAILURE,
	REQUEST,
}

export interface Response {
	text: string
	type
}

class Agent {
	constructor(
		public name: string,
		public descriptionPrompt: string = "",
		tools: FunctionDeclaration[] = [],
		functionsMap: FunctionsSets = {},
		agents: Agent[] = [],
		systemPrompt: string = reactSystemPrompt,
	) {
		const subAgentsFnc = this.createSubAgentsFnc(agents)
		const subAgentDec = this.createSubAgentsDec(agents)

		this.functionsMap = { ...functionsMap, ...subAgentsFnc}

		this.llm = genAI.getGenerativeModel({
			model: "gemini-2.0-flash",
			tools: [
				{
					functionDeclarations: [...tools, ...subAgentDec, finalAnswerStruct, askInformationStruct]
				}
			],
			toolConfig: {
				functionCallingConfig: { mode: FunctionCallingMode.ANY }
			},
			generationConfig: { temperature: 0 },
			systemInstruction: systemPrompt
		})

		this.chat = this.llm.startChat({
			history: [{ role: "user", parts: [{ text: reactTaskPrompt }] }]
		})
	}

	private functionsMap: FunctionsSets = {}
	private llm: GenerativeModel = null
	private chat: ChatSession = null

	createSubAgentsDec(agents: Agent[]) {
		const structs = agents.map<FunctionDeclaration>(agent => {
			return {
				name: `chat_with_${agent.name}`,
				description: agent.descriptionPrompt,
				parameters: {
					type: SchemaType.OBJECT,
					properties: {
						prompt: {
							type: SchemaType.STRING,
							description: "The question to ask the agent"
						}
					},
					required: ["prompt"]
				}
			}
		})
		return structs
	}

	createSubAgentsFnc(agents: Agent[]) {
		const funcs = agents.reduce((acc, agent) => {
			acc[`chat_with_${agent.name}`] = async ({ prompt }: any) => {
				const response = await agent.ask(prompt)
				if (response.type == RESPONSE_TYPE.REQUEST) {
					return `${agent.name} asks: ${response.text}`
				} else if (response.type == RESPONSE_TYPE.FAILURE) {
					return `${agent.name} failed to answer: ${response.text}`
				}
				return `${agent.name} result: ${response.text}`
			}
			return acc
		}, {} as FunctionsSets)
		return funcs
	}



	async ask(prompt: string): Promise<Response> {

		// LOOP
		for (let i = 0; i < 10; i++) {

			// THINK
			const response = await this.chat.sendMessage(prompt)

			// ROUTE TOOL
			console.log(this.name, ":receive:", prompt)
			const functionCalls = response.response.functionCalls();
			if (functionCalls && functionCalls.length > 0) {

				const call = functionCalls[0]
				const functionName = call.name
				let args = call.args

				// FINAL RESPONSE
				if (functionName === "final_answer") {
					console.log(this.name, ":final answer: ", args["answer"])
					return {
						text: args["answer"],
						type: RESPONSE_TYPE.SUCCESS
					}
				}

				// COLLECT INFORMATION
				if (functionName === "ask_for_information") {
					console.log(this.name, ":ask info:", args["request"])
					return {
						text: args["request"],
						type: RESPONSE_TYPE.REQUEST
					}
				}

				// CONTINUE RAESONING
				console.log(this.name, `:function:`, functionName, args);
				const fun = this.functionsMap[functionName]
				prompt = await fun(args)

			} else {
				prompt = "Please continue reasoning and use the provided functions to solve the task."
			}

		}

		console.log(this.name, ":falure")
		return {
			text: "Couldn't reach a conclusion after maximum iterations.",
			type: RESPONSE_TYPE.FAILURE
		}
	}
}

export default Agent

// System instructions for ReAct agent
const reactSystemPrompt = `
You are a ReAct agent that solves problems by thinking step by step.
Follow this process:
1. Thought: Analyze the problem and think about how to solve it
2. Action: Choose an action from the available functions
3. Ask information: If you don't have enough information call the ask_for_information function
3. Observation: Receive the result of the action
4. Repeat steps 1-3 until you can provide a final answer
5. When ready, use the final_answer function to provide your solution

Always be explicit in your reasoning. Break down complex problems into steps.
`;

// Task instruction template
const reactTaskPrompt = `
Please solve the following problem using reasoning and the available tools:

`;

const finalAnswerStruct: FunctionDeclaration = {
	name: "final_answer",
	description: "Provide the final answer to the problem",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			answer: {
				type: SchemaType.STRING,
				description: "The complete, final answer to the problem"
			}
		},
		required: ["answer"]
	}
}

const askInformationStruct: FunctionDeclaration = {
	name: "ask_for_information",
	description: `
You can use this procedure if you don't have enough information from the user.
For example: 
User: "give me the temperature where I am now". You: "where are you now?", User: "I am in Paris"
`,
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			request: {
				type: SchemaType.STRING,
				description: "The question to ask to get useful information."
			}
		},
		required: ["request"]
	}
}
