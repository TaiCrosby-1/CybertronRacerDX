import * as THREE from "three";

export function createBike(scene, bikeType, isMobile, settings) {
    const bikeGroup = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(8, 4, 20);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bikeGroup.add(body);

    const wheelGeometry = new THREE.CylinderGeometry(3, 3, 2, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.position.set(0, -2, 8);
    frontWheel.rotation.z = Math.PI / 2;
    bikeGroup.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearWheel.position.set(0, -2, -8);
    rearWheel.rotation.z = Math.PI / 2;
    bikeGroup.add(rearWheel);

    if (!isMobile) {
      const trailGeometry = new THREE.BufferGeometry();
      const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
      });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      bikeGroup.add(trail);
    }

    if ((!isMobile || settings.graphics === "high") && settings.bloom) {
      body.material = body.material.clone();
      body.material.emissive = new THREE.Color(0x0066ff);
      body.material.emissiveIntensity = 0.2;
    }

    bikeGroup.position.set(0, 0, 0);
    scene.add(bikeGroup);
    return bikeGroup;
}
