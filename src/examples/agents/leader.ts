import { SchemaType } from "@google/generative-ai"
import Agent from "../../llm/Agent.js"
import { NodeDoc } from "../types.js"
import { queryDB } from "../queryDB.js"
import { buildCodiceAgent } from "./codice.js"
import { buildMenuAgent } from "./menu.js"
import { buildManualeAgent } from "./manuale.js"



export function buildLeadAgent() {

	const codiceAgent = buildCodiceAgent()
	const manualeAgent = buildManualeAgent()
	const menuAgent = buildMenuAgent()

	const leaderAgent = new Agent(
		"LEADER",
		`Sei un Agente che risponde a domande su un mondo immaginario fantascientifico.
- Se ti servono informazioni specifiche o non sai rispondere alla domanda usa chat_with per poter chiedere ai tuoi sotto agenti e ricevere informazioni utili.
- chat_with CODICE ti permette di chiedere informazioni sul Codice Galattico (norme, leggi, abitudini, etc etc).
- chat_with MENU ti permette di chiedere informazioni sul menu dei ristoranti (piatti, preparazioni etc etc).
- chat_with MANUALE ti permette di chiedere informazioni sul manuale di cucina (ricette, procedimenti etc etc).
`,
		null,
		null,
		[codiceAgent, manualeAgent, menuAgent]
	)
	return leaderAgent
}