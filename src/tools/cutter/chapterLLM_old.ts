import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import fromPDFToText from "../textualize/pdf.js";
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

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
	//title: string,
	opening_words: string,
	// end: string
}

const schema: Schema = {
	description: "list sorted by appearance of the first 5 initial words of the text blocks into which the document has been divided",
	type: SchemaType.ARRAY,
	items: {
		description: "An array of opening sentences. Each opening sentence indicates the exact start of each block of text",
		type: SchemaType.OBJECT,
		properties: {
			opening_words: {
description: `
It is a string that contains EXACTLY the first 5 initial words of the single block of text.
The 5 words must be exactly the same sequence of words.
The words must be AT LEAST 5.
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
A single block of text follows the following rules:
- the meaning of the single block of text refers to a single specific topic. For example, a single character, place, concept, or event.
- the text block MUST NOT be too long. That is, it MUST be less than 400 words
- the text block has more than 100 words.
- a single block of text is understandable even on its own
- a single block of text does not overlap with other blocks of text
- without cuts in the middle of sentences
`;

// const systemPrompt = `
// Split a text document into multiple chapters.
// A single chapter follows the following rules:
// - it is a portion of the total document
// - if possible it has more than 50 words and less than 350 words
// - refers to a single specific topic. For example, a single person, place, concept or event.
// - a single chapter is understandable even on its own
// - it does not overlap with other chapters
// - without cuts in the middle of sentences
// `;








// async function run() {
// 	const relativePath = "../../../data/legge_maltrattamento_animali.pdf"
// 	const absolutePath = path.resolve(__dirname, relativePath);
// 	const text = await fromPDFToText(absolutePath);
// 	await textCutterChapter(text)
// }
//run()
