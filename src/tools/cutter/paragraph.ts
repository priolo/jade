import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

export async function textCutterParagraph(text: string): Promise<Paragraph[]> {

	const llm = genAI.getGenerativeModel({
		model: "gemini-2.0-flash",
		generationConfig: {
			responseMimeType: "application/json",
			responseSchema: schema,
			temperature: 0,
		},
		systemInstruction: systemPrompt
	})

	const result = await llm.generateContent(text)
	const resultTxt = result.response.text()
	const resultJson = JSON.parse(resultTxt)

	return resultJson
}

export type Paragraph = {
	start: string,
}

const schema: Schema = {
	description: "Array of paragraph into which the chapter has been divided",
	type: SchemaType.ARRAY,
	items: {
		description: "This is the description of the single paragraph",
		type: SchemaType.OBJECT,
		properties: {
			start: {
				description: `
The first 5 exact words from the beginning of the single paragraph.
For example in the sentence:
"The Territorial Force was a part-time volunteer component of the British Army, created in 1908 to augment British land forces without resorting to conscription."
The correct answer is
"The Territorial Force was a"
`,
				type: SchemaType.STRING
			},
		},
		required: ["start"]
	}
}

const systemPrompt = `
Divide a chapter of text into multiple paragraphs.
A single paragraph is constructed according to the following rules:
- the single paragraph is composed of one or more sentences with a self-contained autonomous discourse
- it refers to a single and simple concept.
- it does not exceed about 200 words
- it does not overlap with other paragraphs
- without cuts in the middle of sentences
`;

async function run() {
	const text = `Art. 1.
(Modifiche al codice penale)
 1. Dopo il titolo IX del libro II del codice penale è inserito il seguente:
"TITOLO IX-BIS - DEI DELITTI CONTRO IL SENTIMENTO PER GLI ANIMALI
Art. 544-bis. - (Uccisione di animali). - Chiunque, per crudeltà o senza necessità, cagiona la morte
di un animale è punito con la reclusione da tre mesi a diciotto mesi.
Art. 544-ter. - (Maltrattamento di animali). - Chiunque, per crudeltà o senza necessità, cagiona una
lesione ad un animale ovvero lo sottopone a sevizie o a comportamenti o a fatiche o a lavori
insopportabili per le sue caratteristiche etologiche è punito con la reclusione da tre mesi a un anno o
con la multa da 3.000 a 15.000 euro.
La stessa pena si applica a chiunque somministra agli animali sostanze stupefacenti o vietate ovvero
li sottopone a trattamenti che procurano un danno alla salute degli stessi.
La pena è aumentata della metà se dai fatti di cui al primo comma deriva la morte dell'animale.
Art. 544-quater. - (Spettacoli o manifestazioni vietati). - Salvo che il fatto costituisca più grave
reato, chiunque organizza o promuove spettacoli o manifestazioni che comportino sevizie o strazio
per gli animali è punito con la reclusione da quattro mesi a due anni e con la multa da 3.000 a.
15.000 euro.
La pena è aumentata da un terzo alla metà se i fatti di cui al primo comma sono commessi in
relazione all'esercizio di scommesse clandestine o al fine di trarne profitto per sè od altri ovvero se
ne deriva la morte dell'animale.
Art. 544-quinquies. - (Divieto di combattimenti tra animali). - Chiunque promuove, organizza o
dirige combattimenti o competizioni non autorizzate tra animali che possono metterne in pericolo
l'integrità fisica è punito con la reclusione da uno a tre anni e con la multa da 50.000 a 160.000
euro.
La pena è aumentata da un terzo alla metà:
 1) se le predette attività sono compiute in concorso con minorenni o da persone armate;
 2) se le predette attività sono promosse utilizzando videoriproduzioni o materiale di qualsiasi tipo
contenente scene o immagini dei combattimenti o delle competizioni;
 3) se il colpevole cura la ripresa o la registrazione in qualsiasi forma dei combattimenti o delle
competizioni.
Chiunque, fuori dei casi di concorso nel reato, allevando o addestrando animali li destina sotto
qualsiasi forma e anche per il tramite di terzi alla loro partecipazione ai combattimenti di cui al
primo comma è punito con la reclusione da tre mesi a due anni e con la multa da 5.000 a 30.000
euro. La stessa pena si applica anche ai proprietari o ai detentori degli animali impiegati nei
combattimenti e nelle competizioni di cui al primo comma, se consenzienti.
Chiunque, anche se non presente sul luogo del reato, fuori dei casi di concorso nel medesimo,
organizza o effettua scommesse sui combattimenti e sulle competizioni di cui al primo comma è
punito con la reclusione da tre mesi a due anni e con la multa da 5.000 a 30.000 euro.
Art. 544-sexies. - (Confisca e pene accessorie). - Nel caso di condanna, o di applicazione della pena
su richiesta delle parti a norma dell'articolo 444 del codice di procedura penale, per i delitti previsti
dagli articoli 544-ter, 544-quater e 544-quinquies, è sempre ordinata la confisca dell'animale, salvo
che appartenga a persona estranea al reato.
E' altresì disposta la sospensione da tre mesi a tre anni dell'attività di trasporto, di commercio o di
allevamento degli animali se la sentenza di condanna o di applicazione della pena su richiesta è
pronunciata nei confronti di chi svolge le predette attività. In caso di recidiva è disposta
l'interdizione dall'esercizio delle attività medesime".
 2. All'articolo 638, primo comma, del codice penale, dopo le parole: "è punito" sono inserite le
seguenti: ", salvo che il fatto costituisca più grave reato".
 3. L'articolo 727 del codice penale è sostituito dal seguente:
"Art. 727. - (Abbandono di animali). - Chiunque abbandona animali domestici o che abbiano
acquisito abitudini della cattività è punito con l'arresto fino ad un anno o con l'ammenda da 1.000 a
10.000 euro.
Alla stessa pena soggiace chiunque detiene animali in condizioni incompatibili con la loro natura, e
produttive di gravi sofferenze`
	await textCutterParagraph(text)
}

//run()