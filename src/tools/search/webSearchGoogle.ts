import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define interfaces for our data structures
interface GoogleSearchItem {
	title: string;
	link: string;
	snippet: string;
}

interface GoogleSearchResponse {
	items?: GoogleSearchItem[];
	error?: {
		message: string;
	};
}

/**
 * https://programmablesearchengine.google.com/controlpanel/all
 * Fetches short descriptions from Google Custom Search
 * @param query The search query
 * @param numResults Number of results to return (default: 5)
 * @returns Array of search results with title, link, and snippet
 */
async function fetchGoogleSearchDescriptions(query: string, numResults: number = 5): Promise<GoogleSearchItem[]> {
	try {
		// You need to create a Custom Search Engine and get API key from Google Cloud Console
		const apiKey = process.env.GOOGLE_API_KEY
		// This is your Custom Search Engine ID
		const cseId = process.env.GOOGLE_CSE_ID

		if (!apiKey) {
			throw new Error('GOOGLE_API_KEY not found in environment variables');
		}

		if (!cseId) {
			throw new Error('GOOGLE_CSE_ID not found in environment variables');
		}

		const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
			params: {
				key: apiKey,
				cx: cseId,
				q: query,
				num: Math.min(numResults, 10) // Google API allows max 10 results per page
			}
		});

		const data = response.data as GoogleSearchResponse;

		if (data.error) {
			throw new Error(`API Error: ${data.error.message}`);
		}

		if (!data.items || data.items.length === 0) {
			return [];
		}

		return data.items.slice(0, numResults).map(item => ({
			title: item.title,
			link: item.link,
			snippet: item.snippet
		}));

	} catch (error) {
		console.error('Error fetching search results:', error);
		throw error;
	}
}

// Example usage
async function main() {
	try {
		const query = process.argv[2] || 'meloni';
		const results = await fetchGoogleSearchDescriptions(query);

		console.log(`Search results for: "${query}"\n`);

		results.forEach((result, index) => {
			console.log(`Result #${index + 1}:`);
			console.log(`Title: ${result.title}`);
			console.log(`URL: ${result.link}`);
			console.log(`Description: ${result.snippet}`);
			console.log('-----------------------------------');
		});

	} catch (error) {
		console.error('An error occurred:', (error as Error).message);
	}
}

// Run the main function
main();