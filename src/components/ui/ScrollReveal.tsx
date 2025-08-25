// src/components/ScrollReveal.tsx
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
  once?: boolean;
}

const ScrollReveal = ({ 
  children, 
  direction = "up", 
  delay = 0, 
  className = "", 
  once = true
}: ScrollRevealProps) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
    rootMargin: "-100px 0px"
  });

  const variants = {
    hidden: {
      y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
      x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
      opacity: 0
    },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;