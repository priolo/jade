import { tool } from "ai"
import Agent from "../../llm/Agent.js"
import { buildCodiceAgent } from "./codice.js"
import { buildManualeAgent } from "./manuale.js"
import { buildMenuAgent } from "./menu.js"
import { z } from "zod"



export function buildLeadAgent() {

	const codiceAgent = buildCodiceAgent()
	const manualeAgent = buildManualeAgent()
	const menuAgent = buildMenuAgent()

	const leaderAgent = new Agent(
		"LEADER",
		{
			descriptionPrompt: "Sei un Agente che risponde a domande su un mondo immaginario fantascientifico.",
			systemPrompt: `
Se ti servono informazioni specifiche o non sai rispondere alla domanda usa chat_with per poter chiedere ai tuoi sotto agenti e ricevere informazioni utili.
- chat_with CODICE ti permette di chiedere informazioni sul Codice Galattico (licenze, definizioni, ingredienti, regolamenti, norme, leggi, abitudini, etc etc).
- chat_with MENU ti permette di chiedere informazioni sul menu dei ristoranti (piatti, preparazioni etc etc).
- chat_with MANUALE ti permette di chiedere informazioni sul manuale di cucina di  Sirius Cosmo (licenze, ricette, abilità, livelli, procedimenti con vantaggi e svantaggi, etc etc).
`,
			agents: [codiceAgent, manualeAgent, menuAgent],
			tools: {
				"get_distance": tool({
					description: "Restituisce la distanza tra due popolazioni o culture spaziali",
					parameters: z.object({
						partenza: z.string().describe("Il nome della popolazione o cultura spaziale di partenza"),
						destinazione: z.string().describe("Il nome della popolazione o cultura spaziale di destinazione"),
					}),
					execute: async ({ partenza, destinazione }) => {
						const destinations = ["Tatooine", "Asgard", "Namecc", "Arrakis", "Krypton", "Pandora", "Cybertron", "Ego", "Montressosr", "Klyntar"]
						const distances = [
							[0, 695, 641, 109, 661, 1130, 344, 835, 731, 530],
							[695, 0, 550, 781, 188, 473, 493, 156, 240, 479],
							[641, 550, 0, 651, 367, 987, 728, 688, 767, 845],
							[109, 781, 651, 0, 727, 1227, 454, 926, 834, 640],
							[661, 188, 367, 727, 0, 626, 557, 321, 422, 599],
							[1130, 473, 987, 1227, 626, 0, 847, 317, 413, 731],
							[344, 493, 728, 454, 557, 847, 0, 594, 434, 186],
							[835, 156, 688, 926, 321, 317, 594, 0, 215, 532],
							[731, 240, 767, 834, 422, 413, 434, 215, 0, 331],
							[530, 479, 845, 640, 599, 731, 186, 532, 331, 0],
						]
						const indexPartenza = destinations.indexOf(partenza)	
						const indexDestinazione = destinations.indexOf(destinazione)
						if (indexPartenza === -1 || indexDestinazione === -1) {
							return `Non conosco la distanza tra ${partenza} e ${destinazione}`
						}
						const distance = distances[indexPartenza][indexDestinazione]
						return `La distanza tra ${partenza} e ${destinazione} è di ${distance}.`
					}
				}),
			}
		}
	)
	return leaderAgent
}