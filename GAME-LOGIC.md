# Sleevo Vinyl Shop Manager - Complete Game Logic Reference

This document captures every game rule, mechanic, data structure, and behavioral detail
needed to rebuild the game from scratch. It focuses on WHAT the game does, not how it is
rendered.

---

## 1. Core Concept

The player sorts vinyl records into the correct shelf columns by dragging and dropping them
from a scrolling carousel at the bottom of the screen onto a shelf grid above. Each vinyl
has a genre and a predetermined target column. The goal is to place all vinyls in their
correct columns to complete the level.

---

## 2. Data Structures

### 2.1 Vinyl

```ts
type VinylWidth = 1 | 2;

interface Vinyl {
  id: string;          // Unique identifier, e.g. "v1", "v2"
  width: VinylWidth;   // Currently always 1 (single-slot)
  color: string;       // Hex CSS color, e.g. "#D7263D"
  genre: string;       // Genre name: "Rock", "Pop", "Jazz", "Hip-Hop", "Classica"
  year: number;        // Release year, e.g. 1975
  title?: string;      // Optional album title
  artist?: string;     // Optional artist name
  coverImage?: string; // Optional cover image URL
}
```

### 2.2 Shelf Configuration

```ts
interface ShelfConfig {
  rows: number;  // Number of rows (currently 2 in level data, but runtime uses row 0 only for single-slot-per-column mode)
  cols: number;  // Number of columns (4 in current levels)
}
```

### 2.3 Grid Cell

```ts
interface GridCell {
  row: number;           // Row index (0-based)
  col: number;           // Column index (0-based)
  vinylId: string | null; // null = empty, string = occupied by that vinyl's ID
}
```

The grid is a 2D array: `grid[row][col]`.

### 2.4 Level

```ts
interface LevelRules {
  fillAllSlots: boolean;  // Whether all slots must be filled (currently false)
  sortBy?: 'color' | 'genre' | 'year';  // Sorting criterion (currently unused in logic)
  allowGaps: boolean;     // Whether gaps are allowed between vinyls (currently true)
}

interface Level {
  id: string;            // e.g. "level-1"
  shelf: ShelfConfig;    // Grid dimensions
  vinyls: Vinyl[];       // All vinyls to place in this level
  rules: LevelRules;     // Completion rules
}
```

### 2.5 Game Status

```ts
type GameStatus = 'idle' | 'playing' | 'completed' | 'failed';
```

- `idle` -- Initial state before a level is loaded.
- `playing` -- Active gameplay.
- `completed` -- All vinyls placed on the shelf (regardless of correctness -- see scoring).
- `failed` -- Not currently used.

### 2.6 Combo State

```ts
interface ComboState {
  streak: number;           // Consecutive correct placements
  multiplier: number;       // Current multiplier (1x, 1.5x, 2x, 3x, 5x)
  lastPlacementTime: number; // Timestamp (ms) of last placement
  maxStreak: number;        // Session best streak
  comboDecayMs: number;     // Time window before combo resets (default: 4000ms)
}
```

---

## 3. Level Definitions

### Level 1

```ts
{
  id: 'level-1',
  shelf: { rows: 2, cols: 4 },
  vinyls: [
    { id: 'v1', width: 1, color: '#D7263D', genre: 'Rock',     year: 1975 },
    { id: 'v2', width: 1, color: '#EC4899', genre: 'Pop',      year: 1989 },
    { id: 'v3', width: 1, color: '#2563EB', genre: 'Jazz',     year: 1959 },
    { id: 'v4', width: 1, color: '#F97316', genre: 'Hip-Hop',  year: 1992 },
    { id: 'v5', width: 1, color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v6', width: 1, color: '#D7263D', genre: 'Rock',     year: 1969 },
    { id: 'v7', width: 1, color: '#2563EB', genre: 'Jazz',     year: 1965 },
    { id: 'v8', width: 1, color: '#EC4899', genre: 'Pop',      year: 2001 },
  ],
  rules: { fillAllSlots: false, allowGaps: true },
}
```

### Level 2

```ts
{
  id: 'level-2',
  shelf: { rows: 2, cols: 4 },
  vinyls: [
    { id: 'v6', width: 1, color: '#D7263D', genre: 'Rock',     year: 1969 },
    { id: 'v3', width: 1, color: '#EC4899', genre: 'Pop',      year: 1989 },
    { id: 'v5', width: 1, color: '#A78BFA', genre: 'Classica', year: 1791 },
    { id: 'v1', width: 1, color: '#D7263D', genre: 'Rock',     year: 1975 },
    { id: 'v8', width: 1, color: '#EC4899', genre: 'Pop',      year: 2001 },
    { id: 'v4', width: 1, color: '#F97316', genre: 'Hip-Hop',  year: 1992 },
    { id: 'v2', width: 1, color: '#2563EB', genre: 'Jazz',     year: 1959 },
    { id: 'v7', width: 1, color: '#2563EB', genre: 'Jazz',     year: 1965 },
  ],
  rules: { fillAllSlots: false, allowGaps: true },
}
```

Key observation: Both levels use the **same 8 vinyls** with the **same IDs**, but Level 2
presents them in a **different (shuffled) order** in the carousel. The target columns
(defined in `gameRules.ts`) remain the same across all levels because they are tied to
vinyl ID, not position.

Level progression: after completing the last level, the game loops back to level 1.

---

## 4. Genre/Color Mapping System

### 4.1 Column Labels (8 columns)

The shelf has 8 labeled columns in a fixed order that does not change between levels:

```ts
const COLUMN_GENRE_LABELS = [
  'ROCK',      // Column 0
  'JAZZ',      // Column 1
  'POP',       // Column 2
  'HIP-HOP',   // Column 3
  'CLASSICA',  // Column 4
  'ROCK',      // Column 5
  'JAZZ',      // Column 6
  'POP',       // Column 7
];
```

Note: Genres can repeat across columns. There are two ROCK columns, two JAZZ columns,
and two POP columns.

### 4.2 Vinyl-to-Column Mapping (Exact Target)

Each vinyl ID maps to exactly ONE specific column. This is the **primary placement rule**:

```ts
const VINYL_ID_TO_COLUMN = {
  'v1': 0,  // Rock 1975   -> Column 0 (ROCK)
  'v2': 1,  // Jazz 1959   -> Column 1 (JAZZ)   [NOTE: v2 is Pop in level data but mapped to Jazz column]
  'v3': 2,  // Pop 1989    -> Column 2 (POP)     [NOTE: v3 is Jazz in level data but mapped to Pop column]
  'v4': 3,  // Hip-Hop 1992 -> Column 3 (HIP-HOP)
  'v5': 4,  // Classica 1791 -> Column 4 (CLASSICA)
  'v6': 5,  // Rock 1969   -> Column 5 (ROCK)
  'v7': 6,  // Jazz 1965   -> Column 6 (JAZZ)
  'v8': 7,  // Pop 2001    -> Column 7 (POP)
};
```

### 4.3 Genre-to-Color Mapping (Visual Display)

```ts
const GENRE_TO_COLOR = {
  rock:     0xff1744,  // Vivid red
  jazz:     0x2979ff,  // Electric blue
  pop:      0xff4081,  // Hot pink
  'hip-hop': 0xff6d00, // Vibrant orange
  hiphop:   0xff6d00,  // Alias
  classica: 0x9c27b0,  // Rich purple
};
// Fallback: 0x8b7355 (warm brown)
```

### 4.4 Genre-to-Column Mapping (Legacy/Fallback)

Used when vinyl ID is not available:

```ts
const NORMALIZED_GENRE_TO_COLUMN = {
  rock:     0,
  jazz:     1,
  pop:      2,
  'hip-hop': 3,
  hiphop:   3,
  classica: 4,
};
```

This maps to the **first** column of each genre only.

### 4.5 Genre Normalization

Genre strings are normalized before comparison:
```ts
function normalizeGenre(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}
```

---

## 5. Vinyl Placement Rules

### 5.1 Drop Validation (Three conditions -- ALL must be true)

A drop is **valid** if and only if:

1. **Genre Match**: The vinyl's genre matches the column's genre label (normalized comparison).
2. **Exact Column**: The vinyl's ID maps to this specific column via `VINYL_ID_TO_COLUMN`.
3. **Slot Free**: The target column is not already occupied (single-slot-per-column mode).

```
canPlace = snapped && isGenreMatch && isExactColumn && isSlotFree
```

### 5.2 Column Availability

A column is available if:
- The column index is within bounds (`0 <= col < shelfCols`).
- `grid[0][col].vinylId === null` (the cell in row 0 is empty).

Note: Despite the shelf config having `rows: 2`, the runtime operates in
**single-slot-per-column** mode where only `grid[0][col]` is used for availability checks.
The InputController always snaps to `row = 0`.

### 5.3 Snap-to-Grid

When the player releases a vinyl over the shelf area:
1. The vinyl's screen position is projected from the drag plane Z to the shelf surface Z
   (corrects for perspective distortion).
2. X bounds are checked against shelf width.
3. Y bounds are checked with a lenient tolerance of +/- 0.2 beyond shelf edges.
4. Column is calculated: `col = floor((localX / slotWidth) + (cols / 2))`, clamped to `[0, cols-1]`.
5. Row is always 0 (single-row mode).
6. If all bounds pass, `snapped = true` and the vinyl position is set to the cell center.

### 5.4 Invalid Drop Behavior

If the drop is invalid:
- The vinyl returns to its original carousel position (animated bounce-back).
- A horizontal shake animation plays.
- A red flash overlay appears on the vinyl.
- An invalid drop is registered (increments `moves` and `invalidDrops`).
- The combo streak resets to 0.
- Haptic feedback (heavy) on mobile.

### 5.5 Valid Drop Behavior

If the drop is valid:
- The vinyl is moved from the carousel group to the shelf group.
- It is positioned at the cell center with a slight lean/rotation for visual variety.
- The grid cell is marked as occupied.
- Moves counter increments.
- Combo system processes the placement.
- Score and status are recalculated.
- Haptic feedback (medium) on mobile.

---

## 6. Scoring System

### 6.1 Base Score Calculation

```ts
score = max(0, (placedCount * 10) - (invalidDrops * 2) + comboBonusScore)
```

Where:
- `placedCount` = number of vinyls successfully placed on the shelf.
- `invalidDrops` = total number of failed drop attempts.
- `comboBonusScore` = accumulated combo bonus points from all placements.

### 6.2 Combo Bonus Points (per placement)

On each valid placement:

```ts
basePoints = 6
streakBonus = min(10, combo.streak)
comboPoints = round((basePoints + streakBonus) * combo.multiplier)
```

This means:
- Streak 1: `round((6 + 1) * 1.0)` = 7 points
- Streak 2: `round((6 + 2) * 1.5)` = 12 points
- Streak 4: `round((6 + 4) * 2.0)` = 20 points
- Streak 6: `round((6 + 6) * 3.0)` = 36 points
- Streak 8+: `round((6 + 8) * 5.0)` = 70 points (streak capped at 10 for bonus)

### 6.3 Penalties

- Each invalid drop subtracts 2 points from the score (via the formula).
- Each invalid drop resets the combo streak to 0.

### 6.4 Score Floor

The score cannot go below 0 (enforced by `Math.max(0, ...)`).

---

## 7. Combo System

### 7.1 Combo Tiers

```ts
const COMBO_TIERS = [
  { minStreak: 0,  multiplier: 1.0, label: '',           color: '#ffffff' },
  { minStreak: 2,  multiplier: 1.5, label: 'NICE!',      color: '#22c55e' },
  { minStreak: 4,  multiplier: 2.0, label: 'GREAT!',     color: '#3b82f6' },
  { minStreak: 6,  multiplier: 3.0, label: 'AMAZING!',   color: '#a855f7' },
  { minStreak: 8,  multiplier: 5.0, label: 'LEGENDARY!', color: '#f59e0b' },
];
```

### 7.2 Combo Rules

- A **precise drop** (vinyl placed in its exact target column) increments the streak.
- An imprecise drop resets the combo to 0.
- If the time between consecutive placements exceeds `comboDecayMs` (4000ms / 4 seconds),
  the streak resets to 1 (starts fresh) instead of continuing.
- The multiplier is determined by the highest tier whose `minStreak` is <= current streak.
- `maxStreak` tracks the best streak achieved in the current level session.

### 7.3 Combo Decay

```ts
const withinWindow = (now - lastPlacementTime) <= comboDecayMs;
streak = withinWindow ? streak + 1 : 1;
```

If the player takes more than 4 seconds between placements, the streak resets to 1
(not 0 -- they still get credit for the current placement).

### 7.4 Combo Reset Events

The combo resets to 0 (streak = 0, multiplier = 1) on:
- Invalid drop attempt.
- Level load/restart.
- Non-precise placement (vinyl placed in wrong column).

---

## 8. Win Condition and Level Completion

### 8.1 Completion Check

```ts
status = (placedCount >= totalVinyls && totalVinyls > 0) ? 'completed' : 'playing';
```

The level is **completed** when the number of vinyls placed on the shelf equals the total
number of vinyls in the level. This is checked after every placement and every invalid
drop via `recalculateScoreAndStatus()`.

Important: Completion only requires all vinyls to be placed. Since invalid drops do not
place vinyls and valid drops require correct column matching, completion inherently means
all vinyls are in their correct columns.

### 8.2 Level Complete Flow

1. Status changes to `'completed'`.
2. After a 600ms delay, the level-complete overlay is shown.
3. The overlay displays: final score and number of errors (invalid drops).
4. A "Next Level" button appears (or "Play Again" if on the last level).
5. Clicking the button loads the next level (or loops to level 1).

---

## 9. Game States and Lifecycle

### 9.1 State Machine

```
idle -> playing -> completed
                -> playing (restart)
```

### 9.2 Level Loading (`loadLevel`)

When a level is loaded:
1. Status set to `'playing'`.
2. Score, moves, invalidDrops, comboBonusScore all reset to 0.
3. Combo state resets.
4. `totalVinyls` set to `level.vinyls.length`.
5. `shelfCols` set from `level.shelf.cols`.
6. Grid initialized: 2D array of `GridCell` objects, all with `vinylId: null`.
7. Shelf visual is built.
8. Vinyl objects are created and placed in the carousel.

### 9.3 Restart

Calls `loadLevel` with the current level, fully resetting all state.

### 9.4 Next Level

Increments `currentLevelIndex`. If past the end, wraps to 0. Then calls `loadLevel`.

---

## 10. Input / Interaction Model

### 10.1 Drag and Drop

The game uses a raycasting-based drag-and-drop system supporting both mouse and touch:

**Pointer Down (Grab)**:
1. Raycast from pointer position into the scene.
2. Find intersected vinyl objects (navigate up the parent hierarchy to find `vinyl-*` named group).
3. Store original position and scale.
4. Mark vinyl as dragging (`userData.isDragging = true`).
5. Scale up vinyl slightly (1.08x).
6. Lift vinyl forward on Z axis (+0.3).
7. Set up a drag plane parallel to the screen at the lifted Z position.
8. Show target column guide (during onboarding).

**Pointer Move (Drag)**:
1. Raycast onto the drag plane to get world position.
2. Move vinyl to follow pointer (X and Y from intersection, Z stays on drag plane).
3. Determine which shelf cell the vinyl is hovering over.
4. Show drop preview (green = valid, red = invalid column highlight).
5. Update instruction text with placement guidance.

**Pointer Up (Drop)**:
1. Snap vinyl position to the nearest grid cell.
2. Validate the drop (genre match + exact column + slot free).
3. If valid: call `placeVinylOnShelf`, play success animations.
4. If invalid: play error animations, return vinyl to carousel position.
5. Clear all preview guides.

### 10.2 Carousel

Unplaced vinyls sit on a horizontal scrolling carousel below the shelf:
- Vinyls scroll left continuously at `scrollSpeed = 0.35 * speedMultiplier`.
- Speed multiplier increases as fewer vinyls remain (2 or fewer: 2.6x, 3-4: 1.45x, 5+: 1.0x).
- Vinyls wrap around when they scroll past the left edge.
- Vinyls near the center are slightly larger (scale: 0.75 base + up to 0.12 center bonus).
- Vinyls gently oscillate vertically (sine wave, amplitude 0.012).
- Dragging a vinyl stops its carousel animation.

### 10.3 Onboarding

A two-step onboarding system guides new players:
1. **Step 1 - Grab**: Activated when the player first picks up a vinyl.
2. **Step 2 - Drop**: Activated when the player successfully drops their first vinyl.

During the first drag, a target arrow points to the correct column. After the first
successful drop, the onboarding is marked complete and the guide elements are hidden.

---

## 11. Grid System

### 11.1 Shelf Dimensions

```ts
slotWidth  = 0.50  // Width of each column in world units
rowHeight  = 0.45  // Height of each row in world units
```

Shelf total width = `cols * slotWidth`
Shelf total height = `rows * rowHeight`

### 11.2 Cell Center Calculation

```ts
function getShelfCellCenter(row: number, col: number): Vector3 {
  x = (col - shelfCols / 2 + 0.5) * slotWidth
  y = -shelfHeight / 2 + (row + 0.5) * rowHeight
  z = 0.02
}
```

### 11.3 Column Position

For column operations (guides, labels):
```ts
x = (col - cols / 2 + 0.5) * slotWidth
```

### 11.4 Single-Slot-Per-Column Mode

The game enforces `singleSlotPerColumn = true`:
- Only one vinyl can occupy each column.
- Column availability checks only look at `grid[0][col]`.
- Attempting to place into an occupied column is silently rejected.

---

## 12. Vinyl Physical Properties

### 12.1 Disc Geometry

- Disc radius: 0.16
- Disc thickness: 0.004
- Label (center) radius: 0.065 (~40% of disc radius)
- Spindle hole radius: 0.004

### 12.2 Carousel Presentation

- Vinyls face forward (flat face toward camera).
- Base scale: 0.75 (scaled up slightly near center).
- Position Z: ~2.15 (in front of shelf).
- Carousel base Y: -0.70.
- Spacing between vinyls: 0.42 world units.

### 12.3 Shelf Presentation

- After placement, vinyl is rotated to a slight lean: `rotation(-0.055, -0.5, roll)`.
- Scale on shelf: 1.15.
- Z position on shelf: 0.19 (in front of shelf surface).
- Roll varies by column position for visual variety.

---

## 13. Drop Preview System

### 13.1 Drop Column Guide

A semi-transparent colored plane overlay on the hovered column:
- **Green** (`0x10b981`, opacity 0.30): Valid drop target.
- **Red** (`0xef4444`, opacity 0.26): Invalid drop target.

### 13.2 Target Column Guide

A cyan (`0x38bdf8`, opacity 0.20) guide that highlights the expected/correct column for
the currently dragged vinyl. Only shown during onboarding (first drag).

### 13.3 Drag Hint Tooltip

A floating HTML tooltip near the cursor showing:
- Valid: "checkmark GENRE_NAME" (green background).
- Slot occupied: "COLUMN_NAME occupata" (red background).
- Wrong column: "arrow CORRECT_COLUMN (now: CURRENT_COLUMN)" (red background).

### 13.4 Instruction Text

A central instruction element updates during drag:
- Valid hover: "Perfetto: GENRE -> TARGET_COLUMN"
- Slot occupied: "Slot occupato: COLUMN_NAME. Cerca una colonna vuota."
- Wrong column: "GENRE -> TARGET_COLUMN"
- Idle (playing): "Drag the records to the shelf!" / custom text
- Idle (completed): "Level Complete!"

---

## 14. Tracked Statistics

| Statistic      | Description                                    |
|----------------|------------------------------------------------|
| `score`        | Calculated score (base + combo - penalties)    |
| `moves`        | Total drops attempted (valid + invalid)        |
| `invalidDrops` | Number of failed/rejected drop attempts        |
| `combo.streak` | Current consecutive correct placements         |
| `combo.maxStreak` | Best streak in current level session        |
| `combo.multiplier` | Current combo multiplier                   |
| `placedCount`  | Number of vinyls on the shelf (derived)        |
| `totalVinyls`  | Total vinyls in the level                      |

---

## 15. UI State Displays

| UI Element     | Shows                                          |
|----------------|------------------------------------------------|
| Level number   | `currentLevelIndex + 1`                        |
| Sort by        | Always "COLOR" (hardcoded in UI update)        |
| Allow gaps     | Always "FALSE" (hardcoded in UI update)        |
| Moves          | `moves` count                                  |
| Score          | Formatted score with locale separators         |
| Combo label    | "Nice!" when multiplier > 1, else "Combo"      |
| Combo value    | "x1.5", "x2.0" etc. when active, else "--"     |

---

## 16. Game Flow Summary

1. Game loads. Level 1 is loaded automatically.
2. Player sees a tutorial overlay (dismissed by clicking Start).
3. Vinyls scroll in a carousel below the shelf.
4. Player drags a vinyl from the carousel toward the shelf.
5. While dragging, visual feedback shows which column they are hovering and whether it is valid.
6. On release:
   - **Correct column**: Vinyl snaps into place, score increases, combo may advance.
   - **Wrong column/occupied**: Vinyl bounces back to carousel, error counted, combo resets.
7. Steps 3-6 repeat until all 8 vinyls are placed.
8. Level complete overlay appears showing score and errors.
9. Player can proceed to the next level or restart.
10. After the last level, the game loops back to level 1.

---

## 17. Constants Reference

```ts
// Shelf layout
SLOT_WIDTH       = 0.50
ROW_HEIGHT       = 0.45
SHELF_COLS       = 4  (from level config, but 8 columns in COLUMN_GENRE_LABELS)
SHELF_DEPTH      = 0.45

// Scoring
BASE_POINTS_PER_PLACEMENT = 10  (in recalculateScoreAndStatus)
INVALID_DROP_PENALTY      = 2   (subtracted per invalid drop)
COMBO_BASE_POINTS         = 6   (in handleComboOnPlace)
COMBO_STREAK_BONUS_CAP    = 10  (max streak contribution to bonus)

// Combo timing
COMBO_DECAY_MS = 4000  (4 seconds between placements before streak resets)

// Carousel
CAROUSEL_SCROLL_SPEED = 0.35  (base speed, multiplied by count-based factor)
CAROUSEL_SPACING      = 0.42  (world units between vinyls)
CAROUSEL_BASE_SCALE   = 0.75
CAROUSEL_BASE_Y       = -0.70

// Vinyl disc
DISC_RADIUS      = 0.16
DISC_THICKNESS   = 0.004
LABEL_RADIUS     = 0.065
HOLE_RADIUS      = 0.004
```

---

## 18. Important Implementation Notes

1. **Shelf config vs actual grid**: Level data says `rows: 2, cols: 4` but the game uses
   8 columns from `COLUMN_GENRE_LABELS` and operates in single-slot-per-column mode on
   row 0. The `shelfCols` is set from `level.shelf.cols` (4), but `COLUMN_GENRE_LABELS`
   has 8 entries. The InputController has its own `shelfConfig` that can be set independently.

2. **Vinyl ID is the source of truth** for placement. Genre matching is checked as an
   additional validation layer, but the exact column is determined by `VINYL_ID_TO_COLUMN`.

3. **The combo system rewards speed**: Players must place vinyls within 4 seconds of each
   other to maintain the streak. The multiplier grows significantly at higher streaks
   (up to 5x at 8+ streak).

4. **No undo system**: The `undo()` method exists but is empty. Once a vinyl is placed,
   it cannot be moved.

5. **Level data has a discrepancy**: In `main.ts`, v2 is labeled as Pop but
   `VINYL_ID_TO_COLUMN` maps v2 to column 1 (JAZZ). Similarly, v3 is labeled Jazz but
   maps to column 2 (POP). The `gameRules.ts` comments describe v2 as "Jazz 1959" and
   v3 as "Pop 1989", suggesting the game rules file is the authoritative mapping, and the
   level data in `main.ts` may have genre labels swapped for v2 and v3.

6. **Language**: UI strings are a mix of Italian and English. Level-complete button text
   is in Italian ("Prossimo livello", "Gioca di nuovo"). Instruction text mixes both.
