import React from "react";
import { Countdown } from "./Countdown";
import { DriftIndicator } from "./DriftIndicator";
import { GameStats } from "./GameStats";
import { MobileControls } from "./MobileControls";
import { ActionButtons } from "./ActionButtons";

export function HUD({
  gameState,
  settings,
  isMobile,
  mobileControls,
  onReset,
  onExit,
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Countdown count={gameState.countdown} isMobile={isMobile} />

      {gameState.isStarted && (
        <>
          <GameStats gameState={gameState} settings={settings} isMobile={isMobile} />
          <DriftIndicator isDrifting={gameState.isDrifting} isMobile={isMobile} />
          <ActionButtons onReset={onReset} onExit={onExit} isMobile={isMobile} />
          
          {isMobile && (
            <div className="pointer-events-auto">
              <MobileControls {...mobileControls} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
