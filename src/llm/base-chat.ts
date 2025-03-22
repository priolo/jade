import { GoogleGenerativeAI } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

async function run() {
	const llm = genAI.getGenerativeModel({
		model: "gemini-2.0-flash",
		generationConfig: { temperature: 0 },
		systemInstruction: "a simple chat"
	})
	const chat = llm.startChat({
		history: [
			{
				role: "user",
				parts: [{ text: `there are a my friend Pippo here!` }]
			},
			{
				role: "pippo",
				parts: [{ text: `hello!` }]
			}
		]
	})

	const response = await chat.sendMessage("what say pippo?")
	console.log(response.response.text())

}

run()