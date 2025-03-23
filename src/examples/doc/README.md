# MultilevelRAG

## PREMESSA

Ottimizzazione per il recupero testo per la RAG.  
Spezzare un intero documento o in maniera regolare ha i seguenti svantaggi:  
- non permette di incorporare tutta la semantica del contesto perche' il taglio puo' avvenire potenzialmente in qualunque punto  
- contesti troppo lunghi non permettono un recupero efficace con dei vettori di discreta dimensione  

Ho implementato questa tecnica per un mio progetto ed ha funzionato piuttosto bene.  
Probabilmente è stata già implementata (e sicuramente anche meglio di come ho fatto io). 
Se è così fatemelo sapere, grazie!  

## SOLUZIONE (QUASI)

### Immagazzinamento di un DOCUMENTO  
L'idea è di chiedere ad un LLM di spezzare il DOCUMENTO in CAPITOLI semanticamente coereti.  
Questi CAPITOLI sono divisi a loro volta in BLOCCHI di testo con le classiche tecniche di splitting.  
I BLOCCHI mantengono un riferimento al CAPITOLO da cui provengono.  
E in fine i BLOCCHI sono embedding e memorizzati nel database vettoriale.  
**p.s.** In realtà metto anche i CAPITOLI nel dabatase vettoriale.. non si sa mai.

![Multilevel RAG Document Storage Structure](fig1.png)

### Recupero tramite QUERY
Come di consueto dalla stringa di QUERY recupero il vettore di EMBEDDING
Con questo interrogo il VECTOR DB e ricavo un array di BLOCCHI di testo (memorizzati precedentemente) semanticamente simili alla QUERY.
Con questi BLOCCHI di testo (e grazie alla loro distanza dalla QUERY) compilo una lista di CAPITOLI in qualche modo pertinente

## DIVISIONE IN CAPITOLI 

Questa operazione è eseguita del LLM quindi puo' essere abbastanza "pesante". Va fatta con qualche trucco.

> FUN FACT (con "gemini-2.0-flash")  
> Se date ad un LLM un documento molto lungo e gli chiedete di restituirvi i CAPITOLI   
> potrebbe metterci molto molto tempo per completare l'operazione  
> o darvi un errore (a me lo dava)  
> perche' deve ri-generare tutti i token del documento stesso!  

L'idea è di farsi restituire dell'LLM solo i riferimenti di dove inizia ogni singolo CAPITOLO
Questo permette di ridurre al massimo la lunghezza della risposta e di velocizzarla moltissimo.

> FUN FACT  
> Se chiedete ad un LLM di darvi una posizione numerica   
> per esempio un indice del numero di caratteri dove inizia un CAPITOLO... sicuramente sbaglierà!  
> Come sapete gli LLM non riescono a contare i caratteri correttamente dato che loro utilizzano i TOCKENS.  
> Il trucco è di farsi dare le prime X prole dell'inizio del CAPITOLO. Questo lo fa "abbastnza" bene.  

### TAGLIAMO IL DOC IN CAPITOLI CON LLM

Ho creato un semplice LLM generativo con `response schema` 
così da avere esattamente la lista di "inizio CAPITOLO"

> LO SO è typescript e non python! Perche' sono abituato a usare typescript! 
> Ma il codice è cosi' semplice che si può tradurre ad occhio.
> Comunque il grosso del lavoro sono state le descrizioni dello `schema`.

```typescript
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function textCutterChapter(text: string): Promise<Chapter[]> {

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

export type Chapter = {
	opening_words: string,
}

const schema: Schema = {
	description: `list sorted by the position of the text blocks into which the document has been divided`,
	type: SchemaType.ARRAY,
	items: {
		description: `
An array of starting sentences for each text block
- they are in the exact order of position in the array relative to the entire document.
- each starting sentence indicates the exact beginning of each text block.
`,
		type: SchemaType.OBJECT,
		properties: {
			opening_words: {
description: `
It is a string containing the first 5 initial opening words of the single text block.
- The 5 words must be exactly the same sequence of words.
- The words must be AT LEAST 5.
For example in the blocks of text:
"The Territorial Force was a part-time volunteer component of the British Army, created in 1908 to augment British land forces without resorting to conscription."
The correct answer is
"The Territorial Force was a"
`,
				type: SchemaType.STRING
			},
		},
		required: ["opening_words"]
	}
}

const systemPrompt = `
Split a document into smaller blocks of text.
These individual blocks of text follow the following rules:
- The meaning of the single block of text refers to a single specific topic. For example, a single character, place, concept, or event.
- The length of the text block MUST be less than 400 words
- The text block has more than 100 words.
- A single block of text is understandable even on its own
- A single block of text does not overlap with other blocks of text
- Without cuts in the middle of sentences
`
```

Otteniamo (in un tempo ragionevole) un arry simile a questo:

```ts
[
  {
    opening_words: "When folding the sheet, we",
  },
  {
    opening_words: "Suggestions how to print and",
  },
  {
    opening_words: "The founding of Rome is",
  },
   ...
]
```

Questa è la funzione per ottenere i CAPITOLI interi dall'array precedente.
In pratica cerco le parole in `text` prendendo in considerazione solo i caratteri alfanumerici

```ts
export function breakWords(text: string, words: string[]): string[] {
	const pieces = words.reduce((acc, word) => {
		let index = findIndex(text.toLowerCase(), word)
		if (index == -1 || index == 0) return acc
		acc.push(text.slice(0, index))

		text = text.slice(index)
		return acc
	}, [])

	pieces.push(text)
	return pieces
}

export function findIndex(text: string, searchString: string): number {

	const search = searchString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
	let searchIndex = 0
	let firstIndex = -1

	for (let i = 0; i < text.length; i++) {
		const char = text[i]
		if (!isAlphanumeric(char)) continue
		if (char == search[searchIndex]) {
			if (searchIndex == 0) firstIndex = i
			searchIndex++
		} else {
			searchIndex = 0
			if (char == search[searchIndex]) {
				if (searchIndex == 0) firstIndex = i
				searchIndex++
			}
		}
		if (searchIndex == search.length) {
			return firstIndex
		}
	}
	return -1
}

function isAlphanumeric(char: string) {
	return /^[A-Za-z0-9]$/.test(char);
}
```

In fine otteniamo un array di CAPITOLI partendo da un documento `text`

```ts
const chaptersDesc = await textCutterChapter(text)
let chaptersTxt: string[] = breakWords(text, chaptersDesc.map(c => c.opening_words))
```

## DIVISIONE IN BLOCCHI DI TESTO

Vogliamo dividere i CAPITOLI ottenuti in BLOCCHI (senza usare LLM)
Serve un text splitter e non volevo perderci troppo tempo ho provato a generarlo con copilot, 
pensavo fosse un compito sempice ma non mi ha dato soluzioni soddisfacenti.
Quindi ho usato l'ottimo: `langchain`

```ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function split(text:string): Promise<string[]> {
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 200,
		chunkOverlap: 0,
	})
	const chunks = await textSplitter.splitText(text);
	return chunks;
}
```

Ok quindi ora posso ottenere i BLOCCHI dai CAPITOLI:

