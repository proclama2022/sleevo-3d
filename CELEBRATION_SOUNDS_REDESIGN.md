# Celebration Sounds Redesign - Modal Synthesis Implementation

## Overview
Redesigned 4 celebration sound functions using modal synthesis and physical modeling for organic, fanfare-like qualities.

## Implementation Details

### 1. comboMilestone - Replace lines 489-504

```typescript
  /**
   * Combo milestone - MODAL SYNTHESIS fanfare for 5x/10x/15x combos
   * Short, energetic fanfare using overlapping modal resonances
   */
  comboMilestone: (level: number) => {
    console.log('🎺 MODAL comboMilestone chiamato!', level);
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.2; // Short and punchy

      // Frequencies for celebration chords based on level
      const frequencies = level >= 15 ? [523, 659, 784, 1047] : // C-E-G-C (high)
                         level >= 10 ? [440, 554, 659, 880] :  // A-C#-E-A (mid-high)
                         [392, 494, 587, 784]; // G-B-D-G (mid)

      frequencies.forEach((freq, idx) => {
        // Generate modal resonance for each note
        const modalBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const modalData = modalBuffer.getChannelData(0);

        for (let i = 0; i < modalData.length; i++) {
          const t = i / ctx.sampleRate;
          const decay = Math.exp(-t * 8); // Fast decay for energy

          // Fundamental + harmonics (modal synthesis)
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.15;

          modalData[i] = (fundamental + harmonic2 + harmonic3) * decay;
        }

        // Play with slight delay for chord spread
        const source = ctx.createBufferSource();
        source.buffer = modalBuffer;
        const gain = ctx.createGain();
        gain.gain.value = settings.sfxVolume * 0.35;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(now + idx * 0.02); // 20ms stagger
      });

      console.log('✅ Modal fanfare riprodotto');
    } catch (error) {
      console.error('Failed to play comboMilestone:', error);
    }
  },
```

**Key Features:**
- Different chord voicings for 5x/10x/15x milestones
- Modal synthesis with fundamental + 2 harmonics
- 20ms stagger between notes for organic chord spread
- Fast exponential decay (8x) for energetic character
- Duration: ~200ms

---

### 2. levelComplete - Find and replace current levelComplete function

```typescript
  /**
   * Level complete - MODAL SYNTHESIS victory jingle
   * Ascending harmonic sequence, trionfale ma organico
   */
  levelComplete: () => {
    console.log('🏆 MODAL levelComplete chiamato!');
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.4; // Victory jingle duration

      // Ascending victory sequence: C-E-G-C
      const sequence = [
        { freq: 523, delay: 0 },    // C5
        { freq: 659, delay: 0.1 },  // E5
        { freq: 784, delay: 0.2 },  // G5
        { freq: 1047, delay: 0.3 }, // C6
      ];

      sequence.forEach(({ freq, delay }) => {
        // Generate modal resonance for each note
        const modalBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const modalData = modalBuffer.getChannelData(0);

        for (let i = 0; i < modalData.length; i++) {
          const t = i / ctx.sampleRate;
          const decay = Math.exp(-t * 5); // Natural decay

          // Modal synthesis with rich harmonics
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.4;
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.2;
          const harmonic5 = Math.sin(2 * Math.PI * freq * 5 * t) * 0.1;

          modalData[i] = (fundamental + harmonic2 + harmonic3 + harmonic5) * decay;
        }

        const source = ctx.createBufferSource();
        source.buffer = modalBuffer;
        const gain = ctx.createGain();
        gain.gain.value = settings.sfxVolume * 0.4;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(now + delay);
      });

      console.log('✅ Modal victory jingle riprodotto');
    } catch (error) {
      console.error('Failed to play levelComplete:', error);
    }
  },
```

**Key Features:**
- Ascending C major arpeggio (C-E-G-C)
- 100ms spacing between notes
- Rich harmonic content (fundamental + 3 overtones)
- Natural exponential decay (5x)
- Duration: ~400ms total

---

### 3. achievementUnlock - Find and replace current achievementUnlock function

```typescript
  /**
   * Achievement unlock - MODAL SYNTHESIS long fanfare
   * Complex 5-note sequence with overlapping resonances
   */
  achievementUnlock: () => {
    console.log('🌟 MODAL achievementUnlock chiamato!');
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.6; // Long memorable fanfare

      // Complex fanfare sequence: G-B-D-G-B (ascending with harmony)
      const sequence = [
        { freq: 392, delay: 0, sustain: 0.5 },    // G4
        { freq: 494, delay: 0.12, sustain: 0.48 }, // B4
        { freq: 587, delay: 0.24, sustain: 0.46 }, // D5
        { freq: 784, delay: 0.36, sustain: 0.44 }, // G5
        { freq: 988, delay: 0.48, sustain: 0.42 }, // B5
      ];

      sequence.forEach(({ freq, delay, sustain }) => {
        // Generate modal resonance with overlapping decay
        const modalBuffer = ctx.createBuffer(1, ctx.sampleRate * sustain, ctx.sampleRate);
        const modalData = modalBuffer.getChannelData(0);

        for (let i = 0; i < modalData.length; i++) {
          const t = i / ctx.sampleRate;
          const decay = Math.exp(-t * 3); // Slow decay for rich overlaps

          // Complex modal synthesis with many harmonics
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.5;
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.3;
          const harmonic4 = Math.sin(2 * Math.PI * freq * 4 * t) * 0.15;
          const harmonic5 = Math.sin(2 * Math.PI * freq * 5 * t) * 0.1;

          modalData[i] = (fundamental + harmonic2 + harmonic3 + harmonic4 + harmonic5) * decay;
        }

        const source = ctx.createBufferSource();
        source.buffer = modalBuffer;
        const gain = ctx.createGain();
        gain.gain.value = settings.sfxVolume * 0.45;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(now + delay);
      });

      console.log('✅ Modal achievement fanfare riprodotto');
    } catch (error) {
      console.error('Failed to play achievementUnlock:', error);
    }
  },
```

**Key Features:**
- 5-note ascending sequence (G-B-D-G-B)
- 120ms spacing with overlapping resonances
- Very rich harmonic content (5 overtones)
- Slow decay (3x) for sustained, triumphant character
- Duration: ~600ms with long tails

---

### 4. levelUp - Improve existing levelUp sound

**Current levelUp function location:** Search for "levelUp:" in the sfx object (currently duplicated as "achievement:")

Replace the duplicate `achievement:` function (around line 742-749) with this improved levelUp:

```typescript
  /**
   * Level up - MODAL SYNTHESIS ascending scale
   * 4-note scale with modal synthesis, improved from original
   */
  levelUp: () => {
    console.log('⬆️ MODAL levelUp chiamato!');
    if (!settings.sfxEnabled) return;
    initAudioContext();
    if (!audioContext) return;

    try {
      const ctx = audioContext;
      const now = ctx.currentTime;
      const duration = 0.5; // Scale duration

      // Ascending pentatonic scale: C-D-E-G-C
      const scale = [
        { freq: 523, delay: 0 },    // C5
        { freq: 587, delay: 0.1 },  // D5
        { freq: 659, delay: 0.2 },  // E5
        { freq: 784, delay: 0.3 },  // G5
        { freq: 1047, delay: 0.4 }, // C6
      ];

      scale.forEach(({ freq, delay }) => {
        // Generate modal resonance
        const modalBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
        const modalData = modalBuffer.getChannelData(0);

        for (let i = 0; i < modalData.length; i++) {
          const t = i / ctx.sampleRate;
          const decay = Math.exp(-t * 6); // Medium-fast decay

          // Modal synthesis with harmonics
          const fundamental = Math.sin(2 * Math.PI * freq * t);
          const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.4;
          const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.2;

          modalData[i] = (fundamental + harmonic2 + harmonic3) * decay;
        }

        const source = ctx.createBufferSource();
        source.buffer = modalBuffer;
        const gain = ctx.createGain();
        gain.gain.value = settings.sfxVolume * 0.38;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(now + delay);
      });

      console.log('✅ Modal level up riprodotto');
    } catch (error) {
      console.error('Failed to play levelUp:', error);
    }
  },
```

**Key Features:**
- 5-note pentatonic scale (C-D-E-G-C)
- 100ms spacing for clear articulation
- Modal synthesis with 3 harmonics
- Medium decay (6x) for balanced character
- Duration: ~500ms

---

## Technical Summary

All four functions now use:
- **Modal synthesis** instead of simple oscillators
- **Pre-rendered buffers** with sine waves + harmonics
- **Exponential decay envelopes** for natural sound
- **No simple MIDI-style scale playback**
- **Overlapping resonances** where appropriate
- **Volume range: 0.35-0.45 * settings.sfxVolume**

## Testing

After implementation, test with:
- comboMilestone(5), comboMilestone(10), comboMilestone(15)
- levelComplete()
- achievementUnlock()
- levelUp()

All should sound organic, celebratory, and avoid synthetic "beep" quality.
