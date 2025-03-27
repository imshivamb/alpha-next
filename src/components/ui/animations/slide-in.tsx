"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  direction?: "left" | "right" | "top" | "bottom";
  distance?: number;
  className?: string;
}

function SlideIn({
  children,
  duration = 0.5,
  delay = 0,
  direction = "left",
  distance = 50,
  className = "",
}: SlideInProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case "left":
        return { x: -distance, y: 0 };
      case "right":
        return { x: distance, y: 0 };
      case "top":
        return { x: 0, y: -distance };
      case "bottom":
        return { x: 0, y: distance };
      default:
        return { x: 0, y: 0 };
    }
  };

  const { x, y } = getDirectionOffset();

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default SlideIn;
