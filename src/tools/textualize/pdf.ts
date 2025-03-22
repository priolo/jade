import * as pdfjs from 'pdfjs-dist';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function fromPDFToText(pdfPath: string): Promise<string> {
    let pdf:pdfjs.PDFDocumentProxy
    try {
        pdf = await pdfjs.getDocument(pdfPath).promise;
    } catch (e) {
        console.error(e);
        return '';
    }
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items
            .map(item => 'str' in item ? item.str : '')
            .join(' ');
    }
    return text;
}
  
export default fromPDFToText;

// async function run() {
//     const relativePath = "../../../data/legge_maltrattamento_animali.pdf"
//     const absolutePath = path.resolve(__dirname, relativePath);
//     console.log(`Converting relative path: ${relativePath}`);
//     console.log(`To absolute path: ${absolutePath}`);
// 	const text = await fromPDFToText(absolutePath);
// 	console.log(text);
// }

// run()