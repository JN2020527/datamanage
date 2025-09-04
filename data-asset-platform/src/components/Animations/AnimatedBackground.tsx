import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: any;
  enableHover?: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}) => {
  const [activeId, setActiveId] = useState<string | null>(defaultValue || null);

  useEffect(() => {
    if (defaultValue) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  const handleClick = (id: string) => {
    setActiveId(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  const handleHover = (id: string) => {
    if (enableHover) {
      setActiveId(id);
    }
  };

  const handleMouseLeave = () => {
    if (enableHover && defaultValue) {
      setActiveId(defaultValue);
    } else if (enableHover && !defaultValue) {
      setActiveId(null);
    }
  };

  return (
    <div 
      className={`relative ${className || ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const dataId = child.props['data-id'];
          if (!dataId) {
            return child;
          }

          const isActive = activeId === dataId;

          return (
            <div
              key={dataId}
              onClick={() => handleClick(dataId)}
              onMouseEnter={() => handleHover(dataId)}
              className="cursor-pointer relative"
            >
              {child}
              {isActive && (
                <motion.div
                  layoutId="animated-background-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200/20 backdrop-blur-sm z-[-1]"
                  initial={false}
                  transition={transition || { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    duration: 0.3 
                  }}
                />
              )}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
};

export default AnimatedBackground;
