import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

const AnimatedCounter = ({ value, duration = 1.5, className = "" }: AnimatedCounterProps) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedCounter;
