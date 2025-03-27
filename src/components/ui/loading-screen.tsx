"use client";

import React from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./animations";

interface LoadingScreenProps {
  message?: string;
}

function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <LoadingSpinner size={60} color="hsl(var(--primary))" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-4 text-lg font-medium text-foreground"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default LoadingScreen;
