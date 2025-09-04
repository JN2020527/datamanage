import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Circle } from 'lucide-react';

interface LoadingProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'shimmer' | 'particles';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const EnhancedLoading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  text,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${getSizeClasses()} text-blue-500`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${getSizeClasses()} bg-blue-500 rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-sm">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );

  const renderShimmer = () => (
    <div className="relative overflow-hidden bg-gray-100 rounded-md w-full h-20">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
        }}
      />
    </div>
  );

  const renderParticles = () => (
    <div className="relative w-16 h-16">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-500 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: "-4px",
            marginTop: "-4px",
          }}
          animate={{
            x: [0, Math.cos(i * Math.PI / 4) * 20],
            y: [0, Math.sin(i * Math.PI / 4) * 20],
            scale: [1, 0.5, 1],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-6 h-6 text-blue-400" />
      </motion.div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'skeleton': return renderSkeleton();
      case 'shimmer': return renderShimmer();
      case 'particles': return renderParticles();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderLoader()}
      {text && (
        <motion.p
          className={`${getTextSize()} text-gray-600 font-medium`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default EnhancedLoading;
