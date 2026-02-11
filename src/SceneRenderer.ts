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

    // Scene - negozio cozy premium: sfondo più profondo e contrastato (v3)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a2420);
    this.scene.fog = new THREE.Fog(0x2a2420, 5.5, 14);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Leggera vista \"diorama\" dall'alto per effetto tabletop
    this.camera.position.set(0, 0.9, 4.3);
    this.camera.lookAt(0, 0.2, 0);

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
    this.renderer.toneMappingExposure = 1.48;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x2a2420, 1);
    container.appendChild(this.renderer.domElement);

    // Controls (fixed view)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableDamping = false;
    this.controls.target.set(0, 0.8, 0);

    this.setupLights();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLights(): void {
    // 1. Ambient Light - base calda ma più contenuta
    const ambientLight = new THREE.AmbientLight(0xfff0e0, 0.45);
    this.scene.add(ambientLight);

    // 2. Hemisphere Light - equilibrio caldo/scuro
    const hemiLight = new THREE.HemisphereLight(0xffe8d6, 0x2a1f19, 0.42);
    this.scene.add(hemiLight);

    // 3. KEY LIGHT - focus principale sullo scaffale
    const keyLight = new THREE.SpotLight(0xfff3e2, 2.35, 30, Math.PI / 3, 0.3, 0.5);
    keyLight.position.set(0, 6, 5);
    keyLight.target.position.set(0, 0.5, 0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    this.scene.add(keyLight);
    this.scene.add(keyLight.target);

    // Store reference for subtle pulsing animation
    (keyLight as any).baseIntensity = 2.35;
    (this.scene.userData as any).keyLight = keyLight;

    // 4. FILL LIGHT - da sinistra, crema caldo
    const fillLight = new THREE.DirectionalLight(0xffdcbf, 0.78);
    fillLight.position.set(-4, 4, 3);
    this.scene.add(fillLight);

    // 5. RIM LIGHT - da destra, lavanda soft
    const rimLight = new THREE.DirectionalLight(0xe7d7ff, 0.48);
    rimLight.position.set(4, 3, -2);
    this.scene.add(rimLight);

    // 6. CAROUSEL LIGHT - spot sul bancone (accento moderno)
    const carouselLight = new THREE.SpotLight(0xffd8bf, 1.45, 20, Math.PI / 3, 0.3, 0.5);
    carouselLight.position.set(0, 3, 5);
    carouselLight.target.position.set(0, -0.5, 1.5);
    this.scene.add(carouselLight);
    this.scene.add(carouselLight.target);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Subtle light pulsing (cozy atmosphere)
    const keyLight = (this.scene.userData as any).keyLight;
    if (keyLight) {
      const baseIntensity = (keyLight as any).baseIntensity || 3.0;
      keyLight.intensity = baseIntensity + Math.sin(elapsedTime * 0.5) * 0.1;
    }

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
