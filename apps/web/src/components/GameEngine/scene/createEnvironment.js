import * as THREE from "three";

const createParticleSystem = (scene, isMobile) => {
  try {
    const particleCount = isMobile ? 100 : 1000; // Reduce particles for mobile
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = Math.random() * 500;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 1.0, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 1 : 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  } catch (error) {
    console.warn("Particle system creation failed:", error);
    // Skip particles on error - they're not essential
  }
};

// Create simple sky material fallback for mobile Safari
const createSkyMaterial = (isMobile) => {
  if (isMobile) {
    // Use simple gradient material for mobile Safari
    return new THREE.MeshBasicMaterial({
      color: 0x0a0015,
      side: THREE.BackSide,
    });
  }

  // Try to use shader material for desktop, with fallback
  try {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vWorldPosition;
        void main() {
          vec3 direction = normalize(vWorldPosition);
          float elevation = direction.y;
          vec3 skyColor = mix(vec3(0.05, 0.0, 0.1), vec3(0.1, 0.0, 0.2), elevation * 0.5 + 0.5);
          float star = sin(direction.x * 100.0) * sin(direction.y * 100.0) * sin(direction.z * 100.0);
          star = smoothstep(0.99, 1.0, star);
          skyColor += star * 0.3;
          vec3 nebula = vec3(sin(direction.x * 2.0 + time * 0.1), sin(direction.y * 2.0 + time * 0.15), sin(direction.z * 2.0 + time * 0.2)) * 0.1;
          gl_FragColor = vec4(skyColor + nebula, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  } catch (error) {
    console.warn(
      "Sky shader compilation failed, using simple material:",
      error,
    );
    return new THREE.MeshBasicMaterial({
      color: 0x0a0015,
      side: THREE.BackSide,
    });
  }
};

export function createEnvironment(scene, isMobile) {
  try {
    // Create skybox with mobile-safe materials
    const skyGeometry = new THREE.SphereGeometry(
      1500,
      isMobile ? 8 : 32,
      isMobile ? 8 : 32,
    );
    const skyMaterial = createSkyMaterial(isMobile);
    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyMesh);

    // Add particle system (with error handling)
    createParticleSystem(scene, isMobile);
  } catch (error) {
    console.error("Environment creation failed:", error);

    // Create emergency fallback environment
    try {
      const fallbackSkyGeometry = new THREE.SphereGeometry(1000, 8, 8);
      const fallbackSkyMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0015,
        side: THREE.BackSide,
      });
      const fallbackSkyMesh = new THREE.Mesh(
        fallbackSkyGeometry,
        fallbackSkyMaterial,
      );
      scene.add(fallbackSkyMesh);
    } catch (fallbackError) {
      console.error("Even fallback environment failed:", fallbackError);
      // Continue without environment - not critical for gameplay
    }
  }
}
