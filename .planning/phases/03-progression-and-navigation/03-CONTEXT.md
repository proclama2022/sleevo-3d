# Phase 3: Progression and Navigation - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the level select screen, unlock gating (2★ on level N unlocks level N+1), resume-on-load behavior (always open at level select, scrolled to first incomplete level), and best-star persistence (localStorage). Players can navigate the full level catalog and the game remembers where they are across sessions.

Creating posts, achievements, leaderboards, or any other social/meta features are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Level select layout
- 3-column grid layout
- Each cell shows: level number + best star count earned (★★★ filled/empty)
- No level name or mode hint on the cell — just number and stars
- Locked levels: same cell style but dimmed/greyed out with a padlock icon (no number hidden)
- Header: simple title (e.g. "Scegli Livello") + back button — minimal chrome

### Locked level interaction
- Tapping a locked level does nothing (silent block — no toast, no modal)
- Unlock rule explained by subtle hint text below the grid (e.g. "Guadagna 2 stelle per sbloccare il prossimo livello")
- After completing a level with enough stars to unlock the next: LevelComplete screen first (stars animate, player sees score), then player taps Continue and lands on level select with the newly unlocked level visible

### App load & resume
- Always open at level select on load — never jump directly into a level
- On load, visually highlight/focus the first level the player hasn't earned 3★ on yet
- "Incomplete" = never earned 3★ (not just never played) — encourages replaying for perfection
- If all levels are 3★, focus the last level

### Star persistence
- Storage: localStorage (JSON, browser-native, no backend needed)
- Best stars are always preserved — a worse replay never overwrites a better result
- Unlocks are permanent: once level N+1 is unlocked (by earning 2★ on level N), it stays unlocked regardless of future replays
- Unlock state is derived from best-ever star count stored in localStorage

### Claude's Discretion
- Exact localStorage key structure and schema
- Scroll animation / focus animation on the highlighted cell
- Transition animation between level select and gameplay
- Exact Italian strings for title and hint text

</decisions>

<specifics>
## Specific Ideas

- The grid mockup chosen: numbered cells with star rows, locked cells show padlock in place of stars
- The "first incomplete" highlight is the primary orientation cue on load — player immediately sees where to go next

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-progression-and-navigation*
*Context gathered: 2026-02-25*
