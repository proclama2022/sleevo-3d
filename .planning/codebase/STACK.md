# Technology Stack

**Analysis Date:** 2026-02-10

## Languages

**Primary:**
- TypeScript 5.8.2 - Main application code
- JavaScript ES2022 - React runtime

**Secondary:**
- Swift (iOS) - Native iOS app wrapper
- HTML/CSS - Web UI components

## Runtime

**Environment:**
- Node.js 18.0+ (minimum required)
- ES Modules (ESM) - Module system

**Package Manager:**
- npm - Package dependency management
- Lockfile: Present (package-lock.json)

## Frameworks

**Core:**
- React 19.2.4 - UI library
- React DOM 19.2.4 - DOM rendering

**Testing:**
- Not detected - No testing framework found

**Build/Dev:**
- Vite 6.2.0 - Build tool and development server
- TypeScript Compiler 5.8.2 - Type checking and transpilation

## Key Dependencies

**Critical:**
- @capacitor/core 8.0.2 - Cross-platform mobile app framework
- @capacitor/ios 8.0.2 - iOS platform support
- @capacitor/cli 8.0.2 - Capacitor CLI
- @capacitor/haptics 8.0.0 - Haptic feedback for mobile
- @capacitor/status-bar 8.0.0 - Status bar management

**UI:**
- lucide-react 0.563.0 - Icon library
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- PostCSS 8.4.49 - CSS post-processing
- Autoprefixer 10.4.20 - CSS vendor prefixing

**Infrastructure:**
- Not detected - No backend dependencies

## Configuration

**Environment:**
- Environment variables loaded from `.env.local`
- GEMINI_API_KEY required for AI features (currently placeholder)

**Build:**
- Vite configuration for development and production builds
- Capacitor configuration for mobile deployment
- TypeScript configuration with ES2022 target
- Tailwind CSS with custom animations and fonts

## Platform Requirements

**Development:**
- Node.js 18.0+
- npm package manager
- TypeScript compiler

**Production:**
- Web browsers (modern, ES2022 support)
- iOS mobile devices (via Capacitor)
- Cross-platform compatibility

---

*Stack analysis: 2026-02-10*
```