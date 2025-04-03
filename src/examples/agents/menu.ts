import AgentFinder from "../../llm/AgentFinder.js"



export function buildMenuAgent() {
	const agent = new AgentFinder(
		"MENU",
		{
			descriptionPrompt: "Sei un agente che risponde a domande sui menu dei vari ristoranti. Gli chef, i posti, le abitudini, gli ingredienti, le ricette , le preparazioni tipiche di tutti i ristoranti.",
			tableName: "kb_pizza_menu",
		}
	)
	return agent
}

