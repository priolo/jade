import axios from "axios";
import * as cheerio from "cheerio";


export class FetchNewsNode {
	async invoke() {
		try {
			console.log("Fetching latest news about Italy...");

			// We'll use a news search API (you can replace with your preferred news API)
			const response = await axios.get("https://news.google.com/rss/search", {
				params: {
					q: "Italy",
					hl: "en-US",
					gl: "US",
					ceid: "US:en"
				}
			});

			const $ = cheerio.load(response.data, { xmlMode: true });

			// Extract article information
			const articles = $("item").map((_, item) => {
				const title = $(item).find("title").text();
				const link = $(item).find("link").text();
				const pubDate = $(item).find("pubDate").text();
				const description = $(item).find("description").text();

				return {
					title,
					link,
					pubDate,
					description
				};
			}).get();

			// Return the top 5 articles
			return { articles: articles.slice(0, 5) };
		} catch (error) {
			console.error("Error fetching news:", error);
			return { articles: [], error: "Failed to fetch news" };
		}
	}
}

function run() {
	const fn = new FetchNewsNode();
	fn.invoke().then((result) => {
		console.log(result);
	});
}
