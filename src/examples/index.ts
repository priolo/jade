import { chat } from "./chat.js"
import { queryDB } from "./queryDB.js"
import { normalizeString, importPDFToText, storeInDb, storeTextInDb, importHTMLToText } from "./storeInDB.js"
import * as path from 'path';
import { fileURLToPath } from 'url';
import fromPDFToText from '../tools/textualize/pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const TableName = "kb_pizza"




storeInDb("../../data/pizza/Codice Galattico/Codice Galattico.pdf", TableName)




const pdfPaths = [
	"Anima Cosmica",
	"Armonia Universale",
	"Cosmica Essenza",
	"Datapizza",
	"Eco di Pandora",
	"Eredita Galattica",
	"Essenza dell Infinito",
	"Il Firmamento",
	"L Architetto dell Universo",
	"L Eco dei Sapori",
	"L Equilibrio Quantico",
	"L Essenza Cosmica",
	"L Essenza del Multiverso su Pandora",
	"L Essenza delle Dune",
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
// async function importMenuPDFs() {
// 	for (const pdfPath of pdfPaths) {
// 		await storeInDb(`../../data/pizza/Menu/${pdfPath}.pdf`, TableName)
// 	}
// }
//importMenuPDFs()


// async function importManualPDFs() {
// 	let text = await importPDFToText("../../data/pizza/Misc/Manuale di Cucina.pdf")
// 	text = normalizeString(text)
// 	await storeTextInDb(text, TableName)
// }
// importManualPDFs()




// async function importBlog() {
// 	let text = await importHTMLToText("../../data/pizza/Blogpost/blog_etere_del_gusto.html")
// 	await storeTextInDb(text, TableName)
// }
// importBlog()










//storeInDb("../../data/rome_guide2.pdf", TableName)
//storeInDb("../../data/legge_maltrattamento_animali.pdf", TableName)
//storeInDb("../../data/light.pdf", TableName)

//queryDB("typical recipes", TableName)
// queryDB("Kitchen vampire", TableName)
// queryDB("where can i eat?", TableName)
// queryDB("quando non è reato?", TableName)
// queryDB("research on design", TableName)

//chat(TableName)


