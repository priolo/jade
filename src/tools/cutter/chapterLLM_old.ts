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

