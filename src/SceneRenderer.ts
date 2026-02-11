import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private updateCallback?: (deltaTime: number) => void;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();
    // Scene (modern soft gradient - Fill the Fridge style)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f4f8);
    this.scene.fog = new THREE.Fog(0xe8eef5, 10, 25);

    // Camera (record store overview - see shelf + carousel)
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0.5, 4);
    this.camera.lookAt(0, 0, 0);

    // Renderer (modern settings)
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // Controls (disabled rotation - fixed view)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false; // No rotation
    this.controls.enablePan = false; // No panning
    this.controls.enableZoom = false; // No zoom
    this.controls.enableDamping = false;
    this.controls.target.set(0, 1, 0);

    // Lights
    this.setupLights();

    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLights(): void {
    // Bright ambient light (Fill the Fridge style)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Main soft directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.radius = 8; // Very soft shadows
    this.scene.add(dirLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0xe8f4ff, 0.4);
    fillLight.position.set(-4, 6, -4);
    this.scene.add(fillLight);

    // Top soft light for even illumination
    const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
    topLight.position.set(0, 15, 0);
    this.scene.add(topLight);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    const deltaTime = this.clock.getDelta();
    
    // Call update callback if set
    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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
