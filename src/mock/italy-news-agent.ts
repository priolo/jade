class FetchNewsNode extends BaseNode {
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
  
  // Node to summarize news with Gemini
  class SummarizeNewsNode extends BaseNode {
	async invoke({ articles }: { articles: any[] }) {
	  if (!articles.length) {
		return { summaries: [] };
	  }
  
	  console.log("Summarizing news articles with Gemini...");
	  
	  try {
		const summaries = await Promise.all(
		  articles.map(async (article) => {
			const prompt = `
			  Summarize the following news article about Italy in 2-3 short sentences.
			  Keep only the most important information. The summary should be concise and factual.
			  
			  Title: ${article.title}
			  Date: ${article.pubDate}
			  Content: ${article.description}
			`;
			
			const result = await model.generateContent(prompt);
			const text = result.response.text();
			
			return {
			  title: article.title,
			  summary: text.trim(),
			  date: article.pubDate,
			  link: article.link
			};
		  })
		);
		
		return { summaries };
	  } catch (error) {
		console.error("Error summarizing with Gemini:", error);
		return { error: "Failed to summarize news", summaries: [] };
	  }
	}
  }
  
  // Node to format the results for presentation
  class FormatResultsNode extends BaseNode {
	async invoke({ summaries }: { summaries: any[] }) {
	  if (!summaries.length) {
		return { 
		  result: "No news articles about Italy were found or could be summarized." 
		};
	  }
  
	  console.log("Formatting news summaries...");
	  
	  // Format each summary as a compact text block
	  const formattedSummaries = summaries.map((item, index) => {
		return `
  📰 NEWS BLOCK ${index + 1}
  -----------------
  HEADLINE: ${item.title}
  SUMMARY: ${item.summary}
  DATE: ${new Date(item.date).toLocaleDateString()}
  SOURCE: ${item.link}
		`.trim();
	  });
	  
	  return {
		result: formattedSummaries.join("\n\n")
	  };
	}
  }
  