


- system
  - prompt tempate
  - tool tempate
    - inserire dei mock
  - agent tempate
	- inserimento stringhe promt, system
    	- utilizzo delle def (variabili sul testo che sostituiscono parole)
    	- utilizzo di template di prompt
	- tools
	- subagent
	- conteggio tokens
  - embedding
    - visualizzazione mappa di vicinanza
    - 
  
- test
  - test con delay su un prompt e verifica dello stato (sprattutto history)
  - test con una serie di prompt e verifica delle performance per ogni pompt
  - recuperare la history dello stato dell'agent per analisi
  - 
  
- providers setup account
  - store API-KEYS



AGENT (CO-REACT)
- è possibile lanciare un agente in maniera asincrona
- distruggere tutti i sottoagenti quando finisce un task
- i subagents possono essere giudicati per le loro risposte. assegnare un punteggio

EMBEDDING MULTILEVEL
- fornire un doc composto dai "title" dei CHAPTER indice di tutto il DOCUMENT
- tool: "search_single_word"
- tool: "search_all_block_of_text"