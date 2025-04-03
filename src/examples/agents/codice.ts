import AgentFinder from "../../llm/AgentFinder.js"



export function buildCodiceAgent() {
	const agent = new AgentFinder(
		"CODICE",
		{ 
			descriptionPrompt: "Sei un agente che risponde a domande sul Codice Galattico.",
			tableName: "kb_pizza_code",
		},
	)
	return agent
}



