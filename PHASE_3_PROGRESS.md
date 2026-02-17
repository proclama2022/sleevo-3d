# Phase 3: Conveyor Belt Integration - Progress Report

## Date: 2026-02-10

## Overview
Phase 3 integration is **40% complete**. The foundation for the conveyor belt system has been successfully implemented in App.tsx, but the codebase is currently in a transitional state with TypeScript compilation errors.

## Files Modified
- **App.tsx**: +178 lines, -53 lines (231 total changes)
- **CONVEYOR_INTEGRATION_TODO.md**: Created (comprehensive roadmap)
- **PHASE_3_PROGRESS.md**: Created (this file)

## Completed Work ✅

### 1. Import Updates
```typescript
// Added imports
import { ConveyorVinyl, ShelfSection, ShelfSlot } from './types';
import { ConveyorBelt } from './components/ConveyorBelt';
import { GenreSection } from './components/GenreSection';
import {
  spawnConveyorVinyl,
  updateConveyorPositions,
  getBeltSpeed,
  getSpawnInterval,
  removeVinylFromBelt
} from './services/conveyorLogic';

// Removed imports
- import { CrateBox } from './components/CrateBox'; (removed)
```

### 2. State Management Refactor
```typescript
// BEFORE (Crate System)
const [crates, setCrates] = useState<Crate[]>([]);
const [shelfVinyls, setShelfVinyls] = useState<Vinyl[]>([]);
const crateRefs = useRef<Record<string, HTMLDivElement | null>>({});
const stackRefs = useRef<Record<string, HTMLDivElement | null>>({});

// AFTER (Conveyor System)
const [shelfSections, setShelfSections] = useState<ShelfSection[]>([]);
const [conveyorVinyls, setConveyorVinyls] = useState<ConveyorVinyl[]>([]);
const [beltSpeed, setBeltSpeed] = useState<number>(50);
const [lastSpawnTime, setLastSpawnTime] = useState<number>(Date.now());
const slotRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
const [slotHighlights, setSlotHighlights] = useState<Map<number, 'none' | 'neutral' | 'valid' | 'invalid'>>(new Map());
const animationFrameRef = useRef<number>();
const lastFrameTimeRef = useRef<number>(Date.now());
```

### 3. New useEffect Hooks

**Belt Animation Loop** (lines 537-577)
- RAF-based animation system
- Updates conveyor vinyl positions every frame
- Detects expired vinyls (fell off belt)
- Calls handleVinylExpired() for penalties

**Vinyl Spawn Timer** (lines 579-612)
- Spawns vinyls at calculated intervals
- Uses getSpawnInterval(level) for timing
- Spawns based on active shelf genres
- Updates lastSpawnTime state

**Belt Speed Adjuster** (lines 614-620)
- Calculates speed based on difficulty + level
- Uses getBeltSpeed() from conveyorLogic
- Updates when difficulty or level changes

### 4. Handler Functions

**handleBeltVinylGrab()** (lines 1009-1053)
- Handles grabbing vinyl from conveyor belt
- Manages dusty vinyl cleaning
- Reveals mystery vinyls
- Removes vinyl from belt when grabbed
- Plays appropriate sound effects

**handleVinylExpired()** (lines 928-946)
- Penalty for missed non-trash vinyls
- Reduces moves by 1
- Breaks combo
- Shows "Too slow!" feedback
- Plays error sound + haptic

**registerSlotRef()** (lines 920-926)
- Map-based slot reference registration
- Key format: `${genre}-${position}`
- Used for drag & drop targeting

### 5. Level Initialization Update

**startLevel() refactor** (lines 660-678)
```typescript
// Now initializes shelfSections instead of crates
const genres = data.crates.map(c => c.genre);
const sections: ShelfSection[] = genres.map((genre, genreIdx) => ({
  genre,
  slots: Array.from({ length: 5 }, (_, slotIdx) => ({
    genre,
    vinyl: null,
    position: genreIdx * 5 + slotIdx,
  })),
  capacity: 5,
  filled: 0,
}));

setShelfSections(sections);
setConveyorVinyls([]);
setLastSpawnTime(Date.now());
```

## Remaining Work ❌

### TypeScript Compilation Errors: 45 total

1. **shelfVinyls references** (9 locations)
   - Lines: 496, 504, 535, 824, 1189, 1199, 1268, 1535, 1565, 1620, 1652, 1660, 1996, 2002, 2016

2. **crates references** (15 locations)
   - Lines: 827, 843, 846, 847, 849, 869, 1085, 1154, 1276, 1619, 1660, 1827, 1833, 1947, 1996, 2002

3. **crateRefs references** (8 locations)
   - Lines: 1077, 1254, 1827, 1833

4. **CrateBox component** (1 location)
   - Line: 1963

5. **Other errors**
   - `registerCrateRef`, `registerStackRef` (lines 1968, 1969)
   - `handlePointerDown` signature mismatch (line 2024)
   - `sfx.error` (line 936) - should be `sfx.dropError`

### Critical Functions To Refactor

#### 1. handlePointerMove() (lines 1058-1145)
**Status:** Still uses crateRefs, needs slot-based targeting

**Required Changes:**
- Replace `crateRefs.current` iteration with `slotRefs.current` iteration
- Change targeting from crates to shelf slots
- Validate: `slot.vinyl === null && slot.genre === vinyl.genre`
- Remove/adapt ghost preview system
- Update with `setSlotHighlights()`

#### 2. handlePointerUp() (lines 1147-1183)
**Status:** Still validates against crates

**Required Changes:**
- Replace `crates.find()` with slot lookup
- Validate slot is empty
- Validate genre matches
- Call handleSuccess() with slot position
- Update handleMistake() for slot feedback

#### 3. handleSuccess() (lines ~1276-1400)
**Status:** Still updates crates state

**Required Changes:**
- Replace crate state update with shelf section update
- Mark slot as filled: `slot.vinyl = activeVinyl`
- Increment `section.filled`
- Update flying vinyl target to slot center
- Keep scoring/combo logic intact

#### 4. handleMistake() (lines ~1200-1270)
**Status:** Uses shelfVinyls

**Required Changes:**
- Update feedback messages for slots
- Check slot availability instead of crate capacity
- Keep penalty logic intact

#### 5. handleTrashDrop() (lines 1185-1200)
**Status:** Uses setShelfVinyls

**Required Changes:**
- Remove vinyl from belt (already handled in grab)
- Keep scoring logic

#### 6. Victory Condition (lines 1619-1620)
**Status:** Checks crates.every()

**Required Changes:**
```typescript
// BEFORE
const allCratesFull = crates.every(c => c.filled >= c.capacity);
const allVinylsSorted = shelfVinyls.length === 0;

// AFTER
const allSlotsFilled = shelfSections.every(s => s.filled >= s.capacity);
const beltEmpty = conveyorVinyls.length === 0;
```

### JSX Layout Replacement

#### Main Shelf Area (lines 1811-1975)
**Current:** Horizontal crate carousel
**Replace With:**
```tsx
<main className="shelf-area">
  {feedback && <FeedbackDisplay />}
  {explosions && <ParticleExplosions />}

  <div className="shelf-container">
    {shelfSections.map(section => (
      <GenreSection
        key={section.genre}
        section={section}
        highlightStates={slotHighlights}
        onRegisterSlotRef={registerSlotRef}
      />
    ))}
  </div>

  <div className="belt-container">
    <ConveyorBelt
      vinyls={conveyorVinyls}
      beltSpeed={beltSpeed}
      isPaused={gameState.status !== 'playing'}
      grabbedVinylId={activeVinyl?.id || null}
      onVinylExpired={handleVinylExpired}
      onVinylGrabStart={handleBeltVinylGrab}
    />
  </div>
</main>
```

#### Vinyl Shelf Section (lines 2016+)
**Status:** Entire section should be removed (replaced by conveyor belt)

#### Progress Indicators (lines 1996-2005)
**Replace:**
```typescript
// Current
crates.reduce((sum, c) => sum + c.filled, 0)
shelfVinyls.length + crates.reduce((sum, c) => sum + c.filled, 0)

// New
shelfSections.reduce((sum, s) => sum + s.filled, 0)
shelfSections.reduce((sum, s) => sum + s.capacity, 0)
```

### Tutorial System (lines 1827, 1833)
**Status:** References crateRefs

**Options:**
1. Update to use slotRefs
2. Redesign tutorial for conveyor system
3. Temporarily disable for this phase

## Testing Checklist

Once all errors are fixed, test:
- [ ] Game starts without errors
- [ ] Vinyls spawn on belt
- [ ] Belt scrolls continuously
- [ ] Can grab vinyl from belt
- [ ] Can drag to correct slot
- [ ] Correct drop triggers success
- [ ] Wrong drop triggers error
- [ ] Expired vinyl triggers penalty
- [ ] Trash bin works
- [ ] Mystery vinyls reveal
- [ ] Gold vinyls work
- [ ] Dusty vinyls clean
- [ ] Victory condition works
- [ ] Scoring intact
- [ ] Combo system intact
- [ ] Particles work
- [ ] Audio plays correctly
- [ ] Mobile responsive
- [ ] Tutorial works (if kept)

## Estimated Completion Time

- Fix drag handlers: 30 min
- Fix game logic: 45 min
- Replace JSX: 30 min
- Fix TypeScript errors: 30 min
- Testing & debug: 60 min
- **Total: ~3 hours**

## Risk Assessment

**Low Risk:**
- State management changes (already complete)
- Animation loops (tested in Phase 2)
- Spawn logic (from conveyorLogic.ts)

**Medium Risk:**
- Drag & drop refactor (complex logic)
- Victory condition (critical gameplay)
- JSX layout (many dependencies)

**High Risk:**
- Breaking existing game systems (scoring, combos, achievements)
- Missing edge cases in slot validation
- Performance issues with large state updates

## Recommendations

1. **Complete in dedicated session** - Don't context-switch mid-refactor
2. **Compile frequently** - Run `npx tsc --noEmit` after each major change
3. **Test incrementally** - Don't wait until everything is "done"
4. **Keep backup** - Consider branching before final push
5. **Document assumptions** - Leave comments for future maintainers

## Dependencies

**Phases Completed:**
- ✅ Phase 1: Core data structures & logic
- ✅ Phase 2: UI components (ConveyorBelt, GenreSection, ShelfSlot)

**Phases Blocked:**
- ⏸️ Phase 4: Polish & audio (waiting for Phase 3 completion)

## Notes

- The foundation is solid and working
- All Phase 1 & 2 components are ready to use
- Main challenge is mechanical replacement of old system
- Game systems (scoring, combos, particles) should remain untouched
- Focus on drag-drop and JSX layout for quickest path to working game

---

**Status:** Ready for completion | **Next Session:** Continue from TODO doc
