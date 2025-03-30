import { chat } from "./chat.js"
import { queryDB } from "./queryDB.js"
import { normalizeString, importPDFToText, storeInDb, storeTextInDb, importHTMLToText } from "./storeInDB.js"
import * as path from 'path';
import { fileURLToPath } from 'url';
import fromPDFToText from '../tools/textualize/pdf.js';
import Agent from "../llm/Agent.js";
import { tool } from "ai";
import { z } from "zod"
import readline from 'readline';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const TableName = "kb_pizza"




//storeInDb("../../data/pizza/Codice Galattico/Codice Galattico.pdf", TableName)




const pdfPaths = [
	"Anima Cosmica",
	"Armonia Universale",
	"Cosmica Essenza",
	"Datapizza",
	"Eco di Pandora",
	"Eredita Galattica",
	"Essenza dell Infinito",
	"Il Firmamento",
	"L Architetto dell Universo",
	"L Eco dei Sapori",
	"L Equilibrio Quantico",
	"L Essenza Cosmica",
	"L Essenza del Multiverso su Pandora",
	"L Essenza delle Dune",
	"L Essenza di Asgard",
	"L Etere del Gusto",
	"L infinito in un Boccone",
	"L Oasi delle Dune Stellari",
	"L Universo in Cucina",
	"Le Dimensioni del Gusto",
	"Le Stelle che Ballano",
	"Le Stelle Danzanti",
	"Ristorante delle Dune Stellari",
	"Ristorante Quantico",
	"Sala del Valhalla",
	"Sapore del Dune",
	"Stelle Astrofisiche",
	"Stelle dell Infinito Celestiale",
	"Tutti a TARSvola",
	"Universo Gastronomico di Namecc",
]
// async function importMenuPDFs() {
// 	for (const pdfPath of pdfPaths) {
// 		await storeInDb(`../../data/pizza/Menu/${pdfPath}.pdf`, TableName)
// 	}
// }
//importMenuPDFs()


// async function importManualPDFs() {
// 	let text = await importPDFToText("../../data/pizza/Misc/Manuale di Cucina.pdf")
// 	text = normalizeString(text)
// 	await storeTextInDb(text, TableName)
// }
// importManualPDFs()




// async function importBlog() {
// 	let text = await importHTMLToText("../../data/pizza/Blogpost/blog_etere_del_gusto.html")
// 	await storeTextInDb(text, TableName)
// }
// importBlog()










//storeInDb("../../data/rome_guide2.pdf", TableName)
//storeInDb("../../data/legge_maltrattamento_animali.pdf", TableName)
//storeInDb("../../data/light.pdf", TableName)

//queryDB("typical recipes", TableName)
// queryDB("Kitchen vampire", TableName)
// queryDB("where can i eat?", TableName)
// queryDB("quando non è reato?", TableName)
// queryDB("research on design", TableName)

//chat()
queryDB("Cioccorane", "kb_pizza")

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