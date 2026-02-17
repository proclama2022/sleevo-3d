# Three.js Skills Installate per Sleevo Vinyl Shop Manager

## ✅ Skill Installate con Successo

### 1. CloudAI-X/threejs-skills (10 skill files)
**Percorso:** `.claude/skills/threejs-skills/`
**Repository:** https://github.com/CloudAI-X/threejs-skills

Contiene 10 skill complete:
- ✅ **threejs-fundamentals** - Scene setup, cameras, renderer, Object3D (Review: 99%)
- ✅ **threejs-geometry** - Built-in shapes, BufferGeometry, instancing (Review: 92%)
- ✅ **threejs-materials** - PBR, basic, phong, standard, shader materials (Review: 98%)
- ✅ **threejs-lighting** - Light types, shadows, environment lighting (Review: 95%)
- ✅ **threejs-textures** - Texture types, UV mapping, environment maps (Review: 89%)
- ✅ **threejs-animation** - Keyframe, skeletal animation, morph targets (Review: 92%)
- ✅ **threejs-loaders** - GLTF, textures, images, async patterns (Review: 89%)
- ✅ **threejs-shaders** - GLSL, ShaderMaterial, uniforms, custom effects (Review: 98%)
- ✅ **threejs-postprocessing** - EffectComposer, bloom, DOF, screen effects (Review: 98%)
- ✅ **threejs-interaction** - Raycasting, controls, mouse/touch input (Review: 98%)

### 2. threejs-game (Game Development Skill)
**Percorso:** `.claude/skills/threejs-game/`
**Fonte:** skills.sh/natea

Copre specificamente:
- ✅ Game loop con requestAnimationFrame e delta time
- ✅ Player controller (movimento, velocità, gravità, salto)
- ✅ Collision detection (bounding box, sphere, raycasting)
- ✅ Health/scoring system
- ✅ Camera systems (PerspectiveCamera FPS/TPS, OrthographicCamera isometric)
- ✅ Physics engines integration (Cannon.js, Ammo.js, Rapier, Oimo.js)
- ✅ Input handling (keyboard, mouse, touch, gamepad)
- ✅ Asset loading (GLTF, OBJ, FBX con LoadingManager)
- ✅ State machine per game states
- ✅ Performance (instancing, frustum culling, LOD, texture atlases)

### 3. webgpu-threejs (WebGPU Three.js TSL)
**Percorso:** `.claude/skills/webgpu-threejs/`
**Repository:** https://github.com/dgreenheck/webgpu-claude-skill

Copre:
- ✅ Setup Three.js con WebGPU renderer
- ✅ Scrittura shader con TSL (Three.js Shading Language)
- ✅ Nuovo backend moderno rispetto a WebGL
- ✅ Compute shaders e post-processing con WebGPU

## 📋 Skill Aggiuntive da Installare Manualmente

Le seguenti skill richiedono download manuale da MCP Market (limite rate-limiting):

### 4. Three.js Scene Builder (MCP Market)
**URL:** https://mcpmarket.com/tools/skills/three-js-scene-builder-1

Fornisce:
- Reference Frame Contract (elimina errori comuni coordinate)
- GLTF model loading specializzato
- Camera controls responsive e cross-device
- Scene hierarchy optimization
- Material optimization per performance cross-device

**Come installare:**
1. Visita il link sopra
2. Scarica il file SKILL.md
3. Copia in `.claude/skills/threejs-scene-builder/SKILL.md`

### 5. Three.js Game Development Advanced (MCP Market)
**URL:** https://mcpmarket.com/zh/tools/skills/three-js-game-development

Fornisce features avanzate:
- Scene management avanzato
- WebGL rendering optimization
- Gameplay systems complessi
- Character controllers e physics integration avanzata
- Dynamic lighting per mobile
- GLTF animated models avanzati

**Come installare:**
1. Visita il link sopra
2. Scarica il file SKILL.md
3. Copia in `.claude/skills/threejs-game-dev-advanced/SKILL.md`

## 🎮 Skill Specifiche per Sleevo

### sleevo-game-dev (già presente)
**Percorso:** Caricata automaticamente da sistema
Skill master per Sleevo Vinyl Shop Manager con expertise in:
- Three.js 3D components specifici del gioco
- Game mechanics (drag&drop, grid, scoring)
- UI/UX (glassmorphism)
- Level design

## 📊 Riepilogo Installazione

| Skill | Status | Metodo | Files |
|-------|--------|--------|-------|
| CloudAI-X threejs-skills | ✅ Installata | Git clone | 10 |
| threejs-game | ✅ Installata | WebFetch + Write | 1 |
| webgpu-threejs | ✅ Installata | Git clone | 1+ |
| Scene Builder | ⏳ Manuale | MCP Market | 1 |
| Game Dev Advanced | ⏳ Manuale | MCP Market | 1 |

## 🚀 Come Usare le Skill

Le skill vengono caricate automaticamente da Claude Code quando:
- Rileva contesto Three.js nel tuo codice
- Riceve richieste relative a 3D, rendering, giochi
- Hai file .js/.ts che importano 'three'

### Esempio di Attivazione

**User:** "Create a 3D scene with a rotating cube"
→ Carica: `threejs-fundamentals`

**User:** "Add player movement with WASD controls"
→ Carica: `threejs-game`, `threejs-interaction`

**User:** "Load a GLTF model with animations"
→ Carica: `threejs-loaders`, `threejs-animation`

**User:** "Add bloom post-processing effect"
→ Carica: `threejs-postprocessing`

## 🔄 Aggiornamento Skill

Per aggiornare le skill installate via Git:

```bash
# CloudAI-X threejs-skills
cd .claude/skills/threejs-skills
git pull origin main

# WebGPU threejs
cd ../webgpu-threejs
git pull origin main
```

## 📚 Fonti

- [CloudAI-X threejs-skills](https://github.com/CloudAI-X/threejs-skills)
- [Tessl Registry reviews](https://tessl.io/skills/github/cloudai-x/threejs-skills)
- [threejs-game skill](https://skills.sh/natea/fitfinder/threejs-game)
- [WebGPU skill](https://github.com/dgreenheck/webgpu-claude-skill)
- [Three.js Scene Builder](https://mcpmarket.com/tools/skills/three-js-scene-builder-1)
- [Three.js Game Development](https://mcpmarket.com/zh/tools/skills/three-js-game-development)

## 🎯 Prossimi Step per Sleevo

Con queste skill installate, puoi ora:

1. **Ottimizzare Performance 3D**
   - Usa `threejs-geometry` per instancing dei vinili
   - Implementa LOD con `threejs-interaction`
   - Texture atlases per UI elements

2. **Migliorare Meccaniche di Gioco**
   - Refactor del sistema di drag&drop con `threejs-interaction`
   - Physics più robusto con `threejs-game` (Cannon.js integration)
   - State machine per gestire stati del gioco

3. **Effetti Visivi Avanzati**
   - Bloom per glassmorphism UI con `threejs-postprocessing`
   - Custom shaders per vinili con `threejs-shaders`
   - Lighting dinamico con `threejs-lighting`

4. **WebGPU Ready (futuro)**
   - Migrazione a WebGPU renderer con `webgpu-threejs`
   - TSL shaders per performance next-gen
