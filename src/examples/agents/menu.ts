import AgentFinder from "../../llm/AgentFinder.js"



export async function buildMenuAgent() {
	const agent = new AgentFinder(
		"MENU",
		{
			descriptionPrompt: "Sei un agente che risponde a domande sui ristoranti e i loro menu. Gli chef, i posti, le abitudini, gli ingredienti, le ricette , le preparazioni tipiche di tutti i ristoranti.",
			tableName: "kb_pizza_menu",
			clearOnResponse: true,
		}
	)
	await agent.build()
	return agent
}

