"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  thickness?: number;
  speed?: number;
  className?: string;
}

function LoadingSpinner({
  size = 40,
  color = "currentColor",
  secondaryColor = "rgba(0, 0, 0, 0.1)",
  thickness = 4,
  speed = 1.5,
  className = "",
}: LoadingSpinnerProps) {
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: speed,
  };

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {/* Background circle */}
      <motion.span
        style={{
          width: size,
          height: size,
          border: `${thickness}px solid ${secondaryColor}`,
          borderRadius: "50%",
          position: "absolute",
          boxSizing: "border-box",
        }}
      />

      {/* Spinning circle */}
      <motion.span
        animate={{ rotate: 360 }}
        transition={spinTransition}
        style={{
          width: size,
          height: size,
          border: `${thickness}px solid transparent`,
          borderTopColor: color,
          borderRadius: "50%",
          position: "absolute",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default LoadingSpinner;
