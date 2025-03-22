import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function split(text:string): Promise<string[]> {
	//const text = `La basilica di San Magno è il principale luogo di culto cattolico di Legnano. Intitolata a Magno di Milano, arcivescovo ambrosiano dal 518 al 530, e costruita con uno stile architettonico rinascimentale lombardo di scuola bramantesca, è stata edificata dal 1504 al 1513. Si può ragionevolmente ritenere che il progetto della basilica sia stato realizzato sulla base di un disegno tracciato personalmente da Donato Bramante. Il suo campanile è stato costruito in seguito, dal 1752 al 1791. Il 19 marzo 1950 papa Pio XII ha elevato l'edificio sacro legnanese a basilica romana minore.`
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 200,
		chunkOverlap: 0,

	});

	// Split the text into chunks
	const chunks = await textSplitter.splitText(text);

	// Display the results
	// console.log(`Text split into ${chunks.length} chunks:`);
	// chunks.forEach((chunk, i) => {
	// 	console.log(`\nChunk ${i + 1}:`);
	// 	console.log(chunk);
	// });

	return chunks;
}

//run().catch(console.error);