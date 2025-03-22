import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, FunctionCallingMode } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

export async function aiRun(text: string) {

	const model = genAI.getGenerativeModel({
		//model: "gemini-1.5-flash",
		model: "gemini-2.0-flash",
		tools: [
			{
				functionDeclarations: [ funtionExtrapolate ]
			}
		],
		toolConfig: {
			functionCallingConfig: { mode: FunctionCallingMode.ANY },
		},
		generationConfig: { temperature: 0 },
		//systemInstruction: ``,
	})

	const chat = model.startChat()
	const result = await chat.sendMessage(`${instructions}${START_STORY}${text}${END_STORY}`)

	console.log(result)

	// For simplicity, this uses the first function call found.
	const calls = result.response.functionCalls();
	const call = calls?.[0]
	const articles = (call!.args as any)["articles"]
	console.log(articles)
	return articles
}

const instructions = `
the text from <|START-STORY|> to <|END-STORY|> is the content from the website www.repubblica.it of March 2, 2025 at 10:07 PM.
From this text, extrapolate the data in many articles using the available tool.
`
const START_STORY = "<|START-STORY|>"
const END_STORY = "<|END-STORY|>"

const funtionExtrapolate: FunctionDeclaration = {
	name: "extrapolate_articles",
	description: `
extract an array of articles from all the plain text
`,
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			articles: {
				type: SchemaType.ARRAY,
				items: {
					type: SchemaType.OBJECT,
					properties: {
						title: {
							description: "a few lines indicating the content of the article",
							type: SchemaType.STRING
						},
						description: {
							description: "a summary of the piece of text that does not exceed 500 letters",
							type: SchemaType.STRING
						},
						subjects: {
							type: SchemaType.ARRAY,
							description: "tags or single-word subjects involved in the article",
							items: {
								type: SchemaType.STRING
							}
						}
					},
					required: [
						"title",
						"subjects"
					],
					description: "a piece of the whole text that makes sense"
				}
			}
		}
	}
}


//aiRun("Abbonati Menu Cerca Notifiche Abbonati Abbonati Redazione Scriveteci 02 Marzo 2025 - Aggiornato alle 18.57 L'intervista Maurizio Nichetti: \"Solo l'ironia ci può salvare dall'angoscia. La società ha bisogno di speranza\" Papa Francesco, il bollettino: “Nessuna conseguenza dalla crisi di due giorni fa, è stabile” Roma live 0 1 02/03 ore 18:00 Como Bologna Fine 2 1 02/03 ore 15:00 Cagliari Genoa Fine 1 1 02/03 ore 15:00 Empoli Monza Fine 0 2 02/03 ore 12:30 Torino Udinese Fine 1 0 01/03 ore 20:45 Parma Napoli Fine 1 1 01/03 ore 18:00 Inter Atalanta Fine 0 0 01/03 ore 15:00 Venezia Fiorentina Fine 1 0 28/02 ore 20:45 Lecce Milan PreMatch 0 0 02/03 ore 20:45 Lazio Juventus PreMatch 03/03 ore 20:45 Verona Serie A La diretta Roma-Como 0-1. Da Cunha supera Mancini e batte Svilar | Classifica Primo piano La diretta Von der Leyen: “Riarmare con urgenza l'Europa”. Meloni: “Zelensky-Trump? Dispiaciuta ma tifoserie non sono utili” Il bilaterale Meloni incontra Starmer, irritazione per l’attivismo anglo-francese dal nostro inviato Tommaso Ciriaco Il focus Gb e Francia lavorano a un piano di pace per Kiev: cosa prevede dal nostro corrispondente Antonello Guerrera Il Regno Unito L'invito per Trump mentre Carlo riceve Zelensky: dietro il tè e i banchetti il “potere morbido” della Royal Family di Enrico Franceschini La ricostruzione Una trappola organizzata nello Studio Ovale: come è stato preparato l'agguato al leader ucraino di Massimo Basile Il pontefice Papa, il bollettino: “Nessuna conseguenza dall'ultima crisi. È stabile, a messa con medici e infermieri” L'iniziativa Il 15 marzo a Roma la grande piazza per dire sì all’Europa | Lo speciale di Gabriella Cerami L'intervista Fini: “I veri patrioti sono gli ucraini. La destra non esiti e stia con loro” di Francesco Bei La lettera /1 Michele, io ci sarò. Chi l’avrebbe mai detto di Pier Ferdinando Casini La lettera /2 In strada uniti sotto una sola bandiera di Ernesto Maria Ruffini La lettera /3 La storia accelera e chiama risposte decisive di Riccardo Magi e Eric Jozsef Il colloquio Maraini: “Aderisco perché oggi sostenere Bruxelles significa lottare per la libertà” di Giovanna Vitale La proposta Una piazza per l’Europa di Michele Serra Longform La nuova frontiera delle truffe allo Stato. Che ci costa molti miliardi ogni anno | Podcast di Antonio Fraschilla.")