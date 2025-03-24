# MultilevelRAG

## PREMESSA

Ottimizzazione per il recupero testo per la RAG.  
Spezzare un intero documento o in maniera regolare ha i seguenti svantaggi:  
- non permette di incorporare tutta la semantica del contesto perche' il taglio puo' avvenire potenzialmente in qualunque punto  
- contesti troppo lunghi non permettono un recupero efficace con dei vettori di discreta dimensione  

Presento questa tecnica che ho usato un mio progetto ed ha funzionato piuttosto bene.  
Probabilmente è stata già implementata (e sicuramente anche meglio di come ho fatto io).  
Se è così fatemelo sapere!  

[progetto sandbox](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FrunChat.ts%3A3%2C1)

> LO SO è typescript e non python! Perche' sono abituato a usare typescript! 
> Ma il codice è cosi' semplice che si può tradurre ad occhio.  
> Comunque il grosso del lavoro sono state le descrizioni dello `schema`.

Se lo scarichi lo puoi eseguire mettendo la tua API_KEY google gemini in .env
e mandando in esecuzione  
`npm run storeDB`  
oppure  
`npm run chat`  
oppure esegui il `launch.json` sul file selezionato.   
Se sei pazzo puoi anche fare un FORK mettere la tua API_KEY nell'.env ed eseguire direttamente in sandbox online.

## SOLUZIONE

### MEMORIZZARE un DOCUMENTO  
L'idea è di chiedere ad un LLM di spezzare il DOCUMENTO in CAPITOLI semanticamente coereti.  
Questi CAPITOLI sono divisi a loro volta in BLOCCHI di testo (chunk) con le classiche tecniche di splitting.  
I BLOCCHI mantengono un riferimento al CAPITOLO da cui provengono.  
E in fine i BLOCCHI sono embedding e memorizzati nel database vettoriale.  

![Multilevel RAG Document Storage Structure](fig1.png)

### RECUPERO tramite QUERY
Per recuperare i CAPITOLI collegati ad una QUERY genero il vettore embedding della QUERY.  
Con questo interrogo il VECTOR DB (lancedb) e ricavo un array di BLOCCHI di testo (memorizzati precedentemente) semanticamente simili alla QUERY .  
Ogni BLOCCO di testo ha il riferimento al CAPITOLO da cui è stato generato quindi recupero i CAPITOLI pertinenti.  

## CREAZIONE KB

Ok quindi ho un DOCUMENTO e voglio ficcarlo dentro un VECTOR DB come fare?  
Guarda questo [file](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2FstoreInDB.ts%3A14%2C20)

In pratica passo il DOCUMENTO all'LLM che lo divide in CAPITOLI [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Fcutter%2Fllm.ts%3A17%2C23-17%2C40).  
Questa operazione è eseguita del LLM quindi puo' essere abbastanza "pesante": Va fatta con qualche trucco.

> FUN FACT:  
> Se date ad un LLM (gemini-2.0-flash) un documento molto lungo e gli chiedete di restituirvi i CAPITOLI   
> potrebbe metterci molto molto tempo per completare l'operazione  
> o darvi un errore (a me lo dava)  
> perche' deve ri-generare tutti i token del documento stesso!  

L'idea è di farsi restituire dell'LLM solo i riferimenti di dove inizia ogni singolo CAPITOLO
Questo permette di ridurre al massimo la lunghezza della risposta e di velocizzarla moltissimo.

> FUN FACT:  
> Se chiedete ad un LLM di darvi una posizione numerica   
> per esempio: il numero di caratteri dall'inizio del documento dopo i quali inizia un CAPITOLO... sicuramente sbaglierà!  
> Come sapete un LLM non riesce a contare i caratteri correttamente dato che utilizza i TOKENS.  
 
Il trucco è di farsi dare le prime X prole dell'inizio del CAPITOLO.  
Questo lo fa "abbastanza" bene.   

> FUN FACT:  
> Se chiedete, anche minacciando, ad un LLM di restituire una lista ordinata in una certa maniera a volte la mette in ordine a volte quasi.    
 
Ho dovuto implementare una sistema per essere sicuro di recuperare il giusto capitolo [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Fcutter%2Futils.ts%3A1%2C17-1%2C27)

Quindi ora abbiamo i CAPITOLI poi è tutto molto semplice:
- spezzo il CAPITOLO in BLOCCHI di testo mantenendo il riferiemnto al CAPITOLO
- ottengo l'embedding dei BLOCCHI di testo
- memorizzo nel VECTOR DB

> FUN FACT:  
> se volete migliorare molto le performance dell'EMBEDDING optate sempre per chiamate API in batch.  
> GEMINI genera 100 EMBEDDING al massimo per chiamata API  
> [qui](https://codesandbox.io/p/devbox/embedding-d3x34d?file=%2Fsrc%2Futils%2FembeddingGemini.ts%3A27%2C1-27%2C89).

 

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

Ci sono, secodno me, almeno due importanti ottimizzazzioni

- Quando LLM taglia il documento in capitoli dovrebbe creare anche un indice o riassunto.
  Questo permetterebbe di far capire all'agente di cosa parla l'intero documento.
  Altrimenti alla domanda "cosa posso fare a Roma?" (in demo ho usato il testo di una guida turistica per Roma) lui dovrebbe scaricare teoricamente tutta la conoscenza.

- Bisognerebbe creare un sotto-agente che gestisce le query al database vettoriale al posto dell'agente-leader
  Questo permetterebbe di gestre la richiesta senza appesantire la finestra dell'agente-leader
