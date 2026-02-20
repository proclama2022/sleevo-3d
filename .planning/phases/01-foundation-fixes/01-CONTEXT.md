# Phase 1: Foundation Fixes - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Correggere i bug strutturali dell'engine (soglia sblocco, storage keys, SLOT_TARGETS hardcoded, Zustand morto) e collegare i componenti di feedback già costruiti ma non connessi: ScorePopup (feedback punti), contatore progresso nell'HUD, e visualizzazione regola del livello. Nessuna nuova funzionalità — solo wiring e bug fix.

</domain>

<decisions>
## Implementation Decisions

### Score Feedback Visivo (COMM-01)
- Il feedback "+N" appare vicino al punteggio nell'HUD (non vicino allo slot, non al centro)
- Mostra solo il numero in assenza di combo ("+10"); aggiunge il combo label solo quando scatta NICE!/GREAT!/AMAZING!/LEGENDARY! (es. "+35 GREAT!")
- Animazione e colori: Claude's discretion (scegliere in base all'estetica esistente)

### Contatore Progresso (COMM-02)
- Formato: "5 / 8" (solo numeri, senza testo aggiuntivo)
- Posizione nell'HUD: Claude's discretion (integrare dove ha più senso con il layout esistente)

### Regola del Livello (COMM-03)
- Stile: icona + testo breve (es. icona musicale + "Genere", icona clock + "Anno")
- Modalità free: Claude's discretion (nascondere o mostrare testo neutro)

### Claude's Discretion
- Animazione score feedback (sale verso l'alto o pop in/fade)
- Colore del testo score feedback
- Posizione esatta contatore nell'HUD
- Comportamento regola in modalità free
- Approccio al quarantining/rimozione Zustand gameStore

</decisions>

<specifics>
## Specific Ideas

- Il ScorePopup esiste già nel codebase ma non è collegato al drop handler — è un wiring job, non un rebuild
- Il componente ComboFloat già usa un pattern simile per il floating label del combo — usarlo come riferimento
- SLOT_TARGETS è hardcoded per v1-v8 in rules.ts; la fix deve supportare vinili con ID arbitrari per i livelli futuri

</specifics>

<deferred>
## Deferred Ideas

Nessuna — la discussione è rimasta entro lo scope della fase.

</deferred>

---

*Phase: 01-foundation-fixes*
*Context gathered: 2026-02-20*
