import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: "tween",
  ease: [0.25, 0.4, 0.25, 1],
  duration: 0.4,
};

const slideVariants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  in: {
    x: 0,
    opacity: 1,
  },
  out: {
    x: "-100%",
    opacity: 0,
  },
};

const fadeSlideVariants = {
  initial: {
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  },
  in: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  out: {
    opacity: 0,
    y: -30,
    filter: "blur(4px)",
  },
};

const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: "blur(2px)",
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  out: {
    opacity: 0,
    scale: 1.1,
    filter: "blur(2px)",
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeSlideVariants}
        transition={pageTransition}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 导出不同的变体
export const SlidePageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const ScalePageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={scaleVariants}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className={`w-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
