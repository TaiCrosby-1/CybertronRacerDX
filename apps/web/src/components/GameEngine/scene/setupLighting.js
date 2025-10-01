import * as THREE from "three";

export function setupLighting(scene, isMobile, settings) {
  const ambientLight = new THREE.AmbientLight(0x4a0e4e, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
  directionalLight.position.set(-100, 100, 0);
  directionalLight.castShadow = !isMobile && settings.graphics === "high";
  if (directionalLight.castShadow) {
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
  }
  scene.add(directionalLight);

  if (!isMobile || settings.graphics !== "low") {
    const neonLight1 = new THREE.PointLight(0xff00ff, 2, 100);
    neonLight1.position.set(50, 20, 0);
    scene.add(neonLight1);

    const neonLight2 = new THREE.PointLight(0x00ffff, 2, 100);
    neonLight2.position.set(-50, 20, 0);
    scene.add(neonLight2);
  }
}
