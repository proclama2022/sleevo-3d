# Sleevo

## What This Is

Sleevo è un gioco di sorting di vinili in cui il giocatore trascina dischi da un carosello rotante verso uno scaffale a griglia, piazzandoli nel posto corretto secondo la regola del livello (genere, ordine cronologico, richiesta del cliente, ecc.). Il gioco è costruito in React + Three.js ed è destinato al browser, con 21 livelli che introducono gradualmente 7 modalità di gioco distinte.

## Core Value

Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.

## Requirements

### Validated

- ✓ Drag-and-drop di vinili dal carosello allo scaffale — v1.0
- ✓ Validazione piazzamento (genere, colonna esatta) — v1.0
- ✓ Sistema combo con moltiplicatori (1x → 5x) — v1.0
- ✓ Scoring base: placement points - error penalty + combo bonus — v1.0
- ✓ Tutte le modalità implementate: free, genre, chronological, customer, blackout, rush, sleeve-match — v1.0
- ✓ Feedback visivo errore: shake + bounce-back + flash rosso — v1.0
- ✓ Onboarding a due step per il primo drag — v1.0
- ✓ Feedback visivo immediato sui punti guadagnati dopo ogni piazzamento — v1.0
- ✓ Contatore progresso vinili nell'HUD — v1.0
- ✓ Regola del livello corrente mostrata nell'HUD — v1.0
- ✓ Sistema stelle basato su errori + velocità con parTime per livello — v1.0
- ✓ Progressione livelli: 2 stelle per sbloccare il successivo — v1.0
- ✓ 21 livelli con difficoltà crescente, tutte le modalità coperte — v1.0
- ✓ Schermata di fine livello con stelle, punteggio, errori, tempo — v1.0
- ✓ Salvataggio progressione in localStorage (best stars, unlock state) — v1.0
- ✓ Schermata selezione livelli con griglia 3 colonne, locked/unlocked, focus sul primo incompleto — v1.0
- ✓ Pre-level hint overlay per ogni livello — v1.0
- ✓ Rush mode: countdown HUD, urgenza a 10s, auto-complete allo scadere — v1.0
- ✓ Blackout mode: label-hide engine-driven senza flicker (BLACKOUT_TICK) — v1.0
- ✓ Customer mode: nome cliente + richiesta nel panel sotto HUD — v1.0
- ✓ Best score (punti) salvato in localStorage per ogni livello con best-only merge-write — v1.1
- ✓ Cella level select mostra punteggio migliore "1.420 pt" sotto le stelle (o "—" se mai completato) — v1.1
- ✓ Badge "Nuovo Record! +X pt" in LevelComplete quando si batte il record personale — v1.1

### Active

*(next milestone requirements go here)*

### Out of Scope

| Feature | Reason |
|---------|--------|
| Lives / energy system | Combo reset è sufficiente come penalità |
| Timer di default su tutti i livelli | Distrugge l'atmosfera "negozio di dischi" |
| Undo button | Trivializzerebbe il puzzle |
| Account utente / cloud sync | Complessità eccessiva; localStorage sufficiente per v1 |
| Cutscene animate tra i livelli | Alto costo produttivo |
| Leaderboard online | Richiede backend; rimandare a post-launch |
| Acquisti in-app | Fuori scope |

## Context

**v1.1 shipped 2026-02-26.** 21 livelli, 7 modalità, progressione completa con best score e "Nuovo Record!" badge. 7 fasi totali (4 v1.0 + 3 v1.1), 19 piani.

Tech stack: React + Three.js + TypeScript + Vite. State: useReducer in GameScreen. Storage: localStorage. No backend.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stelle basate su errori + velocità (parTime) | Riflette precisione e ritmo | ✓ Good |
| 2 stelle minime per sbloccare | Permissivo ma incentiva qualità | ✓ Good |
| BLACKOUT_TICK in reducer (non useEffect) | Elimina flicker da setTimeout | ✓ Good |
| localStorage per progressione | Zero infrastruttura, funziona offline | ✓ Good |
| App.tsx screen router minimalista | Evita React Router per un'app a 2 schermate | ✓ Good |
| LevelHintOverlay ad ogni load (non solo prima volta) | Refactoring più semplice; recall per i giocatori | ✓ Good |
| saveProgress merge-write con spread `{ ...existing }` | Previene perdita campi silenziosa quando schema cresce | ✓ Good |
| scoreImproved come condizione OR indipendente | Score migliore salva anche senza cambio stelle | ✓ Good |
| isNewRecord calcolato pre-save nel useEffect | Evita lettura stale post-scrittura localStorage | ✓ Good |
| Guard strict `!== undefined` (non `?? 0`) | Primo completamento non è "nuovo record" | ✓ Good |
| formatScore hardcoded it-IT | Formato consistente indipendente da locale browser | ✓ Good |

## Constraints

- **Tech stack**: React + Three.js + TypeScript + Vite — non cambiare il renderer
- **Brownfield**: Modifiche additive o mirate; codebase funzionante
- **Lingua**: UI in italiano

---
*Last updated: 2026-02-26 after v1.1 milestone*
