import AgentFinder from "../../llm/AgentFinder.js"



export async function buildManualeAgent() {
	const agent = new AgentFinder(
		"MANUALE",
		{ 
			descriptionPrompt: "Sei un agente che risponde a domande sul Manuale di Cucina. Contiene le metodologie, ricette, licenze per poter preparare i piatti.",
			tableName: "kb_pizza_manual",
			clearOnResponse: true,
		},
	)
	await agent.build()
	return agent
}
