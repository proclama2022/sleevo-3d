# Requirements: Sleevo v1.1 — Social & Retention

## Milestone Goal

Il giocatore può confrontare le proprie performance passate — best score visibile nel level select e celebrazione del nuovo record alla fine del livello.

## v1.1 Requirements

### Persistence

- [x] **PERSIST-01**: Il gioco salva il punteggio migliore (punti interi) per ogni livello in localStorage con semantica best-only (sovrascrive solo se il nuovo score supera il precedente)
- [x] **PERSIST-02**: Il salvataggio del punteggio migliore usa merge-write per non sovrascrivere i dati esistenti (bestStars, unlocked)

### Display — Level Select

- [x] **SELECT-01**: La cella di ogni livello mostra il punteggio migliore come "1.420 pt" sotto le stelle; mostra "--" se il livello non è mai stato completato

### Display — Level Complete

- [x] **COMPLETE-01**: La schermata di fine livello mostra il badge "Nuovo Record!" quando il punteggio corrente supera il record personale precedente (escluso il primo completamento — nessun record precedente non conta come "nuovo record")
- [x] **COMPLETE-02**: Il badge "Nuovo Record!" mostra anche il delta rispetto al record precedente (es. "+340 pt")

## Future Requirements

*(Deferred to a future milestone)*

- Delta score animato che conta su dalla differenza (P3 — visual polish)
- Classifica locale multi-profilo (richiede refactor storage)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Leaderboard online | Richiede backend |
| Condivisione score sui social | Fuori dal core loop |
| Best time display in LevelSelect | Non richiesto per v1.1; bestTime non ha superficie di display |
| Animazione "nuovo record" elaborata (particelle, camera shake) | Overkill per questo contesto; badge + pulse sufficienti |

## Traceability

| REQ-ID | Phase | Plan |
|--------|-------|------|
| PERSIST-01 | Phase 5 | 05-01, 05-02 |
| PERSIST-02 | Phase 5 | 05-01, 05-02 |
| SELECT-01 | Phase 7 | 07-01 |
| COMPLETE-01 | Phase 6 | 06-01 |
| COMPLETE-02 | Phase 6 | 06-01 |
