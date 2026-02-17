# Codebase Structure

**Analysis Date:** 2026-02-10

## Directory Layout

```
/Users/martha2022/Documents/Claude code/Sleevo Vinyl Shop Manager/
├── App.tsx                 # Main game component
├── index.tsx               # React app entry point
├── types.ts                # TypeScript type definitions
├── package.json            # Project dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── capacitor.config.ts     # Capacitor mobile app config
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── public/                 # Static assets
│   └── icons/             # App icons
├── assets/                 # Game assets
│   └── images.ts          # Image asset definitions
├── components/             # React UI components
│   ├── VinylCover.tsx     # Vinyl disc component
│   ├── CrateBox.tsx       # Crate container component
│   ├── ThemeBackground.tsx # Background theming
│   ├── Tutorial.tsx       # Game tutorial overlay
│   ├── CollectionScreen.tsx # Vinyl collection viewer
│   ├── StatsScreen.tsx    # Player statistics
│   ├── AchievementScreen.tsx # Achievements system
│   ├── CustomizationScreen.tsx # Game customization
│   ├── AccessibilitySettings.tsx # Accessibility options
│   ├── AudioSettings.tsx  # Audio controls
│   ├── HintButton.tsx     # Game hints
│   ├── InGameStats.tsx    # Live game stats
│   ├── SecondaryObjectives.tsx # Bonus objectives
│   ├── RandomEventOverlay.tsx # Special events
│   ├── AchievementToast.tsx # Achievement notifications
│   ├── ErrorBoundary.tsx  # Error handling
│   └── VinylDisc.tsx     # Vinyl disc component
├── services/               # Business logic services
│   ├── gameLogic.ts       # Core game mechanics
│   ├── storage.ts         # Data persistence
│   ├── audio.ts           # Audio generation
│   ├── objectives.ts      # Game objectives
│   └── randomEvents.ts    # Random gameplay events
├── constants/              # Game constants and config
│   ├── gameConfig.ts      # Game mechanics constants
│   └── achievements.ts    # Achievement definitions
├── hooks/                 # Custom React hooks
│   └── useWindowSize.ts   # Window size hook
├── types/                 # Additional type definitions
│   └── events.ts          # Event-related types
├── dist/                  # Built application
├── node_modules/          # Dependencies
├── ios/                   # iOS native project
└── .planning/             # Planning documentation
    └── codebase/          # Architecture analysis
```

## Directory Purposes

**components/:**
- Purpose: UI components and game visual elements
- Contains: React components for all game screens and UI elements
- Key files: `VinylCover.tsx` (vinyl discs), `CrateBox.tsx` (crates), `CollectionScreen.tsx` (collection viewer)

**services/:**
- Purpose: Business logic and game mechanics
- Contains: Services handling game logic, storage, audio, and events
- Key files: `gameLogic.ts` (core mechanics), `storage.ts` (persistence), `audio.ts` (audio generation)

**constants/:**
- Purpose: Game configuration and constants
- Contains: Achievement definitions and game mechanic constants
- Key files: `gameConfig.ts` (game settings), `achievements.ts` (achievement definitions)

**types/:**
- Purpose: Extended type definitions
- Contains: Type definitions for events and other complex types
- Key files: `events.ts` (event-related interfaces)

**hooks/:**
- Purpose: Custom React hooks
- Contains: Reusable logic hooks
- Key files: `useWindowSize.ts` (responsive sizing)

**assets/ & public/:**
- Purpose: Static assets and resources
- Contains: Icons and image definitions
- Key files: `images.ts` (asset definitions), `icons/` (app icons)

## Key File Locations

**Entry Points:**
- `index.tsx`: React app initialization
- `App.tsx`: Main game controller and state management

**Configuration:**
- `vite.config.ts`: Build tool configuration
- `tailwind.config.js`: CSS framework configuration
- `capacitor.config.ts`: Mobile app configuration

**Core Logic:**
- `services/gameLogic.ts`: Level generation and scoring
- `services/storage.ts`: Data persistence and statistics
- `services/audio.ts`: Procedural audio generation

**UI Components:**
- `components/VinylCover.tsx`: Vinyl disc rendering
- `components/CrateBox.tsx`: Crate interface
- `components/CollectionScreen.tsx`: Collection viewer
- `components/StatsScreen.tsx`: Player statistics

## Naming Conventions

**Files:**
- PascalCase for components: `VinylCover.tsx`, `CrateBox.tsx`
- camelCase for services: `gameLogic.ts`, `storage.ts`
- kebab-case for config: `tailwind.config.js`, `postcss.config.js`

**Functions:**
- camelCase for all functions: `generateLevel`, `calculateScore`
- Verb-noun pattern for actions: `loadSaveData`, `playThemeMusic`
- is-prefixed for boolean checks: `isEventActive`, `shouldTriggerEvent`

**Variables:**
- camelCase for variables: `vinylCount`, `cratePosition`
- PascalCase for interfaces and types: `Vinyl`, `Crate`
- UPPER_CASE for constants: `MAX_VINYL_COUNT`, `PARTICLE_COUNT`

**React Components:**
- PascalCase for component names: `VinylCover`, `CrateBox`
- camelCase for props and state: `vinylData`, `isDragging`

## Where to Add New Code

**New Game Feature:**
- Primary code: `services/` for logic, `components/` for UI
- Example: New vinyl type → `services/gameLogic.ts` + `components/VinylCover.tsx`

**New UI Component:**
- Implementation: `components/[ComponentName].tsx`
- Types: Update `types.ts` if needed
- Styling: Use Tailwind CSS classes

**New Game Mode:**
- Logic: `services/gameLogic.ts`
- UI: `components/[ModeName]Screen.tsx`
- Config: Update `constants/gameConfig.ts`

**New Audio Effect:**
- Implementation: `services/audio.ts`
- Integration: Update `App.tsx` imports
- Usage: Call from component interaction handlers

**New Achievement:**
- Definition: `constants/achievements.ts`
- Logic: `services/storage.ts` (check/unlock)
- UI: `components/AchievementScreen.tsx` and `AchievementToast.tsx`

## Special Directories

**dist/:**
- Purpose: Built application output
- Generated: Yes (by Vite build process)
- Committed: No (in .gitignore)

**ios/:**
- Purpose: iOS native project for Capacitor
- Generated: Yes (capacitor create/ios)
- Committed: Yes (part of project)

**node_modules/:**
- Purpose: Third-party dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

**public/icons/:**
- Purpose: App icons for mobile deployment
- Generated: No (manually added)
- Committed: Yes

---

*Structure analysis: 2026-02-10*