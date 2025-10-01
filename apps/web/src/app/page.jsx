import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Settings,
  Trophy,
  Keyboard,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react";
import { create } from "zustand";
import GameEngine from "../components/GameEngine";

// Zustand store for game state
const useGameStore = create((set, get) => ({
  // Settings
  settings: {
    laps: 3,
    track: "neon-circuit",
    bike: "vapor-v1",
    difficulty: "medium",
    graphics: "medium",
    bloom: true,
    motionBlur: false,
    ssao: false,
    musicVolume: 0.7,
    sfxVolume: 0.8,
  },

  // Game records
  bestLapTimes: {},
  ghostData: {},

  // Actions
  updateSettings: (newSettings) =>
    set({ settings: { ...get().settings, ...newSettings } }),

  saveLapTime: (track, bike, time) =>
    set((state) => {
      const key = `${track}-${bike}`;
      const currentBest = state.bestLapTimes[key];
      if (!currentBest || time < currentBest) {
        return {
          bestLapTimes: { ...state.bestLapTimes, [key]: time },
        };
      }
      return state;
    }),

  saveGhostData: (track, bike, data) =>
    set((state) => ({
      ghostData: { ...state.ghostData, [`${track}-${bike}`]: data },
    })),
}));

export default function CybertronRacerDX() {
  const [currentScreen, setCurrentScreen] = useState("menu");
  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState("neon-circuit");
  const [selectedBike, setSelectedBike] = useState("vapor-v1");
  const [gameMode, setGameMode] = useState("race"); // 'race', 'time-trial', 'free-run'

  // Game store
  const { settings, updateSettings, bestLapTimes, saveLapTime } =
    useGameStore();

  const tracks = [
    {
      id: "neon-circuit",
      name: "Neon Circuit",
      description: "Wide, flowing entry-level track",
      difficulty: "Easy",
    },
    {
      id: "hyper-overpass",
      name: "Hyper Overpass",
      description: "Elevation, jumps, speed pads",
      difficulty: "Medium",
    },
    {
      id: "maze-vector",
      name: "Maze Vector",
      description: "Tight chicanes and shortcuts",
      difficulty: "Hard",
    },
  ];

  const bikes = [
    {
      id: "vapor-v1",
      name: "Vapor V1",
      description: "Balanced performance",
      stats: { speed: 7, agility: 7, boost: 6 },
    },
    {
      id: "photon-x",
      name: "Photon X",
      description: "High top speed",
      stats: { speed: 9, agility: 5, boost: 7 },
    },
    {
      id: "nova-s",
      name: "Nova S",
      description: "Maximum agility",
      stats: { speed: 6, agility: 9, boost: 8 },
    },
  ];

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("cybertron-racer-settings");
    if (savedSettings) {
      try {
        updateSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to load saved settings:", error);
      }
    }

    // Load best lap times
    const savedLapTimes = localStorage.getItem("cybertron-racer-laptimes");
    if (savedLapTimes) {
      try {
        const lapTimes = JSON.parse(savedLapTimes);
        Object.keys(lapTimes).forEach((key) => {
          const [track, bike] = key.split("-");
          saveLapTime(track, bike, lapTimes[key]);
        });
      } catch (error) {
        console.error("Failed to load saved lap times:", error);
      }
    }

    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [updateSettings, saveLapTime]);

  // Persist settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("cybertron-racer-settings", JSON.stringify(settings));
  }, [settings]);

  // Persist lap times
  useEffect(() => {
    localStorage.setItem(
      "cybertron-racer-laptimes",
      JSON.stringify(bestLapTimes),
    );
  }, [bestLapTimes]);

  const startGame = (mode) => {
    setGameMode(mode);
    updateSettings({ track: selectedTrack, bike: selectedBike });
    setCurrentScreen("game");
  };

  const handleGameComplete = (results) => {
    // Save lap times and return to menu
    if (results.lapTimes && results.lapTimes.length > 0) {
      const bestLap = Math.min(...results.lapTimes);
      saveLapTime(selectedTrack, selectedBike, bestLap);
    }

    // Show results briefly then return to menu
    setTimeout(() => setCurrentScreen("menu"), 3000);
  };

  const handleGameExit = () => {
    setCurrentScreen("menu");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#000000] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            CYBERTRON RACER DX
          </motion.h1>
          <motion.p
            className="text-cyan-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Initializing Neural Network...
          </motion.p>
        </div>

        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-cyan-400/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, delay: i * 0.01, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Custom styles */}
        <style jsx global>{`
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            background: linear-gradient(45deg, #22d3ee, #ec4899);
            height: 20px;
            width: 20px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
            transition: all 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
          }
          
          .slider::-webkit-slider-track {
            background: #374151;
            height: 8px;
            border-radius: 4px;
            border: none;
          }
          
          .slider {
            -webkit-appearance: none;
            background: transparent;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Game screen with GameEngine component
  if (currentScreen === "game") {
    return (
      <GameEngine
        settings={settings}
        track={selectedTrack}
        bike={selectedBike}
        mode={gameMode}
        onExit={handleGameExit}
        onComplete={handleGameComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0015] via-[#1a0030] to-[#000000] relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="grid grid-cols-40 grid-rows-40 h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
        >
          {Array.from({ length: 1600 }).map((_, i) => (
            <div key={i} className="border border-cyan-400/30" />
          ))}
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-8 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500 mb-2"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            CYBERTRON RACER DX
          </motion.h1>
          <motion.p
            className="text-cyan-300 text-lg tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            High-Speed Neural Racing
          </motion.p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <AnimatePresence mode="wait">
            {currentScreen === "menu" && (
              <motion.div
                key="menu"
                className="w-full max-w-md space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <MenuButton
                  icon={<Play className="w-6 h-6" />}
                  label="Quick Race"
                  onClick={() => {
                    setGameMode("race");
                    setCurrentScreen("track-select");
                  }}
                />
                <MenuButton
                  icon={<Trophy className="w-6 h-6" />}
                  label="Time Trial"
                  onClick={() => {
                    setGameMode("time-trial");
                    setCurrentScreen("track-select");
                  }}
                />
                <MenuButton
                  icon={<Settings className="w-6 h-6" />}
                  label="Settings"
                  onClick={() => setCurrentScreen("settings")}
                />
                <MenuButton
                  icon={<Keyboard className="w-6 h-6" />}
                  label="Controls"
                  onClick={() => setCurrentScreen("controls")}
                />
                <MenuButton
                  icon={<Info className="w-6 h-6" />}
                  label="Credits"
                  onClick={() => setCurrentScreen("credits")}
                />
              </motion.div>
            )}

            {currentScreen === "credits" && (
              <motion.div
                key="credits"
                className="w-full max-w-2xl text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                <h2 className="text-3xl font-bold text-cyan-400 mb-8">
                  CREDITS
                </h2>
                <div className="space-y-6 text-gray-300">
                  <div>
                    <h3 className="text-xl text-magenta-400 mb-2">
                      Game Engine
                    </h3>
                    <p>
                      Built with React, Three.js, and modern web technologies
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl text-magenta-400 mb-2">Design</h3>
                    <p>Inspired by 1980s synthwave and cyberpunk aesthetics</p>
                  </div>
                  <div>
                    <h3 className="text-xl text-magenta-400 mb-2">Audio</h3>
                    <p>Web Audio API for immersive racing sounds</p>
                  </div>
                  <div>
                    <h3 className="text-xl text-magenta-400 mb-2">
                      Special Thanks
                    </h3>
                    <p>
                      To the open source community and retro gaming enthusiasts
                    </p>
                  </div>
                </div>
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => setCurrentScreen("menu")}
                    className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold tracking-wider"
                    style={{ touchAction: "manipulation" }}
                  >
                    BACK
                  </button>
                </div>
              </motion.div>
            )}

            {currentScreen === "track-select" && (
              <motion.div
                key="track-select"
                className="w-full max-w-4xl"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
                  SELECT TRACK
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {tracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      selected={selectedTrack === track.id}
                      onClick={() => setSelectedTrack(track.id)}
                      bestTime={bestLapTimes[`${track.id}-${selectedBike}`]}
                    />
                  ))}
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentScreen("menu")}
                    className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold tracking-wider"
                    style={{ touchAction: "manipulation" }}
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => setCurrentScreen("bike-select")}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black hover:from-cyan-300 hover:to-magenta-400 transition-all duration-300 font-semibold tracking-wider"
                    style={{ touchAction: "manipulation" }}
                  >
                    NEXT
                  </button>
                </div>
              </motion.div>
            )}

            {currentScreen === "bike-select" && (
              <motion.div
                key="bike-select"
                className="w-full max-w-4xl"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h2 className="text-3xl font-bold text-cyan-400 mb-8 text-center">
                  SELECT BIKE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {bikes.map((bike) => (
                    <BikeCard
                      key={bike.id}
                      bike={bike}
                      selected={selectedBike === bike.id}
                      onClick={() => setSelectedBike(bike.id)}
                    />
                  ))}
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentScreen("track-select")}
                    className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold tracking-wider"
                    style={{ touchAction: "manipulation" }}
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => startGame(gameMode)}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black hover:from-cyan-300 hover:to-magenta-400 transition-all duration-300 font-semibold tracking-wider"
                    style={{ touchAction: "manipulation" }}
                  >
                    START RACE
                  </button>
                </div>
              </motion.div>
            )}

            {currentScreen === "settings" && (
              <motion.div
                key="settings"
                className="w-full max-w-2xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={updateSettings}
                  onBack={() => setCurrentScreen("menu")}
                />
              </motion.div>
            )}

            {currentScreen === "controls" && (
              <motion.div
                key="controls"
                className="w-full max-w-2xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
              >
                <ControlsPanel onBack={() => setCurrentScreen("menu")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Audio toggle */}
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300"
            style={{ touchAction: "manipulation" }}
            aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
          >
            {audioEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Custom slider and UI styles */}
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(45deg, #22d3ee, #ec4899);
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
        }
        
        .slider::-webkit-slider-track {
          background: #374151;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        
        .slider {
          -webkit-appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        /* Focus styles for accessibility */
        button:focus {
          outline: 2px solid #22d3ee;
          outline-offset: 2px;
        }
        
        select:focus {
          outline: 2px solid #22d3ee;
          outline-offset: 2px;
        }
        
        /* Mobile touch improvements */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function MenuButton({ icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full p-4 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 flex items-center justify-center space-x-3 font-semibold tracking-wider text-lg"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function TrackCard({ track, selected, onClick, bestTime }) {
  return (
    <motion.div
      onClick={onClick}
      className={`p-6 border-2 cursor-pointer transition-all duration-300 ${
        selected
          ? "border-magenta-500 bg-magenta-500/10"
          : "border-cyan-400 hover:border-magenta-400"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3
        className={`text-xl font-bold mb-2 ${selected ? "text-magenta-400" : "text-cyan-400"}`}
      >
        {track.name}
      </h3>
      <p className="text-gray-300 mb-3">{track.description}</p>
      <div className="flex items-center justify-between mb-3">
        <div
          className={`inline-block px-3 py-1 text-xs font-semibold ${
            track.difficulty === "Easy"
              ? "bg-green-500"
              : track.difficulty === "Medium"
                ? "bg-yellow-500"
                : "bg-red-500"
          } text-black`}
        >
          {track.difficulty}
        </div>
        {bestTime && (
          <div className="text-xs text-cyan-400">
            Best: {bestTime.toFixed(2)}s
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BikeCard({ bike, selected, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      className={`p-6 border-2 cursor-pointer transition-all duration-300 ${
        selected
          ? "border-magenta-500 bg-magenta-500/10"
          : "border-cyan-400 hover:border-magenta-400"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3
        className={`text-xl font-bold mb-2 ${selected ? "text-magenta-400" : "text-cyan-400"}`}
      >
        {bike.name}
      </h3>
      <p className="text-gray-300 mb-4">{bike.description}</p>
      <div className="space-y-2">
        <StatBar label="Speed" value={bike.stats.speed} />
        <StatBar label="Agility" value={bike.stats.agility} />
        <StatBar label="Boost" value={bike.stats.boost} />
      </div>
    </motion.div>
  );
}

function StatBar({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="w-20 h-2 bg-gray-700 flex">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${
              i < value
                ? "bg-gradient-to-r from-cyan-400 to-magenta-500"
                : "bg-gray-600"
            } ${i > 0 ? "ml-0.5" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSettingsChange, onBack }) {
  const updateSetting = (key, value) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">
        SETTINGS
      </h2>

      <div className="space-y-6">
        <SettingSlider
          label="Laps"
          value={settings.laps}
          min={1}
          max={10}
          onChange={(value) => updateSetting("laps", value)}
        />

        <SettingSelect
          label="Graphics Preset"
          value={settings.graphics}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
          onChange={(value) => updateSetting("graphics", value)}
        />

        <SettingToggle
          label="Bloom Effect"
          value={settings.bloom}
          onChange={(value) => updateSetting("bloom", value)}
        />

        <SettingToggle
          label="Motion Blur"
          value={settings.motionBlur}
          onChange={(value) => updateSetting("motionBlur", value)}
        />

        <SettingSlider
          label="Music Volume"
          value={Math.round(settings.musicVolume * 100)}
          min={0}
          max={100}
          onChange={(value) => updateSetting("musicVolume", value / 100)}
        />

        <SettingSlider
          label="SFX Volume"
          value={Math.round(settings.sfxVolume * 100)}
          min={0}
          max={100}
          onChange={(value) => updateSetting("sfxVolume", value / 100)}
        />
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold tracking-wider"
        >
          BACK
        </button>
      </div>
    </div>
  );
}

function SettingSlider({ label, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cyan-400 font-semibold">{label}</span>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-white w-8 text-center">{value}</span>
      </div>
    </div>
  );
}

function SettingSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cyan-400 font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-gray-800 border border-cyan-400 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cyan-400 font-semibold">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
          value
            ? "bg-gradient-to-r from-cyan-400 to-magenta-500"
            : "bg-gray-600"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
            value ? "left-6" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ControlsPanel({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);

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

  const desktopControls = [
    { action: "Accelerate", key: "W / ↑" },
    { action: "Brake/Reverse", key: "S / ↓" },
    { action: "Steer Left", key: "A / ←" },
    { action: "Steer Right", key: "D / →" },
    { action: "Drift", key: "Left Shift" },
    { action: "Boost", key: "Space" },
    { action: "Reset", key: "R" },
    { action: "Camera Toggle", key: "C" },
    { action: "Photo Mode", key: "P" },
    { action: "Pause", key: "Esc" },
  ];

  const mobileControls = [
    { action: "Accelerate", key: "Green GO Button" },
    { action: "Brake/Reverse", key: "Red STOP Button" },
    { action: "Steer Left/Right", key: "Tilt Device Left/Right" },
    { action: "Reset", key: "RESET Button" },
    { action: "Fullscreen", key: "🗖 Button" },
    { action: "Exit", key: "EXIT Button" },
  ];

  const controls = isMobile ? mobileControls : desktopControls;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-cyan-400 text-center mb-8">
        CONTROLS
      </h2>

      {isMobile && (
        <div className="mb-6 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded">
          <h3 className="text-lg text-cyan-400 font-semibold mb-2">
            Mobile Racing Instructions
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Tilt your phone left/right to steer</li>
            <li>• Use touch buttons for gas and brake</li>
            <li>• Enable device orientation when prompted</li>
            <li>• Tap fullscreen for better experience</li>
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {controls.map((control, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-cyan-400/30 bg-cyan-400/5"
          >
            <span className="text-cyan-400 font-semibold">
              {control.action}
            </span>
            <span className="text-white bg-gray-800 px-3 py-1 rounded font-mono text-sm">
              {control.key}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-400 text-sm">
        {isMobile ? (
          <>
            <p>Best performance on iOS Safari and Chrome</p>
            <p>Landscape orientation recommended</p>
          </>
        ) : (
          <>
            <p>Gamepad support available</p>
            <p>Touch controls enabled on mobile devices</p>
          </>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-semibold tracking-wider"
          style={{ touchAction: "manipulation" }}
        >
          BACK
        </button>
      </div>
    </div>
  );
}
