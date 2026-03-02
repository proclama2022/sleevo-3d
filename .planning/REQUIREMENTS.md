# Requirements: Sleevo v1.2 Visual Polish

**Defined:** 2026-03-02
**Core Value:** Il giocatore deve sempre sapere esattamente cosa deve fare, perché ha guadagnato punti, e quanto manca alla fine del livello.

## v1.2 Requirements

### Accessibility (Foundation)

- [ ] **ACES-01**: Tutte le animazioni rispettano prefers-reduced-motion via CSS media query
- [ ] **ACES-02**: Animazioni non causano vestibular issues (no infinite motion, no extreme parallax)

### Drag Feedback

- [ ] **DRAG-01**: Vinile oscilla naturalmente quando afferrato (wobble effect con physics)
- [ ] **DRAG-02**: Wobble risponde alla velocità del drag — movimento veloce = oscillazione maggiore
- [ ] **DRAG-03**: Wobble si attenua gradualmente quando il drag si ferma

### Slot Feedback

- [ ] **SLOT-01**: Slot emette glow pulsante quando vinile è in prossimità
- [ ] **SLOT-02**: Glow intensifica quando vinile è direttamente sopra lo slot
- [ ] **SLOT-03**: Glow si spegne con transizione smooth quando vinile si allontana

### Placement Feedback

- [ ] **PLACE-01**: Vinile ruota di 360° quando piazzato correttamente (spin animation)
- [ ] **PLACE-02**: Drop shadow appare sotto il vinile durante il drag
- [ ] **PLACE-03**: Effetto "thwack" visivo al placement (mini-bounce + sparkle esistente)

### Screen Transitions

- [ ] **TRAN-01**: Transizione fade tra LevelSelect e GameScreen
- [ ] **TRAN-02**: Transizione fade tra GameScreen e LevelComplete
- [ ] **TRAN-03**: Loading state visivo durante lazy loading livelli
- [ ] **TRAN-04**: Transizioni rispettano prefers-reduced-motion

### Ambient Atmosphere

- [ ] **AMBI-01**: Particelle polvere fluttuano nella scena (tema-aware)
- [ ] **AMBI-02**: Raggi di luce sottili nella scena (solo temi specifici)
- [ ] **AMBI-03**: Particelle reagiscono al tema (colore, intensità)

## Future Requirements

Deferred to future release.

### Advanced Polish

- **ADV-01**: Particle burst colorato per combo > 3x
- **ADV-02**: Screen shake per errori consecutivi
- **ADV-03**: Haptic feedback su mobile

## Out of Scope

| Feature | Reason |
|---------|--------|
| Suoni/effetti audio | Separato in milestone dedicata |
| 3D mesh animati in Three.js | Three.js resta statico per performance |
| Micro-interazioni su ogni button | Non core per game feel |
| Parallax scrolling | Non applicabile al layout attuale |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACES-01 | Phase 8 | Pending |
| ACES-02 | Phase 8 | Pending |
| DRAG-01 | Phase 9 | Pending |
| DRAG-02 | Phase 9 | Pending |
| DRAG-03 | Phase 9 | Pending |
| SLOT-01 | Phase 9 | Pending |
| SLOT-02 | Phase 9 | Pending |
| SLOT-03 | Phase 9 | Pending |
| PLACE-01 | Phase 10 | Pending |
| PLACE-02 | Phase 10 | Pending |
| PLACE-03 | Phase 10 | Pending |
| TRAN-01 | Phase 11 | Pending |
| TRAN-02 | Phase 11 | Pending |
| TRAN-03 | Phase 11 | Pending |
| TRAN-04 | Phase 11 | Pending |
| AMBI-01 | Phase 12 | Pending |
| AMBI-02 | Phase 12 | Pending |
| AMBI-03 | Phase 12 | Pending |

**Coverage:**
- v1.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after initial definition*
