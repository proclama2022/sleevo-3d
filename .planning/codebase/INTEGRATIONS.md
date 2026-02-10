# External Integrations

**Analysis Date:** 2026-02-10

## APIs & External Services

**AI/LLM:**
- Google Gemini AI - AI features integration
  - SDK: Via direct API calls (not detected in current codebase)
  - Auth: GEMINI_API_KEY environment variable

## Data Storage

**Databases:**
- LocalStorage - Client-side data persistence
  - Connection: Browser API
  - Client: Native browser API
- Not detected - No external databases

**File Storage:**
- Local filesystem only - No cloud storage integration

**Caching:**
- LocalStorage - Game state and settings persistence
- Browser cache - Asset caching

## Authentication & Identity

**Auth Provider:**
- Custom implementation - No external auth service
  - Implementation: None detected (game likely runs anonymously)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service

**Logs:**
- Console logging - Browser console for debugging
- Not detected - No structured logging service

## CI/CD & Deployment

**Hosting:**
- Vercel - Web deployment platform
  - Detected via: manifest.json for Vercel deployment

**CI Pipeline:**
- Not detected - No automated CI/CD pipeline found

## Environment Configuration

**Required env vars:**
- GEMINI_API_KEY - AI service authentication

**Secrets location:**
- .env.local file (should be in .gitignore)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints

**Outgoing:**
- Not detected - No external service callbacks

## Audio System

**Audio Engine:**
- Web Audio API - Procedural audio generation
  - Purpose: Background music and sound effects generation
  - Features: Theme-specific music, SFX library, volume controls
  - Mobile: iOS-compatible with proper context initialization

**External Audio:**
- Not detected - All audio procedurally generated

## Game Services

**Local Storage Services:**
- services/storage.ts - Save/load game state
- services/audio.ts - Audio management
- services/gameLogic.ts - Game mechanics
- Random events system - Dynamic gameplay modifiers

**Client-Side Only:**
- No external APIs required for core gameplay
- All game logic runs in browser

---

*Integration audit: 2026-02-10*
```