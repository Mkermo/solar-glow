import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
  once?: boolean;
  // Add a new prop to control if element should be visible initially
  initiallyVisible?: boolean;
}

const ScrollReveal = ({ 
  children, 
  direction = "up", 
  delay = 0, 
  className = "", 
  once = true,
  initiallyVisible = false // New prop with default false
}: ScrollRevealProps) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
    rootMargin: "-10px 0px" // Made this even less aggressive for better user experience
  });

  const variants = {
    hidden: {
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
      opacity: 0
    },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={initiallyVisible ? "visible" : "hidden"}
      animate={inView ? "visible" : (initiallyVisible ? "visible" : "hidden")}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;