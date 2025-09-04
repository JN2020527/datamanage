import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Card, Typography } from 'antd';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const { Text } = Typography;

interface EnhancedStatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan';
  animateValue?: boolean;
  className?: string;
  extra?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  color = 'blue',
  animateValue = true,
  className = '',
  extra,
  onClick,
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(animateValue ? 0 : value);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.1 });

  const colorThemes = {
    blue: {
      gradient: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-200/20',
      icon: 'text-blue-600',
      trend: 'text-blue-600',
      glow: 'shadow-blue-500/25',
    },
    green: {
      gradient: 'from-green-500/10 to-green-600/5',
      border: 'border-green-200/20',
      icon: 'text-green-600',
      trend: 'text-green-600',
      glow: 'shadow-green-500/25',
    },
    red: {
      gradient: 'from-red-500/10 to-red-600/5',
      border: 'border-red-200/20',
      icon: 'text-red-600',
      trend: 'text-red-600',
      glow: 'shadow-red-500/25',
    },
    purple: {
      gradient: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-200/20',
      icon: 'text-purple-600',
      trend: 'text-purple-600',
      glow: 'shadow-purple-500/25',
    },
    orange: {
      gradient: 'from-orange-500/10 to-orange-600/5',
      border: 'border-orange-200/20',
      icon: 'text-orange-600',
      trend: 'text-orange-600',
      glow: 'shadow-orange-500/25',
    },
    cyan: {
      gradient: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-200/20',
      icon: 'text-cyan-600',
      trend: 'text-cyan-600',
      glow: 'shadow-cyan-500/25',
    },
  };

  const theme = colorThemes[color];

  useEffect(() => {
    if (inView && animateValue && typeof value === 'number') {
      const duration = 2000; // 2秒动画
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animateNumber = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateNumber);
        }
      };

      requestAnimationFrame(animateNumber);
    } else if (!animateValue) {
      setDisplayValue(value);
    }
  }, [inView, value, animateValue]);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1],
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <Card className={`relative overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={controls}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`
          relative overflow-hidden transition-all duration-300 border-0 shadow-lg hover:shadow-xl
          bg-gradient-to-br ${theme.gradient} backdrop-blur-sm
          ${isHovered ? `${theme.glow} shadow-2xl` : ''}
          ${className}
        `}
        styles={{
          body: { padding: '20px' }
        }}
      >
        {/* 装饰性渐变 */}
        <div 
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient.replace('/10', '/60').replace('/5', '/40')}`}
        />

        {/* 背景光效 */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
          animate={{
            opacity: isHovered ? [0, 0.5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
          }}
        />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <Text className="text-gray-600 text-sm font-medium mb-1 block">
              {title}
            </Text>
            
            <div className="flex items-baseline gap-2 mb-2">
              {prefix && (
                <span className={`${theme.icon}`}>
                  {prefix}
                </span>
              )}
              
              <motion.span
                className="text-2xl font-bold text-gray-900"
                animate={animateValue && typeof value === 'number' ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 0.3 }}
              >
                {displayValue}
                {suffix && <span className="text-lg font-normal text-gray-600">{suffix}</span>}
              </motion.span>
            </div>

            {trend && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {getTrendIcon()}
                <Text className={`text-xs font-medium ${getTrendColor()}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </Text>
              </motion.div>
            )}
          </div>

          {extra && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              {extra}
            </motion.div>
          )}
        </div>

        {/* 悬浮发光效果 */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient.replace('/10', '/5').replace('/5', '/2')} blur-xl`} />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default EnhancedStatCard;
