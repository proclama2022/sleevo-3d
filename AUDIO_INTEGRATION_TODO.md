# Audio Integration - Modifiche Rimanenti

Questo documento contiene le modifiche rimanenti da applicare ad App.tsx per completare l'integrazione audio.

## Stato Attuale

✅ **Completato:**
- Servizio audio creato (`services/audio.ts`)
- Componente AudioSettings creato (`components/AudioSettings.tsx`)
- Import audio in App.tsx
- useEffect per cambio musica automatico con tema
- initAudioContext() in startGame
- Suoni aggiunti a:
  - handlePointerDown (dragStart, dustClean, mysteryReveal, goldVinyl)
  - handleTrashDrop (trash)
  - handleMistake (dropError)
  - handleSuccess (dropSuccess)

## Modifiche Rimanenti

### 1. Aggiungere suono combo in handleLanding

Trovare la riga con il commento `// Show varied feedback based on combo level and special discs` (circa riga 820)

**Prima:**
```typescript
      // Show varied feedback based on combo level and special discs
      if (specialFeedback) {
```

**Dopo:**
```typescript
      // Play combo milestone sound
      if (newCombo >= 2) {
        const comboLevel = newCombo >= 15 ? 5 : newCombo >= 10 ? 4 : newCombo >= 5 ? 3 : newCombo === 3 ? 2 : 1;
        sfx.comboMilestone(comboLevel);
      }

      // Show varied feedback based on combo level and special discs
      if (specialFeedback) {
```

### 2. Aggiungere suono levelComplete quando si vince

Trovare l'useEffect che gestisce la vittoria (circa riga 850-900), dove c'è:
```typescript
      // Level won!
      setGameState(prev => ({ ...prev, status: 'won', xp: prev.xp + 100, starsEarned: stars }));
```

Aggiungere prima:
```typescript
      // Level won!
      sfx.levelComplete();
      setGameState(prev => ({ ...prev, status: 'won', xp: prev.xp + 100, starsEarned: stars }));
```

### 3. Aggiungere modal AudioSettings al rendering

Trovare la sezione di render, prima del return finale, aggiungere il rendering condizionale del modal:

Cercare la sezione dove viene renderizzato `<CollectionScreen` (circa riga 900+) e aggiungere subito dopo:

```typescript
      {showCollection && (
        <CollectionScreen
          collection={saveData.collection || []}
          onClose={() => setShowCollection(false)}
        />
      )}

      {showAudioSettings && (
        <AudioSettings onClose={() => setShowAudioSettings(false)} />
      )}
```

### 4. Aggiungere bottone Settings nel menu

Nel menu principale (status === 'menu'), aggiungere un bottone per aprire le impostazioni audio.

Cercare la sezione con i bottoni Easy/Normal/Hard (circa riga 900-950) e aggiungere dopo i bottoni:

```typescript
                      ))}
                  </div>

                  <button
                    onClick={() => setShowAudioSettings(true)}
                    className="mt-4 text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <Settings size={16} />
                    <span className="text-sm">Audio Settings</span>
                  </button>
              </div>
```

### 5. Aggiungere bottone Settings durante il gioco

Nel header del gioco (quando status === 'playing'), modificare il bottone Settings esistente per aprire il modal audio:

Cercare la riga con:
```typescript
<button onClick={() => { clearComboTimer(); setGameState(prev => ({...prev, status: 'menu'})); }} className="text-gray-400 hover:text-white transition-colors"><Settings size={10} className="md:w-3 md:h-3" /></button>
```

Sostituire con:
```typescript
<button onClick={() => setShowAudioSettings(true)} className="text-gray-400 hover:text-white transition-colors"><Settings size={10} className="md:w-3 md:h-3" /></button>
```

## Note

- Tutti i suoni sono generati via Web Audio API, nessun file esterno richiesto
- Il sistema gestisce automaticamente iOS audio context requirements
- Le impostazioni audio sono persistite in localStorage
- La musica cambia automaticamente con il tema del negozio (Basement/Store/Expo)

## Testing

Dopo aver applicato le modifiche, testare:
1. Avvio gioco → musica parte automaticamente
2. Drag vinile → suono whoosh
3. Drop corretto → clink sound
4. Drop errato → buzz sound
5. Combo 2x, 3x, 5x+ → chime crescente
6. Vinile mystery → sparkle sound
7. Pulizia dust → pop sound
8. Vinile gold pickup → special chime
9. Trash bin → thud sound
10. Level complete → victory jingle
11. Cambio tema → cambio musica automatico
12. Settings → modal audio si apre
13. Volume controls → funzionano correttamente
