import { google } from '@ai-sdk/google';
import { mistral } from "@ai-sdk/mistral"
import { CoreMessage, generateText, tool, ToolSet } from "ai";
import dotenv from 'dotenv';
import { z } from "zod";
import { colorPrint, ColorType } from '../utils.js';
dotenv.config();



//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

//type FunctionsSets = { [key: string]: (args: any) => Promise<string> }

export enum RESPONSE_TYPE {
	SUCCESS,
	FAILURE,
	REQUEST,
}

export interface Response {
	text: string
	type: RESPONSE_TYPE
}

export interface AgentOptions {
	/** per descrivere l'AGENT nel tool */
	descriptionPrompt?: string
	/** in aggiunta al system prompt ReAct */
	systemPrompt?: string
	tools?: ToolSet
	agents?: Agent[]
	/** distruggi history quando ha risposto */
	clearOnResponse?: boolean
}


/**
 * Co-ReAct agent that can solve problems by thinking step by step.
 * The agent can use a set of tools and functions to reason and solve tasks.
 * The agent can also interact with other agents to solve complex problems.
 * Can ask info from the parent agent 
 */
class Agent {
	constructor(
		public name: string,
		options: AgentOptions,
	) {
		const defaultOptions = this.getOptions() ?? {}
		options = {
			descriptionPrompt: options.descriptionPrompt ?? defaultOptions.descriptionPrompt,
			systemPrompt: options.systemPrompt ?? defaultOptions.systemPrompt,
			tools: { ...defaultOptions.tools ?? {}, ...options.tools ?? {} },
			agents: [...defaultOptions.agents ?? [], ...options.agents ?? []],
			clearOnResponse: options.clearOnResponse ?? defaultOptions.clearOnResponse,
		}

		this.model = google('gemini-2.0-flash')
		//this.model = mistral('mistral-large-latest')

		this.subagents = options.agents
		this.subagentTools = this.createSubAgentsTools(options.agents)
		this.tools = options.tools ?? {}

		this.descriptionPrompt = options.descriptionPrompt
		this.systemPompt = options.systemPrompt
		this.clearOnResponse = options.clearOnResponse ?? false
	}

	public parent: Agent | null = null

	private model = null
	private history: CoreMessage[] = []

	private subagents: Agent[] = []
	private subagentTools: ToolSet = {}
	private tools: ToolSet = {}
	private clearOnResponse: boolean = false

	protected descriptionPrompt: string = ""
	protected systemPompt: string = ""

	private createSubAgentsTools(agents: Agent[]) {
		if (!agents) return {}
		const structs = agents.reduce<ToolSet>((acc, agent) => {

			agent.parent = this

			acc[`chat_with_${agent.name}`] = tool({
				description: agent.descriptionPrompt,
				parameters: z.object({
					prompt: z.string().describe("The question to ask the agent"),
				}),
				execute: async ({ prompt }) => {
					colorPrint([this.name, ColorType.Blue], " : chat_with : ", [agent.name, ColorType.Blue], " : ", [prompt, ColorType.Green])
					const response = await agent.ask(prompt)
					if (response.type == RESPONSE_TYPE.REQUEST) {
						return `${agent.name} asks: ${response.text}`
					} else if (response.type == RESPONSE_TYPE.FAILURE) {
						return `${agent.name} failed to answer: ${response.text}`
					}
					return `${agent.name} result: ${response.text}`
				},
			})

			return acc
		}, {})
		return structs
	}

	async build() { }

	async ask(prompt: string): Promise<Response> {

		const tools = { ...this.tools, ...this.subagentTools, ...systemTool }
		const systemPrompt = `${reactSystemPrompt ?? ""}\n${this.systemPompt ?? ""}`

		// inserisco un prompt di initializzazione per l'AGENT
		if (this.history.length == 0) {
			this.history = [{ role: "user", content: reactTaskPrompt }]
		}

		this.history.push({
			role: "user",
			content: `${prompt}`
		})

		// LOOP
		for (let i = 0; i < 50; i++) {

			// THINK
			const r = await generateText({
				model: this.model,
				temperature: 0,
				system: systemPrompt,
				messages: this.history,
				//toolChoice: !this.parent? "auto": "required",
				//toolChoice: this.history.length > 2 && !!this.parent ? "auto" : "required",
				toolChoice: "required",
				tools,
				maxSteps: 1,
			})

			this.history.push(...r.response.messages)

			const lastMessage = r.response.messages[r.response.messages.length - 1]

			if (lastMessage.role == "tool") {
				const content = lastMessage.content[0]
				const functionName = content.toolName
				const result = content.result as string

				// FINAL RESPONSE
				if (content.toolName == "final_answer") {
					colorPrint([this.name, ColorType.Blue], " : final answer: ", [result, ColorType.Green])
					this.subagents.forEach(agent => agent.kill())
					if (this.clearOnResponse) this.kill()
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.SUCCESS
					}
				}

				// COLLECT INFORMATION
				if (content.toolName == "ask_for_information") {
					colorPrint([this.name, ColorType.Blue], " : ask info: ", [result, ColorType.Green])
					return <Response>{
						text: result,
						type: RESPONSE_TYPE.REQUEST
					}
				}

				// CONTINUE RAESONING
				if (!functionName.startsWith("chat_with_")) {
					const funArgs = this.history[this.history.length - 2]?.content[1]?.["args"]
					colorPrint([this.name, ColorType.Blue], " : function : ", [functionName, ColorType.Yellow], " : ", [JSON.stringify(funArgs), ColorType.Green])
					console.log(result)
				}

				// CONTINUE RAESONING
			} else {
				colorPrint([this.name, ColorType.Blue], " : reasoning: ", [JSON.stringify(lastMessage.content), ColorType.Magenta])

				this.history.push({
					role: "assistant",
					content: "Please continue reasoning and use the provided functions to solve the task."
				})
			}

			await new Promise(resolve => setTimeout(resolve, 3000)) // wait 1 second
		}

		colorPrint(this.name, ColorType.Blue, " : ", ["failure", ColorType.Red])
		if (this.clearOnResponse) this.kill()
		return {
			text: "Couldn't reach a conclusion after maximum iterations.",
			type: RESPONSE_TYPE.FAILURE
		}
	}

	// [II] chiamato quando il task del parent è finito
	kill() {
		this.history = []
		colorPrint(this.name, ColorType.Blue, " : ", ["killed", ColorType.Red])
	}

	protected getOptions(): AgentOptions {
		return {
			descriptionPrompt: "",
			systemPrompt: "",
			tools: {},
			agents: [],
			clearOnResponse: false,
		}
	}
}

export default Agent

const toolDef = "tool" // "function"
const toolDef2 = "tools" // "functions"

// System instructions for ReAct agent
const reactSystemPrompt = `
You are a ReAct agent that solves problems by thinking step by step.
Follow this process:
1. Thought: Analyze the problem and think about how to solve it
2. Action: Choose an action from the available ${toolDef2}
3. Observation: Get the result of the ${toolDef} and use it to process the answer
4. Request information: If you really can't get information from others ${toolDef2} call "ask_for_information" ${toolDef} to ask for more information
5. Repeat steps 1-4 until you can provide a final answer (6)
6. When ready, use the "final_answer" ${toolDef} to provide your solution

Always be explicit in your reasoning. Break down complex problems into steps.
`;
//2.1 Do not call the same ${toolDef} multiple times with the same parameters to avoid loops

// Task instruction template
const reactTaskPrompt = `
Please solve the following problem using reasoning and the available ${toolDef2}:
`;

const systemTool = {

	final_answer: tool({
		description: "Provide the final answer to the problem",
		parameters: z.object({
			answer: z.string().describe("The complete, final answer to the problem"),
		}),
		execute: async ({ answer }) => {
			return answer
		}
	}),

	ask_for_information: tool({
		description: `
You can use this procedure if you don't have enough information from the user.
For example: 
User: "give me the temperature where I am now". You: "where are you now?", User: "I am in Paris"
`,
		parameters: z.object({
			request: z.string().describe("The question to ask to get useful information.")
		}),
		execute: async ({ request }) => {
			return request
		}
	})
}



