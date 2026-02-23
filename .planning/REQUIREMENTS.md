# Requirements: Sleevo

**Defined:** 2026-02-20
**Core Value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.

## v1 Requirements

### Foundation Fixes

- [x] **FIX-01**: La soglia di sblocco livello successivo è >= 2 stelle (attualmente hardcoded >= 1)
- [x] **FIX-02**: La chiave di storage per i livelli usa l'ID livello (non l'indice numerico) per evitare rotture quando si aggiungono livelli
- [x] **FIX-03**: `SLOT_TARGETS` / `getTargetSlot()` supporta vinili arbitrari (non solo v1-v8 hardcoded)
- [ ] **FIX-04**: Il Zustand store dormante (`gameStore.ts`) è rimosso o isolato per evitare confusione

### Player Communication

- [ ] **COMM-01**: Il giocatore vede un feedback visivo immediato con i punti guadagnati dopo ogni piazzamento corretto ("+10", "+35 GREAT!" fluttuante vicino allo slot)
- [ ] **COMM-02**: L'HUD mostra un contatore progresso vinili ("5 / 8 piazzati")
- [ ] **COMM-03**: L'HUD mostra la regola del livello corrente in modo persistente (es. "Ordina per: Genere")
- [ ] **COMM-04**: La schermata di fine livello mostra stelle, punteggio, errori e tempo impiegato

### Star System

- [ ] **STAR-01**: Il sistema stelle calcola il rating da combinazione errori + velocità (3 stelle = nessun errore + sotto il par time del livello)
- [ ] **STAR-02**: Le soglie stelle sono differenziate per modalità (le modalità più difficili come blackout/rush hanno soglie più permissive)
- [ ] **STAR-03**: Ogni livello ha un `parTime` definito usato nel calcolo stelle

### Progression

- [ ] **PROG-01**: Il progresso è salvato in localStorage (stelle per livello, livello più alto sbloccato)
- [ ] **PROG-02**: I livelli si sbloccano quando il precedente raggiunge almeno 2 stelle
- [ ] **PROG-03**: Una schermata di selezione livelli mostra la griglia con stato locked/unlocked e stelle acquisite

### Level Content

- [ ] **LVLS-01**: Esistono 20+ livelli con difficoltà crescente
- [ ] **LVLS-02**: I livelli coprono tutte le modalità: free, genre, chronological, customer, blackout, rush, sleeve-match
- [ ] **LVLS-03**: La curva di difficoltà introduce le modalità gradualmente (base → varianti avanzate)
- [ ] **LVLS-04**: Ogni livello ha un `hint` chiaro che spiega la regola

### Mode Implementation

- [ ] **MODE-01**: La modalità `rush` è completamente implementata con timer nell'HUD e comportamento "time's up" definito
- [ ] **MODE-02**: La modalità `blackout` nasconde le etichette colonna in modo affidabile (logica nel engine, non in useEffect)
- [ ] **MODE-03**: La modalità `customer` mostra chiaramente la richiesta del cliente durante il gioco
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
| FIX-04 | Phase 1 | Pending |
| COMM-01 | Phase 1 | Pending |
| COMM-02 | Phase 1 | Pending |
| COMM-03 | Phase 1 | Pending |
| STAR-01 | Phase 2 | Pending |
| STAR-02 | Phase 2 | Pending |
| STAR-03 | Phase 2 | Pending |
| COMM-04 | Phase 2 | Pending |
| PROG-01 | Phase 3 | Pending |
| PROG-02 | Phase 3 | Pending |
| PROG-03 | Phase 3 | Pending |
| LVLS-01 | Phase 4 | Pending |
| LVLS-02 | Phase 4 | Pending |
| LVLS-03 | Phase 4 | Pending |
| LVLS-04 | Phase 4 | Pending |
| MODE-01 | Phase 4 | Pending |
| MODE-02 | Phase 4 | Pending |
| MODE-03 | Phase 4 | Pending |
| MODE-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after initial definition*
