# Conveyor Belt Integration - Remaining Work

## Completed (Phase 3 - Partial)
- ✅ Updated imports (ConveyorBelt, GenreSection, conveyorLogic)
- ✅ Added ConveyorVinyl, ShelfSection, ShelfSlot types to imports
- ✅ Replaced state: crates/setCrates → shelfSections/conveyorVinyls/beltSpeed
- ✅ Replaced refs: crateRefs → slotRefs (Map-based)
- ✅ Added belt animation loop useEffect (RAF-based position updates)
- ✅ Added vinyl spawn timer useEffect
- ✅ Added belt speed adjuster useEffect
- ✅ Updated startLevel() to initialize shelfSections
- ✅ Added handleBeltVinylGrab() for grabbing from belt
- ✅ Added handleVinylExpired() for missed vinyl penalties

## Remaining Critical Tasks

### 1. Refactor Drag & Drop Handlers

**handlePointerMove()** (line ~1058)
- Replace `crateRefs` iteration with `slotRefs` iteration
- Change targeting logic: crates → shelf slots
- Update validation: check slot.vinyl === null && slot.genre === vinyl.genre
- Remove ghost preview system (or adapt for slots)
- Update slot highlights using setSlotHighlights()

**handlePointerUp()** (line ~1147)
- Replace crate finding logic with slot finding
- Validate: slot empty + genre match
- Update handleSuccess() call with slot position instead of crateId
- Update handleMistake() for slot-based feedback

### 2. Update Game Logic Handlers

**handleSuccess()** (find location)
- Replace crate update logic with slot filling
- Update shelfSections state: mark slot as filled with vinyl
- Update flying vinyl target to use slot center position
- Increment section.filled counter

**handleMistake()** (find location)
- Update feedback messages for slot-based errors
- Replace crate capacity checks with slot availability checks

**handleLanding()** (find location)
- Update to place vinyl in shelf slot instead of crate
- Update explosion position calculation

**handleHint()** (line ~817+)
- Replace crate finding with slot finding
- Update spotlight system for slots

**startSwapping()** (line ~843+)
- Either remove or adapt for section swapping instead of crate swapping
- If keeping, swap entire sections instead of individual crates

### 3. Update Victory Condition

**checkVictoryCondition()** (line ~1619+)
- Replace: `crates.every(c => c.filled >= c.capacity)`
- With: `shelfSections.every(s => s.filled >= s.capacity)`

### 4. Replace JSX Layout

**Main crate carousel section** (line ~1947+)
```tsx
{crates.map(crate => ( ... <CrateBox ... /> ))}
```

Replace with:
```tsx
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
```

### 5. Remove Shelf Vinyls Section

**Vinyl shelf display** (line ~1900+)
- Remove the entire shelfVinyls rendering section
- This is replaced by the conveyor belt

### 6. Update Progress Indicators

**Vinyl Progress Counter** (line ~1996+)
- Replace: `crates.reduce((sum, c) => sum + c.filled, 0)`
- With: `shelfSections.reduce((sum, s) => sum + s.filled, 0)`
- Replace denominator: total slots = `shelfSections.reduce((sum, s) => sum + s.capacity, 0)`

### 7. Fix Tutorial System

**Tutorial refs** (line ~1827+)
- Replace crateRefs references with slotRefs
- Update tutorial steps to reference slots instead of crates
- May need to redesign some tutorial steps for conveyor system

### 8. TypeScript Fixes

Run `npx tsc --noEmit` and fix all type errors related to:
- Crate vs ShelfSection
- CrateBox component removal
- Ref system changes
- Handler function signatures

### 9. Testing Checklist

After all changes:
- [ ] Game starts without errors
- [ ] Vinyls spawn on belt and scroll
- [ ] Can grab vinyl from belt
- [ ] Can drag to shelf slot
- [ ] Correct placement triggers success (score, combo, particles)
- [ ] Wrong placement triggers error feedback
- [ ] Expired vinyls trigger penalty
- [ ] Trash bin still works
- [ ] Mystery vinyls reveal
- [ ] Gold vinyls grant bonus moves
- [ ] Dusty vinyls can be cleaned
- [ ] Victory condition triggers correctly
- [ ] Audio plays correctly
- [ ] Particles and feedback work
- [ ] Tutorial works (if kept)
- [ ] Combo system works
- [ ] Star calculation works
- [ ] Mobile layout works

## Known Issues

1. **shelfVinyls state** - Currently unused but still initialized in startLevel. Should be completely removed.
2. **CrateBox import** - Still imported but not used after refactor. Remove import.
3. **crateRefs references** - Multiple locations still reference old system
4. **Ghost preview** - System designed for crates, needs slot adaptation or removal

## Estimated Remaining Effort

- Drag handlers refactor: 30 min
- JSX layout replacement: 20 min
- Game logic updates: 45 min
- TypeScript fixes: 30 min
- Testing & debugging: 60 min

**Total: ~3 hours of focused work**

## Notes

- This is a major refactor touching ~600 lines across the 2383-line App.tsx
- Core functionality (scoring, combos, particles, audio) should remain intact
- The conveyor belt system is fundamentally different from crates (active scrolling vs static containers)
- Consider creating a backup branch before continuing
