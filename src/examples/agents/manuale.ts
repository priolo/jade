import AgentFinder from "../../llm/AgentFinder.js"



export async function buildManualeAgent() {
	const agent = new AgentFinder(
		"MANUALE",
		{ 
			description: "Sei un agente che risponde a domande sul Manuale di Cucina di Sirius Cosmo (licenze, ricette, abilità, livelli, procedimenti con vantaggi e svantaggi, etc etc).",
			tableName: "kb_pizza_manual",
			clearOnResponse: true,
		},
	)
	await agent.build()
	return agent
}
