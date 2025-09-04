import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glowEffect?: boolean;
  hoverScale?: number;
  springOptions?: {
    stiffness: number;
    damping: number;
  };
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  tiltIntensity = 15,
  glowEffect = false,
  hoverScale = 1.02,
  springOptions = { stiffness: 400, damping: 30 },
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 鼠标位置跟踪
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 弹性动画
  const mouseXSpring = useSpring(x, springOptions);
  const mouseYSpring = useSpring(y, springOptions);

  // 3D倾斜变换
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]);

  // 光泽效果位置
  const glowX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu transition-all duration-300 ${className}`}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: "preserve-3d",
      }}
      animate={{
        scale: isHovered ? hoverScale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: springOptions.stiffness,
        damping: springOptions.damping,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 主要内容 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 光泽效果 */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* 边框光效 */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: `linear-gradient(90deg, 
              transparent, 
              rgba(59, 130, 246, 0.3), 
              rgba(147, 51, 234, 0.3), 
              transparent
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* 阴影增强 */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          background: "transparent",
          boxShadow: isHovered 
            ? "0 20px 40px rgba(0,0,0,0.1), 0 10px 20px rgba(59, 130, 246, 0.1)"
            : "0 4px 8px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default InteractiveCard;
