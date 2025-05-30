# MultilevelRAG

## PREMESSA

Spezzare semplicemente un intero documento in CHUNK regolari ha degli svantaggi:  
- Non permette di incorporare tutta la semantica del contesto perche' il taglio puo' avvenire potenzialmente in qualunque punto  
- Se l'informazione è integrata un contesto piu' lungo si perdono informazioni a corredo

Infatti per argomenti molto strutturati si preferisce usare il GraphRAG, che rimane la soluzione migliore anche se piu' complessa da implementare.  
Quindi ho implementato questa tecnica che ho usato un mio progetto ed ha funzionato piuttosto bene.  
Probabilmente è stata già implementata (e sicuramente anche meglio di come ho fatto io).  

[progetto sandbox](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FrunChat.ts%3A3%2C1)

> LO SO è typescript e non python! Sono abituato a usare typescript! 
> Il codice è molto semplice che si può tradurre ad occhio.  
> Comunque il grosso del lavoro sono state le descrizioni dell' `llm`.

Se lo scarichi lo puoi eseguire mettendo la tua `API_KEY` google gemini in `.env`  
La demo elabora un testo (un manuale turistico per Roma) e lo inserisce nel VECTOR DB:  
`npm run storeDB`   

In seguito puoi chattare per ricavare informazioni:  
`npm run chat`  

Oppure metti un breakpoint ed esegui in debug il file selezionato con il `launch.json`. 

Se sei pazzo puoi anche fare un FORK mettere la tua API_KEY nell'`.env` ed eseguire direttamente in sandbox online.

## SOLUZIONE

### MEMORIZZARE il DOCUMENTO su piu' livelli
L'idea è di chiedere ad un LLM di spezzare il DOCUMENTO in CAPITOLI semanticamente coereti.  
Questi CAPITOLI sono divisi a loro volta in BLOCCHI di testo (chunk) con le classiche tecniche di splitting.  
I BLOCCHI mantengono un riferimento al CAPITOLO da cui provengono.  
E, in fine, i BLOCCHI sono embedding e memorizzati nel VECTOR DB (lancedb).  

![Multilevel RAG Document Storage Structure](fig1.png)

### RECUPERO tramite QUERY
Quando ricevo una QUERY genero il suo vettore embedding.  
Interrogo il VECTOR DB e ricavo un array di BLOCCHI di testo (quelli memorizzati precedentemente) semanticamente simili alla QUERY.  
Ogni BLOCCO di testo ha il riferimento al CAPITOLO da cui è stato generato quindi recupero i CAPITOLI pertinenti.  

Questo permette di recuperare una intera porzione di testo semanticamente coerente con la QUERY quindi utile per il RAG.

## CREAZIONE KB

Ok ho un DOCUMENTO e voglio ficcarlo dentro un VECTOR DB, come faccio?  
Guarda questo [codice](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FstoreInDB.ts%3A14%2C20)

In pratica passo il DOCUMENTO all'LLM e lui decide come dividerlo in CAPITOLI [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Fcutter%2Fllm.ts%3A17%2C23-17%2C40).  
Questa operazione è eseguita su molti token (l'intero documento) quindi puo' essere "pesante": Va fatta con una sola interazione e con qualche trucco.

> FUN FACT:  
> Se date ad un LLM (gemini-2.0-flash) un documento molto lungo e gli chiedete di restituirvi i CAPITOLI   
> potrebbe metterci molto molto tempo per completare l'operazione  
> o darvi un errore (a me lo dava) perche' deve ri-generare tutti i token del documento stesso!  

L'idea è di farsi restituire dell'LLM solo i riferimenti di dove inizia ogni singolo CAPITOLO
Questo permette di ridurre al massimo la lunghezza della risposta e quindi di velocizzarla moltissimo.

> FUN FACT:  
> Se chiedete ad un LLM di darvi una posizione numerica   
> per esempio: il numero di caratteri dall'inizio del documento dopo i quali inizia un CAPITOLO... sicuramente sbaglierà!  
> Come sapete un LLM non riesce a contare i caratteri correttamente dato che utilizza i TOKENS.  
 
Il trucco è di farsi dare le prime X parole dell'inizio del CAPITOLO.  
Questo lo fa "abbastanza" bene.   

> FUN FACT:  
> Se chiedete, anche minacciando, ad un LLM di restituire una lista ordinata in una certa maniera a volte la mette in ordine a volte quasi.    
 
Ho dovuto implementare una sistema per essere sicuro di recuperare il giusto capitolo [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Fcutter%2Futils.ts%3A1%2C17-1%2C27)

Quindi ora LLM ha creato gli indici dei CAPITOLI e noi li abbiamo estrapolati dal DOCUMENTO
In seguito è tutto molto semplice:
- spezzo il CAPITOLO in BLOCCHI di testo mantenendo il riferiemnto al CAPITOLO
- ottengo l'embedding dei BLOCCHI di testo
- memorizzo nel VECTOR DB
[codice](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FstoreInDB.ts%3A44%2C2-60%2C4)

> FUN FACT:  
> se volete migliorare molto le performance dell'EMBEDDING optate sempre per chiamate API in batch.  
> GEMINI genera 100 EMBEDDING al massimo per chiamata API  
> [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Futils%2FembeddingGemini.ts%3A27%2C1-46%2C2)

 

## CHAT

Per avviare la CHAT puoi eseguire  
`npm run chat`  
o lancicare il file `runChat.ts`  
Si tratta di un AGENT ReAct con un TOOL per interrogare il VECTOR DB [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Fchat.ts%3A8%2C1)  
L'implementazione della classe base "Agent" merita un discorso a parte.

Il recupero dal DB avviene [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FqueryDB.ts%3A6%2C23-6%2C30). Cioè:
- Interrogo il VECTOR DB per similitudine semantica tramite l'EMBEDDING della QUERY
- Recupero una lista di BLOCCHI di testo (o anche direttamente CAPITOLI eventualmente)
- Di questi BLOCCHI di testo recupero i CAPITOLI e gli assegno la distanza del BLOCCO "migliore"
- Quindi ottengo una lista di CAPITOLI ordinata per "distanza semantica" dalla QUERY
- Arricchisco il prompt con i CAPITOLI trovati (metto i primi due ma potrebbe essere anche tre!)


## COS'ALTRO SI POTREBBE FARE

Ci sono, secondo me, almeno due importanti ottimizzazzioni

- Quando LLM taglia il documento in capitoli dovrebbe creare anche un indice o riassunto.
  Questo permetterebbe di far capire all'agente di cosa parla l'intero documento.
  Altrimenti alla domanda "cosa posso fare a Roma?" (in demo ho usato il testo di una guida turistica per Roma) lui dovrebbe scaricare teoricamente tutta la conoscenza.

- Bisognerebbe creare un sotto-agente che gestisca le query al database vettoriale al posto dell'agente-leader
  Questo permetterebbe di gestre la richiesta senza appesantire la finestra dell'agente-leader
