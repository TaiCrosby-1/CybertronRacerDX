import React from "react";

export function MobileControls({
  isFullscreen,
  toggleFullscreen,
  touchControls,
  handleTouchStart,
  handleTouchEnd,
  accelerometerEnabled,
  requestOrientationPermission
}) {
  return (
    <>
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 left-4 p-3 bg-black/50 text-white rounded-lg border border-cyan-400 z-50"
        style={{ touchAction: "manipulation" }}
      >
        {isFullscreen ? "🗗" : "🗖"}
      </button>

      <div className="absolute bottom-4 right-4 flex flex-col space-y-4 z-50">
        <button
          onTouchStart={(e) => handleTouchStart(e, "accelerate")}
          onTouchEnd={(e) => handleTouchEnd(e, "accelerate")}
          className={`w-20 h-20 rounded-full font-bold text-white border-2 transition-all ${
            touchControls.accelerate
              ? "bg-green-600 border-green-400 scale-95"
              : "bg-green-500/80 border-green-400"
          }`}
          style={{ touchAction: "manipulation", userSelect: "none" }}
        >
          GO
        </button>

        <button
          onTouchStart={(e) => handleTouchStart(e, "brake")}
          onTouchEnd={(e) => handleTouchEnd(e, "brake")}
          className={`w-20 h-20 rounded-full font-bold text-white border-2 transition-all ${
            touchControls.brake
              ? "bg-red-600 border-red-400 scale-95"
              : "bg-red-500/80 border-red-400"
          }`}
          style={{ touchAction: "manipulation", userSelect: "none" }}
        >
          STOP
        </button>
      </div>

      {!accelerometerEnabled && (
        <div className="absolute top-20 left-4 right-4 bg-black/80 text-white p-4 rounded-lg border border-cyan-400 z-40">
          <p className="text-center text-sm">
            Tap to enable device orientation for steering!
          </p>
          <button
            onClick={requestOrientationPermission}
            className="w-full mt-2 p-2 bg-cyan-500 text-black rounded font-bold"
            style={{ touchAction: "manipulation" }}
          >
            Enable Tilt Steering
          </button>
        </div>
      )}
    </>
  );
}
