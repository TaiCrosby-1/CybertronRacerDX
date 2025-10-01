import React from "react";
import { motion } from "motion/react";

export function Countdown({ count, isMobile }) {
  if (count <= 0) return null;

  return (
    <motion.div
      key={count}
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`font-bold text-cyan-400 text-center ${
          isMobile ? "text-6xl" : "text-8xl md:text-9xl"
        }`}
      >
        {count}
      </div>
    </motion.div>
  );
}
