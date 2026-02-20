# Sleevo

## What This Is

Sleevo è un gioco di sorting di vinili in cui il giocatore trascina dischi da un carosello rotante verso uno scaffale a griglia, piazzandoli nel posto corretto secondo la regola del livello (genere, ordine cronologico, richiesta del cliente, ecc.). Il gioco è costruito in React + Three.js ed è destinato al browser, con una progressione di 20+ livelli che introducono gradualmente le varie modalità.

## Core Value

Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.

## Requirements

### Validated

- ✓ Drag-and-drop di vinili dal carosello allo scaffale — esistente
- ✓ Validazione piazzamento (genere, colonna esatta) — esistente
- ✓ Sistema combo con moltiplicatori (1x → 5x) — esistente
- ✓ Scoring base: placement points - error penalty + combo bonus — esistente
- ✓ Modalità di gioco definite: free, genre, chronological, customer, blackout, rush, sleeve-match — definite ma non tutte implementate
- ✓ Feedback visivo errore: shake + bounce-back + flash rosso — esistente
- ✓ Onboarding a due step per il primo drag — esistente

### Active

- [ ] Feedback visivo immediato sui punti guadagnati dopo ogni piazzamento (+N punti fluttuanti)
- [ ] Contatore progresso vinili nell'HUD: "5/8 vinili piazzati"
- [ ] Regola del livello corrente mostrata chiaramente nell'HUD (es. "Ordina per genere")
- [ ] Sistema stelle basato su combinazione errori + velocità (3 stelle = perfetto + veloce)
- [ ] Progressione livelli: servono 2 stelle per sbloccare il livello successivo
- [ ] 20+ livelli con difficoltà crescente, usando tutte le modalità (genre, chronological, customer, blackout, rush, sleeve-match)
- [ ] Schermata di fine livello che mostra stelle, punteggio, errori, tempo
- [ ] Salvataggio progressione livelli (stelle acquisite, livello sbloccato)
- [ ] Ogni livello mostra chiaramente la sua regola prima di iniziare

### Out of Scope

- Multiplayer — non è nel concept del gioco
- Acquisti in-app — fuori scope per ora
- Account utente / sync cloud — complessità eccessiva per v1
- Editor di livelli — non necessario per v1

## Context

Il codebase è già funzionante con una base solida: Three.js per il rendering 3D, React per l'UI overlay, Zustand per lo state management. Il problema principale non è la mancanza di funzionalità tecniche, ma la mancanza di comunicazione chiara al giocatore. Molte modalità di gioco sono già definite nei tipi TypeScript (`LevelMode`) ma non hanno ancora livelli associati né sono tutte implementate nella logica di gioco.

Il GAME-LOGIC.md documenta accuratamente lo stato corrente del sistema.

## Constraints

- **Tech stack**: React + Three.js + TypeScript + Vite — non cambiare il renderer
- **Brownfield**: Il codice esistente è funzionante, le modifiche devono essere additive o mirate
- **Lingua**: UI in italiano (con qualche stringa inglese legacy da normalizzare)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stelle basate su errori + velocità combinati | Riflette entrambe le sfide del gioco: precisione e ritmo | — Pending |
| 2 stelle minime per sbloccare il livello successivo | Abbastanza permissivo da non frustrare, abbastanza impegnativo da incentivare la qualità | — Pending |
| Tutte le modalità esistenti vanno sviluppate | La varietà di modalità è il punto di forza del gioco | — Pending |

---
*Last updated: 2026-02-20 after initialization*
