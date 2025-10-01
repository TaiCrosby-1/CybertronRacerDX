import { useState, useEffect } from "react";

export function useInput(onExit, bikeRef, bikePositionRef, bikeVelocityRef, isMobile) {
  const [inputState, setInputState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    drift: false,
    boost: false,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          setInputState((prev) => ({ ...prev, forward: true }));
          break;
        case "KeyS":
        case "ArrowDown":
          setInputState((prev) => ({ ...prev, backward: true }));
          break;
        case "KeyA":
        case "ArrowLeft":
          setInputState((prev) => ({ ...prev, left: true }));
          break;
        case "KeyD":
        case "ArrowRight":
          setInputState((prev) => ({ ...prev, right: true }));
          break;
        case "ShiftLeft":
          setInputState((prev) => ({ ...prev, drift: true }));
          break;
        case "Space":
          event.preventDefault();
          setInputState((prev) => ({ ...prev, boost: true }));
          break;
        case "KeyR":
          if (bikeRef.current) {
            bikePositionRef.current.set(0, 0, 0);
            bikeVelocityRef.current.set(0, 0, 0);
            bikeRef.current.position.set(0, 0, 0);
            bikeRef.current.rotation.set(0, 0, 0);
          }
          break;
        case "Escape":
          onExit && onExit();
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          setInputState((prev) => ({ ...prev, forward: false }));
          break;
        case "KeyS":
        case "ArrowDown":
          setInputState((prev) => ({ ...prev, backward: false }));
          break;
        case "KeyA":
        case "ArrowLeft":
          setInputState((prev) => ({ ...prev, left: false }));
          break;
        case "KeyD":
        case "ArrowRight":
          setInputState((prev) => ({ ...prev, right: false }));
          break;
        case "ShiftLeft":
          setInputState((prev) => ({ ...prev, drift: false }));
          break;
        case "Space":
          setInputState((prev) => ({ ...prev, boost: false }));
          break;
      }
    };

    if (!isMobile) {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      }
    };
  }, [onExit, bikeRef, bikePositionRef, bikeVelocityRef, isMobile]);

  return inputState;
}
