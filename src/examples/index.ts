import { cosineSimilarity, tool } from "ai";
import readline from 'readline';
import { z } from "zod";
import Agent from "../llm/Agent.js";
import { chat } from "./chat.js";
import { importHTMLToText, importPDFToText, normalizeString, storeInDb, storeTextInDb } from "./storeInDB.js";
import { queryDBChapter } from "./queryDB.js";
import { deleteRecordsByRefSubstring, getAllByRefSubstring, vectorDBSearch, wordDBSearch } from "./utils/db.js";
import { split } from "../tools/cutter/fix.js";
import { getEmbedding } from "../tools/embedding/embedding.js";
import * as lancedb from "@lancedb/lancedb";







//queryDBChapter("Latte+", "kb_pizza", "Essenza dell Infinito")
//queryDBChapter("Latte+", "kb_pizza")
//queryDBChapter("Ravioli al Vaporeon", "kb_pizza")
//queryDBChapter("Chocobo Wings", "kb_pizza")
//queryDBChapter("Latte+", "kb_pizza")

// vectorDBSearch("cosa mi sai dire della fermentazione quantica", TableName, 10/*, ["codice galattico"]*/).then((results) => {
// 	console.log(results)
// })

//getAllByRefSubstring("dell Infinito", "kb_pizza")

// wordDBSearch("Chocobo Wings", TableName).then((results) => {
// 	console.log(results)
// })




const pdfPaths = [
	"Anima Cosmica",
	"Armonia Universale",
	"Cosmica Essenza",
	//"Datapizza",
	"Eco di Pandora",
	"Eredita Galattica",
	"Essenza dell Infinito",
	"Il Firmamento",
	"L Architetto dell Universo",
	"L Eco dei Sapori",
	"L Equilibrio Quantico",
	"L Essenza Cosmica",
	"L Essenza del Multiverso su Pandora",
	//"L Essenza delle Dune",
	"L Essenza di Asgard",
	"L Etere del Gusto",
	"L infinito in un Boccone",
	"L Oasi delle Dune Stellari",
	"L Universo in Cucina",
	"Le Dimensioni del Gusto",
	"Le Stelle che Ballano",
	"Le Stelle Danzanti",
	"Ristorante delle Dune Stellari",
	"Ristorante Quantico",
	"Sala del Valhalla",
	"Sapore del Dune",
	"Stelle Astrofisiche",
	"Stelle dell Infinito Celestiale",
	"Tutti a TARSvola",
	"Universo Gastronomico di Namecc",
]
async function importPDF(relativePath: string, tableName: string, normalize: boolean = false) {
	let text = await importPDFToText(relativePath)
	if (normalize) text = normalizeString(text)
	await storeTextInDb(text, tableName, relativePath)
}
async function importHTML(relativePath: string, tableName: string) {
	let text = await importHTMLToText(relativePath)
	await storeTextInDb(text, tableName, relativePath)
}
async function importMenu() {
	for (const pdfPath of pdfPaths) {
		await importPDF(`../../data/pizza/Menu/${pdfPath}.pdf`, "kb_pizza_menu")
		await new Promise(resolve => setTimeout(resolve, 10000)) // Delay to avoid rate limit
	}
	importPDF("../../data/pizza/Misc/L Essenza delle Dune.pdf", "kb_pizza_menu", true)
	importPDF("../../data/pizza/Misc/Datapizza.pdf", "kb_pizza_menu", true)
}
async function importManual() {
	importPDF("../../data/pizza/Misc/Manuale di Cucina.pdf", "kb_pizza_manual", true)
}
async function importCode() {
	importPDF("../../data/pizza/Codice Galattico/Codice Galattico.pdf", "kb_pizza_code")
}
async function importBlogs() {
	await importHTML("../../data/pizza/Blogpost/blog_etere_del_gusto.html", "kb_pizza_blog")
	await importHTML("../../data/pizza/Blogpost/blog_sapore_del_dune.html", "kb_pizza_blog")
}


//importMenu()
importManual()




//chat()



