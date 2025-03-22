import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

/**
 * Transform in text a HTML page
 */
async function fetchAndConvertToPlainText(url: string): Promise<string> {
	try {
		// Fetch the HTML content
		const response = await axios.get(url);
		const html = response.data;

		// Load the HTML into cheerio
		const $ = cheerio.load(html);

		// Remove unwanted elements
		$('script, style, iframe, nav, footer, header, aside, noscript').remove();

		// Get text and normalize
		let text = $('body').text();

		// Clean up the text
		text = text
			// Replace multiple spaces with a single space
			.replace(/\s+/g, ' ')
			// Replace multiple newlines with a single newline
			.replace(/\n+/g, '\n')
			// Remove leading and trailing whitespace
			.trim();

		return text;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to fetch or process the webpage: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Main function to demonstrate the usage
 */
async function main() {
	if (process.argv.length < 3) {
		console.error('Please provide a URL as an argument');
		process.exit(1);
	}

	const url = process.argv[2];
	const outputPath = process.argv[3] || 'output.txt';

	try {
		console.log(`Fetching and processing ${url}...`);
		const plainText = await fetchAndConvertToPlainText(url);

		// Save to file
		fs.writeFileSync(outputPath, plainText);
		console.log(`Plain text saved to ${outputPath}`);

		// Print first 500 characters as preview
		console.log('\nPreview:');
		console.log(plainText.substring(0, 500) + '...');
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error('An unknown error occurred');
		}
		process.exit(1);
	}
}

// Run the main function
//main();
fetchAndConvertToPlainText("https://www.repubblica.it/")