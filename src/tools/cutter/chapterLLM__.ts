import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// const blockDef = "chunk of text"
// const blockDef2 = "chunks of text"
const blockDef = "block of text"
const blockDef2 = "blocks of text"
//opening sentence


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
	
	type: SchemaType.ARRAY,
	items: {
		description: `
		list of ${blockDef2} ordered by their position in the document. In the list the order of the ${blockDef2} MUST BE THE SAME as they follow one another in the document
		`,
		type: SchemaType.OBJECT,
		properties: {
			opening_words: {
description: `
It is a string containing only the first 5 initial opening words of the single ${blockDef}.
- The 5 words must be exactly the same sequence of words.
- The words must be AT LEAST 5.
For example in this ${blockDef}:
"The Territorial Force was a part-time volunteer component of the British Army, created in 1908 to augment British land forces without resorting to conscription."
The correct answer is
"The Territorial Force was a"
`,
				type: SchemaType.STRING
			},
			title: {
				description: `
A short description of the ${blockDef}.
`,
				type: SchemaType.STRING
			}
		},
		required: ["opening_words"]
	}
}

const systemPrompt = `
Split a document into smaller ${blockDef2}.
These individual ${blockDef2} follow the following rules:
- The meaning of the single ${blockDef} refers to a single specific topic. For example, a single character, place, concept, or event.
- The length of the ${blockDef} MUST be less than 400 words
- The ${blockDef} has more than 100 words.
- A single ${blockDef} is understandable even on its own
- A single ${blockDef} does not overlap with other ${blockDef}
- Without cuts in the middle of sentences
`

