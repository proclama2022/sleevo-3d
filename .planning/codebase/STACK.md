# Technology Stack

**Analysis Date:** 2026-02-07

## Languages

**Primary:**
- TypeScript ~5.8.2 - All source code, configuration, and game logic
- JSX/TSX - React component implementation in `App.tsx`, `components/`, and `services/`
- HTML/CSS - Markup and styling via Tailwind CSS with inline SVG data URIs

**Secondary:**
- JavaScript - Build configuration and runtime

## Runtime

**Environment:**
- Node.js (ES2022 target, ESM modules)

**Package Manager:**
- npm (version unspecified in package.json)
- Lockfile: Not present (package-lock.json not mentioned)

## Frameworks

**Core:**
- React 19.2.4 - UI framework and component library
- React DOM 19.2.4 - DOM rendering for React components
- Vite 6.2.0 - Build tool, dev server (port 3000), asset bundling
- @vitejs/plugin-react 5.0.0 - React JSX transformation for Vite

**UI/Icons:**
- lucide-react 0.563.0 - Icon library (Trophy, Music, Disc3, RefreshCw, Zap, Disc, Trash2, CheckCircle2, Play, Settings, Clock, AlertTriangle, ArrowUp)
- Tailwind CSS (cdn.tailwindcss.com via CDN) - Utility-first CSS framework

**Fonts:**
- Google Fonts: Righteous, Inter, Permanent Marker (loaded via fonts.googleapis.com)

## Key Dependencies

**Critical:**
- React/React DOM 19.2.4 - Core framework for UI rendering
- TypeScript 5.8.2 - Type safety and development experience

**Mobile/Native:**
- @capacitor/core 8.0.2 - Cross-platform mobile app framework (iOS/Android)
- @capacitor/haptics 8.0.0 - Haptic feedback API for vibration/touch feedback
- @capacitor/status-bar 8.0.0 - Native status bar customization
- @types/node 22.14.0 - Node.js type definitions

**Build/Dev:**
- TypeScript 5.8.2 - Compiler and language
- Vite 6.2.0 - Development server and build tool
- @vitejs/plugin-react 5.0.0 - JSX/TSX support in Vite

## Configuration

**Environment:**
- `.env.local` - Contains `GEMINI_API_KEY` (required for AI integration)
- vite.config.ts defines environment variable injection for `process.env.API_KEY` and `process.env.GEMINI_API_KEY`
- Key configs: port 3000, host 0.0.0.0 (accessible from any network interface)

**Build:**
- `vite.config.ts` - Vite build and dev server configuration
- `tsconfig.json` - TypeScript compiler options:
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Path alias: `@/*` maps to project root
  - Experimental decorators enabled

**TypeScript Config Details:**
- `skipLibCheck: true` - Skip type checking of declaration files
- `isolatedModules: true` - Each file is transpiled independently
- `moduleDetection: force` - Force module detection
- `allowJs: true` - Allow JavaScript files
- `allowImportingTsExtensions: true` - Import .ts files directly
- `noEmit: true` - No output JS (relies on Vite for output)

## Platform Requirements

**Development:**
- Node.js (version not specified, but supports ESM)
- npm package manager
- Modern browser with ES2022 support

**Production:**
- Browser-based deployment (SPA)
- Native mobile deployment via Capacitor (iOS/Android)
- PWA capable (manifest.json configured for standalone app)

**Mobile Requirements:**
- iOS or Android device with Capacitor runtime
- Device haptics/vibration support (graceful fallback to navigator.vibrate)

## Feature Flags & Runtime Config

**Vite Dev Server:**
- Host: 0.0.0.0 (allows external connections)
- Port: 3000
- Loads environment variables via `loadEnv()` at build time

**Build Scripts:**
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build locally
```

## Project Structure

```
root/
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build/dev config
├── .env.local             # Environment variables (GEMINI_API_KEY)
├── index.html             # HTML entry point with PWA config
├── index.tsx              # React entry point
├── App.tsx                # Main app component (~31KB)
├── types.ts               # TypeScript type definitions
├── manifest.json          # PWA manifest
├── metadata.json          # App metadata
├── components/
│   ├── VinylCover.tsx
│   ├── VinylDisc.tsx
│   └── CrateBox.tsx
└── services/
    └── gameLogic.ts       # Game mechanics and level generation
```

---

*Stack analysis: 2026-02-07*
