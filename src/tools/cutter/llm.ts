import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// const blockDef = "chunk of text"
// const blockDef2 = "chunks of text"
const blockDef = "block of text"
const blockDef2 = "blocks of text"
const openingDef = "opening words"
const documentDef = "document"
const wordsNumDef = "5"


export async function textCutterChapter(text: string): Promise<Chapter[]> {

	const llm = genAI.getGenerativeModel({
		model: "gemini-2.5-pro-exp-03-25",
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
	description: `
List of ${blockDef} sorted by their position in the ${documentDef}.
`,
	type: SchemaType.ARRAY,
	items: {
		description: `
A list of: ${openingDef} and titles, describing each ${blockDef}
- The list is in the same order as the position of the ${blockDef2} relative to the entire ${documentDef}.
- Eeach ${openingDef} indicates the exact start of each ${blockDef}.
`,
		type: SchemaType.OBJECT,
		properties: {
			opening_words: {
				description: `
It is a string containing the first ${wordsNumDef} initial ${openingDef} of the single ${blockDef}.
- The ${wordsNumDef} words must be exactly the same sequence of words.
- The words must be AT LEAST ${wordsNumDef}.
For example in this ${blockDef}:
"The Territorial Force was a part-time volunteer component of the British Army, created in 1908 to augment British land forces without resorting to conscription."
The correct answer is:
"The Territorial Force was a"
`,
				type: SchemaType.STRING
			},
			title: {
				description: `A short description of the ${blockDef}.`,
				type: SchemaType.STRING
			}
		},
		required: ["opening_words"]
	}
}

const systemPrompt = `
Split the ${documentDef} into smaller ${blockDef2}.
These individual ${blockDef2} follow the following rules:
- The meaning of the single ${blockDef} refers to a single specific topic. For example, a single character, place, concept, or event.
- The length of the ${blockDef} MUST be less than 400 words
- The ${blockDef} has more than 100 words.
- A single ${blockDef} is understandable even on its own
- A single ${blockDef} does not overlap with other ${blockDef2}
- Without cuts in the middle of sentences
`

