import React from "react";

export function ActionButtons({ onReset, onExit, isMobile }) {
  return (
    <>
      <div
        className={`absolute pointer-events-auto ${
          isMobile ? "top-4 right-4" : "bottom-8 right-8"
        }`}
      >
        <button
          onClick={onReset}
          className={`bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors ${
            isMobile ? "px-4 py-2 text-sm" : "px-6 py-3"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          RESET
        </button>
      </div>
      {isMobile && (
        <div className="absolute top-4 right-20 pointer-events-auto">
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded transition-colors text-sm"
            style={{ touchAction: "manipulation" }}
          >
            EXIT
          </button>
        </div>
      )}
    </>
  );
}
