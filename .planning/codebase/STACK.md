# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript 5.9.3 - Core game logic, types, and rendering pipeline
- JavaScript (ES2020) - Browser runtime execution

**Secondary:**
- HTML5 - UI structure and game container
- CSS3 - Styling, animations, responsive design with mobile-first approach

## Runtime

**Environment:**
- Browser (Chrome, Safari, Firefox) - Client-side execution
- ES2020 module system - Modern JavaScript features

**Package Manager:**
- npm 10.x - Dependency management
- Package-lock.json present - Exact dependency versioning

## Frameworks

**Core:**
- Three.js 0.182.0 - 3D rendering engine for game graphics
- React Three Fiber 9.5.0 - React renderer for Three.js (declarative 3D)
- React Three Drei 10.7.7 - Collection of helpers for React Three Fiber

**Build:**
- Vite 7.3.1 - Build tool and development server
- TypeScript compiler - Type checking and transpilation
- ESBuild 0.27.3 - Fast bundler for final builds

## Key Dependencies

**Critical:**
- three@0.182.0 - Core 3D rendering engine
- @react-three/fiber@9.5.0 - React bindings for Three.js
- @react-three/drei@10.7.7 - Useful abstractions for React Three Fiber

**Infrastructure:**
- vite@7.3.1 - Build tool and dev server
- typescript@5.9.3 - Type safety and transpilation
- @types/three@0.182.0 - TypeScript definitions for Three.js

## Configuration

**Environment:**
- Environment variables via .env.local
- iOS-specific Capacitor configuration
- Mobile-first responsive design with safe area insets

**Build:**
- vite.config.ts - Build configuration
- tsconfig.json - TypeScript compiler configuration
- Target: ES2020, modules: ESNext
- Strict mode enabled with unused parameter checks

## Platform Requirements

**Development:**
- Node.js (npm support)
- Modern browser with ES2020 support
- Development server on port 7003

**Production:**
- Web browser supporting WebGL and ES2020
- Mobile deployment via Capacitor (iOS app)
- Responsive design for all screen sizes
- Touch and mouse input support

---

*Stack analysis: 2026-02-11*
```