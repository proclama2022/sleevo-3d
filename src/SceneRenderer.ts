import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

const DESKTOP_FOV = 55;
const DESKTOP_CAMERA_Z = 4.5;
const DESKTOP_CAMERA_Y = 0.0;
const DESKTOP_TARGET_Y = -0.15;
const MOBILE_FOV = 75;  // Wider FOV for portrait
const MOBILE_CAMERA_Z = 5.5;  // Closer for mobile
const MOBILE_CAMERA_Y = -0.15;  // Lower to center shelf+carousel
const MOBILE_TARGET_Y = -0.15;  // Center between shelf and carousel
const MOBILE_BREAKPOINT_WIDTH = 640;

export class SceneRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private composer!: EffectComposer;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private updateCallback?: (deltaTime: number) => void;
  private dustParticles: THREE.Points | null = null;
  private dustVelocities: Float32Array | null = null;
  private dustInitialPositions: Float32Array | null = null;
  private lampGlows: THREE.Mesh[] = [];

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();

    // Scene - WARM VINTAGE SHOP: Bright warm cream atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xE8DDD0); // Warm cream
    this.scene.fog = new THREE.FogExp2(0xE8DDD0, 0.012); // Subtle warm fog for depth

    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      DESKTOP_FOV,
      aspect,
      0.1,
      1000
    );
    this.camera.position.set(0, DESKTOP_CAMERA_Y, DESKTOP_CAMERA_Z);
    this.camera.lookAt(0, DESKTOP_TARGET_Y, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8; // Bright warm vintage exposure
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0xE8DDD0, 1); // Warm cream
    container.appendChild(this.renderer.domElement);

    // Controls (fixed view)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableDamping = false;
    this.controls.target.set(0, DESKTOP_TARGET_Y, 0);

    this.updateCameraForViewport();

    this.createEnvironmentMap();
    this.setupPostProcessing();
    this.setupLights();
    this.createVisibleLamps();
    this.createDustParticles();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createEnvironmentMap(): void {
    // Create a simple procedural environment for reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    // Warm vintage shop backdrop
    envScene.background = new THREE.Color(0xE8DDD0);

    // Dim warm top light - moody atmosphere
    const envLight1 = new THREE.DirectionalLight(0xFFB366, 1.2);
    envLight1.position.set(0, 1, 0);
    envScene.add(envLight1);

    // Subtle golden side fill
    const envLight2 = new THREE.DirectionalLight(0xE8B87E, 0.8);
    envLight2.position.set(1, 0.5, 1);
    envScene.add(envLight2);

    // Dark amber accent
    const envLight3 = new THREE.DirectionalLight(0xC19A6B, 0.4);
    envLight3.position.set(-1, 0.5, -1);
    envScene.add(envLight3);

    // Warm wooden floor
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x8B6B4A });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    envScene.add(ground);

    // Warm cream ceiling
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xE8DDD0, emissive: 0xFFE8D0, emissiveIntensity: 0.1 });
    const ceil = new THREE.Mesh(groundGeo.clone(), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3;
    envScene.add(ceil);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    this.scene.environment = envMap;

    pmremGenerator.dispose();
    envScene.clear();
  }

  private setupPostProcessing(): void {
    // Create composer for post-processing effects
    this.composer = new EffectComposer(this.renderer);

    // Render pass - renders the scene
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom pass - warm vintage glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4,   // strength - visible warm glow
      0.6,   // radius
      0.75   // threshold
    );
    this.composer.addPass(bloomPass);

    // Vignette pass - subtle warm edge darkening
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['offset'].value = 0.9;
    vignettePass.uniforms['darkness'].value = 1.2;
    this.composer.addPass(vignettePass);
  }

  private setupLights(): void {
    // ========================================
    // WARM VINTAGE LIGHTING
    // Style: Bright, warm vintage vinyl shop atmosphere
    // ========================================

    // Warm ambient light
    const ambientLight = new THREE.AmbientLight(0xFFE8D0, 1.2);
    this.scene.add(ambientLight);

    // Hemisphere: warm vintage tones
    const hemiLight = new THREE.HemisphereLight(0xFFE8D0, 0xE8B87E, 0.8);
    this.scene.add(hemiLight);

    // Key SpotLight - warm and bright
    const keyLight = new THREE.SpotLight(0xFFD4A8, 3.5);
    keyLight.position.set(0, 5, 4);
    keyLight.target.position.set(0, 0.5, 0);
    keyLight.angle = Math.PI / 3.0;
    keyLight.penumbra = 0.6;
    keyLight.decay = 1.5;
    keyLight.distance = 25;
    keyLight.castShadow = true;

    const isMobile = this.isMobileViewport();
    const shadowResolution = isMobile ? 768 : 1024;
    keyLight.shadow.mapSize.width = shadowResolution;
    keyLight.shadow.mapSize.height = shadowResolution;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;

    this.scene.add(keyLight);
    this.scene.add(keyLight.target);

    (keyLight as any).baseIntensity = 3.5;
    (this.scene.userData as any).keyLight = keyLight;

    // Warm accent lamp lights
    const lampLight1 = new THREE.PointLight(0xFFB366, 1.0, 6, 1.5);
    lampLight1.position.set(-2.5, 0.8, 1.2);
    this.scene.add(lampLight1);
    (this.scene.userData as any).pulsingLamp = lampLight1;
    (lampLight1 as any).baseIntensity = 1.0;

    const lampLight2 = new THREE.PointLight(0xFFD4A8, 0.8, 5, 1.5);
    lampLight2.position.set(2.3, 0.7, 1.5);
    this.scene.add(lampLight2);

    // Fill DirectionalLight - warm
    const fillLight = new THREE.DirectionalLight(0xFFE8CC, 1.8);
    fillLight.position.set(0, 2, 5);
    this.scene.add(fillLight);

    // Rim PointLight - golden warm
    const rimLight = new THREE.PointLight(0xFFC966, 2.0, 15, 1.0);
    rimLight.position.set(0, 2, -3);
    this.scene.add(rimLight);
  }

  /**
   * Creates visible 3D table lamp objects with glowing bulbs - WARM SHOP STYLE
   */
  private createVisibleLamps(): void {
    // Lamp positions matching the point lights
    const lampPositions = [
      { x: -2.5, y: -0.6, z: 1.2, color: 0xFFB366 },  // Warm orange
      { x: 2.3, y: -0.6, z: 1.5, color: 0xFFD4A8 },   // Warm peach
    ];

    for (const pos of lampPositions) {
      const lampGroup = new THREE.Group();

      // Lamp base - warm wood tone
      const baseGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.08, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x5C4033, // Dark wood brown
        metalness: 0.1,
        roughness: 0.6,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0;
      base.castShadow = true;
      lampGroup.add(base);

      // Lamp stem - brass/bronze
      const stemGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.6, 8);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xB8860B, // Brass golden
        metalness: 0.5,
        roughness: 0.4,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.34;
      stem.castShadow = true;
      lampGroup.add(stem);

      // Lamp shade - warm cream
      const shadeGeo = new THREE.ConeGeometry(0.18, 0.2, 16, 1, true);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xFFF8DC, // Warm cream
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0,
        transparent: true,
        opacity: 0.95,
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.y = 0.74;
      shade.rotation.x = Math.PI; // Point opening down
      lampGroup.add(shade);

      // GLOWING BULB - colorful cartoon glow!
      const bulbGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({
        color: pos.color, // Match lamp color
        transparent: true,
        opacity: 0.95,
      });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 0.68;
      lampGroup.add(bulb);
      this.lampGlows.push(bulb);

      // Outer glow sphere - for bloom
      const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.5,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = 0.68;
      lampGroup.add(glow);
      this.lampGlows.push(glow);

      lampGroup.position.set(pos.x, pos.y, pos.z);
      lampGroup.name = `table-lamp-${lampPositions.indexOf(pos)}`;
      this.scene.add(lampGroup);
    }
  }

  /**
   * Creates subtle golden dust particles floating in the warm shop atmosphere.
   * Warm and ambient for cozy feel.
   */
  private createDustParticles(): void {
    const particleCount = 80; // Fewer particles for subtlety
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Particle distribution bounds (around shelf area)
    const boundsX = { min: -3, max: 3 };
    const boundsY = { min: -0.5, max: 2.5 };
    const boundsZ = { min: -0.5, max: 2.5 };

    // Warm golden/amber colors for cozy atmosphere
    const goldenColors = [
      new THREE.Color(0xFFD700), // Warm gold
      new THREE.Color(0xFFB366), // Warm orange
      new THREE.Color(0xFFE4C4), // Warm cream
      new THREE.Color(0xE8B87E), // Warm amber
      new THREE.Color(0xF5DEB3), // Warm wheat
      new THREE.Color(0xFFDAB9), // Warm peach
    ];

    // Store initial positions and create random velocities for animation
    this.dustInitialPositions = new Float32Array(particleCount * 3);
    this.dustVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random initial positions within bounds
      positions[i3] = boundsX.min + Math.random() * (boundsX.max - boundsX.min);
      positions[i3 + 1] = boundsY.min + Math.random() * (boundsY.max - boundsY.min);
      positions[i3 + 2] = boundsZ.min + Math.random() * (boundsZ.max - boundsZ.min);

      // Store initial positions for wrap-around
      this.dustInitialPositions[i3] = positions[i3];
      this.dustInitialPositions[i3 + 1] = positions[i3 + 1];
      this.dustInitialPositions[i3 + 2] = positions[i3 + 2];

      // Faster drift for more visible movement
      this.dustVelocities[i3] = (Math.random() - 0.5) * 0.004;
      this.dustVelocities[i3 + 1] = 0.002 + Math.random() * 0.003;
      this.dustVelocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

      // Random golden/amber color for each particle
      const color = goldenColors[Math.floor(Math.random() * goldenColors.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Subtle particles with soft glow for warm atmosphere
    const material = new THREE.PointsMaterial({
      size: 0.025, // Smaller for subtle effect
      transparent: true,
      opacity: 0.4, // Lower opacity for subtlety
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  private isMobileViewport(): boolean {
    return window.innerWidth < MOBILE_BREAKPOINT_WIDTH || window.innerWidth < window.innerHeight;
  }

  private updateCameraForViewport(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const mobile = this.isMobileViewport();
    this.camera.aspect = aspect;
    this.camera.fov = mobile ? MOBILE_FOV : DESKTOP_FOV;
    const cameraY = mobile ? MOBILE_CAMERA_Y : DESKTOP_CAMERA_Y;
    const cameraZ = mobile ? MOBILE_CAMERA_Z : DESKTOP_CAMERA_Z;
    const targetY = mobile ? MOBILE_TARGET_Y : DESKTOP_TARGET_Y;

    this.camera.position.set(0, cameraY, cameraZ);
    this.camera.lookAt(0, targetY, 0);

    if (this.controls) {
      this.controls.target.set(0, targetY, 0);
    }
    this.camera.updateProjectionMatrix();
  }

  private onWindowResize(): void {
    this.updateCameraForViewport();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  public animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Spotlight pulsing for dramatic effect
    const keyLight = (this.scene.userData as any).keyLight;
    if (keyLight) {
      const baseIntensity = (keyLight as any).baseIntensity || 2.0;
      keyLight.intensity = baseIntensity + Math.sin(elapsedTime * 0.3) * 0.2;
    }

    // Strong pulsing on lamp lights for "breathing" glow
    const pulsingLamp = (this.scene.userData as any).pulsingLamp;
    if (pulsingLamp) {
      const baseIntensity = (pulsingLamp as any).baseIntensity || 2.0;
      pulsingLamp.intensity = baseIntensity + Math.sin(elapsedTime * 0.8) * 0.5;
    }

    // Animate lamp bulb glows for bloom effect
    for (let i = 0; i < this.lampGlows.length; i++) {
      const glow = this.lampGlows[i];
      if (glow.material && (glow.material as THREE.MeshBasicMaterial).opacity !== undefined) {
        const baseOpacity = i % 2 === 0 ? 0.95 : 0.4;
        (glow.material as THREE.MeshBasicMaterial).opacity = baseOpacity + Math.sin(elapsedTime * 0.6 + i) * 0.15;
      }
      // Subtle scale pulsing on glow spheres
      const scale = 1 + Math.sin(elapsedTime * 0.5 + i * 0.5) * 0.08;
      glow.scale.setScalar(scale);
    }

    // Animate golden dust particles - more dynamic movement
    if (this.dustParticles && this.dustVelocities && this.dustInitialPositions) {
      const positions = this.dustParticles.geometry.attributes.position.array as Float32Array;
      const particleCount = positions.length / 3;

      // Updated bounds
      const boundsX = { min: -3, max: 3 };
      const boundsY = { min: -0.5, max: 2.5 };
      const boundsZ = { min: -0.5, max: 2.5 };

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Apply drift velocity
        positions[i3] += this.dustVelocities[i3];
        positions[i3 + 1] += this.dustVelocities[i3 + 1];
        positions[i3 + 2] += this.dustVelocities[i3 + 2];

        // More pronounced bobbing motion
        positions[i3] += Math.sin(elapsedTime * 0.4 + i) * 0.001;
        positions[i3 + 2] += Math.cos(elapsedTime * 0.3 + i * 0.5) * 0.0008;

        // Wrap particles that go out of bounds
        if (positions[i3] < boundsX.min) positions[i3] = boundsX.max;
        if (positions[i3] > boundsX.max) positions[i3] = boundsX.min;
        if (positions[i3 + 1] < boundsY.min) positions[i3 + 1] = boundsY.max;
        if (positions[i3 + 1] > boundsY.max) positions[i3 + 1] = boundsY.min;
        if (positions[i3 + 2] < boundsZ.min) positions[i3 + 2] = boundsZ.max;
        if (positions[i3 + 2] > boundsZ.max) positions[i3 + 2] = boundsZ.min;
      }

      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }

    this.controls.update();

    // Use composer for post-processing (bloom + vignette)
    this.composer.render();
  }

  public setUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  public stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public dispose(): void {
    this.stopAnimation();
    this.controls.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
