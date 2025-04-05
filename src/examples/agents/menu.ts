import AgentFinder from "../../llm/AgentFinder.js"



export async function buildMenuAgent() {
	const agent = new AgentFinder(
		"MENU",
		{
			descriptionPrompt: "Sei un agente che risponde a domande sui: menu, i piatti e gli ingredienti, i ristoranti e i loro chef.",
			tableName: "kb_pizza_menu",
			clearOnResponse: true,
		}
	)
	await agent.build()
	return agent
}

