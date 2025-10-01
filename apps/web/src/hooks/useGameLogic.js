import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

export function useGameLogic({
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
  checkpointsRef
}) {
  const [gameState, setGameState] = useState({
    speed: 0,
    boost: 100,
    position: 1,
    lap: 1,
    time: 0,
    isStarted: false,
    countdown: 5,
    isDrifting: false,
    lapTimes: [],
  });

  const currentCheckpointRef = useRef(0);
  
  useEffect(() => {
    if (gameState.countdown > 0 && !gameState.isStarted) {
      const timer = setTimeout(() => {
        if (gameState.countdown === 1) {
          setGameState((prev) => ({ ...prev, countdown: 0, isStarted: true }));
        } else {
          setGameState((prev) => ({ ...prev, countdown: prev.countdown - 1 }));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.countdown, gameState.isStarted]);
  
  const checkCheckpoints = useCallback(() => {
    if (checkpointsRef.current.length === 0) return;

    const currentCheckpoint = checkpointsRef.current[currentCheckpointRef.current];
    const distance = bikePositionRef.current.distanceTo(currentCheckpoint);

    if (distance < 30) {
      currentCheckpointRef.current =
        (currentCheckpointRef.current + 1) % checkpointsRef.current.length;

      if (currentCheckpointRef.current === 0) {
        setGameState((prev) => {
            if (prev.lap >= settings.laps) {
                 onComplete &&
                    onComplete({
                      totalTime: prev.time,
                      lapTimes: [...prev.lapTimes, prev.time],
                      track: track,
                      bike: bike,
                    });
            }
            return {
                ...prev,
                lap: prev.lap + 1,
                lapTimes: [...prev.lapTimes, prev.time],
            }
        });
      }
    }
  }, [settings.laps, onComplete, track, bike, checkpointsRef, bikePositionRef, gameState.lap, gameState.time, gameState.lapTimes]);

  const updateBikePhysics = useCallback((deltaTime) => {
    if (!bikeRef.current || !gameState.isStarted) return;

    const bike = bikeRef.current;
    const maxSpeed = 200;
    const acceleration = 100;
    const turnSpeed = 2;

    const mobileSteering = mobileControls.getSteeringInput();

    const finalInputState = {
      forward: isMobile ? mobileControls.touchControls.accelerate : desktopInput.forward,
      backward: isMobile ? mobileControls.touchControls.brake : desktopInput.backward,
      left: isMobile ? mobileSteering.left : desktopInput.left,
      right: isMobile ? mobileSteering.right : desktopInput.right,
      drift: desktopInput.drift
    };

    if (finalInputState.forward) {
      bikeVelocityRef.current.z -= acceleration * deltaTime;
    }
    if (finalInputState.backward) {
      bikeVelocityRef.current.z += acceleration * deltaTime * 0.5;
    }

    if (finalInputState.left) {
      bike.rotation.y += turnSpeed * deltaTime;
    }
    if (finalInputState.right) {
      bike.rotation.y -= turnSpeed * deltaTime;
    }

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(bike.quaternion);

    const speed = bikeVelocityRef.current.length();
    if (speed > maxSpeed) {
      bikeVelocityRef.current.normalize().multiplyScalar(maxSpeed);
    }

    bikePositionRef.current.add(
      bikeVelocityRef.current.clone().multiplyScalar(deltaTime),
    );
    bike.position.copy(bikePositionRef.current);

    bikeVelocityRef.current.multiplyScalar(0.95);

    setGameState((prev) => ({
      ...prev,
      speed: Math.round(speed * 3.6),
      isDrifting: finalInputState.drift && speed > 20,
    }));
    
    checkCheckpoints();
  }, [gameState.isStarted, isMobile, desktopInput, mobileControls, bikeRef, bikePositionRef, bikeVelocityRef, checkCheckpoints]);
  
  const updateTimer = (deltaTime) => {
      if(gameState.isStarted) {
          setGameState(prev => ({ ...prev, time: prev.time + deltaTime }));
      }
  };

  const resetBike = useCallback(() => {
    if (bikeRef.current) {
        bikePositionRef.current.set(0, 0, 0);
        bikeVelocityRef.current.set(0, 0, 0);
        bikeRef.current.position.set(0, 0, 0);
        bikeRef.current.rotation.set(0, 0, 0);
    }
  }, [bikeRef, bikePositionRef, bikeVelocityRef]);

  return { gameState, updateBikePhysics, updateTimer, resetBike };
}
