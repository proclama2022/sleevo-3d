import * as THREE from 'three';

export interface GenrePanelConfig {
  slotWidth: number;
  shelfHeight: number;
  genreColor: string;
  col: number;
  x: number;
}

export function createEnhancedGenrePanel(config: GenrePanelConfig): THREE.Group {
  const group = new THREE.Group();
  group.name = `genre-panel-${config.col}`;
  group.userData = { col: config.col };

  // Simple panel background
  const panelGeo = new THREE.BoxGeometry(config.slotWidth * 0.9, 0.12, 0.04);
  const panelMat = new THREE.MeshStandardMaterial({
    color: config.genreColor,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(config.x, config.shelfHeight / 2 + 0.18, 0);
  panel.castShadow = true;
  group.add(panel);

  return group;
}

export function updatePanelState(
  panel: THREE.Group,
  isEmpty: boolean,
  isFull: boolean,
  isActive: boolean,
  time: number
): void {
  const mesh = panel.children[0] as THREE.Mesh;
  if (!mesh || !mesh.material) return;
  const mat = mesh.material as THREE.MeshStandardMaterial;

  if (isFull) {
    mat.emissive = new THREE.Color(0x00ff00);
    mat.emissiveIntensity = 0.15 + Math.sin(time * 0.003) * 0.05;
  } else if (isEmpty) {
    mat.emissive = new THREE.Color(0x000000);
    mat.emissiveIntensity = 0;
    mat.opacity = 0.6;
  } else {
    mat.emissive = new THREE.Color(0x000000);
    mat.emissiveIntensity = 0;
    mat.opacity = 0.85;
  }

  if (isActive) {
    mat.emissive = new THREE.Color(0xffff00);
    mat.emissiveIntensity = 0.2;
  }
}
