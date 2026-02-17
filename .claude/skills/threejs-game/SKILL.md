---
name: threejs-game
description: "Comprehensive assistance with Three.js game development using WebGL, covering 3D rendering, game mechanics, physics, animations, and interactive browser-based games."
---

# Three.js Game Development

## When to Use This Skill

Activate when working on:
- 3D web games with Three.js
- Game mechanics implementation (player movement, collisions, scoring)
- Camera, lighting, and scene management setup
- 3D model loading (GLTF, OBJ, FBX formats)
- User input handling (keyboard, mouse, touch, gamepad)
- Animations and character controllers
- Physics engine integration (Cannon.js, Ammo.js, Rapier, Oimo.js)
- 3D game performance optimization
- Shaders and materials for game visuals

## Quick Start - Basic Game Setup

```javascript
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Game state
const gameState = {
  player: null,
  enemies: [],
  score: 0,
  health: 100
};

// Delta time for frame-independent movement
let lastTime = performance.now();

// Game loop
function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // seconds
  lastTime = currentTime;

  // Update game logic here with deltaTime
  update(deltaTime);

  renderer.render(scene, camera);
}

function update(deltaTime) {
  // Move objects frame-independently: position += velocity * deltaTime
}

animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

## Player Controller (Third-Person)

```javascript
class PlayerController {
  constructor(camera, mesh) {
    this.camera = camera;
    this.mesh = mesh;
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 5;
    this.rotateSpeed = Math.PI; // radians per second

    // Camera offset from player
    this.cameraOffset = new THREE.Vector3(0, 2, 5);
  }

  update(deltaTime, input) {
    // Movement relative to player's forward direction
    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.mesh.quaternion);
    const right = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(this.mesh.quaternion);

    // Apply movement
    if (input.forward) this.velocity.add(forward.multiplyScalar(this.moveSpeed * deltaTime));
    if (input.backward) this.velocity.add(forward.multiplyScalar(-this.moveSpeed * deltaTime));
    if (input.left) this.velocity.add(right.multiplyScalar(-this.moveSpeed * deltaTime));
    if (input.right) this.velocity.add(right.multiplyScalar(this.moveSpeed * deltaTime));

    // Rotation
    if (input.rotateLeft) this.mesh.rotateY(this.rotateSpeed * deltaTime);
    if (input.rotateRight) this.mesh.rotateY(-this.rotateSpeed * deltaTime);

    // Apply velocity with friction
    this.mesh.position.add(this.velocity);
    this.velocity.multiplyScalar(0.9); // friction

    // Update camera position
    const targetCameraPos = this.mesh.position.clone().add(
      this.cameraOffset.clone().applyQuaternion(this.mesh.quaternion)
    );
    this.camera.position.lerp(targetCameraPos, 0.1);
    this.camera.lookAt(this.mesh.position);
  }
}
```

## Input Manager

```javascript
class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, buttons: {} };

    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('mousedown', (e) => this.mouse.buttons[e.button] = true);
    window.addEventListener('mouseup', (e) => this.mouse.buttons[e.button] = false);
  }

  getInput() {
    return {
      forward: this.keys['KeyW'] || this.keys['ArrowUp'],
      backward: this.keys['KeyS'] || this.keys['ArrowDown'],
      left: this.keys['KeyA'] || this.keys['ArrowLeft'],
      right: this.keys['KeyD'] || this.keys['ArrowRight'],
      jump: this.keys['Space'],
      interact: this.keys['KeyE'],
      rotateLeft: this.keys['KeyQ'],
      rotateRight: this.keys['KeyE'],
      mouseX: this.mouse.x,
      mouseY: this.mouse.y,
      mouseLeft: this.mouse.buttons[0]
    };
  }
}
```

## Collision Detection - Raycasting

```javascript
class CollisionDetector {
  constructor(player, obstacles) {
    this.player = player;
    this.obstacles = obstacles;
    this.raycaster = new THREE.Raycaster();
    this.directions = [
      new THREE.Vector3(1, 0, 0),   // right
      new THREE.Vector3(-1, 0, 0),  // left
      new THREE.Vector3(0, 0, 1),   // forward
      new THREE.Vector3(0, 0, -1),  // backward
    ];
  }

  check() {
    for (const dir of this.directions) {
      this.raycaster.set(
        this.player.position,
        dir.clone().applyQuaternion(this.player.quaternion)
      );

      const intersects = this.raycaster.intersectObjects(this.obstacles);
      if (intersects.length > 0 && intersects[0].distance < 0.5) {
        // Collision detected - push player back
        this.player.position.sub(
          dir.clone().multiplyScalar(0.5 - intersects[0].distance)
        );
      }
    }
  }
}
```

## 3D Model Loading (GLTF)

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();

    // Optional: Draco compression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  async load(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          // Setup animation mixer if animations exist
          let mixer = null;
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }

          resolve({ model, mixer, animations: gltf.animations });
        },
        (progress) => {
          console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
        },
        (error) => reject(error)
      );
    });
  }
}

// Usage
const loader = new ModelLoader();
const { model, mixer } = await loader.load('/models/character.glb');
scene.add(model);

// In game loop
if (mixer) mixer.update(deltaTime);
```

## Physics Body - Gravity & Jumping

```javascript
class PhysicsBody {
  constructor(mesh) {
    this.mesh = mesh;
    this.velocity = new THREE.Vector3();
    this.gravity = -9.8;
    this.jumpForce = 5;
    this.isGrounded = false;
    this.groundLevel = 0;
  }

  update(deltaTime) {
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Update position
    this.mesh.position.add(
      this.velocity.clone().multiplyScalar(deltaTime)
    );

    // Ground collision
    if (this.mesh.position.y <= this.groundLevel) {
      this.mesh.position.y = this.groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
    }
  }
}
```

## Interactive Objects - Raycasting Picking

```javascript
class InteractionSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactables = [];

    window.addEventListener('click', (e) => this.onClick(e));
  }

  addInteractable(object, callback) {
    this.interactables.push({ object, callback });
  }

  onClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    for (const { object, callback } of this.interactables) {
      const intersects = this.raycaster.intersectObject(object, true);
      if (intersects.length > 0) {
        callback(object, intersects[0]);
      }
    }
  }
}
```

## Health & Scoring System

```javascript
class Entity {
  constructor(maxHealth = 100) {
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.isAlive = true;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.die();
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  die() {
    this.isAlive = false;
    // Trigger death animation, remove from scene, etc.
  }
}

class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('highScore', this.highScore);
    }
  }

  reset() {
    this.score = 0;
  }
}
```

## Camera Systems

### First-Person Camera
```javascript
class FirstPersonCamera {
  constructor(camera) {
    this.camera = camera;
    this.pitch = 0;
    this.yaw = 0;
    this.sensitivity = 0.002;

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      }
    });

    document.body.addEventListener('click', () => {
      document.body.requestPointerLock();
    });
  }
}
```

### Isometric Camera
```javascript
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1,
  1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);
```

## Physics Engine Integration - Cannon.js

```javascript
import CANNON from 'cannon-es';

class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.bodies = new Map(); // Map Three.js meshes to Cannon bodies
  }

  addBox(mesh, mass = 1) {
    const shape = new CANNON.Box(new CANNON.Vec3(
      mesh.geometry.parameters.width / 2,
      mesh.geometry.parameters.height / 2,
      mesh.geometry.parameters.depth / 2
    ));

    const body = new CANNON.Body({ mass, shape });
    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);

    this.world.addBody(body);
    this.bodies.set(mesh, body);
  }

  update(deltaTime) {
    this.world.step(1 / 60, deltaTime, 3);

    // Sync Three.js meshes with Cannon bodies
    for (const [mesh, body] of this.bodies) {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  }
}
```

## Game State Machine

```javascript
class GameStateMachine {
  constructor() {
    this.states = {
      menu: {
        enter: () => {
          document.getElementById('menu').style.display = 'block';
        },
        exit: () => {
          document.getElementById('menu').style.display = 'none';
        }
      },
      playing: {
        enter: () => {
          // Initialize game
        },
        exit: () => {
          // Pause game
        }
      },
      paused: {
        enter: () => {
          document.getElementById('pauseMenu').style.display = 'block';
        },
        exit: () => {
          document.getElementById('pauseMenu').style.display = 'none';
        }
      },
      gameOver: {
        enter: () => {
          document.getElementById('gameOverScreen').style.display = 'block';
        },
        exit: () => {
          document.getElementById('gameOverScreen').style.display = 'none';
        }
      }
    };

    this.currentState = null;
  }

  transition(newState) {
    if (this.currentState) {
      this.states[this.currentState].exit();
    }
    this.currentState = newState;
    this.states[this.currentState].enter();
  }
}
```

## Object Pooling Pattern

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = [];

    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  get() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.push(obj);
    return obj;
  }

  release(obj) {
    const index = this.inUse.indexOf(obj);
    if (index !== -1) {
      this.inUse.splice(index, 1);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }
}

// Usage for bullets
const bulletPool = new ObjectPool(
  () => {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material);
  },
  (bullet) => {
    bullet.position.set(0, 0, 0);
    bullet.visible = false;
  },
  50
);
```

## Performance Optimization

### Instancing for Multiple Objects
```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);

const matrix = new THREE.Matrix4();
for (let i = 0; i < 1000; i++) {
  matrix.setPosition(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50
  );
  instancedMesh.setMatrixAt(i, matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;
scene.add(instancedMesh);
```

### Level of Detail (LOD)
```javascript
const lod = new THREE.LOD();

const highDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  material
);
const mediumDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  material
);
const lowDetail = new THREE.Mesh(
  new THREE.SphereGeometry(1, 8, 8),
  material
);

lod.addLevel(highDetail, 0);
lod.addLevel(mediumDetail, 50);
lod.addLevel(lowDetail, 100);
scene.add(lod);
```

### Frustum Culling
```javascript
// Three.js does this automatically, but you can manually control:
object.frustumCulled = true; // default
```

### Texture Atlases
```javascript
// Combine multiple textures into one to reduce draw calls
const textureAtlas = new THREE.TextureLoader().load('/textures/atlas.png');

// Adjust UV coordinates to select regions:
const uvs = geometry.attributes.uv.array;
for (let i = 0; i < uvs.length; i += 2) {
  uvs[i] = uvs[i] * 0.25; // scale to quarter of atlas
  uvs[i + 1] = uvs[i + 1] * 0.25;
}
geometry.attributes.uv.needsUpdate = true;
```

## Physics Engines Comparison

| Engine | Pros | Complexity | Use Case |
|--------|------|------------|----------|
| **Cannon.js** | Lightweight, pure JS | Medium | General 3D physics |
| **Ammo.js** | Full-featured (Bullet port) | High | Complex simulations |
| **Rapier** | Modern, high-performance | Medium | Performance-critical games |
| **Oimo.js** | Simple API, small file | Low | Simple physics needs |

## Common Patterns

### Asset Loading Manager
```javascript
const loadingManager = new THREE.LoadingManager();
const assets = {};

loadingManager.onProgress = (url, loaded, total) => {
  console.log(`Loading: ${(loaded / total * 100).toFixed(0)}%`);
};

loadingManager.onLoad = () => {
  console.log('All assets loaded!');
  startGame();
};

const textureLoader = new THREE.TextureLoader(loadingManager);
assets.playerTexture = textureLoader.load('/textures/player.png');
assets.enemyTexture = textureLoader.load('/textures/enemy.png');
```

## Development Best Practices

1. **Plan architecture first** - Define your game systems before coding
2. **Frame-independent movement** - Always use deltaTime for physics and movement
3. **Separate game logic from rendering** - Keep update() and render() functions distinct
4. **Use object pooling** - For frequently created/destroyed objects (bullets, particles)
5. **Optimize early** - Use instancing, LOD, and texture atlases from the start
6. **Test on target devices** - Mobile performance can vary significantly
7. **Profile regularly** - Use Chrome DevTools to find performance bottlenecks

## See Also

- threejs-fundamentals - Scene setup, cameras, renderer basics
- threejs-materials - PBR materials and shaders
- threejs-lighting - Lighting systems and shadows
- threejs-animation - Character animation and mixers
- threejs-interaction - Advanced raycasting techniques
- threejs-postprocessing - Visual effects and screen effects

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Cannon.js Documentation](https://pmndrs.github.io/cannon-es/)
- [Three.js Fundamentals](https://threejsfundamentals.org/)
- [Discover Three.js](https://discoverthreejs.com/)
