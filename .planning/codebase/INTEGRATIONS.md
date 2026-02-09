# External Integrations

**Analysis Date:** 2026-02-07

## APIs & External Services

**Google Gemini AI:**
- Service: Google Gemini (AI model)
- What it's used for: Not actively integrated in current game code; configured in vite.config.ts as future integration point
  - SDK/Client: Native fetch API (not installed as npm package)
  - Auth: `GEMINI_API_KEY` environment variable
  - Configuration: Injected via Vite as `process.env.GEMINI_API_KEY` in `vite.config.ts`
  - Status: Prepared but not utilized in gameplay or services

**Icon CDN:**
- Service: cdn.lucide.dev (Lucide Icons CDN)
- What it's used for: App icon and touch icon loading
  - URLs: `https://cdn.lucide.dev/disc-3.svg` (192x192 and 512x512 in manifest.json)
  - Used in: `index.html` favicon and PWA icons
  - Fallback: SVG icons from lucide-react npm package used in code

**Font CDN:**
- Service: fonts.googleapis.com
- What it's used for: Custom fonts for UI typography
  - Fonts loaded: Righteous (display font), Inter (body/UI), Permanent Marker (decorative)
  - Used in: `index.html` via `<link rel="stylesheet">`
  - Applied in: CSS custom font families in inline `<style>` block

**CSS Framework CDN:**
- Service: cdn.tailwindcss.com (Tailwind CSS CDN)
- What it's used for: Utility-first styling
  - Loaded in: `index.html` via `<script src="https://cdn.tailwindcss.com"></script>`
  - Note: Uses CDN instead of npm build tool for rapid development

## Data Storage

**Databases:**
- None - Game state is client-side only

**Client-Side Storage:**
- localStorage - Not currently implemented
- sessionStorage - Not currently implemented
- IndexedDB - Not currently implemented
- Note: Game state exists only in React component state during active session (lost on refresh)

**File Storage:**
- Local filesystem only - No cloud storage integration
- Assets: Inline CSS, SVG data URIs, and npm packages

**Caching:**
- Browser cache (implicit via HTTP headers and Vite build)
- No explicit caching layer configured

## Authentication & Identity

**Auth Provider:**
- None - No user authentication system
- No login/signup functionality
- No user profiles or accounts

**Permissions:**
- Declared in metadata.json: `requestFramePermissions: []` (no special permissions requested)
- Capacitor haptics permission (implicit through @capacitor/haptics usage)
- Status bar permission (implicit through @capacitor/status-bar usage)

## Mobile Platform Integration

**Native Features:**
- Haptics: `@capacitor/haptics` 8.0.0
  - Used for: Feedback during gameplay (light, heavy, success notifications)
  - API: `Haptics.impact()`, `Haptics.notification()`
  - Fallback: `navigator.vibrate()` for browsers without Capacitor
  - Used in: `App.tsx` triggerHaptic() function (line ~60-70)

- Status Bar: `@capacitor/status-bar` 8.0.0
  - Used for: Native status bar styling
  - Configuration: Dark status bar style matching app theme (#1a1110)
  - Used in: `App.tsx` StatusBar.setStyle() initialization

- Core: `@capacitor/core` 8.0.2
  - Used for: Platform detection and initialization
  - API: `Capacitor.isNativePlatform()` to check if running as native app vs web
  - Used in: `App.tsx` for conditional haptics/vibration

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, LogRocket, or similar integration

**Logs:**
- Console logging approach (standard console methods)
- No structured logging framework detected

**Analytics:**
- None - No Google Analytics, Mixpanel, or similar tracking

## CI/CD & Deployment

**Hosting:**
- Google AI Studio (mentioned in README.md as deployment source)
- Web: Any static file host compatible with SPA
- Mobile: Capacitor-based iOS/Android deployment
- PWA: Standalone app mode via manifest.json

**CI Pipeline:**
- None detected in codebase

**Build Process:**
- Vite development server: `npm run dev` (port 3000)
- Production build: `npm run build` (outputs to dist/)
- Preview: `npm run preview` (preview built assets locally)

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Google Gemini API key (required but not actively used)

**Optional env vars:**
- None explicitly configured

**Secrets location:**
- `.env.local` file (in project root)
- Note: .env.local should not be committed (listed in .gitignore)

**.env.local Structure:**
```
GEMINI_API_KEY=sk-...
```

## Webhooks & Callbacks

**Incoming:**
- None - No server or webhook endpoints

**Outgoing:**
- None - No external API calls from game logic

## External Resources

**Hosted CDN Assets:**
- Tailwind CSS: cdn.tailwindcss.com
- Google Fonts: fonts.googleapis.com
- Lucide Icons: cdn.lucide.dev
- ESM import maps: esm.sh CDN for npm package imports in browser
  - React: esm.sh/react@^19.2.4
  - React DOM: esm.sh/react-dom@^19.2.4
  - lucide-react: esm.sh/lucide-react@^0.563.0
  - Capacitor: esm.sh/@capacitor/core@^8.0.2, etc.

## Security Considerations

**API Key Exposure:**
- GEMINI_API_KEY is injected into browser via Vite `define` option
- Client-side exposure means key could be visible in network traffic or source
- Recommendation: Only use for client-safe operations or proxy through backend

**CORS:**
- Not configured (no external API calls expected)
- Tailwind/Google Fonts/CDN calls use standard browser CORS

**Content Security Policy:**
- Not configured

**Capacitor Permissions:**
- Minimal permissions: haptics and status bar only
- No camera, location, contacts, or other sensitive data requested

---

*Integration audit: 2026-02-07*
