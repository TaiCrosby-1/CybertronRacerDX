import React, { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import { useMobileControls } from "@/hooks/useMobileControls";
import { useInput } from "@/hooks/useInput";
import { useGameLogic } from "@/hooks/useGameLogic";
import { setupLighting } from "@/components/GameEngine/scene/setupLighting";
import { createTrack } from "@/components/GameEngine/scene/createTrack";
import { createBike } from "@/components/GameEngine/scene/createBike";
import { createEnvironment } from "@/components/GameEngine/scene/createEnvironment";
import { HUD } from "@/components/GameEngine/ui/HUD";

export default function GameEngine({
  settings,
  track,
  bike,
  onExit,
  onComplete,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bikeRef = useRef(null);
  const animationIdRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const checkpointsRef = useRef([]);
  const bikePositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const bikeVelocityRef = useRef(new THREE.Vector3(0, 0, 0));

  // Add error state
  const [initError, setInitError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const mobileControls = useMobileControls();
  const { isMobile } = mobileControls;

  const desktopInput = useInput(
    onExit,
    bikeRef,
    bikePositionRef,
    bikeVelocityRef,
    isMobile,
  );

  const { gameState, updateBikePhysics, updateTimer, resetBike } = useGameLogic(
    {
      settings,
      onComplete,
      track,
      bike,
      desktopInput,
      mobileControls,
      isMobile,
      bikeRef,
      bikePositionRef,
      bikeVelocityRef,
      checkpointsRef,
    },
  );

  // Check WebGL support
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  const updateCamera = useCallback(() => {
    if (!cameraRef.current || !bikeRef.current) return;

    try {
      const bike = bikeRef.current;
      const camera = cameraRef.current;
      const idealOffset = new THREE.Vector3(
        0,
        isMobile ? 20 : 15,
        isMobile ? 35 : 30,
      );
      idealOffset.applyQuaternion(bike.quaternion);
      const idealPosition = bike.position.clone().add(idealOffset);
      camera.position.lerp(idealPosition, 0.1);
      camera.lookAt(bike.position);

      const speed = bikeVelocityRef.current.length();
      const baseFov = isMobile ? 70 : 60;
      const targetFov = baseFov + (speed / 200) * (isMobile ? 10 : 20);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.02);
      camera.updateProjectionMatrix();
    } catch (error) {
      console.warn("Camera update error:", error);
    }
  }, [isMobile]);

  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    try {
      const deltaTime = Math.min(clockRef.current.getDelta(), 0.1); // Cap delta time for mobile
      updateTimer(deltaTime);
      updateBikePhysics(deltaTime);
      updateCamera();

      // Update shaders less frequently on mobile
      if (!isMobile || Math.random() < 0.3) {
        sceneRef.current.traverse((child) => {
          try {
            if (child.material?.uniforms?.time) {
              child.material.uniforms.time.value = clockRef.current.elapsedTime;
            }
          } catch (error) {
            // Silently ignore shader update errors
          }
        });
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationIdRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error("Animation loop error:", error);
      // Try to continue animation despite errors
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, [updateTimer, updateBikePhysics, updateCamera, isMobile]);

  const createSimpleTrackMaterial = () => {
    // Fallback material for mobile Safari
    return new THREE.MeshLambertMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
  };

  const createSimpleSkyMaterial = () => {
    // Simple gradient material for mobile Safari
    return new THREE.MeshBasicMaterial({
      color: 0x0a0015,
      side: THREE.BackSide,
    });
  };

  const initializeScene = useCallback(() => {
    if (!mountRef.current) return;

    try {
      // Check WebGL support first
      if (!checkWebGLSupport()) {
        setInitError("WebGL not supported on this device");
        return;
      }

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000015, isMobile ? 0.008 : 0.0025);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        isMobile ? 70 : 60,
        window.innerWidth / window.innerHeight,
        0.1,
        isMobile ? 800 : 2000,
      );
      camera.position.set(0, 15, 30);
      cameraRef.current = camera;

      // Renderer setup with mobile Safari optimizations
      const rendererOptions = {
        antialias: !isMobile,
        powerPreference: isMobile ? "low-power" : "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: isMobile,
      };

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer(rendererOptions);
      } catch (error) {
        // Fallback for mobile Safari
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: "low-power",
          alpha: false,
        });
      }

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(
        isMobile
          ? Math.min(window.devicePixelRatio, 1.5)
          : Math.min(window.devicePixelRatio, 2),
      );

      // Disable shadows on mobile for better performance
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1.0;

      // Mobile Safari optimizations
      if (isMobile) {
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.gammaFactor = 2.2;
      }

      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      // Initialize scene components with error handling
      try {
        setupLighting(scene, isMobile, settings);
      } catch (error) {
        console.warn("Lighting setup error:", error);
        // Add basic lighting fallback
        const ambientLight = new THREE.AmbientLight(0x4a4a4a, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
      }

      try {
        checkpointsRef.current = createTrack(scene, track, isMobile, settings);
      } catch (error) {
        console.warn("Track creation error:", error);
        // Create simple fallback track
        const trackGeometry = new THREE.PlaneGeometry(1000, 1000);
        const trackMaterial = createSimpleTrackMaterial();
        const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
        trackMesh.rotation.x = -Math.PI / 2;
        trackMesh.position.y = -1;
        scene.add(trackMesh);

        // Create simple checkpoints
        checkpointsRef.current = [
          new THREE.Vector3(0, 5, 100),
          new THREE.Vector3(100, 5, 100),
          new THREE.Vector3(100, 5, -100),
          new THREE.Vector3(0, 5, -100),
        ];
      }

      try {
        bikeRef.current = createBike(scene, bike, isMobile, settings);
      } catch (error) {
        console.warn("Bike creation error:", error);
        // Create simple fallback bike
        const bikeGeometry = new THREE.BoxGeometry(8, 4, 20);
        const bikeMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff });
        const bikeMesh = new THREE.Mesh(bikeGeometry, bikeMaterial);
        scene.add(bikeMesh);
        bikeRef.current = bikeMesh;
      }

      try {
        createEnvironment(scene, isMobile);
      } catch (error) {
        console.warn("Environment creation error:", error);
        // Create simple fallback environment
        const skyGeometry = new THREE.SphereGeometry(1000, 8, 8);
        const skyMaterial = createSimpleSkyMaterial();
        const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(skyMesh);
      }

      setIsInitialized(true);
      animate();

      const handleResize = () => {
        try {
          if (!cameraRef.current || !rendererRef.current) return;
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        } catch (error) {
          console.warn("Resize error:", error);
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (mountRef.current && rendererRef.current?.domElement) {
          try {
            mountRef.current.removeChild(rendererRef.current.domElement);
          } catch (error) {
            console.warn("Cleanup error:", error);
          }
        }
        if (rendererRef.current) {
          try {
            rendererRef.current.dispose();
          } catch (error) {
            console.warn("Renderer disposal error:", error);
          }
        }
      };
    } catch (error) {
      console.error("Scene initialization error:", error);
      setInitError(`Initialization failed: ${error.message}`);
    }
  }, [settings, track, bike, isMobile, animate]);

  useEffect(() => {
    const cleanup = initializeScene();
    return cleanup;
  }, [initializeScene]);

  // Error fallback
  if (initError) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#000000] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Racing Engine Error
          </h2>
          <p className="text-gray-300 mb-6">{initError}</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Try these solutions:</p>
            <ul className="text-sm text-gray-400 text-left space-y-2">
              <li>• Refresh the page</li>
              <li>• Use a different browser (Chrome/Safari)</li>
              <li>• Enable hardware acceleration</li>
              <li>• Close other browser tabs</li>
            </ul>
          </div>
          <button
            onClick={onExit}
            className="mt-6 px-6 py-3 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition-colors"
            style={{ touchAction: "manipulation" }}
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isInitialized) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading Racing Engine...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing 3D graphics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <HUD
        gameState={gameState}
        settings={settings}
        isMobile={isMobile}
        mobileControls={mobileControls}
        onReset={resetBike}
        onExit={onExit}
      />
    </div>
  );
}
