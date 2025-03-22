# Gemini Travel Agent with LangGraph and Travil

This project demonstrates how to build a conversational travel agent using:
- TypeScript and Node.js
- LangGraph for the agent workflow
- Google's Gemini Pro LLM for natural language understanding
- Travil (mock) for travel-related functionalities

## Setup

### Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn
- Google Gemini API key

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Add your API keys to the `.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   TRAVIL_API_KEY=your_travil_api_key_here
   ```

## Running the Application

```bash
npm run build
npm start
```

Or in development mode:

```bash
npm run dev
```

## How It Works

1. The user sends a travel query
2. The agent uses Gemini to analyze the input and extract travel details
3. If information is missing, the agent asks clarifying questions
4. Once sufficient details are available, it uses Travil to fetch:
   - Travel recommendations
   - Weather forecasts
   - Local attractions
5. Gemini formats a helpful response with all the information
6. The agent continues the conversation with the user

## Architecture

- `src/index.ts` - Main entry point
- `src/agent.ts` - LangGraph agent implementation
- `src/gemini-service.ts` - Gemini API integration
- `src/travil-service.ts` - Travel service integration (mocked)
- `src/types.ts` - TypeScript type definitions

## Example Conversation

```
User: I'd like to plan a trip to Paris for next week, from June 20 to June 27. I love art and food.