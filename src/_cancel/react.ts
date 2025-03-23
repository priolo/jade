import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, FunctionCallingMode } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI("AIzaSyBGaDP1hcY9uKuuRDGCxV_7OEqnCO8gVwM");

export async function aiRun(text: string) {
	// Initialize the model with ReAct capabilities
	const model = genAI.getGenerativeModel({
		model: "gemini-2.0-flash", // Using Gemini 2.0 Flash for better performance
		tools: [
			{
				functionDeclarations: [searchFunction, calculateFunction, finalAnswerFunction]
			}
		],
		toolConfig: {
			functionCallingConfig: { mode: FunctionCallingMode.ANY },
		},
		generationConfig: { temperature: 0 }, // Using deterministic responses
		systemInstruction: reactSystemPrompt,
	});

	// Start a chat session
	const chat = model.startChat();

	// Initial state
	let isCompleted = false;
	let finalAnswer: string | null = null;
	let iterationCount = 0;
	const maxIterations = 10; // Prevent infinite loops

	// Store the conversation history for debugging/logging
	const history: any[] = [];

	// Initial prompt
	const initialPrompt = `${reactTaskPrompt}${text}`;
	let response = await chat.sendMessage(initialPrompt);
	history.push({ role: "user", content: initialPrompt });
	history.push({ role: "assistant", content: response.response.text() });

	// ReAct loop: Reasoning and Acting until completion
	while (!isCompleted && iterationCount < maxIterations) {
		iterationCount++;

		// Process function calls if any
		const functionCalls = response.response.functionCalls();
		if (functionCalls && functionCalls.length > 0) {
			const call = functionCalls[0];
			const functionName = call.name;
			const args = call.args;

			console.log(`Function called: ${functionName}`, args);

			let functionResponse = "";

			switch (functionName) {
				case "search":
					functionResponse = await mockSearch(args.query as string);
					break;

				case "calculate":
					functionResponse = calculateResult(args.expression as string);
					break;

				case "final_answer":
					finalAnswer = args.answer as string;
					isCompleted = true;
					functionResponse = "Final answer recorded.";
					break;

				default:
					functionResponse = "Unknown function called.";
			}

			// Return the function result to the model
			response = await chat.sendMessage(`Function result: ${functionResponse}`);
			history.push({ role: "function", name: functionName, content: functionResponse });
			history.push({ role: "assistant", content: response.response.text() });
		} else {
			// If no function was called but we're not done, ask the model to continue
			if (!isCompleted) {
				response = await chat.sendMessage("Please continue reasoning and use the provided functions to solve the task.");
				history.push({ role: "user", content: "Please continue reasoning and use the provided functions to solve the task." });
				history.push({ role: "assistant", content: response.response.text() });
			}
		}
	}

	// Return the final answer or a timeout message
	return {
		finalAnswer: finalAnswer || "Couldn't reach a conclusion after maximum iterations.",
		iterations: iterationCount,
		conversationHistory: history
	};
}

// System instructions for ReAct agent
const reactSystemPrompt = `
You are a ReAct agent that solves problems by thinking step by step.
Follow this process:
1. Thought: Analyze the problem and think about how to solve it
2. Action: Choose an action from the available functions
3. Observation: Receive the result of the action
4. Repeat steps 1-3 until you can provide a final answer
5. When ready, use the final_answer function to provide your solution

Always be explicit in your reasoning. Break down complex problems into steps.
`;

// Task instruction template
const reactTaskPrompt = `
Please solve the following problem using reasoning and the available tools:

`;

// Function declarations
const searchFunction: FunctionDeclaration = {
	name: "search",
	description: "Search for information on a given topic",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			query: {
				type: SchemaType.STRING,
				description: "The search query"
			}
		},
		required: ["query"]
	}
};

const calculateFunction: FunctionDeclaration = {
	name: "calculate",
	description: "Perform a mathematical calculation",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			expression: {
				type: SchemaType.STRING,
				description: "The mathematical expression to evaluate (e.g. '2 + 2', '5 * 3')"
			}
		},
		required: ["expression"]
	}
};

const finalAnswerFunction: FunctionDeclaration = {
	name: "final_answer",
	description: "Provide the final answer to the problem",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			answer: {
				type: SchemaType.STRING,
				description: "The complete, final answer to the problem"
			}
		},
		required: ["answer"]
	}
};

// Mock implementations of functions
async function mockSearch(query: string): Promise<string> {
	// In a real implementation, this would query an actual search API
	return `Mock search results for: ${query}. 
    This is a placeholder. In a real implementation, this would return actual search results.`;
}

function calculateResult(expression: string): string {
	try {
		// CAUTION: Using eval is generally not recommended for security reasons
		// In a production environment, use a proper math expression parser
		// This is just for demonstration purposes
		const result = eval(expression);
		return `Result: ${result}`;
	} catch (error) {
		return `Error calculating ${expression}: ${error}`;
	}
}


aiRun("calcola 2 + 2 e il risultato moltipliclo per 3 e poi sottrai 5") // Example usage
	.then((result) => {
		console.log("Final Answer:", result.finalAnswer);
		console.log("Iterations:", result.iterations);
		console.log("Conversation History:", result.conversationHistory);
	})
	.catch((error) => {
		console.error("Error running ReAct agent:", error);
	});
