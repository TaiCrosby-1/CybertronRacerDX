import React from "react";
import { motion } from "motion/react";

export function DriftIndicator({ isDrifting, isMobile }) {
  if (!isDrifting) return null;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <div
        className={`font-bold text-yellow-400 ${
          isMobile ? "text-4xl" : "text-6xl"
        }`}
      >
        DRIFT!
      </div>
    </motion.div>
  );
}
