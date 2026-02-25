# Phase 4: Level Content and Mode Validation - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Author 21-25 playable levels covering all 7 game modes, fix Rush/Blackout/Customer mode behavior so they're reliable, and add a pre-level hint overlay showing the rule before play starts. The game goes from "technically working" to "fully playable with a complete content catalog."

New modes, meta-features (achievements, leaderboards), social features, or editor tools are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Level difficulty curve
- Mode ordering: simple modes first — levels 1-5 use free/genre; levels 6-10 introduce chronological/customer; levels 11+ gradually add blackout, rush, sleeve-match
- Difficulty levers: two only — more vinyls per level AND stricter sorting rules (e.g. combined rules in later levels). Do NOT use distractor vinyls or artificial time pressure for difficulty.
- Vinyl count ramp: start at 4 vinyls (level 1), reach 8-10 by late levels (16-21+)
- Total levels: 21-25; no unique names needed — mode + rule is sufficient identity (e.g. "Livello 8 — Ordina per Anno")

### Rush mode: timer & time's up
- Countdown timer position: in the HUD, replacing or sitting near the existing elapsed-time display
- Time expires behavior: auto-complete the level immediately with whatever score was accumulated — no separate "Tempo Scaduto!" screen, just flow into LevelComplete
- Low-time urgency: countdown turns red and pulses in the last 10 seconds
- Duration: each level defines its own `rushTime` field (e.g. `rushTime: 90`) in the level definition in levels.ts — no fixed global default

### Customer mode display
- Panel content: customer name + request text — e.g. "Marco vuole: Jazz degli anni '70"
- Panel position: below the HUD, above the 3D shelf — always visible, never covers gameplay
- Panel style: dark background, amber text — matches existing HUD aesthetic exactly
- One customer per level; customer and request are fixed in the level definition; same customer appears on every replay
- Request resets correctly on LOAD_LEVEL (existing engine requirement from roadmap)

### Pre-level hint overlay
- Trigger: shown every time a level loads (not just first exposure to a mode)
- Content: rule only — e.g. "Ordina per: Genere" or "Modalità: Blackout". No explanation text.
- Dismiss: tap anywhere OR tap an "Inizia" button — deliberate player action, not auto-dismiss
- Implementation: overlay on the game screen, appearing before the player can interact with vinyls; dismissing it starts the level

### Claude's Discretion
- Exact vinyl albums/artists used in level definitions (real-sounding Italian vinyl catalog)
- Blackout mode implementation fix (engine-level hide logic, not useEffect — roadmap specifies this)
- Customer name pool and request phrasing
- Exact hint overlay visual design (consistent with game aesthetic)
- parTime values per level (derived from vinyl count × reasonable placement speed)

</decisions>

<specifics>
## Specific Ideas

- The progression feel: level 1 should be so easy a first-timer gets it immediately (4 vinyls, free mode or genre). The last few levels should feel like a genuine challenge requiring attention.
- "Blackout mode reliably hides column labels without flicker; the hide logic lives in the engine, not a useEffect" — this is a known fix requirement from the roadmap, not a new feature.
- Rush auto-complete on timer expiry means the star formula should handle 0 mistakes gracefully when time runs out (player completed whatever they could).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-level-content-and-mode-validation*
*Context gathered: 2026-02-25*
