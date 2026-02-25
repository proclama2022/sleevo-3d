# Requirements: Sleevo

**Defined:** 2026-02-20
**Core Value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.

## v1 Requirements

### Foundation Fixes

- [x] **FIX-01**: La soglia di sblocco livello successivo è >= 2 stelle (attualmente hardcoded >= 1)
- [x] **FIX-02**: La chiave di storage per i livelli usa l'ID livello (non l'indice numerico) per evitare rotture quando si aggiungono livelli
- [x] **FIX-03**: `SLOT_TARGETS` / `getTargetSlot()` supporta vinili arbitrari (non solo v1-v8 hardcoded)
- [x] **FIX-04**: Il Zustand store dormante (`gameStore.ts`) è rimosso o isolato per evitare confusione

### Player Communication

- [x] **COMM-01**: Il giocatore vede un feedback visivo immediato con i punti guadagnati dopo ogni piazzamento corretto ("+10", "+35 GREAT!" fluttuante vicino allo slot)
- [x] **COMM-02**: L'HUD mostra un contatore progresso vinili ("5 / 8 piazzati")
- [x] **COMM-03**: L'HUD mostra la regola del livello corrente in modo persistente (es. "Ordina per: Genere")
- [x] **COMM-04**: La schermata di fine livello mostra stelle, punteggio, errori e tempo impiegato

### Star System

- [x] **STAR-01**: Il sistema stelle calcola il rating da combinazione errori + velocità (3 stelle = nessun errore + sotto il par time del livello)
- [x] **STAR-02**: Le soglie stelle sono differenziate per modalità (le modalità più difficili come blackout/rush hanno soglie più permissive)
- [x] **STAR-03**: Ogni livello ha un `parTime` definito usato nel calcolo stelle

### Progression

- [x] **PROG-01**: Il progresso è salvato in localStorage (stelle per livello, livello più alto sbloccato)
- [x] **PROG-02**: I livelli si sbloccano quando il precedente raggiunge almeno 2 stelle
- [x] **PROG-03**: Una schermata di selezione livelli mostra la griglia con stato locked/unlocked e stelle acquisite

### Level Content

- [x] **LVLS-01**: Esistono 20+ livelli con difficoltà crescente
- [x] **LVLS-02**: I livelli coprono tutte le modalità: free, genre, chronological, customer, blackout, rush, sleeve-match
- [x] **LVLS-03**: La curva di difficoltà introduce le modalità gradualmente (base → varianti avanzate)
- [x] **LVLS-04**: Ogni livello ha un `hint` chiaro che spiega la regola

### Mode Implementation

- [x] **MODE-01**: La modalità `rush` è completamente implementata con timer nell'HUD e comportamento "time's up" definito
- [x] **MODE-02**: La modalità `blackout` nasconde le etichette colonna in modo affidabile (logica nel engine, non in useEffect)
- [x] **MODE-03**: La modalità `customer` mostra chiaramente la richiesta del cliente durante il gioco
- [ ] **MODE-04**: La modalità `sleeve-match` abbina il disco fisico alla copertina mostrata nello slot

## v2 Requirements

### Social & Retention

- **SOC-01**: Leaderboard locale (best score per livello)
- **SOC-02**: Replay incentive — "Il tuo record: 3 stelle" mostrato nella level select

### Content Expansion

- **CONT-01**: Pacchetti di livelli tematici (anni '60, jazz club, punk underground)
- **CONT-02**: Livelli con vinili rari che danno bonus speciali

## Out of Scope

| Feature | Reason |
|---------|--------|
| Lives / energy system | Non ci sono acquisti in-app; punire gli errori con combo reset è sufficiente |
| Timer di default su tutti i livelli | Distrugge l'atmosfera "negozio di dischi" del gioco |
| Undo button | Trivializzerebbe il puzzle; `undo()` è già vuoto per design |
| Account utente / cloud sync | Complessità eccessiva per v1 browser game; localStorage è sufficiente |
| Cutscene animate tra i livelli | Alto costo produttivo, blocca i giocatori esperti |
| Leaderboard online | Richiede infrastruttura backend; rimandare a post-launch |
| Acquisti in-app | Fuori scope per v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 | Complete |
| FIX-02 | Phase 1 | Complete |
| FIX-03 | Phase 1 | Complete |
| FIX-04 | Phase 1 | Complete |
| COMM-01 | Phase 1 | Complete |
| COMM-02 | Phase 1 | Complete |
| COMM-03 | Phase 1 | Complete |
| STAR-01 | Phase 2 | Complete |
| STAR-02 | Phase 2 | Complete |
| STAR-03 | Phase 2 | Complete |
| COMM-04 | Phase 2 | Complete |
| PROG-01 | Phase 3 | Complete |
| PROG-02 | Phase 3 | Complete |
| PROG-03 | Phase 3 | Complete |
| LVLS-01 | Phase 4 | Complete |
| LVLS-02 | Phase 4 | Complete |
| LVLS-03 | Phase 4 | Complete |
| LVLS-04 | Phase 4 | Complete |
| MODE-01 | Phase 4 | Complete |
| MODE-02 | Phase 4 | Complete |
| MODE-03 | Phase 4 | Complete |
| MODE-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after initial definition*
