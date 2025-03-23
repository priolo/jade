import { chat } from "./chat.js"
import { storeInDb } from "./storeInDB.js"






const TableName = "kb_general"

storeInDb("../data/rome_guide.pdf", TableName)
// storeInDb("../data/rome_guide2.pdf", TableName)
// storeInDb("../data/legge_maltrattamento_animali.pdf", TableName)
// storeInDb("../data/light.pdf", TableName)

// queryDB("typical recipes", TableName)
// queryDB("Kitchen vampire", TableName)
// queryDB("where can i eat?", TableName)
// queryDB("quando non è reato?", TableName)
// queryDB("research on design", TableName)

//chat(TableName)


