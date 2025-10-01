import * as THREE from "three";

const generateTrackSpline = (trackType) => {
  let points = [];
  let checkpoints = [];

  switch (trackType) {
    case "neon-circuit":
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 300 + Math.sin(angle * 2) * 50;
        const z = Math.sin(angle) * 200;
        points.push(new THREE.Vector3(x, 0, z));

        if (i % 16 === 0) {
          checkpoints.push(new THREE.Vector3(x, 5, z));
        }
      }
      break;

    case "hyper-overpass":
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const x = Math.cos(angle) * 350 + Math.sin(angle * 3) * 80;
        const z = Math.sin(angle) * 250;
        const y = Math.sin(angle * 4) * 30;
        points.push(new THREE.Vector3(x, y, z));

        if (i % 16 === 0) {
          checkpoints.push(new THREE.Vector3(x, y + 5, z));
        }
      }
      break;

    case "maze-vector":
      for (let i = 0; i <= 96; i++) {
        const t = i / 96;
        const angle = t * Math.PI * 4;
        const radius = 200 + Math.sin(angle * 3) * 100;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0, z));

        if (i % 24 === 0) {
          checkpoints.push(new THREE.Vector3(x, 5, z));
        }
      }
      break;

    default:
      points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(100, 0, 0),
        new THREE.Vector3(100, 0, 100),
        new THREE.Vector3(0, 0, 100),
      ];
      checkpoints = points.map((p) => new THREE.Vector3(p.x, 5, p.z));
  }

  return { spline: new THREE.CatmullRomCurve3(points, true), checkpoints };
};

const createTrackBorders = (scene, spline, isMobile, settings) => {
  const pointCount = isMobile ? 100 : 200;
  const points = spline.getPoints(pointCount);

  points.forEach((point, index) => {
    if (index % (isMobile ? 3 : 1) === 0) {
      const leftBorderGeometry = new THREE.BoxGeometry(2, 8, 2);
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
      });

      const leftBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
      leftBorder.position.copy(point);
      leftBorder.position.x -= 40;
      leftBorder.position.y += 4;
      scene.add(leftBorder);

      const rightBorder = leftBorder.clone();
      rightBorder.position.x = point.x + 40;
      scene.add(rightBorder);

      if ((!isMobile || settings.graphics === "high") && settings.bloom) {
        leftBorder.material = leftBorder.material.clone();
        leftBorder.material.emissive = new THREE.Color(0x00ffff);
        leftBorder.material.emissiveIntensity = 0.3;

        rightBorder.material = rightBorder.material.clone();
        rightBorder.material.emissive = new THREE.Color(0x00ffff);
        rightBorder.material.emissiveIntensity = 0.3;
      }
    }
  });
};

const createElevatedSections = (scene) => {
  const rampGeometry = new THREE.BoxGeometry(80, 20, 200);
  const rampMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const ramp1 = new THREE.Mesh(rampGeometry, rampMaterial);
  ramp1.position.set(200, 10, 0);
  ramp1.rotation.x = Math.PI / 12;
  scene.add(ramp1);
  const ramp2 = new THREE.Mesh(rampGeometry, rampMaterial);
  ramp2.position.set(-200, 10, 0);
  ramp2.rotation.x = -Math.PI / 12;
  scene.add(ramp2);
};

const createMazeElements = (scene, isMobile) => {
  const obstacleCount = isMobile ? 10 : 20;
  for (let i = 0; i < obstacleCount; i++) {
    const obstacleGeometry = new THREE.BoxGeometry(
      10 + Math.random() * 20,
      20 + Math.random() * 30,
      10 + Math.random() * 20,
    );
    const obstacleMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.3),
    });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(
      (Math.random() - 0.5) * 600,
      obstacle.geometry.parameters.height / 2,
      (Math.random() - 0.5) * 600,
    );
    scene.add(obstacle);
  }
};

// Create simple track material fallback for mobile Safari
const createSimpleTrackMaterial = (isMobile) => {
  if (isMobile) {
    // Use simple material for mobile Safari
    return new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
    });
  }

  // Try to use shader material for desktop, with fallback
  try {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x00ffff) },
        color2: { value: new THREE.Color(0xff00ff) },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          vec3 pos = position;
          pos.z += sin(pos.x * 0.01 + time * 2.0) * 2.0;
          pos.z += cos(pos.y * 0.01 + time * 1.5) * 1.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vec2 grid = abs(fract(vPosition.xy * 0.1) - 0.5) / fwidth(vPosition.xy * 0.1);
          float line = min(grid.x, grid.y);
          vec3 color = mix(color1, color2, sin(time + vPosition.x * 0.01) * 0.5 + 0.5);
          color *= (1.0 - min(line, 1.0)) * 0.3 + 0.1;
          color += sin(time * 4.0 + vPosition.x * 0.05) * 0.1;
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  } catch (error) {
    console.warn("Shader compilation failed, using simple material:", error);
    return new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });
  }
};

export function createTrack(scene, trackType, isMobile, settings) {
  try {
    const trackPoints = generateTrackSpline(trackType);

    const segments = isMobile ? 32 : 100; // Reduce segments for mobile
    const trackGeometry = new THREE.PlaneGeometry(
      2000,
      2000,
      segments,
      segments,
    );

    // Use fallback-safe material creation
    const trackMaterial = createSimpleTrackMaterial(isMobile);

    const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = -1;
    scene.add(trackMesh);

    createTrackBorders(scene, trackPoints.spline, isMobile, settings);

    if (trackType === "hyper-overpass") {
      createElevatedSections(scene);
    } else if (trackType === "maze-vector") {
      createMazeElements(scene, isMobile);
    }

    return trackPoints.checkpoints;
  } catch (error) {
    console.error("Track creation failed:", error);

    // Create emergency fallback track
    const fallbackGeometry = new THREE.PlaneGeometry(1000, 1000);
    const fallbackMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });
    const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    fallbackMesh.rotation.x = -Math.PI / 2;
    fallbackMesh.position.y = -1;
    scene.add(fallbackMesh);

    // Return basic checkpoints
    return [
      new THREE.Vector3(0, 5, 100),
      new THREE.Vector3(100, 5, 100),
      new THREE.Vector3(100, 5, -100),
      new THREE.Vector3(0, 5, -100),
    ];
  }
}
