# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**None detected**: The game uses procedural generation and runs entirely client-side without external API dependencies.

## Data Storage

**Databases:**
- None - Game data is hardcoded in TypeScript files
- Level data stored locally in `/src/main.ts`

**File Storage:**
- Local filesystem only - No external file storage
- Game assets generated procedurally (no external image/audio files)

**Caching:**
- Browser cache for built assets
- No external caching services

## Authentication & Identity

**Auth Provider:**
- None - Single-player game without user accounts
- No authentication required

## Monitoring & Observability

**Error Tracking:**
- None detected - No external error tracking service
- Console logging for debugging

**Logs:**
- Browser console for development
- No external logging infrastructure

## CI/CD & Deployment

**Hosting:**
- Static web hosting (can be deployed to any static site host)
- iOS mobile deployment via Capacitor

**CI Pipeline:**
- None detected - Manual build process
- Package scripts: dev, build, preview

## Environment Configuration

**Required env vars:**
- None detected for runtime
- Development server configurable via vite.config.ts

**Secrets location:**
- No external secrets required
- Game is self-contained

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Mobile Platform Integration

**iOS (Capacitor):**
- Capacitor for iOS app wrapping
- StatusBar and Haptics plugins configured
- No external SDK integrations

**Mobile APIs:**
- Device motion sensors (touch input)
- Device vibration (haptic feedback)
- No external mobile SDK dependencies

## Audio & Media

**Audio:**
- Web Audio API - Procedural audio generation
- No external audio files or streaming
- No external audio services

**Images:**
- Procedurally generated vinyl covers
- No external image hosting or CDN
- Background image via CSS (Google Fonts CDN)

## Social Features

**None detected** - Single-player experience without social integration

---

*Integration audit: 2026-02-11*
```