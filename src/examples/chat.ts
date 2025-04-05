import readline from 'readline';
import { buildLeadAgent } from "./agents/leader.js";



export async function chat() {

	const leadAgent = await buildLeadAgent()
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	while (true) {
		const prompt: string = await new Promise(resolve => rl.question('YOU: ', resolve))
		if (!prompt || prompt.toLowerCase() === 'exit') {
			console.log('Conversation ended');
			break;
		}
		const response = await leadAgent.ask(prompt)
	}
}


const DishMapping = {
	"Alternate Realities Risotto": 0,
	"Antipasto Celestiale": 1,
	"Antipasto Stellare dell'Eterna Armonia": 2,
	"Armonia Cosmica alla Tavola d'Oro": 3,
	"Armonia Cosmica della Fenice": 4,
	"Astro-Risotto alle Onde Temporali": 5,
	"Aurora del Cosmo": 6,
	"Bistecca Cacofonica dell'Infinito": 7,
	"Concordanza Cosmica": 8,
	"Cosmic Harmony": 9,
	"Cosmic Harmony Infusion": 10,
	"Cosmic Harmony Risotto": 11,
	"Cosmic Rhapsody": 12,
	"Cosmic Serenade": 13,
	"Cosmic Symphony di Ghiaccio e Fuoco": 14,
	"Cosmic Synchrony: Il Destino di Pulsar": 15,
	"Cosmo Sferico di Sogni Rigenerativi": 16,
	"Cosmofantasia di Terra e Mare nel Vortice delle Stelle": 17,
	"Cosmologia Terrestre: Viaggio in Otto Dimensioni": 18,
	"Cosmopastico di Meraviglie Celesti": 19,
	"Cosmopolis delle Galassie Perdute": 20,
	"Cosmos Culinary Symphony": 21,
	"Cosmos Quantum Fusion": 22,
	"Cosmos Risotto Reale": 23,
	"Cosmos in Tavola": 24,
	"Creazione Celestiale: L'Alba del Cosmo": 25,
	"Crescendo Cosmico": 26,
	"Danza Cosmica al Crepuscolo": 27,
	"Danza Luminosa del Multiverso": 28,
	"Delizia Astrale all'Essenza del Multiverso": 29,
	"Dimensioni del Mare Stellato": 30,
	"Dimensioni di Sapori Infusi": 31,
	"Echi del Cosmo": 32,
	"Echi del Mare Eterno": 33,
	"Eclissi Armonica di Sapori": 34,
	"Eclissi Quantica: Viaggio nei Reami del Gusto": 35,
	"Eclissi del Drago nell'Abbraccio del Kraken": 36,
	"Ecosistema Celeste": 37,
	"Enigma Celeste": 38,
	"Entropia Eterna": 39,
	"Essenze dell'Infinito": 40,
	"Eterea Sinfonia di Gravit\u00e0 con Infusione Temporale": 41,
	"Etereo Crepuscolare": 42,
	"Eterna Sinfonia del Cosmo": 43,
	"Ethereal Temporal Elixir": 44,
	"Euforia Cosmica": 45,
	"Evanescenza Cosmica": 46,
	"Evanescenza Quantica": 47,
	"Falso Risotto dell'Infinito Multiverso": 48,
	"Fenice Galattica": 49,
	"Fenice sull'Orizzonte degli Eventi": 50,
	"Fusione Celeste": 51,
	"Galassia Ardente": 52,
	"Galassia Aurorale": 53,
	"Galassia Commovente di Stellari": 54,
	"Galassia Incantata: Un Viaggio Attraverso l'Infinito": 55,
	"Galassia Infinita: Viaggio tra Memorie e Stelle": 56,
	"Galassia Riflessa": 57,
	"Galassia Rinascente": 58,
	"Galassia Risvegliata": 59,
	"Galassia Sensoriale": 60,
	"Galassia Speculare": 61,
	"Galassia Suprema": 62,
	"Galassia a Tavola: Sinfonia di Tempeste Cosmiche": 63,
	"Galassia d'Aromi Perduti": 64,
	"Galassia di Celestial Delight": 65,
	"Galassia di Cosmo-Delizie": 66,
	"Galassia di Fusilli Sferici alla Risonanza Crononica": 67,
	"Galassia di Sapore": 68,
	"Galassia di Sapore Interdimensionale": 69,
	"Galassia di Sapore Interstellare": 70,
	"Galassia di Sapore Quantico": 71,
	"Galassia di Sapore Quantum": 72,
	"Galassia di Sapori": 73,
	"Galassia di Sapori Eterei": 74,
	"Galassia di Sapori Interstellari": 75,
	"Galassia di Sapori Sublimi": 76,
	"Galassia di Sapori di Aurora": 77,
	"Galassia di Sapori: Il Viaggio Senza Tempo": 78,
	"Galassia di Sapori: L'Eterno Ritorno": 79,
	"Galassia di Sapori: Sinfonia Transdimensionale": 80,
	"Galassia di Sogni Cosmogastronomici": 81,
	"Galassia in Tavola: Sinfonia dei Sensi": 82,
	"Galassia nel Piatto: Sinfonia Universale di Aromi e Sapori": 83,
	"Galassia nel Piatto: Sinfonia di Sapori e Dimensioni": 84,
	"Galassie Infiammate: Sinfonia Cosmica in Sei Dimensioni": 85,
	"Galassie Riflesse: Sinfonia del Multiverso": 86,
	"Galassie Sospese: Un Viaggio di Sapori Cosmogalattici": 87,
	"Galassie alla Spirale di Vento con Sfera di Ghiaccio Eterno": 88,
	"Galassie in Epifania: Risotto Celestiale con Preziosi dell'Universo": 89,
	"Galaxia Gustativa": 90,
	"Galaxia Rinasciata": 91,
	"Il Banchetto delle Galassie": 92,
	"Il Crepuscolo dell\u2019Unicorno": 93,
	"Il Rapsodo Celestiale": 94,
	"Il Ricordo del Fuoco Celeste": 95,
	"Il Risveglio del Drago Celeste": 96,
	"Il Risveglio del Multiverso": 97,
	"Il Risveglio della Fenice sull'Arcobaleno d'Oceano": 98,
	"Il Risveglio delle Stelle": 99,
	"Il Simposio degli Infiniti Ricordi": 100,
	"Il Viaggio Celeste": 101,
	"Il Viaggio Cosmico di Marinetti": 102,
	"Il Viaggio dell'Etereo Risveglio": 103,
	"Il Viaggio delle Dimensioni Confluenti": 104,
	"Interstellar Requiem": 105,
	"Interstellare Risveglio di Kraken": 106,
	"L'Abbraccio del Cosmo": 107,
	"L'Ascensione Siderale": 108,
	"L'Estasi Cosmica di Nova": 109,
	"L'Eternit\u00e0 al Crepuscolo": 110,
	"L'Unicorno piange il Kraken": 111,
	"La Balena Sputafuoco": 112,
	"La Balena incontra la Mandragora": 113,
	"La Creazione di Nova": 114,
	"La Mucca Che Stordisce l'Universo": 115,
	"La Sinfonia dell'Universo": 116,
	"La Voce del Vento": 117,
	"Luce e Ombra di Nomea Spaziale": 118,
	"Lumi\u00e8re Cosmica": 119,
	"Mandragola e Radici": 120,
	"Melodia del Multiverso Parallelo": 121,
	"Microcosmo in un Boccone": 122,
	"Mycoflora con Polvere di Stelle Sbagliato": 123,
	"Nebulae Di-Cedri Risvegliati": 124,
	"Nebulare Asteroideo con Crepuscolo di Mucca": 125,
	"Nebulosa Celeste di Terrafirma": 126,
	"Nebulosa Celestiale alla Stellaris": 127,
	"Nebulosa Celestiale di Sogni Quantici": 128,
	"Nebulosa Eterna": 129,
	"Nebulosa Galattica": 130,
	"Nebulosa dell'Infinito: Un Viaggio attraverso il Cosmo del Gusto": 131,
	"Nebulosa di Confini Sfondati": 132,
	"Nebulosa di Drago Interdimensionale": 133,
	"Nebulosa di Dragone all'Essenza di Vuoto": 134,
	"Nebulosa di Fenice con Sinfonia Eterea": 135,
	"Nebulosa di Sapori Quantici": 136,
	"Nebulosa di Sapori dell'Infinito": 137,
	"Nebulose Pensanti: Sinfonia del Multiverso": 138,
	"Nebulose a Strati": 139,
	"Nebulose della Fenice su Vento Lunare": 140,
	"Ode Cosmica di Terra e Stelle": 141,
	"Ode al Crepuscolo del Multiverso": 142,
	"Odissea Celestiale": 143,
	"Odissea Cosmica di Nettuno": 144,
	"Odissea Temporale": 145,
	"Pane e Carne Rivisitato": 146,
	"Panetto di Carne": 147,
	"Piastrella Celestiale di Gnocchi del Crepuscolo con Nebulosa di Riso di Cassandra, Lacrime di Unicorno e Velo di Materia Oscura": 148,
	"Piccola Odissea Cosmica": 149,
	"Pioggia Calante dell'Universo": 150,
	"Pioggia di Andromeda": 151,
	"Pioggia di Dimensioni Galattiche": 152,
	"Pizza Baby Daniele": 153,
	"Pizza Baby Lorenzo": 154,
	"Pizza Baby Simone e Alessandro": 155,
	"Pizza Cosmica all'Essenza di Drago con Nebbia Arcobaleno e Funghi Orbitali": 156,
	"Pizza Cri": 157,
	"Pizza Emma": 158,
	"Pizza Fra": 159,
	"Pizza Gio": 160,
	"Pizza Luca": 161,
	"Pizza Raul": 162,
	"Pi\u00f9 Lontano delle Stelle": 163,
	"Pi\u00f9-dimensionale Sinfonia di Sapori: La Carne del Cosmo": 164,
	"Plasma Celestiale al Risotto di Kraken nell'Aura del Sole": 165,
	"Porta Celestiale alle Stelle": 166,
	"Portale Astrale di Sapori": 167,
	"Portale Cosmico del Kraken": 168,
	"Portale Cosmico: Sinfonia di Gnocchi del Crepuscolo con Essenza di Tachioni e Sfumature di Fenice": 169,
	"Portale Interdimensionale di Sapori": 170,
	"Portale del Cosmo: Sinfonia di Sapori Multidimensionali": 171,
	"Portale del Cosmo: Sinfonia di Sapori e Tempi": 172,
	"Portale delle Meraviglie": 173,
	"Portale delle Stelle": 174,
	"Portale di Sapori Arcani": 175,
	"Quadrifonia Cosmica: Sinfonia di Sapori e Dimensioni": 176,
	"Rapsodia Quantistica nel Cosmo": 177,
	"Rapsodia dei Ricordi Celesti": 178,
	"Rinascita Cosmica": 179,
	"Rintocchi del Cosmo": 180,
	"Risotto Cosmico Multiversale": 181,
	"Risotto Cosmico alla Draconia": 182,
	"Risotto Interdimensionale alla Carne di Drago e Balena Spaziale con Biscotti della Galassia Croccanti": 183,
	"Risotto dei Multiversi": 184,
	"Risveglio Cosmico": 185,
	"Risveglio Cosmico: Un Viaggio nel Sapore Quantistico": 186,
	"Risveglio Cosmico: Una Sinfonia di Sapori Universali": 187,
	"Rivelazione del Multiverso": 188,
	"Rivisitazione del Kraken sotto Molecole": 189,
	"Sassi e Sassolini": 190,
	"Serenata del Multiverso": 191,
	"Sfere del Ricordo Astrale": 192,
	"Sfogliare Galattico di Sogni Temporali": 193,
	"Simfonia Celeste di Aurora": 194,
	"Sinfonia Aromatica del Multiverso": 195,
	"Sinfonia Astrale": 196,
	"Sinfonia Astrale - Risotto Multiversale con Risacca Celeste": 197,
	"Sinfonia Celeste dell'Equilibrio Temporale": 198,
	"Sinfonia Celeste di Granuli Arcobaleno e Riso di Cassandra": 199,
	"Sinfonia Celestiale": 200,
	"Sinfonia Celestiale dei Ricordi": 201,
	"Sinfonia Celestiale di Echi Galattici": 202,
	"Sinfonia Celestiale di Gnocchi del Crepuscolo": 203,
	"Sinfonia Cosmica": 204,
	"Sinfonia Cosmica all'Alba di Fenice": 205,
	"Sinfonia Cosmica alla Szechuan": 206,
	"Sinfonia Cosmica del Multiverso": 207,
	"Sinfonia Cosmica della Rinascita": 208,
	"Sinfonia Cosmica di Andromeda": 209,
	"Sinfonia Cosmica di Armonie Terrestri e Celesti": 210,
	"Sinfonia Cosmica di Aurora": 211,
	"Sinfonia Cosmica di Luminiscenze e Contrasti": 212,
	"Sinfonia Cosmica di Mare e Stelle": 213,
	"Sinfonia Cosmica di Proteine Interstellari": 214,
	"Sinfonia Cosmica di Sapore": 215,
	"Sinfonia Cosmica di Sapori": 216,
	"Sinfonia Cosmica di Terracotta": 217,
	"Sinfonia Cosmica di Terre e Stelle": 218,
	"Sinfonia Cosmica in Otto Movimenti": 219,
	"Sinfonia Cosmica ma Fatta Bene": 220,
	"Sinfonia Cosmica ma Fatta Male": 221,
	"Sinfonia Cosmica: Il Crescendo delle Stelle": 222,
	"Sinfonia Cosmica: La Danza dell'Universo": 223,
	"Sinfonia Cosmica: Versione Data": 224,
	"Sinfonia Cosmica: Versione Pizza": 225,
	"Sinfonia Cosmica: il Ritorno dell'Imperatore": 226,
	"Sinfonia Cosmica: la Vendetta Fantasma": 227,
	"Sinfonia Cosmologica": 228,
	"Sinfonia Crepuscolare": 229,
	"Sinfonia Galattica": 230,
	"Sinfonia Galattica Agentica": 231,
	"Sinfonia Galattica ai Cristalli di Nebulite": 232,
	"Sinfonia Galattica alla Griglia Cangiante": 233,
	"Sinfonia Galattica di Sapori con Sorpresa di Drago Fiammante": 234,
	"Sinfonia Interstellare di Fusilli del Vento con Nettare di Sirena": 235,
	"Sinfonia Multiversale in Otto Movimenti": 236,
	"Sinfonia Quantica Galattica": 237,
	"Sinfonia Quantica dell'Oceano Interstellare": 238,
	"Sinfonia Quantistica dell'Universo": 239,
	"Sinfonia Quantistica delle Stelle": 240,
	"Sinfonia Tempolare Galattica": 241,
	"Sinfonia Temporale Galattica": 242,
	"Sinfonia Temporale al Tocco di Crono": 243,
	"Sinfonia Temporale del Drago": 244,
	"Sinfonia Temporale delle Profondit\u00e0 Infrasoniche": 245,
	"Sinfonia Temporale di Fenice e Xenodonte su Pane degli Abissi con Colata di Plasma Vitale e Polvere di Crononite": 246,
	"Sinfonia Temporale nello Spaghi del Sole": 247,
	"Sinfonia degli Elementi Eterni": 248,
	"Sinfonia dei Ricordi Celesti": 249,
	"Sinfonia del Cosmo": 250,
	"Sinfonia del Cosmo Rigenerante": 251,
	"Sinfonia del Cosmo e della Leggenda": 252,
	"Sinfonia del Multiverso": 253,
	"Sinfonia del Multiverso Calante": 254,
	"Sinfonia del Multiverso Nascente": 255,
	"Sinfonia del Multiverso di Gusto": 256,
	"Sinfonia dell'Infinito: Un Viaggio Gnodale tra Terra e Universi": 257,
	"Sinfonia dell'Universo Morente": 258,
	"Sinfonia di Crepuscolo Celestiale": 259,
	"Sinfonia di Cristalli e Rigenerazione": 260,
	"Sinfonia di Galassie Perdute": 261,
	"Sinfonia di Galassie Riflesse": 262,
	"Sinfonia di Gusti del Multiverso": 263,
	"Sinfonia di Multiverso: La Danza degli Elementi": 264,
	"Sinfonia di Stagioni Stellari": 265,
	"Sogni di Abisso Cosmico": 266,
	"Stella Nova": 267,
	"Stellar Fusion": 268,
	"Tris di Carne con Pane": 269,
	"Tris di Verdure con Xenodonte": 270,
	"Una Mucca e una Balena nella Singolarit\u00e0": 271,
	"Universo Cosmico nel Piatto": 272,
	"Universo Incantato: Sinfonia dei Gusti Cosmogonici": 273,
	"Universo in Fluttuazione": 274,
	"Universo in Fusilli - Variazione Celestiale": 275,
	"Universo in Un Boccone": 276,
	"Valzer Cosmico di Asteria": 277,
	"Valzer delle Stelle": 278,
	"Verso l'Inedito Oltre": 279,
	"Viaggio Celeste nel Multiverso": 280,
	"Viaggio Cosmico nel Multiverso": 281,
	"Viaggio Cosmico tra Mare e Stelle": 282,
	"Viaggio Galattico: Sinfonia dei Sensi": 283,
	"Viaggio Gastronomico tra le Stelle": 284,
	"Viaggio dei Ricordi Stellari": 285,
	"Viaggio dei Sensi: Bolla Temporale di Aromi Ancestrali": 286
}