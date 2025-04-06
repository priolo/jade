import { tool } from "ai"
import Agent, { AgentOptions } from "../../llm/Agent.js"
import { buildCodiceAgent } from "./codice.js"
import { buildManualeAgent } from "./manuale.js"
import { buildMenuAgent } from "./menu.js"
import { z } from "zod"



export async function buildLeadAgent() {

	const codiceAgent = await buildCodiceAgent()
	const manualeAgent = await buildManualeAgent()
	const menuAgent = await buildMenuAgent()

	const leaderAgent = new Agent(
		"LEADER",
		<AgentOptions>{
			systemPrompt: `Sei un Agente che risponde a domande su un mondo immaginario fantascientifico fatto di ristoranti, ricette, chef, preparazioni, licenze, usanze, popolazioni e galassie.
La risposta finale "final_answer" è in italiano.
`,
			noAskForInformation: true,
			agents: [codiceAgent, manualeAgent, menuAgent],
			tools: {

				"get_locations_list": tool({
					description: "Restituisce una lista di ritoranti di un universo immaginario",
					parameters: z.object({}),
					execute: async () => {
						return Locations.join(", ");
					}
				}),

				"get_locations_distance": tool({
					description: "Restituisce la distanza tra due ristoranti in anni luce",
					parameters: z.object({
						partenza: z.string().describe("Il nome del ristorante partenza"),
						destinazione: z.string().describe("Il nome del ristorante destinazione"),
					}),
					execute: async ({ partenza, destinazione }) => {
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
						const indexPartenza = Locations.indexOf(partenza)	
						const indexDestinazione = Locations.indexOf(destinazione)
						if (indexPartenza === -1 || indexDestinazione === -1) {
							return `Non conosco la distanza tra ${partenza} e ${destinazione}`
						}
						const distance = distances[indexPartenza][indexDestinazione]
						return `La distanza tra ${partenza} e ${destinazione} è di ${distance} anni luce.`
					}
				}),
			},
		}
	)
	return leaderAgent
}

const Locations = ["Tatooine", "Asgard", "Namecc", "Arrakis", "Krypton", "Pandora", "Cybertron", "Ego", "Montressosr", "Klyntar"]