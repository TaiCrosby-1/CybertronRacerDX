import { useState, useEffect, useRef, useCallback } from "react";

export function useMobileControls() {
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [accelerometerEnabled, setAccelerometerEnabled] = useState(false);
  const [touchControls, setTouchControls] = useState({
    accelerate: false,
    brake: false,
    left: false,
    right: false,
  });
  const accelerometerRef = useRef({ x: 0, y: 0, z: 0 });
  const orientationPermissionRef = useRef(false);

  const requestOrientationPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setAccelerometerEnabled(true);
          orientationPermissionRef.current = true;
        }
      } catch (error) {
        console.log("Device orientation permission denied");
      }
    } else if (window.DeviceOrientationEvent) {
      setAccelerometerEnabled(true);
      orientationPermissionRef.current = true;
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768 ||
        "ontouchstart" in window;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log("Fullscreen not supported or permission denied");
    }
  }, []);

  const handleTouchStart = useCallback((event, control) => {
    event.preventDefault();
    setTouchControls((prev) => ({ ...prev, [control]: true }));
  }, []);

  const handleTouchEnd = useCallback((event, control) => {
    event.preventDefault();
    setTouchControls((prev) => ({ ...prev, [control]: false }));
  }, []);

  const getSteeringInput = useCallback(() => {
      if (isMobile && orientationPermissionRef.current) {
          const gamma = accelerometerRef.current.x;
          const steeringSensitivity = 0.3;
          const steering = Math.max(-1, Math.min(1, ((gamma || 0) / 30) * steeringSensitivity));
          return {
              left: steering < -0.1,
              right: steering > 0.1,
          };
      }
      return { left: false, right: false };
  }, [isMobile]);


  useEffect(() => {
    const handleOrientation = (event) => {
      if (isMobile && orientationPermissionRef.current) {
        accelerometerRef.current = {
          x: event.gamma || 0,
          y: event.beta || 0,
          z: event.alpha || 0,
        };
      }
    };

    if (accelerometerEnabled) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isMobile, accelerometerEnabled]);

  return {
    isMobile,
    isFullscreen,
    toggleFullscreen,
    accelerometerEnabled,
    requestOrientationPermission,
    touchControls,
    handleTouchStart,
    handleTouchEnd,
    getSteeringInput
  };
}
