import React from "react";

export function GameStats({ gameState, settings, isMobile }) {
  const { speed, boost, position, lap, time } = gameState;
  const { laps } = settings;

  const formatTime = (t) => {
    return `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
  };

  return (
    <>
      {/* Speed and boost */}
      <div
        className={`absolute text-white ${
          isMobile ? "bottom-20 left-4 text-sm" : "bottom-8 left-8"
        }`}
      >
        <div
          className={`font-bold mb-2 ${isMobile ? "text-2xl" : "text-4xl"}`}
        >
          {speed}
        </div>
        <div className="text-xs text-cyan-400">KM/H</div>
        <div
          className={`bg-gray-700 mt-4 rounded ${
            isMobile ? "w-16 h-3" : "w-24 h-4"
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-magenta-500 rounded transition-all duration-300"
            style={{ width: `${boost}%` }}
          />
        </div>
        <div className="text-xs text-cyan-400 mt-1">BOOST</div>
      </div>

      {/* Position and lap info */}
      <div
        className={`absolute text-white ${
          isMobile ? "top-16 left-4 text-sm" : "top-8 left-8"
        }`}
      >
        <div className={`font-bold ${isMobile ? "text-lg" : "text-2xl"}`}>
          P{position}
        </div>
        <div className="text-xs text-cyan-400">
          LAP {lap > laps ? laps : lap}/{laps}
        </div>
        <div className="text-xs text-gray-300 mt-2">{formatTime(time)}</div>
      </div>
    </>
  );
}
