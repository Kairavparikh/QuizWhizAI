"use client";

import { Label } from "@radix-ui/react-dropdown-menu";
import { roundStringNumber } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number | string | null;
  label: string;
  index?: number;
};

const MetricCard = (props: Props) => {
  const { value, label, index = 0 } = props;
  const [isHovered, setIsHovered] = useState(false);
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, numericValue, {
      duration: 2,
      ease: "easeOut",
      delay: index * 0.1,
    });

    const unsubscribe = rounded.on("change", (latest) => {
      const rounded = roundStringNumber(latest);
      setDisplayValue(rounded !== null ? String(rounded) : "0");
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [numericValue, index, count, rounded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

      <div className="relative p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 group-hover:border-transparent">
        {/* Background gradient on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20"
              initial={{ x: Math.random() * 100, y: 100 }}
              animate={isHovered ? {
                y: -20,
                x: Math.random() * 100,
                transition: {
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: "linear"
                }
              } : {}}
            />
          ))}
        </div>

        <div className="relative z-10">
          <motion.p
            className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
            animate={{
              x: isHovered ? 2 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.p>

          <motion.p
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            {displayValue}
          </motion.p>
        </div>

        {/* Corner accent */}
        <motion.div
          className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-tl-full"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default MetricCard;
