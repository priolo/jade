async function agentRun() {
	const mathAgent = new Agent(
		"MATH",
		"Sei un agente esperto matematico che conversa su operazioni aritmetiche.",
		{
			add: tool({
				description: "Add a number to another number",
				parameters: z.object({
					a: z.number().describe("The first number"),
					b: z.number().describe("The second number")
				}),
				execute: async ({ a, b }) => {
					return a + b
				}
			}),
			multiply: tool({
				description: "Multiply a number by another number",
				parameters: z.object({
					a: z.number().describe("The first number"),
					b: z.number().describe("The second number")
				}),
				execute: async ({ a, b }) => {
					return a * b
				}
			}),
		}
	)

	const chimicaAgent = new Agent(
		"CHIMICA",
		"Sei un agente esperto di molecole, reazioni, atomi, elettroni, protoni, neutroni cioè quello che riguarda la chimica.",
		{
			num_electrons_by_element_name: tool({
				description: "Restituisce il numero di elettroni di un elemento",
				parameters: z.object({
					element: z.string().describe("Nome dell'elemento di cui si vogliono sapere gli atomi"),
				}),
				execute: async ({ element }) => {
					return 3
				}
			}),
		}
	)

	const leaderAgent = new Agent(
		"LEADER",
		"Sei un agente che risponde direttamente all'utente e per rispondere può interrogare i suoi agenti tool.",
		null,
		[mathAgent, chimicaAgent]
	)




	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	while (true) {
		const prompt: string = await new Promise(resolve => rl.question('YOU: ', resolve))
		if (!prompt || prompt.toLowerCase() === 'exit') {
			console.log('Conversation ended');
			break;
		}
		const response = await leaderAgent.ask(prompt)
		console.log(response)
	}
}
//agentRun()
