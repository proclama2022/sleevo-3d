---
phase: 05-storage-and-score-utility
verified: 2026-02-25T19:30:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 5: Storage and Score Utility — Verification Report

**Phase Goal:** Best scores are persisted safely across sessions and a shared formatting utility exists for all score display surfaces
**Verified:** 2026-02-25T19:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Completing a level saves its score to localStorage; returning later still shows that score | VERIFIED | `GameScreen.tsx:190` calls `saveProgress(state.level.id, state.stars, timeElapsed, state.score)` inside a `useEffect` that fires on `state.status === 'completed'`; `saveProgress` in `storage.ts:35` writes to `localStorage` via `JSON.stringify(data)` |
| 2 | Replaying a level and scoring lower does not overwrite the stored best score | VERIFIED | `storage.ts:25-26` — `scoreImproved` is `score > existing.bestScore`; the write gate on line 28 only fires if `scoreImproved` is true, so a lower score leaves the stored value untouched |
| 3 | Completing a level does not erase previously stored bestStars or unlocked state | VERIFIED | `storage.ts:29-34` uses spread-merge `{ ...existing, ... }` — all prior fields are preserved; `stars` and `bestTime` each have explicit guards so they only update if their own condition is met; a score-only write leaves `stars` and `bestTime` intact |
| 4 | The number 1420 formats to "1.420 pt" consistently across every surface that displays a score | VERIFIED | `formatScore.ts:9` — `new Intl.NumberFormat('it-IT').format(score) + ' pt'` with hardcoded `'it-IT'` locale; re-exported from `src/utils/index.ts:3` as the single shared source of truth; SUMMARY-01 notes browser ICU confirmed correct output; no inline `toLocaleString` calls found |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/game/storage.ts` | `LevelProgress.bestScore` field, `saveProgress` with merge-write and `scoreImproved` condition | VERIFIED | Lines 5-39 — `bestScore?: number` on interface; three independent OR'd improvement conditions; spread-merge write; try/catch guard |
| `src/utils/formatScore.ts` | `formatScore(score)` returning Italian-formatted string or em dash | VERIFIED | Lines 7-10 — hardcoded `'it-IT'`, returns `'—'` (U+2014) for `undefined`/`null`, appends `' pt'` |
| `src/utils/index.ts` | Re-exports `formatScore` for downstream consumers | VERIFIED | Line 3 — `export * from './formatScore'` present |
| `src/components/GameScreen.tsx` | Completion `useEffect` passes `state.score` as fourth arg to `saveProgress` | VERIFIED | Line 190 — `saveProgress(state.level.id, state.stars, timeElapsed, state.score)`; `state.score` intentionally excluded from deps array (line 193 lint-suppress comment) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `GameScreen.tsx` useEffect | `saveProgress` in `storage.ts` | import line 13, call line 190 | WIRED | Import confirmed; call confirmed with all 4 arguments including `state.score` |
| `storage.ts saveProgress` | `localStorage` | `localStorage.setItem(PROGRESS_KEY, JSON.stringify(data))` line 35 | WIRED | Write is inside the improvement-condition gate; try/catch prevents crashes |
| `storage.ts loadAllProgress` | `localStorage` | `localStorage.getItem(PROGRESS_KEY)` line 44 | WIRED | Read path confirmed; returns `{}` on failure or missing key |
| `formatScore.ts` | `src/utils/index.ts` | `export * from './formatScore'` | WIRED | Re-export confirmed; downstream phases (6, 7) can import from `src/utils` barrel |
| `scoreImproved` condition | best-only merge | `score > existing.bestScore` gate in `saveProgress` | WIRED | Independent OR condition means lower scores never overwrite; gate fires even when star count unchanged |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PERSIST-01 | 05-01, 05-02 | Il gioco salva il punteggio migliore per ogni livello con semantica best-only | SATISFIED | `storage.ts:25-26` — `scoreImproved` condition enforces best-only semantics; `GameScreen.tsx:190` wires `state.score` into save call |
| PERSIST-02 | 05-01, 05-02 | Il salvataggio usa merge-write per non sovrascrivere i dati esistenti | SATISFIED | `storage.ts:29-34` — spread-merge `{ ...existing, ... }` preserves all schema fields; individual field guards ensure `stars` and `bestTime` are not clobbered by a score-only write |

No orphaned requirements found for Phase 5.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/utils/formatScore.ts` | — | No anti-patterns | — | — |
| `src/game/storage.ts` | — | No anti-patterns | — | — |
| `src/components/GameScreen.tsx` | 192-193 | `// eslint-disable-next-line react-hooks/exhaustive-deps` | Info | Intentional and documented — `state.score` excluded from deps so effect fires once per completion, not on every score increment mid-game; a comment on the preceding line explains the intent |

No blocker or warning anti-patterns found.

---

### Human Verification Required

None required for automated-verifiable goals. The SUMMARY-02 documents that a human did manually verify end-to-end in a browser session:

- Confirmed `bestScore` appears in localStorage after level completion
- Confirmed lower-score replay leaves `bestScore` unchanged
- Confirmed `stars` and `bestTime` survive a score-only write
- Confirmed `formatScore(1420)` returns `'1.420 pt'` in browser (it-IT locale with dot separator)

The SUMMARY-01 notes Node v22 in this environment has stripped ICU data so the Node CLI produced a false negative — browser behaviour is authoritative and was confirmed by human review.

---

### Commit Verification

All documented commits verified present in git history:

| Commit | Message |
|--------|---------|
| `fc1ade4` | feat(05-01): extend LevelProgress with bestScore and rewrite saveProgress with merge-write |
| `4d5ca9d` | feat(05-01): add formatScore utility with hardcoded it-IT locale and re-export from utils index |
| `836ac60` | feat(05-02): pass state.score to saveProgress on level completion |

---

### Gaps Summary

No gaps. All four success criteria are satisfied by substantive, wired implementation:

1. The `saveProgress` call in `GameScreen.tsx` triggers on level completion (`state.status === 'completed'`) and passes `state.score` — the full pipeline from game state to localStorage is active.
2. The `scoreImproved` guard (`score > existing.bestScore`) is an independent OR condition, not nested under star improvement — a best-score run with no star change will still write.
3. The spread-merge write pattern and per-field guards in `saveProgress` ensure no existing fields are silently erased.
4. `formatScore` hardcodes `'it-IT'` locale and is the single barrel-exported utility — there is no divergent inline formatting path.

---

_Verified: 2026-02-25T19:30:00Z_
_Verifier: Claude (gsd-verifier)_
