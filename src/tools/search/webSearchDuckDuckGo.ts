import axios from 'axios';



/**
 * Search DuckDuckGo and return simplified results
 * @param query The search query
 * @param maxResults Maximum number of results to return
 * @returns Promise with search results
 */
async function searchDuckDuckGo(query: string, maxResults: number = 5): Promise<SearchResult[]> {
	try {
		// Format the query for URL
		const formattedQuery = encodeURIComponent(query);

		// Call DuckDuckGo API
		const response = await axios.get(`https://api.duckduckgo.com/?q=${formattedQuery}&format=json&pretty=1`);

		const data: DuckDuckGoResult = response.data;
		const results: SearchResult[] = [];

		// Add Abstract if available
		if (data.AbstractText && data.AbstractURL) {
			results.push({
				title: data.Heading || 'Abstract',
				url: data.AbstractURL,
				description: data.AbstractText
			});
		}

		// Add Answer if available
		if (data.Answer) {
			results.push({
				title: 'Direct Answer',
				url: data.AbstractURL || '',
				description: data.Answer
			});
		}

		// Add Related Topics
		if (data.RelatedTopics && data.RelatedTopics.length > 0) {
			for (const topic of data.RelatedTopics) {
				// Skip category topics (which don't have FirstURL)
				if (!topic.FirstURL) continue;

				// Extract title from the Result HTML or use Text
				let title = topic.Text;
				if (topic.Result) {
					const titleMatch = topic.Result.match(/<a[^>]*>(.*?)<\/a>/);
					if (titleMatch && titleMatch[1]) {
						title = titleMatch[1];
					}
				}

				results.push({
					title: title,
					url: topic.FirstURL,
					description: topic.Text
				});

				if (results.length >= maxResults) break;
			}
		}

		return results;

	} catch (error) {
		console.error('Error fetching results from DuckDuckGo:', error);
		throw error;
	}
}

// Example usage
async function main() {
	try {
		const query = process.argv[2] || 'Node.js';
		console.log(`Searching DuckDuckGo for: "${query}"\n`);

		const results = await searchDuckDuckGo(query);

		if (results.length === 0) {
			console.log('No results found.');
		} else {
			results.forEach((result, index) => {
				console.log(`Result #${index + 1}:`);
				console.log(`Title: ${result.title}`);
				console.log(`URL: ${result.url}`);
				console.log(`Description: ${result.description}`);
				console.log('-----------------------------------');
			});
		}

	} catch (error) {
		console.error('An error occurred:', (error as Error).message);
	}
}

// Run the main function
main();


/**
 * Simplified search result for returning to the user
 */
interface SearchResult {
	title: string;
	url: string;
	description: string;
}

/**
 * Interface for DuckDuckGo search result
 */
interface DuckDuckGoResult {
	Abstract: string;
	AbstractSource: string;
	AbstractText: string;
	AbstractURL: string;
	Answer: string;
	AnswerType: string;
	Definition: string;
	DefinitionSource: string;
	DefinitionURL: string;
	Entity: string;
	Heading: string;
	Image: string;
	Infobox: any;
	Redirect: string;
	RelatedTopics: Array<{
		FirstURL: string;
		Icon: { Height: string; URL: string; Width: string };
		Result: string;
		Text: string;
	}>;
	Results: Array<{
		FirstURL: string;
		Icon: { Height: string; URL: string; Width: string };
		Result: string;
		Text: string;
	}>;
	Type: string;
	meta: any;
}
