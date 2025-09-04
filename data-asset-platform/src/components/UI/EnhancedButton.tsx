import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ButtonProps } from 'antd';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends Omit<ButtonProps, 'loading'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glow';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rippleEffect?: boolean;
  glowEffect?: boolean;
  hoverScale?: boolean;
  children: React.ReactNode;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  rippleEffect = true,
  glowEffect = false,
  hoverScale = true,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-900 shadow-md hover:shadow-lg';
      case 'outline':
        return 'bg-transparent hover:bg-blue-50 border-blue-600 text-blue-600 shadow-sm hover:shadow-md';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 border-transparent text-gray-700 hover:text-gray-900';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-transparent text-white shadow-lg hover:shadow-xl';
      case 'glow':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-300/50';
      default:
        return 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-lg hover:shadow-xl';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (rippleEffect && !isLoading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples(prev => [...prev, newRipple]);

      // 移除涟漪效果
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    if (onClick && !isLoading) {
      onClick(e);
    }
  };

  const LoadingSpinner = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <Loader2 className="w-4 h-4 animate-spin" />
    </motion.div>
  );

  const IconWrapper = ({ children: iconChild }: { children: React.ReactNode }) => (
    <motion.span
      initial={{ opacity: 0, x: iconPosition === 'left' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: iconPosition === 'left' ? -10 : 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center"
    >
      {iconChild}
    </motion.span>
  );

  return (
    <motion.div
      whileHover={hoverScale ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block"
    >
      <Button
        {...props}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        className={`
          relative overflow-hidden transition-all duration-300 ease-in-out border-0
          ${getVariantClasses()}
          ${glowEffect ? 'animate-pulse' : ''}
          ${className}
        `}
        style={{
          background: variant === 'gradient' 
            ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
            : undefined,
          ...props.style,
        }}
      >
        <div className="flex items-center justify-center gap-2 relative z-10">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingSpinner key="loading" />
            ) : (
              icon && iconPosition === 'left' && (
                <IconWrapper key="left-icon">{icon}</IconWrapper>
              )
            )}
          </AnimatePresence>

          <motion.span
            layout
            className="flex items-center"
          >
            {isLoading && loadingText ? loadingText : children}
          </motion.span>

          <AnimatePresence>
            {!isLoading && icon && iconPosition === 'right' && (
              <IconWrapper key="right-icon">{icon}</IconWrapper>
            )}
          </AnimatePresence>
        </div>

        {/* 涟漪效果 */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              style={{
                left: ripple.x - 2,
                top: ripple.y - 2,
                width: 4,
                height: 4,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 20, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* 发光效果 */}
        {glowEffect && (
          <motion.div
            className="absolute inset-0 rounded-inherit"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </Button>
    </motion.div>
  );
};

export default EnhancedButton;
