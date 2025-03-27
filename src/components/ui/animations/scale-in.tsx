"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  className?: string;
}

function ScaleIn({
  children,
  duration = 0.4,
  delay = 0,
  initialScale = 0.9,
  className = "",
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScaleIn;
